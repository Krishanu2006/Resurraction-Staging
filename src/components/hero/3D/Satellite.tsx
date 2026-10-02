import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SatelliteProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  orbitRadius?: number;
  phase?: number;
}

export const Satellite: React.FC<SatelliteProps> = ({
  position,
  scale = 0.22,
  speed = 0.25,
  orbitRadius = 1.2,
  phase = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const time =
      state.clock.getElapsedTime() * speed + phase;

    groupRef.current.position.x =
      position[0] + Math.cos(time) * orbitRadius;

    groupRef.current.position.y =
      position[1] + Math.sin(time * 0.8) * orbitRadius * 0.45;

    groupRef.current.position.z =
      position[2] + Math.sin(time) * orbitRadius * 0.6;

    groupRef.current.rotation.y =
      time * 1.2;

    groupRef.current.rotation.z =
      Math.sin(time) * 0.25;
  });

  return (
    <group
      ref={groupRef}
      scale={scale}
    >
      {/* Main spacecraft body */}
      <mesh>
        <boxGeometry args={[1.1, 0.32, 0.45]} />

        <meshStandardMaterial
          color="#b8aaa0"
          roughness={0.5}
          metalness={0.65}
        />
      </mesh>

      {/* Central module */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.35, 0.18, 0.3]} />

        <meshStandardMaterial
          color="#e5d3c4"
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>

      {/* Left solar panel */}
      <mesh position={[-0.85, 0, 0]}>
        <boxGeometry args={[0.75, 0.04, 0.55]} />

        <meshStandardMaterial
          color="#394c62"
          roughness={0.35}
          metalness={0.7}
        />
      </mesh>

      {/* Right solar panel */}
      <mesh position={[0.85, 0, 0]}>
        <boxGeometry args={[0.75, 0.04, 0.55]} />

        <meshStandardMaterial
          color="#394c62"
          roughness={0.35}
          metalness={0.7}
        />
      </mesh>

      {/* Small antenna */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.35, 8]} />

        <meshStandardMaterial
          color="#d8c9bc"
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
};