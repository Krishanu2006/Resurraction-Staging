import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SaturnProps {
    position?: [number, number, number];
    scale?: number;
    rotationSpeed?: number;
    scrollY?: number;
}

export const Saturn: React.FC<SaturnProps> = ({
    position = [3.2, 0.8, -5],
    scale = 0.55,
    rotationSpeed = 0.2,
    scrollY = 0,
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const planetRef = useRef<THREE.Mesh>(null);
    const ringsRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        const progress = THREE.MathUtils.clamp(
            scrollY / 900,
            0,
            1
        );

        if (groupRef.current) {
            groupRef.current.position.x =
                position[0] + progress * 1.8;

            groupRef.current.position.y =
                position[1] + progress * 0.5;

            groupRef.current.position.z =
                position[2] - progress * 2.5;
        }

        if (planetRef.current) {
            planetRef.current.rotation.y +=
                delta * rotationSpeed;
        }

        if (ringsRef.current) {
            ringsRef.current.rotation.z +=
                delta * rotationSpeed * 0.18;
        }
    });
    return (
        <group
            ref={groupRef}
            position={position}
            scale={scale}
        >
            {/* Saturn */}
            <mesh ref={planetRef}>
                <sphereGeometry args={[1.7, 96, 96]} />

                <meshStandardMaterial
                    color="#c99a78"
                    roughness={0.78}
                    metalness={0.02}
                />
            </mesh>

            {/* Subtle atmospheric glow */}
            <mesh scale={1.025}>
                <sphereGeometry args={[1.7, 64, 64]} />

                <meshBasicMaterial
                    color="#e4b99b"
                    transparent
                    opacity={0.055}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Saturn rings */}
            <group
                ref={ringsRef}
                rotation={[
                    THREE.MathUtils.degToRad(66),
                    0,
                    THREE.MathUtils.degToRad(-12),
                ]}
            >
                <mesh>
                    <ringGeometry
                        args={[2.15, 3.35, 128]}
                    />

                    <meshStandardMaterial
                        color="#b99680"
                        transparent
                        opacity={0.72}
                        side={THREE.DoubleSide}
                        roughness={0.9}
                    />
                </mesh>

                {/* Inner ring */}
                <mesh>
                    <ringGeometry
                        args={[1.95, 2.12, 128]}
                    />

                    <meshStandardMaterial
                        color="#e2c5ae"
                        transparent
                        opacity={0.42}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Outer faint ring */}
                <mesh>
                    <ringGeometry
                        args={[3.35, 3.55, 128]}
                    />

                    <meshStandardMaterial
                        color="#92725f"
                        transparent
                        opacity={0.28}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>
        </group>
    );
};