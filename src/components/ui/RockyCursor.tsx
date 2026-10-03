import React, { useEffect, useRef } from 'react';

export const RockyCursor: React.FC = () => {
  const cursorRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animationFrame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const animate = () => {
      // Smooth cursor movement
      currentX += (targetX - currentX) * 0.28;
      currentY += (targetY - currentY) * 0.28;

      cursor.style.transform = `translate3d(
        ${currentX - 30}px,
        ${currentY - 20}px,
        0
      )`;

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, {
      passive: true,
    });

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <img
      ref={cursorRef}
      src="/assets/about/rocky.png"
      alt=""
      aria-hidden="true"
      className="rocky-custom-cursor"
      draggable={false}
    />
  );
};