/* eslint-disable */
// @ts-nocheck
"use client";
import { useEffect, useRef } from "react";
import * as cam from "@mediapipe/camera_utils";

const PoseWithWebcam: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<cam.Camera | null>(null);

  // Indices of the key body landmarks (avoiding face landmarks)
  const BODY_LANDMARKS = [
    [11, 12], // Shoulders
    [11, 13], // Left arm
    [13, 15], // Left forearm
    [12, 14], // Right arm
    [14, 16], // Right forearm
    [11, 23], // Left torso
    [12, 24], // Right torso
    [23, 25], // Left thigh
    [25, 27], // Left shin
    [24, 26], // Right thigh
    [26, 28], // Right shin
    [23, 24], // Waist
  ];

  useEffect(() => {
    let pose: Pose;

    const loadPose = async () => {
      const poseModule = await import("@mediapipe/pose");

      pose = new poseModule.Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Draw landmarks and body lines on the canvas
      const drawResults = (results: any) => {
        const canvasCtx = canvasRef.current?.getContext("2d");
        if (canvasCtx && canvasRef.current && videoRef.current) {
          canvasCtx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );

          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;

          if (results.poseLandmarks) {
            // Draw lines between body landmarks
            BODY_LANDMARKS.forEach(([start, end]) => {
              const startLandmark = results.poseLandmarks[start];
              const endLandmark = results.poseLandmarks[end];
              if (startLandmark && endLandmark) {
                canvasCtx.beginPath();
                canvasCtx.moveTo(
                  startLandmark.x * canvasRef.current.width,
                  startLandmark.y * canvasRef.current.height,
                );
                canvasCtx.lineTo(
                  endLandmark.x * canvasRef.current.width,
                  endLandmark.y * canvasRef.current.height,
                );
                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = "blue";
                canvasCtx.stroke();
              }
            });

            // Draw circles at each body landmark
            results.poseLandmarks.forEach((landmark: any, index: number) => {
              if (index >= 11 && index <= 28) {
                canvasCtx.beginPath();
                canvasCtx.arc(
                  landmark.x * canvasRef.current.width,
                  landmark.y * canvasRef.current.height,
                  3, // Smaller circle radius
                  0,
                  2 * Math.PI,
                );
                canvasCtx.fillStyle = "red";
                canvasCtx.fill();
              }
            });
          }
        }
      };

      pose.onResults(drawResults);

      if (videoRef.current) {
        cameraRef.current = new cam.Camera(videoRef.current, {
          onFrame: async () => {
            await pose.send({ image: videoRef.current as HTMLVideoElement });
          },
          width: 640,
          height: 480,
        });
        cameraRef.current.start();
      }
    };

    loadPose();

    return () => {
      cameraRef.current?.stop();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "640px", height: "480px" }}>
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        autoPlay
        muted
        playsInline
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default PoseWithWebcam;
