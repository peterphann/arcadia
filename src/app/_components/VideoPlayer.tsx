// "use client";

// import { useRef } from "react";

// interface Props {
//   selected: any;
// }

// export default function VideoPlayer({ selected }: Props) {
//   const videoRef = useRef<HTMLVideoElement | null>(null);

//   const startTracking = () => {
//     if (videoRef.current) {
//       videoRef.current.currentTime = 0;
//       videoRef.current.play();
//     }
//   };

//   const stopTracking = () => {
//     if (videoRef.current) {
//       videoRef.current.pause();
//     }
//   };

//   return (
//     <>
//       <div>
//         <video
//           ref={videoRef}
//           style={{ width: "640px", height: "480px" }}
//           controls
//         >
//           <source src={selected} type="video/mp4" />
//           <p>Your browser does not support the video tag.</p>
//         </video>
//       </div>

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
//           <div>Score: {100 !== null ? (100).toFixed(2) : "N/A"}</div>
//           <div>Label: {"Excellent"}</div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import * as poseModule from "@mediapipe/pose";
import { getSession } from "next-auth/react";

interface Props {
  selected: string;
  setVideoPose: (landmarks: any) => void;
  similarityScore: number | null;
  isTracking: boolean;
  setIsTracking: (tracking: boolean) => void;
}

export default function VideoPlayer({
  selected,
  setVideoPose,
  similarityScore,
  isTracking,
  setIsTracking,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [scoreSum, setScoreSum] = useState<number>(0);
  const [scoreCount, setScoreCount] = useState<number>(0);
  const [scoreMessage, setScoreMessage] = useState<string>("");

  useEffect(() => {
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
          } else {
            console.error("Error fetching user ID:", data.error);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        console.error("Session email not found");
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const loadPose = async () => {
      const pose = new poseModule.Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: poseModule.Results) => {
        if (results.poseLandmarks && isTracking) {
          setVideoPose(results.poseLandmarks); // Only set videoPose when tracking is active
        }
      });

      if (videoRef.current) {
        videoRef.current.onplay = () => {
          const capturePoseEverySecond = async () => {
            while (
              videoRef.current &&
              !videoRef.current.paused &&
              !videoRef.current.ended &&
              isTracking // Only capture pose if tracking is active
            ) {
              if (videoRef.current.readyState >= 2) {
                await pose.send({ image: videoRef.current });
              }
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          };
          capturePoseEverySecond();
        };
      }
    };

    loadPose();
  }, [selected, setVideoPose, isTracking]);

  useEffect(() => {
    // Update score sum and count if tracking is active and a new similarity score is available
    if (similarityScore !== null && isTracking) {
      setScoreSum((prev) => prev + similarityScore);
      setScoreCount((prev) => prev + 1);
    }
  }, [similarityScore, isTracking]);

  useEffect(() => {
    // Update score message based on the similarity score immediately
    const updateScoreMessage = () => {
      if (similarityScore !== null) {
        if (similarityScore > 80) {
          setScoreMessage("Excellent! Keep it up!");
        } else if (similarityScore > 60) {
          setScoreMessage("Good! Almost there!");
        } else if (similarityScore > 40) {
          setScoreMessage("Decent! Try to improve.");
        } else {
          setScoreMessage("Keep practicing!");
        }
      }
    };

    // Call the function immediately when similarityScore changes
    updateScoreMessage();

    // Optional: If you still want it to update every second while tracking
    const interval = setInterval(updateScoreMessage, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [similarityScore]);

  const startTracking = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsTracking(true); // Start tracking when video plays
      setStartTime(new Date()); // Record the start time
      setScoreSum(0); // Reset score sum
      setScoreCount(0); // Reset score count
    }
  };

  const stopTracking = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsTracking(false); // Stop tracking when video pauses
    }
  };

  const endDance = async () => {
    if (!startTime) return;

    const endTime = new Date();
    const danceDuration = new Date(endTime.getTime() - startTime.getTime())
      .toISOString()
      .substr(11, 8); // Format to HH:MM:SS

    const averageScore = scoreCount ? scoreSum / scoreCount : 0;

    const data = {
      userId,
      song: selected,
      danceDuration,
      averageScore,
    };

    // Send data to the backend API
    try {
      const response = await fetch("/api/dance_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("Dance session saved successfully");
      } else {
        console.error("Failed to save dance session");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div>
        <video
          ref={videoRef}
          style={{ width: "1000px", height: "540px" }}
          controls
        >
          <source src={selected} type="video/mp4" />
          <p>Your browser does not support the video tag.</p>
        </video>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "160px",
        }}
      >
        <button onClick={startTracking}>Start Tracking</button>
        <button onClick={stopTracking}>Stop Tracking</button>
        <button onClick={endDance}>End Dance</button>
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "18px",
            textAlign: "center",
          }}
        >
          <div>
            Similarity Score:{" "}
            {similarityScore !== null
              ? similarityScore.toFixed(2)
              : "Calculating..."}
          </div>
          <div>{scoreMessage}</div>
        </div>
      </div>
    </>
  );
}
