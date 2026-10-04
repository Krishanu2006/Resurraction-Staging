import {
  useEffect,
  useRef,
  useState,
} from 'react';

const NORMAL_ROCKY =
  '/assets/about/rocky.png';

const POINTER_ROCKY =
  '/assets/about/rocky-pointer.png';

const RockyCursor = () => {
  const cursorRef =
    useRef<HTMLImageElement | null>(
      null
    );

  const targetX =
    useRef(-200);

  const targetY =
    useRef(-200);

  const currentX =
    useRef(-200);

  const currentY =
    useRef(-200);

  const frameRef =
    useRef<number | null>(null);

  const [isPointer, setIsPointer] =
    useState(false);

  useEffect(() => {
    const handleMove =
      (event: MouseEvent) => {
        targetX.current =
          event.clientX;

        targetY.current =
          event.clientY;
      };

    const handleOver =
      (event: MouseEvent) => {
        const target =
          event.target as HTMLElement | null;

        if (!target) return;

        const interactive =
          target.closest(
            'a, button, input, textarea, select, summary, [role="button"], [tabindex]:not([tabindex="-1"])'
          );

        setIsPointer(
          Boolean(interactive)
        );
      };

    const handleLeave =
      () => {
        targetX.current = -200;
        targetY.current = -200;
      };

    window.addEventListener(
      'mousemove',
      handleMove,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'mouseover',
      handleOver,
      {
        passive: true,
      }
    );

    document.documentElement.addEventListener(
      'mouseleave',
      handleLeave
    );

    /*
     * Animation loop.
     *
     * Rocky smoothly follows the pointer
     * rather than jumping between mouse events.
     */

    const animate = () => {
      currentX.current +=
        (targetX.current -
          currentX.current) *
        0.28;

      currentY.current +=
        (targetY.current -
          currentY.current) *
        0.28;

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate3d(${currentX.current}px, ${currentY.current}px, 0)`;
      }

      frameRef.current =
        requestAnimationFrame(
          animate
        );
    };

    frameRef.current =
      requestAnimationFrame(
        animate
      );

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMove
      );

      window.removeEventListener(
        'mouseover',
        handleOver
      );

      document.documentElement.removeEventListener(
        'mouseleave',
        handleLeave
      );

      if (
        frameRef.current !== null
      ) {
        cancelAnimationFrame(
          frameRef.current
        );
      }
    };
  }, []);

  return (
    <img
      ref={cursorRef}
      className={
        isPointer
          ? 'rocky-custom-cursor rocky-custom-cursor--pointer'
          : 'rocky-custom-cursor'
      }
      src={
        isPointer
          ? POINTER_ROCKY
          : NORMAL_ROCKY
      }
      alt=""
      draggable={false}
      aria-hidden="true"
    />
  );
};

export default RockyCursor;