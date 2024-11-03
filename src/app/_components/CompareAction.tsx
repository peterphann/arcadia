// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as cam from "@mediapipe/camera_utils";

// const CompareActions: React.FC = () => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [similarityScore, setSimilarityScore] = useState<number | null>(null);
//   const [isTracking, setIsTracking] = useState(false);
//   const lastRecordedTimeRef = useRef<number>(0);
//   const secondCounterRef = useRef<number>(1);
//   const exampleData = useRef<any[]>([]); // Example data from example3.json

//   useEffect(() => {
//     // Load example data from JSON
//     fetch("/example_action5.json")
//       .then((response) => response.json())
//       .then((data) => {
//         exampleData.current = data;
//       });

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
//         if (results.poseLandmarks && isTracking) {
//           const currentTime = Date.now();
//           if (currentTime - lastRecordedTimeRef.current >= 1000) {
//             lastRecordedTimeRef.current = currentTime;

//             // Capture live landmarks for comparison
//             const liveData = {
//               second: secondCounterRef.current,
//               leftShoulder: results.poseLandmarks[11],
//               rightShoulder: results.poseLandmarks[12],
//               leftElbow: results.poseLandmarks[13],
//               rightElbow: results.poseLandmarks[14],
//               leftWrist: results.poseLandmarks[15],
//               rightWrist: results.poseLandmarks[16],
//               leftHip: results.poseLandmarks[23],
//               rightHip: results.poseLandmarks[24],
//               leftKnee: results.poseLandmarks[25],
//               rightKnee: results.poseLandmarks[26],
//               leftAnkle: results.poseLandmarks[27],
//               rightAnkle: results.poseLandmarks[28],
//             };

//             // Find the corresponding example data for the current second
//             const exampleFrame = exampleData.current.find(
//               (frame) => frame.second === secondCounterRef.current,
//             );

//             if (exampleFrame) {
//               const similarity = calculateSimilarityScore(
//                 liveData,
//                 exampleFrame,
//               );
//               setSimilarityScore(similarity);
//             }

//             secondCounterRef.current += 1; // Increment second counter
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
//   }, [isTracking]);

//   // Start and stop tracking
//   const startTracking = () => {
//     setIsTracking(true);
//     lastRecordedTimeRef.current = Date.now();
//     secondCounterRef.current = 1;
//   };

//   const stopTracking = () => {
//     setIsTracking(false);
//     secondCounterRef.current = 1; // Reset for the next comparison
//     setSimilarityScore(null); // Clear similarity score display
//   };

//   // Function to calculate similarity between live and example data
// const calculateSimilarityScore = (liveData: any, exampleData: any) => {
//   let totalDifference = 0;
//   const keypoints = [
//     "leftShoulder",
//     "rightShoulder",
//     "leftElbow",
//     "rightElbow",
//     "leftWrist",
//     "rightWrist",
//     "leftHip",
//     "rightHip",
//     "leftKnee",
//     "rightKnee",
//     "leftAnkle",
//     "rightAnkle",
//   ];

//   keypoints.forEach((key) => {
//     const livePoint = liveData[key];
//     const examplePoint = exampleData[key];
//     const distance = Math.sqrt(
//       Math.pow(livePoint.x - examplePoint.x, 2) +
//         Math.pow(livePoint.y - examplePoint.y, 2),
//     );
//     totalDifference += distance;
//   });

//   const maxDifference = keypoints.length * 2; // Normalize for number of keypoints
//   return 1 - totalDifference / maxDifference;
// };

//   return (
//     <div style={{ position: "relative", width: "640px", height: "480px" }}>
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

//       <button
//         onClick={startTracking}
//         style={{ position: "absolute", top: "10px", left: "10px" }}
//       >
//         Start Tracking
//       </button>
//       <button
//         onClick={stopTracking}
//         style={{ position: "absolute", top: "10px", left: "100px" }}
//       >
//         Stop Tracking
//       </button>

//       {/* Display similarity score at the bottom of the screen */}
//       <div
//         style={{
//           position: "absolute",
//           bottom: "10px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           backgroundColor: "rgba(0, 0, 0, 0.7)",
//           color: "white",
//           padding: "10px 20px",
//           borderRadius: "8px",
//           fontSize: "18px",
//         }}
//       >
//         Similarity Score:{" "}
//         {similarityScore !== null ? similarityScore.toFixed(2) : "N/A"}
//       </div>
//     </div>
//   );
// };

// export default CompareActions;

// "use client";

// import { useEffect, useRef, useState } from "react";
// import * as cam from "@mediapipe/camera_utils";

// const CompareActions: React.FC = () => {
//   const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
//   const exampleVideoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [similarityScore, setSimilarityScore] = useState<number | null>(null);
//   const [isTracking, setIsTracking] = useState(false);
//   const lastRecordedTimeRef = useRef<number>(0);
//   const secondCounterRef = useRef<number>(1);
//   const exampleData = useRef<any[]>([]); // Example data from example3.json

//   useEffect(() => {
//     // Load example data from JSON
//     fetch("/example_action5.json")
//       .then((response) => response.json())
//       .then((data) => {
//         exampleData.current = data;
//       });

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
//         if (results.poseLandmarks && isTracking) {
//           const currentTime = Date.now();
//           if (currentTime - lastRecordedTimeRef.current >= 1000) {
//             lastRecordedTimeRef.current = currentTime;

//             // Capture live landmarks for comparison
//             const liveData = {
//               second: secondCounterRef.current,
//               leftShoulder: results.poseLandmarks[11],
//               rightShoulder: results.poseLandmarks[12],
//               leftElbow: results.poseLandmarks[13],
//               rightElbow: results.poseLandmarks[14],
//               leftWrist: results.poseLandmarks[15],
//               rightWrist: results.poseLandmarks[16],
//               leftHip: results.poseLandmarks[23],
//               rightHip: results.poseLandmarks[24],
//               leftKnee: results.poseLandmarks[25],
//               rightKnee: results.poseLandmarks[26],
//               leftAnkle: results.poseLandmarks[27],
//               rightAnkle: results.poseLandmarks[28],
//             };

//             // Find the corresponding example data for the current second
//             const exampleFrame = exampleData.current.find(
//               (frame) => frame.second === secondCounterRef.current,
//             );

//             if (exampleFrame) {
//               const similarity = calculateSimilarityScore(
//                 liveData,
//                 exampleFrame,
//               );
//               setSimilarityScore(similarity);
//             }

//             secondCounterRef.current += 1; // Increment second counter
//           }

//           // Draw landmarks on canvas
//           const canvasCtx = canvasRef.current?.getContext("2d");
//           if (canvasCtx && canvasRef.current && webcamVideoRef.current) {
//             canvasCtx.clearRect(
//               0,
//               0,
//               canvasRef.current.width,
//               canvasRef.current.height,
//             );
//             canvasRef.current.width = webcamVideoRef.current.videoWidth;
//             canvasRef.current.height = webcamVideoRef.current.videoHeight;

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

//       if (webcamVideoRef.current) {
//         const camera = new cam.Camera(webcamVideoRef.current, {
//           onFrame: async () => {
//             await pose.send({
//               image: webcamVideoRef.current as HTMLVideoElement,
//             });
//           },
//           width: 640,
//           height: 480,
//         });
//         camera.start();
//       }
//     };

//     loadPose();
//   }, [isTracking]);

//   const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file && exampleVideoRef.current) {
//       exampleVideoRef.current.src = URL.createObjectURL(file);
//       exampleVideoRef.current.load();
//     }
//   };

//   const startTracking = () => {
//     setIsTracking(true);
//     lastRecordedTimeRef.current = Date.now();
//     secondCounterRef.current = 1;
//     if (exampleVideoRef.current) {
//       exampleVideoRef.current.currentTime = 0;
//       exampleVideoRef.current.play(); // Start the MP4 file
//     }
//   };

//   const stopTracking = () => {
//     setIsTracking(false);
//     secondCounterRef.current = 1; // Reset for the next comparison
//     setSimilarityScore(null); // Clear similarity score display
//     if (exampleVideoRef.current) {
//       exampleVideoRef.current.pause(); // Pause the MP4 file
//     }
//   };

//   const calculateSimilarityScore = (liveData: any, exampleData: any) => {
//     let totalDifference = 0;
//     const keypoints = [
//       "leftShoulder",
//       "rightShoulder",
//       "leftElbow",
//       "rightElbow",
//       "leftWrist",
//       "rightWrist",
//       "leftHip",
//       "rightHip",
//       "leftKnee",
//       "rightKnee",
//       "leftAnkle",
//       "rightAnkle",
//     ];

//     keypoints.forEach((key) => {
//       const livePoint = liveData[key];
//       const examplePoint = exampleData[key];
//       const distance = Math.sqrt(
//         Math.pow(livePoint.x - examplePoint.x, 2) +
//           Math.pow(livePoint.y - examplePoint.y, 2),
//       );
//       totalDifference += distance;
//     });

//     const maxDifference = keypoints.length * 2; // Normalize for number of keypoints
//     return 1 - totalDifference / maxDifference;
//   };

//   // Function to convert score into descriptive label
//   const getScoreLabel = (score: number) => {
//     if (score >= 0.75) return "Excellent";
//     if (score >= 0.5) return "Great";
//     if (score >= 0.25) return "Good";
//     return "Miss";
//   };

//   return (
//     <div style={{ display: "flex", gap: "20px" }}>
//       {/* Webcam video and canvas overlay */}
//       <div style={{ position: "relative", width: "640px", height: "480px" }}>
//         <video
//           ref={webcamVideoRef}
//           style={{
//             width: "100%",
//             height: "100%",
//             position: "absolute",
//             top: 0,
//             left: 0,
//             transform: "scaleX(-1)",
//           }}
//           autoPlay
//           muted
//           playsInline
//         />
//         <canvas
//           ref={canvasRef}
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             pointerEvents: "none",
//           }}
//         />
//       </div>

//       {/* MP4 video player */}
//       <div>
//         <input type="file" accept="video/mp4" onChange={handleVideoUpload} />
//         <video
//           ref={exampleVideoRef}
//           style={{ width: "640px", height: "480px" }}
//           controls
//         />
//       </div>

//       {/* Controls and similarity score */}
//       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//         <button onClick={startTracking}>Start Tracking</button>
//         <button onClick={stopTracking}>Stop Tracking</button>
//         <div
//           style={{
//             backgroundColor: "rgba(0, 0, 0, 0.7)",
//             color: "white",
//             padding: "10px 20px",
//             borderRadius: "8px",
//             fontSize: "18px",
//             textAlign: "center",
//           }}
//         >
//           <div>
//             Score:{" "}
//             {similarityScore !== null ? similarityScore.toFixed(2) : "N/A"}
//           </div>
//           <div>
//             {similarityScore !== null ? getScoreLabel(similarityScore) : ""}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CompareActions;

"use client";

import { useEffect, useRef, useState } from "react";
import * as cam from "@mediapipe/camera_utils";
import { Pose, Results } from "@mediapipe/pose";

const CompareActions: React.FC = () => {
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [scoreLabel, setScoreLabel] = useState<string>("N/A");
  const [isTracking, setIsTracking] = useState(false);
  const webcamLandmarksRef = useRef<any[]>([]);
  const exampleLandmarksRef = useRef<any[]>([]);

  useEffect(() => {
    const loadPose = async () => {
      const poseModule = await import("@mediapipe/pose");

      const poseWebcam = new poseModule.Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      const poseExample = new poseModule.Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      poseWebcam.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      poseExample.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      const onWebcamResults = (results: Results) => {
        if (results.poseLandmarks && isTracking) {
          webcamLandmarksRef.current.push(results.poseLandmarks);
          calculateSimilarity();
          drawLandmarks(results, "webcam");
        }
      };

      const onExampleResults = (results: Results) => {
        if (results.poseLandmarks && isTracking) {
          exampleLandmarksRef.current.push(results.poseLandmarks);
          calculateSimilarity();
          drawLandmarks(results, "example");
        }
      };

      poseWebcam.onResults(onWebcamResults);
      poseExample.onResults(onExampleResults);

      if (webcamVideoRef.current) {
        const cameraWebcam = new cam.Camera(webcamVideoRef.current, {
          onFrame: async () => {
            await poseWebcam.send({
              image: webcamVideoRef.current as HTMLVideoElement,
            });
          },
          width: 640,
          height: 480,
        });
        cameraWebcam.start();
      }

      if (exampleVideoRef.current) {
        exampleVideoRef.current.onplay = () => {
          const processVideoFrame = async () => {
            while (
              exampleVideoRef.current &&
              !exampleVideoRef.current.paused &&
              !exampleVideoRef.current.ended
            ) {
              await poseExample.send({ image: exampleVideoRef.current });
              await new Promise((resolve) => setTimeout(resolve, 500)); // Process every 0.25 seconds
            }
          };
          processVideoFrame();
        };
      }
    };

    loadPose();
  }, [isTracking]);

  const calculateSimilarity = () => {
    if (
      webcamLandmarksRef.current.length > 0 &&
      exampleLandmarksRef.current.length > 0
    ) {
      const liveData = webcamLandmarksRef.current.shift();
      const exampleData = exampleLandmarksRef.current.shift();

      if (liveData && exampleData) {
        const similarity = calculateSimilarityScore(liveData, exampleData);
        setSimilarityScore(similarity);
        setScoreLabel(getScoreLabel(similarity));
      } else {
        setSimilarityScore(null);
        setScoreLabel("Off Screen");
      }
    }
  };

  const calculateSimilarityScore = (liveData: any, exampleData: any) => {
    let totalDifference = 0;
    // Only track arm keypoints: shoulders, elbows, and wrists
    const keypoints = [11, 12, 13, 14, 15, 16];

    const liveReferencePoint = liveData[11] || liveData[12];
    const exampleReferencePoint = exampleData[11] || exampleData[12];

    keypoints.forEach((index) => {
      const livePoint = liveData[index];
      const examplePoint = exampleData[index];

      if (
        livePoint &&
        examplePoint &&
        liveReferencePoint &&
        exampleReferencePoint
      ) {
        const liveNormalized = {
          x: livePoint.x - liveReferencePoint.x,
          y: livePoint.y - liveReferencePoint.y,
        };
        const exampleNormalized = {
          x: examplePoint.x - exampleReferencePoint.x,
          y: examplePoint.y - exampleReferencePoint.y,
        };

        const liveMagnitude = Math.sqrt(
          Math.pow(liveNormalized.x, 2) + Math.pow(liveNormalized.y, 2),
        );
        const exampleMagnitude = Math.sqrt(
          Math.pow(exampleNormalized.x, 2) + Math.pow(exampleNormalized.y, 2),
        );

        if (liveMagnitude !== 0 && exampleMagnitude !== 0) {
          const liveUnit = {
            x: liveNormalized.x / liveMagnitude,
            y: liveNormalized.y / liveMagnitude,
          };
          const exampleUnit = {
            x: exampleNormalized.x / exampleMagnitude,
            y: exampleNormalized.y / exampleMagnitude,
          };

          const distance = Math.sqrt(
            Math.pow(liveUnit.x - exampleUnit.x, 2) +
              Math.pow(liveUnit.y - exampleUnit.y, 2),
          );

          if (distance > 0.2) {
            totalDifference += distance * 5;
          } else if (distance > 0.1) {
            totalDifference += distance * 2;
          } else {
            totalDifference += distance;
          }
        }
      }
    });

    const maxDifference = keypoints.length * 2;
    let similarityScore = (1 - totalDifference / maxDifference) * 100;
    return Math.max(0, Math.min(similarityScore, 100));
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    if (score >= 20) return "Poor";
    return "Very Poor";
  };

  const drawLandmarks = (results: Results, source: "webcam" | "example") => {
    const canvasCtx = canvasRef.current?.getContext("2d");
    if (canvasCtx && canvasRef.current) {
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      canvasCtx.save();
      canvasCtx.translate(source === "webcam" ? canvasRef.current.width : 0, 0);
      canvasCtx.scale(source === "webcam" ? -1 : 1, 1);
      results.poseLandmarks.forEach((landmark, index) => {
        if ([11, 12, 13, 14, 15, 16].includes(index)) {
          // Only draw arm landmarks
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
      canvasCtx.restore();
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ position: "absolute", top: 0, left: 0 }}>
        <video ref={webcamVideoRef} autoPlay muted playsInline hidden />
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
    </div>
  );
};

export default CompareActions;
