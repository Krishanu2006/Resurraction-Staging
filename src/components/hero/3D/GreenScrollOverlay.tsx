import React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface GreenScrollOverlayProps {
  scrollY: number;
}

export const GreenScrollOverlay: React.FC<
  GreenScrollOverlayProps
> = ({ scrollY }) => {
  const materialRef =
    React.useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    const progress = THREE.MathUtils.clamp(
      scrollY / 900,
      0,
      1
    );

    materialRef.current.uniforms.uTime.value =
      clock.getElapsedTime();

    materialRef.current.uniforms.uProgress.value =
      progress;
  });

  return (
    <mesh position={[0, 0, -3]}>
      <planeGeometry args={[30, 20]} />

      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;

          void main() {
            vUv = uv;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uProgress;

          varying vec2 vUv;

          float wave(vec2 p) {
            float w = 0.0;

            w += sin(
              p.x * 5.0 +
              uTime * 0.45
            ) * 0.5;

            w += sin(
              p.y * 7.0 -
              uTime * 0.35
            ) * 0.35;

            w += sin(
              (p.x + p.y) * 10.0 +
              uTime * 0.25
            ) * 0.15;

            return w;
          }

          void main() {

            vec2 uv = vUv;

            /*
             * Distance from center.
             * Keeps the middle relatively clean
             * for the hero content.
             */
            float edge =
              distance(uv, vec2(0.5));

            /*
             * Slow fluid distortion.
             */
            float distortion =
              wave(uv * 1.4);

            /*
             * Green energy appears progressively
             * as the user scrolls.
             */
            float intensity =
              smoothstep(
                0.08,
                0.75,
                uProgress
              );

            /*
             * Concentrate the effect toward
             * the edges.
             */
            float edgeGlow =
              smoothstep(
                0.15,
                0.75,
                edge
              );

            /*
             * Organic flowing mask.
             */
            float fluid =
              smoothstep(
                -0.2,
                0.7,
                distortion
              );

            float alpha =
              intensity *
              edgeGlow *
              fluid *
              0.32;

            /*
             * Green / teal energy.
             */
            vec3 green =
              vec3(
                0.05,
                0.85,
                0.42
              );

            /*
             * Slight warm highlight so
             * it doesn't look flat green.
             */
            vec3 warm =
              vec3(
                0.95,
                0.42,
                0.12
              );

            float warmMix =
              smoothstep(
                0.65,
                1.0,
                uv.x
              ) *
              intensity *
              0.22;

            vec3 color =
              mix(
                green,
                warm,
                warmMix
              );

            gl_FragColor =
              vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
};