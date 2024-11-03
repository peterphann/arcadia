"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useRouter } from "next/navigation";

function lerp(x: number, y: number, a: number) {
  return (1 - a) * x + a * y;
}

function easeInOutSine(t: number) {
  return -0.5 * (Math.cos(Math.PI * t) - 1);
}

interface ThreeSceneProps {
  startAnim: boolean;
  leaderAnim: boolean;
  route: string;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({
  startAnim,
  leaderAnim,
  route,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cabinetRef = useRef<THREE.Group | null>(null);
  const floorRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef(new THREE.Scene());
  const isAnimatingRef = useRef(false);
  const router = useRouter();

  const initRendererAndCamera = () => {
    if (rendererRef.current || cameraRef.current) return;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
  };

  const animateCamera = () => {
    if (!cameraRef.current) return;

    isAnimatingRef.current = true;
    const duration = 1; // Animation duration in seconds
    const startTime = performance.now();
    const initialPosition = cameraRef.current.position.clone();
    const targetPosition = new THREE.Vector3(-3, 1.25, 0.5);
    const initialRotationX = cameraRef.current.rotation.x;
    const targetRotationX = -0.15;
    let startingCabinetRotationY = 0;
    if (cabinetRef.current) {
      startingCabinetRotationY = cabinetRef.current.rotation.y;
    }

    function animate(time: number) {
      const elapsed = (time - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      cameraRef.current!.position.lerpVectors(
        initialPosition,
        targetPosition,
        easeInOutSine(progress),
      );
      cameraRef.current!.rotation.x = lerp(
        initialRotationX,
        targetRotationX,
        easeInOutSine(progress),
      );

      if (cabinetRef.current) {
        const targetCabinetRotationY =
          Math.round(startingCabinetRotationY / (2 * Math.PI)) * (2 * Math.PI) -
          Math.PI / 2;
        cabinetRef.current.rotation.y = lerp(
          startingCabinetRotationY,
          targetCabinetRotationY,
          easeInOutSine(progress),
        );
      }

      rendererRef.current?.render(sceneRef.current, cameraRef.current!);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          router.push(route);
        }, 1000);
      }
    }

    requestAnimationFrame(animate);
  };

  const animateLeaderboards = () => {
    if (!cameraRef.current) return;

    const duration = 1.5; // Animation duration in seconds
    const startTime = performance.now();
    const initialPosition = cameraRef.current.position.clone();
    const targetPosition = new THREE.Vector3(-0.8, 1.4, -6.3);
    const initialRotationX = cameraRef.current.rotation.x;
    const targetRotationX = -0.45;

    function animate(time: number) {
      const elapsed = (time - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      cameraRef.current!.position.lerpVectors(
        initialPosition,
        targetPosition,
        easeInOutSine(progress),
      );
      cameraRef.current!.rotation.x = lerp(
        initialRotationX,
        targetRotationX,
        easeInOutSine(progress),
      );

      rendererRef.current?.render(sceneRef.current, cameraRef.current!);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          router.push(route);
        }, 1000);
      }
    }

    requestAnimationFrame(animate);
  };
  
  const handleScroll = (event: Event) => {
    if (!cameraRef.current || startAnim || leaderAnim) return;
    const delta = (event as WheelEvent).deltaY;
    if (delta < 0) {
      cameraRef.current.position.z = Math.max(cameraRef.current.position.z + (delta * 0.01), 4);
    } else {
      cameraRef.current.position.z = Math.min(cameraRef.current.position.z + (delta * 0.01), 6);
    }
}

  useEffect(() => {
    initRendererAndCamera();

    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;

    const light = new THREE.AmbientLight(0xffffff, 0.5);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    const spotlight = new THREE.SpotLight(
      0xffffff,
      10.0,
      10.0,
      Math.PI / 4,
      1,
      0,
    );
    dirLight.position.set(1, 2, 0);
    dirLight.target.position.set(-1, 0, 0);
    dirLight.castShadow = true;

    spotlight.position.set(0, 2, 1);
    spotlight.target.position.set(0, 0, 0);
    spotlight.castShadow = true;

    scene.add(light);
    scene.add(dirLight);
    scene.add(dirLight.target);
    scene.add(spotlight);
    scene.add(spotlight.target);

    // Load models
    const loader = new GLTFLoader();
    loader.load("/cabinet.glb", (glb) => {
      const cabinet = glb.scene;
      cabinet.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      cabinet.position.set(-3, -1.5, 0);
      cabinet.rotation.y = -(Math.PI / 2);
      cabinet.scale.set(0.7, 0.7, 0.7);
      scene.add(cabinet);
      cabinetRef.current = cabinet;
    });

    loader.load("/box.glb", (glb) => {
      const floor = glb.scene;
      floor.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.receiveShadow = true;
        }
      });
      floor.position.set(0, -2.5, 0);
      scene.add(floor);
      floorRef.current = floor;
    });

    const animate = () => {
      if (cabinetRef.current && !isAnimatingRef.current) {
        cabinetRef.current.rotation.y += 0.01;
      }
      requestAnimationFrame(animate);
      renderer?.render(scene, camera!);
    };

    animate();
    window.addEventListener('wheel', handleScroll);

    return () => {
      window.removeEventListener('wheel', handleScroll)
    }
  }, []);

  useEffect(() => {
    if (startAnim && cabinetRef.current && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animateCamera();
    }
  }, [startAnim]);

  useEffect(() => {
    if (leaderAnim && cabinetRef.current && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animateLeaderboards();
    }
  }, [leaderAnim]);

  return <div className="h-[100vh] w-[100vw]" ref={mountRef} />;
};

export default ThreeScene;
