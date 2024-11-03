"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { HolisticModel } from "./HolisticModel";

const VRMDisplay = dynamic(() => import("./LoadModel"));

interface MainComponentProps {
  setUserPose: (landmarks: any) => void;
  setHandPose: (landmarks: any) => void;
}

export const MainComponent = ({
  setUserPose,
  setHandPose,
}: MainComponentProps) => {
  const [landmarks, setLandmarks] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="flex">
      <HolisticModel
        setLandmarks={setLandmarks}
        setPoseLandmarks={setUserPose}
        setHandLandmarks={setHandPose}
      />
      <VRMDisplay landmarks={landmarks} videoRef={videoRef} />
    </div>
  );
};
