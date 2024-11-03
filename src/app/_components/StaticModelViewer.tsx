"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ModelViewerProps {
  modelPath: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelPath }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null); // Ref for the model
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up scene, camera, and renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const w = 250;
    const h = 500;

    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current?.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background

    // camera
    const orbitCamera = new THREE.PerspectiveCamera(35, w / h, 0.1, 1000);
    orbitCamera.position.set(0.0, 1.4, 3.0);

    // controls
    const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
    orbitControls.screenSpacePanning = true;
    orbitControls.target.set(0.0, 0.85, 0.0);
    orbitControls.update();

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.crossOrigin = "anonymous";

    loader.register((parser: any) => {
      return new VRMLoaderPlugin(parser);
    });

    loader.load(
      modelPath,
      (gltf: any) => {
        const vrm = gltf.userData.vrm;

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);

        vrm.scene.traverse((obj: any) => {
          obj.frustumCulled = false;
        });

        scene.add(vrm.scene);
        modelRef.current = vrm;

        vrm.scene.rotation.y = Math.PI; // Rotate model 180deg to face camera

        setLoading(false);
        console.log("Loaded model");
      },
      undefined,
      (error: any) => {
        console.error("Error loading model:", error);
      },
    );

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth rotation
      if (modelRef.current) {
        modelRef.current.scene.rotation.y += 0.01; // Adjust rotation speed as needed
        modelRef.current.humanoid.getRawBoneNode("leftUpperArm").rotation.z =
          1.4;
        modelRef.current.humanoid.getRawBoneNode("rightUpperArm").rotation.z =
          -1.4;
      }

      renderer.render(scene, orbitCamera);
    };
    animate();

    // Clean up on component unmount
    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [modelPath]);

  return (
    <div>
      {loading && <p>Loading models...</p>}
      <div ref={mountRef} />
    </div>
  );
};

export default ModelViewer;
