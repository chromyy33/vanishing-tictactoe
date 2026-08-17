const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.get('/', (req, res) => res.send('Vanishing TicTacToe Socket Server is Live'));
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Active rooms storage: roomId -> { players: [{id, symbol}], gameState: null }
const rooms = new Map();
let waitingPlayer = null;

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Quick Match Queue
  socket.on('join_queue', () => {
    if (waitingPlayer && waitingPlayer.id !== socket.id) {
      const roomId = generateRoomId();
      const player1 = waitingPlayer;
      const player2 = socket;

      waitingPlayer = null;

      player1.join(roomId);
      player2.join(roomId);

      rooms.set(roomId, {
        id: roomId,
        players: [
          { id: player1.id, symbol: 'X' },
          { id: player2.id, symbol: 'O' }
        ]
      });

      // Auto-cleanup room after 15 minutes to prevent memory leaks
      setTimeout(() => {
        if (rooms.has(roomId)) {
          console.log(`[Room] TTL expired, cleaning room ${roomId}`);
          rooms.delete(roomId);
        }
      }, 15 * 60 * 1000);

      player1.emit('game_matched', { roomId, symbol: 'X', opponentId: player2.id });
      player2.emit('game_matched', { roomId, symbol: 'O', opponentId: player1.id });
      console.log(`[Queue] Matched room ${roomId}: ${player1.id} (X) vs ${player2.id} (O)`);
    } else {
      waitingPlayer = socket;
      socket.emit('queue_waiting', { message: 'Waiting for an opponent...' });
      console.log(`[Queue] Player ${socket.id} waiting in queue...`);
    }
  });

  // Create Private Room
  socket.on('create_room', () => {
    const roomId = generateRoomId();
    socket.join(roomId);
    rooms.set(roomId, {
      id: roomId,
      players: [{ id: socket.id, symbol: 'X' }]
    });

    // Auto-cleanup room after 15 minutes to prevent memory leaks
    setTimeout(() => {
      if (rooms.has(roomId)) {
        console.log(`[Room] TTL expired, cleaning room ${roomId}`);
        rooms.delete(roomId);
      }
    }, 15 * 60 * 1000);
    socket.emit('room_created', { roomId, symbol: 'X' });
    console.log(`[Room] Created room ${roomId} by ${socket.id}`);
  });

  // Join Private Room
  socket.on('join_room', ({ roomId }) => {
    const cleanRoomId = roomId ? roomId.trim().toUpperCase() : '';
    const room = rooms.get(cleanRoomId);

    if (!room) {
      socket.emit('error_message', { message: 'Room not found. Please check code.' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error_message', { message: 'Room is full.' });
      return;
    }

    socket.join(cleanRoomId);
    room.players.push({ id: socket.id, symbol: 'O' });

    const player1Id = room.players[0].id;
    io.to(cleanRoomId).emit('room_joined', {
      roomId: cleanRoomId,
      players: room.players
    });

    socket.emit('game_matched', { roomId: cleanRoomId, symbol: 'O', opponentId: player1Id });
    io.to(player1Id).emit('game_matched', { roomId: cleanRoomId, symbol: 'X', opponentId: socket.id });
  });

  // Relaying Move
  socket.on('send_move', ({ roomId, cellIndex, player }) => {
    socket.to(roomId).emit('receive_move', { cellIndex, player });
  });

  // Reset Game / Rematch
  socket.on('request_rematch', ({ roomId }) => {
    const cleanRoomId = roomId ? String(roomId).trim().toUpperCase() : '';
    console.log(`[Rematch] Player ${socket.id} requested rematch in room ${cleanRoomId}`);
    if (cleanRoomId) {
      socket.to(cleanRoomId).emit('rematch_requested', { requestedBy: socket.id });
    }
  });

  socket.on('accept_rematch', ({ roomId }) => {
    const cleanRoomId = roomId ? String(roomId).trim().toUpperCase() : '';
    console.log(`[Rematch] Player ${socket.id} accepted rematch in room ${cleanRoomId}`);
    if (cleanRoomId) {
      io.to(cleanRoomId).emit('rematch_started');
    }
  });

  // Explicit Leave Room handler
  socket.on('leave_room', ({ roomId }) => {
    const cleanRoomId = roomId ? String(roomId).trim().toUpperCase() : '';
    if (cleanRoomId) {
      console.log(`[Room] Player ${socket.id} left room ${cleanRoomId}`);
      socket.to(cleanRoomId).emit('opponent_left', { message: 'Opponent left the game' });
      socket.leave(cleanRoomId);
      rooms.delete(cleanRoomId);
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);

    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }

    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        socket.to(roomId).emit('opponent_left', { message: 'Opponent disconnected' });
        rooms.delete(roomId);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Socket.io backend running on port ${PORT}`);
});
