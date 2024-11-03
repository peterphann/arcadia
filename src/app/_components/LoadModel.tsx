"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { animateVRM } from "./Animate";
import { getSession } from "next-auth/react";

interface Props {
  landmarks: any; // Add the type according to your data structure
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VrmModelViewer: React.FC<Props> = ({ landmarks, videoRef }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const currentVrmRef = useRef<any>(null);
  const landmarksRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [modelPath, setModelPath] = useState<string | null>(null);

  useEffect(() => {
    landmarksRef.current = landmarks;
  }, [landmarks]);

  useEffect(() => {
    if (!userId) {
      const fetchUserId = async () => {
        const session = await getSession();
        if (session?.user?.email) {
          try {
            const response = await fetch("/api/getUserIdByEmail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: session.user.email }),
            });
            const data = await response.json();
            if (response.ok) {
              setUserId(data.userId);
              console.log("Fetched userId:", data.userId);
            } else {
              console.error("Error fetching user ID:", data.error);
            }
          } catch (error) {
            console.error("Error fetching user ID:", error);
          }
        }
      };
      fetchUserId();
    }
  }, [userId]);

  useEffect(() => {
    const fetchModelPath = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/profile?userId=${userId}`);
        const data = await response.json();

        if (response.ok && data.model_path) {
          setModelPath(data.model_path); // Set modelPath state with fetched path
        } else {
          console.error(
            "Failed to load model path:",
            data.error || "No model path found",
          );
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching model path:", error);
        setLoading(false);
      }
    };

    fetchModelPath();
  }, [userId]);

  useEffect(() => {
    // Only run if modelPath is available
    if (!modelPath) return;

    // renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const w = 500;
    const h = window.innerHeight;

    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current?.appendChild(renderer.domElement);

    // camera
    const orbitCamera = new THREE.PerspectiveCamera(35, w / h, 0.1, 1000);
    orbitCamera.position.set(0.0, 1.4, 2.9);

    // controls
    const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
    orbitControls.screenSpacePanning = true;
    orbitControls.target.set(0.0, 0.9, 0.0);
    orbitControls.update();

    // scene
    const scene = new THREE.Scene();

    // light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(light);

    // Main Render Loop
    const clock = new THREE.Clock();

    /* VRM CHARACTER SETUP */
    const loader = new GLTFLoader();
    loader.crossOrigin = "anonymous";

    loader.register((parser: any) => {
      return new VRMLoaderPlugin(parser);
    });

    loader.load(
      modelPath, // Dynamically load modelPath from API
      (gltf: any) => {
        const vrm = gltf.userData.vrm;

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);

        vrm.scene.traverse((obj: any) => {
          obj.frustumCulled = false;
        });

        scene.add(vrm.scene);
        currentVrmRef.current = vrm;
        vrm.scene.rotation.y = Math.PI; // Rotate model 180deg to face camera

        setInterval(() => {
          setLoading(false);
        }, 3000);

        console.log("Loaded model");
      },
      undefined,
      (error: any) => console.error("Error loading VRM model:", error),
    );

    function animate() {
      requestAnimationFrame(animate);

      const currentVrm = currentVrmRef.current;
      const landmarks = landmarksRef.current;

      if (currentVrm) {
        currentVrm.humanoid.getRawBoneNode("leftUpperArm").rotation.z = 1.4;
        currentVrm.humanoid.getRawBoneNode("rightUpperArm").rotation.z = -1.4;
      }

      if (currentVrm && landmarks) {
        animateVRM(currentVrm, landmarks, videoRef);
        currentVrm.update(clock.getDelta());
      }
      renderer.render(scene, orbitCamera);
    }

    animate();
  }, [modelPath]); // Re-run this effect if modelPath changes

  return (
    <div className="mt-20 ml-6">
      {loading && <p>Loading model...</p>}
      <div ref={mountRef} />
    </div>
  );
};

export default VrmModelViewer;
