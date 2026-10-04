import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,

        // Starts fading in slightly before the element
        // is completely inside the viewport.
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,

        transform: visible
          ? 'translateY(0px)'
          : 'translateY(35px)',

        transition: `
          opacity 900ms ease-out ${delay}ms,
          transform 900ms ease-out ${delay}ms
        `,
      }}
    >
      {children}
    </div>
  );
};