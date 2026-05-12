import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { useRef, useEffect, Suspense } from "react";
import { motion } from "motion/react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import type { FaceExpression } from "../hooks/useFaceDetection";

interface HumanModelProps {
  isWorking: boolean;
  isDistracted: boolean;
  expression: FaceExpression;
}

function HumanModel({ isWorking, isDistracted, expression }: HumanModelProps) {
  const fbx = useLoader(
    FBXLoader,
    "/src/components/3dModel/55-rp_nathan_animated_003_walking_fbx/rp_nathan_animated_003_walking.fbx",
  );
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const jawRef = useRef<THREE.Object3D | null>(null);
  const leftEyeRef = useRef<THREE.Object3D | null>(null);
  const rightEyeRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (fbx) {
      // Scale and position the model
      fbx.scale.set(0.01, 0.01, 0.01);
      fbx.position.set(0, -1, 0);
      fbx.rotation.y = 0;

      // Stop all animations - model stays stationary
      if (fbx.animations && fbx.animations.length > 0) {
        mixerRef.current = new THREE.AnimationMixer(fbx);
      }

      // Find bones for animation
      fbx.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.needsUpdate = true;
          }
        }

        const name = child.name.toLowerCase();

        // Find facial bones
        if (name.includes("head") && !headRef.current) {
          headRef.current = child;
          console.log("Found head bone:", child.name);
        }
        if (name.includes("jaw") || name.includes("chin")) {
          jawRef.current = child;
          console.log("Found jaw bone:", child.name);
        }
        if (name.includes("eye") && name.includes("left")) {
          leftEyeRef.current = child;
          console.log("Found left eye bone:", child.name);
        }
        if (name.includes("eye") && name.includes("right")) {
          rightEyeRef.current = child;
          console.log("Found right eye bone:", child.name);
        }
      });
    }
  }, [fbx]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Subtle breathing motion
    if (fbx) {
      fbx.position.y = -1 + Math.sin(t * 1.2) * 0.015;
    }

    // Head animation based on state and expression
    if (headRef.current) {
      if (isDistracted) {
        // Quick head shake when distracted
        headRef.current.rotation.y = Math.sin(t * 6) * 0.15;
        headRef.current.rotation.x = Math.sin(t * 4) * 0.05;
      } else if (expression.isSurprised) {
        // Surprised - head tilts back slightly
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          -0.1,
          0.1,
        );
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          Math.sin(t * 0.5) * 0.05,
          0.1,
        );
      } else if (expression.isSmiling) {
        // Smiling - slight head tilt
        headRef.current.rotation.z = THREE.MathUtils.lerp(
          headRef.current.rotation.z,
          Math.sin(t * 0.8) * 0.05,
          0.05,
        );
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          Math.sin(t * 0.5) * 0.03,
          0.05,
        );
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0,
          0.05,
        );
      } else if (expression.isFrowning) {
        // Frowning - head tilts down slightly
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0.08,
          0.1,
        );
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          0,
          0.1,
        );
      } else if (isWorking) {
        // Focused - minimal movement, looking at you
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          Math.sin(t * 0.5) * 0.03,
          0.05,
        );
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          Math.sin(t * 0.3) * 0.02,
          0.05,
        );
        headRef.current.rotation.z = THREE.MathUtils.lerp(
          headRef.current.rotation.z,
          0,
          0.05,
        );
      } else {
        // Idle - gentle head movement
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          Math.sin(t * 0.4) * 0.05,
          0.05,
        );
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0,
          0.05,
        );
        headRef.current.rotation.z = THREE.MathUtils.lerp(
          headRef.current.rotation.z,
          0,
          0.05,
        );
      }
    }

    // Jaw animation for mouth openness
    if (jawRef.current) {
      const targetRotation = expression.mouthOpenness * 0.3; // Max 0.3 radians (~17 degrees)
      jawRef.current.rotation.x = THREE.MathUtils.lerp(
        jawRef.current.rotation.x,
        targetRotation,
        0.2,
      );
    }

    // Eye animation for blinking/surprise
    if (leftEyeRef.current && rightEyeRef.current) {
      const targetScale = expression.eyeOpenness;

      // Scale eyes vertically for open/closed effect
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.y,
        targetScale,
        0.3,
      );
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(
        rightEyeRef.current.scale.y,
        targetScale,
        0.3,
      );

      // Add natural blinking
      if (!expression.isSurprised && Math.random() < 0.01) {
        leftEyeRef.current.scale.y = 0.1;
        rightEyeRef.current.scale.y = 0.1;
      }
    }
  });

  return <primitive ref={modelRef} object={fbx} />;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 1.8, 0.3]} />
      <meshStandardMaterial color="#4f46e5" />
    </mesh>
  );
}

interface Companion3DProps {
  isWorking: boolean;
  isDistracted: boolean;
  expression: FaceExpression;
}

export function Companion3D({
  isWorking,
  isDistracted,
  expression,
}: Companion3DProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.2, 2.5], fov: 40 }}
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <spotLight
          position={[3, 5, 3]}
          angle={0.4}
          penumbra={1}
          intensity={1.2}
          castShadow
          color={isDistracted ? "#eb4444" : "#c3c0ff"}
        />
        <pointLight position={[-3, 2, -2]} color="#4f46e5" intensity={0.4} />
        <ambientLight intensity={0.7} />

        <Suspense fallback={<LoadingFallback />}>
          <HumanModel
            isWorking={isWorking}
            isDistracted={isDistracted}
            expression={expression}
          />
          <ContactShadows
            position={[0, -1, 0]}
            opacity={0.4}
            scale={8}
            blur={2}
            far={3}
          />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* HUD overlay during distraction */}
      {isDistracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none border-2 border-error/20 rounded-3xl"
          style={{ boxShadow: "inset 0 0 50px rgba(235, 68, 68, 0.1)" }}
        />
      )}

      {/* Expression debug overlay */}
      {(expression.isSmiling ||
        expression.isFrowning ||
        expression.isSurprised) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: expression.isSmiling
              ? "rgba(78, 222, 163, 0.2)"
              : expression.isSurprised
                ? "rgba(195, 192, 255, 0.2)"
                : "rgba(235, 68, 68, 0.2)",
            border: `1px solid ${
              expression.isSmiling
                ? "#4edea3"
                : expression.isSurprised
                  ? "#c3c0ff"
                  : "#eb4444"
            }`,
            color: expression.isSmiling
              ? "#4edea3"
              : expression.isSurprised
                ? "#c3c0ff"
                : "#eb4444",
          }}
        >
          {expression.isSmiling
            ? "😊 Smiling"
            : expression.isSurprised
              ? "😲 Surprised"
              : "😟 Frowning"}
        </motion.div>
      )}
    </div>
  );
}
