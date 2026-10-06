import React, { useEffect, useRef, useState } from 'react';

type CursorState = 'default' | 'pointer' | 'card' | 'text' | 'pressed';

export const RockyCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);

  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isFinePointer, setIsFinePointer] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has a fine pointer (mouse/trackpad), otherwise hide custom cursor on touch devices
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
      setIsFinePointer(false);
      return;
    }

    document.documentElement.classList.add('has-rocky-cursor');
    document.body.classList.add('has-rocky-cursor');

    const cursor = cursorRef.current;
    const aura = auraRef.current;
    if (!cursor) return;

    let targetX = -200;
    let targetY = -200;
    let currentX = -200;
    let currentY = -200;
    let velX = 0;
    let tiltAngle = 0;
    let isPressed = false;
    let animationFrame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => {
      isPressed = true;
      setCursorState('pressed');
    };

    const handleMouseUp = (event: MouseEvent) => {
      isPressed = false;
      determineState(event.target as HTMLElement | null);
    };

    const determineState = (target: HTMLElement | null) => {
      if (!target || isPressed) return;

      // 1. Check for clickable buttons, links, toggles, controls
      const isClickable = target.closest(
        'a, button, [role="button"], input[type="submit"], input[type="button"], select, [tabindex]:not([tabindex="-1"]), .tracks-arrow, .pagination-dot, .theme-toggle'
      );

      if (isClickable) {
        setCursorState('pointer');
        return;
      }

      // 2. Check for text editing inputs
      const isTextInput = target.closest('input[type="text"], input[type="email"], textarea, [contenteditable="true"]');
      if (isTextInput) {
        setCursorState('text');
        return;
      }

      // 3. Check for cards & rich interactive containers
      const isCard = target.closest(
        '[data-card], .card, .planet-card, .prize-card, .rule-item, .jury-card, .timeline-item, .faq-item, .interactive-card, article'
      );

      if (isCard) {
        setCursorState('card');
        return;
      }

      setCursorState('default');
    };

    const handlePointerOver = (event: MouseEvent) => {
      determineState(event.target as HTMLElement | null);
    };

    const handlePointerOut = (event: MouseEvent) => {
      const related = event.relatedTarget as HTMLElement | null;
      determineState(related);
    };

    const animate = () => {
      // Calculate velocity for responsive dynamic tilt
      const prevX = currentX;

      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;

      velX = currentX - prevX;

      // Lean into motion (max +/- 18 degrees)
      const targetTilt = Math.max(-18, Math.min(18, velX * 1.8));
      tiltAngle += (targetTilt - tiltAngle) * 0.15;

      if (cursor) {
        cursor.style.transform = `translate3d(${currentX - 28}px, ${currentY - 24}px, 0) rotate(${tiltAngle.toFixed(2)}deg)`;
      }

      if (aura) {
        aura.style.transform = `translate3d(${currentX - 35}px, ${currentY - 35}px, 0)`;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('mouseover', handlePointerOver, { passive: true });
    window.addEventListener('mouseout', handlePointerOut, { passive: true });

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handlePointerOver);
      window.removeEventListener('mouseout', handlePointerOut);
      document.documentElement.classList.remove('has-rocky-cursor');
      document.body.classList.remove('has-rocky-cursor');
      cancelAnimationFrame(animationFrame);
    };
  }, [isVisible]);

  if (!isFinePointer) return null;

  const isPointing = cursorState === 'pointer';
  const isCard = cursorState === 'card';
  const isPressed = cursorState === 'pressed';
  const isText = cursorState === 'text';

  return (
    <>
      {/* Dynamic Cosmic Thruster Glow Aura */}
      <div
        ref={auraRef}
        aria-hidden="true"
        className={`rocky-cursor-aura ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${isPointing || isCard ? 'rocky-cursor-aura--active' : ''}`}
        style={{
          opacity: !isVisible ? 0 : isPointing ? 0.85 : isCard ? 0.65 : 0.25,
          transform: 'translate3d(-200px, -200px, 0)',
        }}
      />

      {/* Rocky Avatar Container */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`rocky-custom-cursor-wrapper ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } rocky-state-${cursorState}`}
        style={{
          transform: 'translate3d(-200px, -200px, 0)',
        }}
      >
        <img
          src={
            isPointing
              ? '/assets/about/rocky-pointer.webp'
              : '/assets/about/rocky.webp'
          }
          alt=""
          draggable={false}
          className={[
            'rocky-custom-cursor',
            isPointing ? 'rocky-custom-cursor--pointer' : '',
            isCard ? 'rocky-custom-cursor--card' : '',
            isPressed ? 'rocky-custom-cursor--pressed' : '',
            isText ? 'rocky-custom-cursor--text' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </div>
    </>
  );
};

export default RockyCursor;