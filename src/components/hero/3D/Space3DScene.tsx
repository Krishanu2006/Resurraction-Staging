import React, { useRef } from 'react';
import {
    Canvas,
    useFrame,
    useThree,
} from '@react-three/fiber';

import * as THREE from 'three';

import { StarField } from './StarField';
import { Saturn } from './Saturn';
import { Satellite } from './Satellite';
import { FluidPlanet } from './FluidPlanet';
import { GreenScrollOverlay } from './GreenScrollOverlay';

interface Space3DSceneProps {
    mouseX?: number;
    mouseY?: number;
    scrollY?: number;
}

interface CameraControllerProps {
    mouseX: number;
    mouseY: number;
    scrollY: number;
}

const CameraController: React.FC<CameraControllerProps> = ({
  mouseX,
  mouseY,
  scrollY,
}) => {
  const { camera } = useThree();

  const targetPosition = useRef(new THREE.Vector3());

  useFrame(() => {
    const progress = THREE.MathUtils.clamp(
      scrollY / 900,
      0,
      1
    );

    // Much stronger camera movement
    const targetZ = 10 - progress * 7;

    const targetX =
      mouseX * 1.8 + progress * 2.0;

    const targetY =
      -mouseY * 1.2 + progress * 1.0;

    targetPosition.current.set(
      targetX,
      targetY,
      targetZ
    );

    // Faster response
    camera.position.lerp(
      targetPosition.current,
      0.08
    );

    // Camera travels deeper into the scene
    camera.lookAt(
      progress * 2.0,
      progress * 0.5,
      -2 - progress * 4
    );
  });

  return null;
};

export const Space3DScene: React.FC<
    Space3DSceneProps
> = ({
    mouseX = 0,
    mouseY = 0,
    scrollY = 0,
}) => {
        return (
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            >
                <Canvas
                    dpr={[1, 1.5]}
                    camera={{
                        position: [0, 0, 10],
                        fov: 48,
                        near: 0.1,
                        far: 100,
                    }}
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: 'high-performance',
                    }}
                >
                    <CameraController
                        mouseX={mouseX}
                        mouseY={mouseY}
                        scrollY={scrollY}
                    />

                    {/* Ambient space lighting */}
                    <ambientLight intensity={0.32} />

                    {/* Main warm light */}
                    <directionalLight
                        position={[5, 4, 6]}
                        intensity={2.4}
                        color="#ffe2cf"
                    />

                    {/* Secondary cooler light */}
                    <pointLight
                        position={[-5, 2, 2]}
                        intensity={1.2}
                        distance={18}
                        color="#9bb8ff"
                    />

                    <StarField count={450} />
                    <GreenScrollOverlay scrollY={scrollY} />

                    <StarField count={450} />

                    {/* <Saturn
                        position={[5.0, 1.0, -6]}
                        scale={0.5}
                        rotationSpeed={0.055}
                        scrollY={scrollY}
                    /> */}

                    {/* Large Saturn */}
                    <Saturn
                        position={[9, 1, -9]}
                        scale={0.3}
                        rotationSpeed={0.2}
                        scrollY={scrollY}
                    />

                    {/* Smaller spacecraft */}
                    <Satellite
                        position={[-3.5, 1.5, -3]}
                        scale={0.16}
                        speed={0.35}
                        orbitRadius={1.3}
                        phase={0}
                    />

                    <Satellite
                        position={[3.8, -1.4, -7]}
                        scale={0.12}
                        speed={0.25}
                        orbitRadius={1.7}
                        phase={2}
                    />

                    <Satellite
                        position={[0.5, 2.4, -14]}
                        scale={0.09}
                        speed={0.18}
                        orbitRadius={2}
                        phase={4}
                    />

                    {/* Distant fluid planet */}
                    <FluidPlanet
                        position={[-9, -1.8, -10]}
                        scale={0.3}
                    />
                </Canvas>
            </div>
        );
    };