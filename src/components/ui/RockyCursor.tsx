import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

export const RockyCursor: React.FC = () => {
  const cursorRef =
    useRef<HTMLImageElement | null>(null);

  const [isPointer, setIsPointer] =
    useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) return;

    let targetX = -200;
    let targetY = -200;

    let currentX = -200;
    let currentY = -200;

    let animationFrame = 0;

    const handleMouseMove = (
      event: MouseEvent
    ) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const handlePointerOver = (
      event: MouseEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      if (!target) return;

      const interactiveElement =
        target.closest(
          'a, button, input, textarea, select, [role="button"], [tabindex]'
        );

      setIsPointer(
        Boolean(interactiveElement)
      );
    };

    const handlePointerOut = (
      event: MouseEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      if (!target) return;

      const interactiveElement =
        target.closest(
          'a, button, input, textarea, select, [role="button"], [tabindex]'
        );

      if (!interactiveElement) return;

      const relatedTarget =
        event.relatedTarget as Node | null;

      if (
        relatedTarget &&
        interactiveElement.contains(
          relatedTarget
        )
      ) {
        return;
      }

      setIsPointer(false);
    };

    const animate = () => {
      currentX +=
        (targetX - currentX) * 0.22;

      currentY +=
        (targetY - currentY) * 0.22;

      cursor.style.transform =
        `translate3d(
          ${currentX + 10}px,
          ${currentY + 10}px,
          0
        )`;

      animationFrame =
        requestAnimationFrame(animate);
    };

    window.addEventListener(
      'mousemove',
      handleMouseMove,
      { passive: true }
    );

    window.addEventListener(
      'mouseover',
      handlePointerOver,
      { passive: true }
    );

    window.addEventListener(
      'mouseout',
      handlePointerOut,
      { passive: true }
    );

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );

      window.removeEventListener(
        'mouseover',
        handlePointerOver
      );

      window.removeEventListener(
        'mouseout',
        handlePointerOut
      );

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, []);

  return (
    <img
      ref={cursorRef}
      src={
        isPointer
          ? '/assets/about/rocky-pointer.png'
          : '/assets/about/rocky.png'
      }
      alt=""
      aria-hidden="true"
      draggable={false}
      className={[
        'rocky-custom-cursor',
        isPointer
          ? 'rocky-custom-cursor--pointer'
          : '',
      ].join(' ')}
    />
  );
};

export default RockyCursor;