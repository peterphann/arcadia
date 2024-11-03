"use client";

import React, { useEffect, useRef } from "react";
import * as hol from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";

interface Props {
  setLandmarks: any;
  setPoseLandmarks: (landmarks: any) => void;
  setHandLandmarks: (landmarks: any) => void;
}

export const HolisticModel: React.FC<Props> = ({
  setLandmarks,
  setPoseLandmarks,
  setHandLandmarks,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<cam.Camera | null>(null);

  // Use a ref to store the last pose landmarks
  const lastPoseLandmarksRef = useRef<any>(null);
  const lastHandLandmarksRef = useRef<any>(null);
  const lastUpdateTime = useRef<number>(Date.now());

  useEffect(() => {
    const holistic = new hol.Holistic({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
      refineFaceLandmarks: true,
    });

    holistic.onResults((results: any) => {
      const currentTime = Date.now();
      if (results.poseLandmarks && currentTime - lastUpdateTime.current >= 10) {
        setLandmarks(results);

        if (results.poseLandmarks) {
          // Check if the new pose landmarks are different from the last ones
          const newLandmarks = results.poseLandmarks;
          if (
            JSON.stringify(newLandmarks) !==
            JSON.stringify(lastPoseLandmarksRef.current)
          ) {
            setPoseLandmarks(newLandmarks); // Update only if there's a change
            // console.log(newLandmarks);
            lastPoseLandmarksRef.current = newLandmarks; // Update the ref with the new landmarks
          }
        }
        if (results.rightHandLandmarks) {
          // Check if the new pose landmarks are different from the last ones
          const newHandmarks = results.rightHandLandmarks;
          if (
            JSON.stringify(newHandmarks) !==
            JSON.stringify(lastPoseLandmarksRef.current)
          ) {
            setHandLandmarks(newHandmarks); // Update only if there's a change
            // console.log(newLandmarks);
            lastHandLandmarksRef.current = newHandmarks; // Update the ref with the new landmarks
          }
        }
        if (results.leftHandLandmarks) {
          // Check if the new pose landmarks are different from the last ones
          const newHandmarks = results.leftHandLandmarks;
          if (
            JSON.stringify(newHandmarks) !==
            JSON.stringify(lastPoseLandmarksRef.current)
          ) {
            setHandLandmarks(newHandmarks); // Update only if there's a change
            // console.log(newLandmarks);
            lastHandLandmarksRef.current = newHandmarks; // Update the ref with the new landmarks
          }
        }
      }
    });

    if (videoRef.current) {
      cameraRef.current = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await holistic.send({
              image: videoRef.current as HTMLVideoElement,
            });
          }
        },
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
    }

    // Cleanup on component unmount
    return () => {
      cameraRef.current?.stop();
    };
  }, [setPoseLandmarks, setHandLandmarks]);

  return <video ref={videoRef} autoPlay playsInline muted hidden />;
};

// const drawResults = (results: any) => {
//   const videoElement = videoRef.current;
//   const canvasElement = canvasRef.current;
//   const ctx = canvasElement?.getContext("2d");

//   if (videoElement && canvasElement && ctx) {
//     // Clear the canvas before drawing
//     ctx.save();
//     ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

//     // Use `Mediapipe` drawing functions
//     draw.drawConnectors(ctx, results.poseLandmarks, hol.POSE_CONNECTIONS, {
//       color: "#00cff7",
//       lineWidth: 4,
//     });
//     draw.drawLandmarks(ctx, results.poseLandmarks, {
//       color: "#ff0364",
//       lineWidth: 2,
//     });
//     draw.drawConnectors(
//       ctx,
//       results.faceLandmarks,
//       hol.FACEMESH_TESSELATION,
//       {
//         color: "#C0C0C070",
//         lineWidth: 1,
//       },
//     );
//     if (results.faceLandmarks && results.faceLandmarks.length === 478) {
//       //draw pupils
//       draw.drawLandmarks(
//         ctx,
//         [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
//         {
//           color: "#ffe603",
//           lineWidth: 2,
//         },
//       );
//     }
//     draw.drawConnectors(
//       ctx,
//       results.leftHandLandmarks,
//       hol.HAND_CONNECTIONS,
//       {
//         color: "#eb1064",
//         lineWidth: 5,
//       },
//     );
//     draw.drawLandmarks(ctx, results.leftHandLandmarks, {
//       color: "#00cff7",
//       lineWidth: 2,
//     });
//     draw.drawConnectors(
//       ctx,
//       results.rightHandLandmarks,
//       hol.HAND_CONNECTIONS,
//       {
//         color: "#22c3e3",
//         lineWidth: 5,
//       },
//     );
//     draw.drawLandmarks(ctx, results.rightHandLandmarks, {
//       color: "#ff0364",
//       lineWidth: 2,
//     });
//   }
// };
