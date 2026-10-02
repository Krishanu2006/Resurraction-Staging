import React from 'react';

export const SectionTransition: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '220px',
        pointerEvents: 'none',
        zIndex: 5,

        background: `
          linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.45) 35%,
            rgba(0, 0, 0, 0.85) 70%,
            #000000 100%
          )
        `,
      }}
    />
  );
};