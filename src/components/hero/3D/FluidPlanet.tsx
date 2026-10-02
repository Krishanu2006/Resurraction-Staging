import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FluidPlanetProps {
  position?: [number, number, number];
  scale?: number;
}

export const FluidPlanet: React.FC<FluidPlanetProps> = ({
  position = [-4.5, -1.5, -7],
  scale = 1,
}) => {
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y +=
        delta * 0.035;
    }
  });

  return (
    <group
      position={position}
      scale={scale}
    >
      <mesh ref={planetRef}>
        <sphereGeometry
          args={[2.6, 96, 96]}
        />

        <meshStandardMaterial
          color="#27752d"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* Warm atmospheric rim */}
      <mesh scale={1.025}>
        <sphereGeometry
          args={[2.6, 64, 64]}
        />

        <meshBasicMaterial
          color="#d18b45"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};