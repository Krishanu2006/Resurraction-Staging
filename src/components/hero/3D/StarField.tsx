import React, { useMemo } from 'react';

interface StarFieldProps {
  count?: number;
}

export const StarField: React.FC<StarFieldProps> = ({
  count = 450,
}) => {
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const radius = 8 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      values[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta);

      values[i * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta);

      values[i * 3 + 2] =
        radius * Math.cos(phi);
    }

    return values;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.035}
        color="#ffffff"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};