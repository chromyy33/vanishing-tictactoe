import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-bebas',
  weight: '400',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Vanishing TicTacToe | Dynamic 3-Mark Rolling Board Game',
  description: 'Experience Vanishing TicTacToe, a fast-paced twist on classic tic-tac-toe where players only keep 3 marks on the board. Features 3D board visuals, Pass & Play, AI with Minimax hard mode, and real-time online multiplayer.',
  keywords: ['Vanishing TicTacToe', 'Tic Tac Toe', 'Minimax AI', 'Web Game', 'Multiplayer Game', 'Next.js Game'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${bebasNeue.variable} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
