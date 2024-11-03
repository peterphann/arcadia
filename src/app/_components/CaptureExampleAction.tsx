// "use client";
// import { useEffect, useRef, useState } from "react";
// import * as cam from "@mediapipe/camera_utils";
// import { Pose, Results } from "@mediapipe/pose";

// const CaptureExampleAction: React.FC = () => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [exampleAction, setExampleAction] = useState<any[]>([]); // Array to store pose landmarks for each frame
//   const [isRecording, setIsRecording] = useState(false); // Flag to control recording
//   const lastRecordedTimeRef = useRef<number>(0); // Timestamp of the last recorded frame
//   const intervalIdRef = useRef<NodeJS.Timeout | null>(null); // To manage setInterval
//   const secondCounterRef = useRef<number>(1); // Counter to label each second

//   useEffect(() => {
//     const loadPose = async () => {
//       const poseModule = await import("@mediapipe/pose");
//       const pose = new poseModule.Pose({
//         locateFile: (file: string) =>
//           `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
//       });

//       pose.setOptions({
//         modelComplexity: 1,
//         smoothLandmarks: true,
//         enableSegmentation: false,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5,
//       });

//       const onResults = (results: Results) => {
//         if (results.poseLandmarks && isRecording) {
//           const currentTime = Date.now();
//           // Record data only if 1 second has passed since last recorded time
//           if (currentTime - lastRecordedTimeRef.current >= 1000) {
//             lastRecordedTimeRef.current = currentTime;

//             // Capture landmarks and add a second label
//             const frameData = {
//               second: secondCounterRef.current, // Add the second label
//               leftShoulder: {
//                 x: results.poseLandmarks[11].x,
//                 y: results.poseLandmarks[11].y,
//               },
//               rightShoulder: {
//                 x: results.poseLandmarks[12].x,
//                 y: results.poseLandmarks[12].y,
//               },
//               leftElbow: {
//                 x: results.poseLandmarks[13].x,
//                 y: results.poseLandmarks[13].y,
//               },
//               rightElbow: {
//                 x: results.poseLandmarks[14].x,
//                 y: results.poseLandmarks[14].y,
//               },
//               leftWrist: {
//                 x: results.poseLandmarks[15].x,
//                 y: results.poseLandmarks[15].y,
//               },
//               rightWrist: {
//                 x: results.poseLandmarks[16].x,
//                 y: results.poseLandmarks[16].y,
//               },
//               leftHip: {
//                 x: results.poseLandmarks[23].x,
//                 y: results.poseLandmarks[23].y,
//               },
//               rightHip: {
//                 x: results.poseLandmarks[24].x,
//                 y: results.poseLandmarks[24].y,
//               },
//               leftKnee: {
//                 x: results.poseLandmarks[25].x,
//                 y: results.poseLandmarks[25].y,
//               },
//               rightKnee: {
//                 x: results.poseLandmarks[26].x,
//                 y: results.poseLandmarks[26].y,
//               },
//               leftAnkle: {
//                 x: results.poseLandmarks[27].x,
//                 y: results.poseLandmarks[27].y,
//               },
//               rightAnkle: {
//                 x: results.poseLandmarks[28].x,
//                 y: results.poseLandmarks[28].y,
//               },
//             };
//             console.log(frameData);

//             setExampleAction((prev) => [...prev, frameData]);
//             secondCounterRef.current += 1; // Increment the second counter
//           }

//           // Draw landmarks on canvas
//           const canvasCtx = canvasRef.current?.getContext("2d");
//           if (canvasCtx && canvasRef.current && videoRef.current) {
//             canvasCtx.clearRect(
//               0,
//               0,
//               canvasRef.current.width,
//               canvasRef.current.height,
//             );
//             canvasRef.current.width = videoRef.current.videoWidth;
//             canvasRef.current.height = videoRef.current.videoHeight;

//             // Draw each tracked landmark as a small circle
//             results.poseLandmarks.forEach((landmark, index) => {
//               if (
//                 [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index)
//               ) {
//                 canvasCtx.beginPath();
//                 canvasCtx.arc(
//                   landmark.x * canvasRef.current.width,
//                   landmark.y * canvasRef.current.height,
//                   5, // Circle radius
//                   0,
//                   2 * Math.PI,
//                 );
//                 canvasCtx.fillStyle = "red";
//                 canvasCtx.fill();
//               }
//             });
//           }
//         }
//       };

//       pose.onResults(onResults);

//       if (videoRef.current) {
//         const camera = new cam.Camera(videoRef.current, {
//           onFrame: async () => {
//             await pose.send({ image: videoRef.current as HTMLVideoElement });
//           },
//           width: 640,
//           height: 480,
//         });
//         camera.start();
//       }
//     };

//     loadPose();
//   }, [isRecording]);

//   // Function to start recording and manage the recording interval
//   const startRecording = () => {
//     setIsRecording(true);
//     lastRecordedTimeRef.current = Date.now(); // Initialize timestamp
//     secondCounterRef.current = 1; // Reset counter when starting a new recording
//     intervalIdRef.current = setInterval(() => {
//       lastRecordedTimeRef.current = Date.now();
//     }, 1000);
//   };

//   // Function to stop recording and clear the interval
//   const stopRecording = () => {
//     setIsRecording(false);
//     if (intervalIdRef.current) {
//       clearInterval(intervalIdRef.current);
//       intervalIdRef.current = null;
//     }
//   };

//   // Function to handle saving the recorded action as JSON
//   const saveExampleAction = () => {
//     const dataStr = JSON.stringify(exampleAction, null, 2);
//     const blob = new Blob([dataStr], { type: "application/json" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "example_action.json";
//     a.click();

//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div style={{ position: "relative", width: "640px", height: "480px" }}>
//       {/* Video feed from webcam */}
//       <video
//         ref={videoRef}
//         style={{
//           width: "100%",
//           height: "100%",
//           position: "absolute",
//           top: 0,
//           left: 0,
//         }}
//         autoPlay
//         muted
//         playsInline
//       />

//       {/* Canvas overlay for drawing landmarks */}
//       <canvas
//         ref={canvasRef}
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           pointerEvents: "none",
//         }}
//       />

//       {/* Control buttons */}
//       <button
//         onClick={startRecording}
//         style={{ position: "absolute", top: "10px", left: "10px" }}
//       >
//         Start Recording
//       </button>
//       <button
//         onClick={stopRecording}
//         style={{ position: "absolute", top: "10px", left: "100px" }}
//       >
//         Stop Recording
//       </button>
//       <button
//         onClick={saveExampleAction}
//         style={{ position: "absolute", top: "10px", left: "200px" }}
//         disabled={exampleAction.length === 0}
//       >
//         Save Example Action
//       </button>
//     </div>
//   );
// };

// export default CaptureExampleAction;

// // video
// "use client";
// import { useEffect, useRef, useState } from "react";
// import * as cam from "@mediapipe/camera_utils";
// import { Pose, Results } from "@mediapipe/pose";

// const CaptureExampleAction: React.FC = () => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [exampleAction, setExampleAction] = useState<any[]>([]);
//   const [isRecording, setIsRecording] = useState(false);
//   const lastRecordedTimeRef = useRef<number>(0);
//   const secondCounterRef = useRef<number>(1);

//   useEffect(() => {
//     const loadPose = async () => {
//       const poseModule = await import("@mediapipe/pose");
//       const pose = new poseModule.Pose({
//         locateFile: (file: string) =>
//           `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
//       });

//       pose.setOptions({
//         modelComplexity: 1,
//         smoothLandmarks: true,
//         enableSegmentation: false,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5,
//       });

//       const onResults = (results: Results) => {
//         if (results.poseLandmarks && isRecording) {
//           const currentTime = videoRef.current?.currentTime ?? 0;
//           if (currentTime - lastRecordedTimeRef.current >= 1) {
//             lastRecordedTimeRef.current = currentTime;

//             const frameData = {
//               second: secondCounterRef.current,
//               leftShoulder: {
//                 x: results.poseLandmarks[11].x,
//                 y: results.poseLandmarks[11].y,
//               },
//               rightShoulder: {
//                 x: results.poseLandmarks[12].x,
//                 y: results.poseLandmarks[12].y,
//               },
//               leftElbow: {
//                 x: results.poseLandmarks[13].x,
//                 y: results.poseLandmarks[13].y,
//               },
//               rightElbow: {
//                 x: results.poseLandmarks[14].x,
//                 y: results.poseLandmarks[14].y,
//               },
//               leftWrist: {
//                 x: results.poseLandmarks[15].x,
//                 y: results.poseLandmarks[15].y,
//               },
//               rightWrist: {
//                 x: results.poseLandmarks[16].x,
//                 y: results.poseLandmarks[16].y,
//               },
//               leftHip: {
//                 x: results.poseLandmarks[23].x,
//                 y: results.poseLandmarks[23].y,
//               },
//               rightHip: {
//                 x: results.poseLandmarks[24].x,
//                 y: results.poseLandmarks[24].y,
//               },
//               leftKnee: {
//                 x: results.poseLandmarks[25].x,
//                 y: results.poseLandmarks[25].y,
//               },
//               rightKnee: {
//                 x: results.poseLandmarks[26].x,
//                 y: results.poseLandmarks[26].y,
//               },
//               leftAnkle: {
//                 x: results.poseLandmarks[27].x,
//                 y: results.poseLandmarks[27].y,
//               },
//               rightAnkle: {
//                 x: results.poseLandmarks[28].x,
//                 y: results.poseLandmarks[28].y,
//               },
//             };
//             console.log(frameData);

//             setExampleAction((prev) => [...prev, frameData]);
//             secondCounterRef.current += 1;
//           }

//           const canvasCtx = canvasRef.current?.getContext("2d");
//           if (canvasCtx && canvasRef.current && videoRef.current) {
//             canvasCtx.clearRect(
//               0,
//               0,
//               canvasRef.current.width,
//               canvasRef.current.height,
//             );
//             canvasRef.current.width = videoRef.current.videoWidth;
//             canvasRef.current.height = videoRef.current.videoHeight;

//             results.poseLandmarks.forEach((landmark, index) => {
//               if (
//                 [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index)
//               ) {
//                 canvasCtx.beginPath();
//                 canvasCtx.arc(
//                   landmark.x * canvasRef.current.width,
//                   landmark.y * canvasRef.current.height,
//                   5,
//                   0,
//                   2 * Math.PI,
//                 );
//                 canvasCtx.fillStyle = "red";
//                 canvasCtx.fill();
//               }
//             });
//           }
//         }
//       };

//       pose.onResults(onResults);

//       if (videoRef.current) {
//         videoRef.current.onplay = () => {
//           const processVideoFrame = async () => {
//             while (
//               videoRef.current &&
//               !videoRef.current.paused &&
//               !videoRef.current.ended
//             ) {
//               await pose.send({ image: videoRef.current });
//               await new Promise((resolve) => setTimeout(resolve, 1000)); // Process frame every second
//             }
//           };
//           processVideoFrame();
//         };
//       }
//     };

//     loadPose();
//   }, [isRecording]);

//   const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file && videoRef.current) {
//       videoRef.current.src = URL.createObjectURL(file);
//       videoRef.current.load();
//     }
//   };

//   const startRecording = () => {
//     setIsRecording(true);
//     lastRecordedTimeRef.current = 0;
//     secondCounterRef.current = 1;
//   };

//   const stopRecording = () => {
//     setIsRecording(false);
//   };

//   const saveExampleAction = () => {
//     const dataStr = JSON.stringify(exampleAction, null, 2);
//     const blob = new Blob([dataStr], { type: "application/json" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "example_action.json";
//     a.click();

//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div style={{ position: "relative", width: "640px", height: "480px" }}>
//       <h1>HackTX</h1>

//       {/* Video display */}
//       <video
//         ref={videoRef}
//         style={{
//           width: "100%",
//           height: "100%",
//           position: "absolute",
//           top: 0,
//           left: 0,
//         }}
//         controls
//       />

//       {/* Canvas overlay */}
//       <canvas
//         ref={canvasRef}
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           pointerEvents: "none",
//         }}
//       />

//       {/* Control buttons */}
//       <button
//         onClick={startRecording}
//         style={{ position: "absolute", top: "10px", left: "10px" }}
//       >
//         Start Recording
//       </button>
//       <button
//         onClick={stopRecording}
//         style={{ position: "absolute", top: "10px", left: "100px" }}
//       >
//         Stop Recording
//       </button>
//       <button
//         onClick={saveExampleAction}
//         style={{ position: "absolute", top: "10px", left: "200px" }}
//         disabled={exampleAction.length === 0}
//       >
//         Save Example Action
//       </button>

//       {/* Upload MP4 Button */}
//       <div style={{ marginTop: "500px" }}>
//         <input type="file" accept="video/mp4" onChange={handleVideoUpload} />
//       </div>
//     </div>
//   );
// };

// export default CaptureExampleAction;

"use client";
import { useEffect, useRef, useState } from "react";
import * as cam from "@mediapipe/camera_utils";
import { Pose, Results } from "@mediapipe/pose";

const CaptureExampleAction: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [exampleAction, setExampleAction] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const lastRecordedTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadPose = async () => {
      const poseModule = await import("@mediapipe/pose");
      const pose = new poseModule.Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const onResults = (results: Results) => {
        if (results.poseLandmarks && isRecording) {
          const currentTime = videoRef.current?.currentTime ?? 0;

          // Record data every 0.1 seconds
          if (currentTime - lastRecordedTimeRef.current >= 0.1) {
            lastRecordedTimeRef.current = currentTime;

            const frameData = {
              time: currentTime.toFixed(1), // Record time with 0.1s precision
              leftShoulder: {
                x: results.poseLandmarks[11].x,
                y: results.poseLandmarks[11].y,
              },
              rightShoulder: {
                x: results.poseLandmarks[12].x,
                y: results.poseLandmarks[12].y,
              },
              leftElbow: {
                x: results.poseLandmarks[13].x,
                y: results.poseLandmarks[13].y,
              },
              rightElbow: {
                x: results.poseLandmarks[14].x,
                y: results.poseLandmarks[14].y,
              },
              leftWrist: {
                x: results.poseLandmarks[15].x,
                y: results.poseLandmarks[15].y,
              },
              rightWrist: {
                x: results.poseLandmarks[16].x,
                y: results.poseLandmarks[16].y,
              },
              leftHip: {
                x: results.poseLandmarks[23].x,
                y: results.poseLandmarks[23].y,
              },
              rightHip: {
                x: results.poseLandmarks[24].x,
                y: results.poseLandmarks[24].y,
              },
              leftKnee: {
                x: results.poseLandmarks[25].x,
                y: results.poseLandmarks[25].y,
              },
              rightKnee: {
                x: results.poseLandmarks[26].x,
                y: results.poseLandmarks[26].y,
              },
              leftAnkle: {
                x: results.poseLandmarks[27].x,
                y: results.poseLandmarks[27].y,
              },
              rightAnkle: {
                x: results.poseLandmarks[28].x,
                y: results.poseLandmarks[28].y,
              },
            };
            console.log(frameData);

            setExampleAction((prev) => [...prev, frameData]);
          }

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

            results.poseLandmarks.forEach((landmark, index) => {
              if (
                [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index)
              ) {
                canvasCtx.beginPath();
                canvasCtx.arc(
                  landmark.x * canvasRef.current.width,
                  landmark.y * canvasRef.current.height,
                  5,
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

      pose.onResults(onResults);

      if (videoRef.current) {
        videoRef.current.onplay = () => {
          const processVideoFrame = async () => {
            while (
              videoRef.current &&
              !videoRef.current.paused &&
              !videoRef.current.ended
            ) {
              await pose.send({ image: videoRef.current });
              await new Promise((resolve) => setTimeout(resolve, 100)); // Process frame every 0.1 seconds
            }
          };
          processVideoFrame();
        };
      }
    };

    loadPose();
  }, [isRecording]);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      videoRef.current.src = URL.createObjectURL(file);
      videoRef.current.load();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    lastRecordedTimeRef.current = 0;
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const saveExampleAction = () => {
    const dataStr = JSON.stringify(exampleAction, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "example_action.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: "relative", width: "640px", height: "480px" }}>
      <h1>HackTX</h1>

      {/* Video display */}
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        controls
      />

      {/* Canvas overlay */}
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

      {/* Control buttons */}
      <button
        onClick={startRecording}
        style={{ position: "absolute", top: "600px", left: "10px" }}
      >
        Start Recording
      </button>
      <button
        onClick={stopRecording}
        style={{ position: "absolute", top: "600px", left: "500px" }}
      >
        Stop Recording
      </button>
      <button
        onClick={saveExampleAction}
        style={{ position: "absolute", top: "10px", left: "200px" }}
        disabled={exampleAction.length === 0}
      >
        Save Example Action
      </button>

      {/* Upload MP4 Button */}
      <div style={{ marginTop: "500px" }}>
        <input type="file" accept="video/mp4" onChange={handleVideoUpload} />
      </div>
    </div>
  );
};

export default CaptureExampleAction;
