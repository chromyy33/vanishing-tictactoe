'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const MouseTrail: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);
  const isXRef = useRef<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = [
      '#ff4757', // Neon Red/Pink (Player X)
      '#a3e635', // Neon Lime/Green (Player O)
      '#00e5b0', // Neon Cyan
      '#ff2d78', // Hot Magenta
      '#e056fd', // Neon Purple
    ];

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle trail particle creation to every 35ms
      if (now - lastTimeRef.current < 35) return;
      lastTimeRef.current = now;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Alternate between X and O
      const symbol = isXRef.current ? '✕' : '○';
      isXRef.current = !isXRef.current;

      const color = colors[Math.floor(Math.random() * colors.length)];
      const fontSize = Math.floor(Math.random() * 8) + 14; // 14px to 22px

      // Create particle DOM node
      const el = document.createElement('div');
      el.innerText = symbol;
      el.className = 'absolute pointer-events-none font-black select-none z-20 flex items-center justify-center';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.color = color;
      el.style.fontSize = `${fontSize}px`;
      el.style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
      el.style.transform = 'translate(-50%, -50%) scale(0.6)';
      el.style.opacity = '0.95';

      container.appendChild(el);

      // Random trajectories using GSAP
      const deltaX = (Math.random() - 0.5) * 35;
      const deltaY = -25 - Math.random() * 25; // Float upwards
      const rotation = (Math.random() - 0.5) * 80;

      gsap.to(el, {
        x: deltaX,
        y: deltaY,
        rotation: rotation,
        scale: 1.3,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.out',
        onComplete: () => {
          if (el.parentNode === container) {
            container.removeChild(el);
          }
        },
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-10"
    />
  );
};
