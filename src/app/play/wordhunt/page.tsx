"use client";

import Link from "next/link";
import { useState } from "react";
import { MainComponent } from "~/app/_components/Main";

import WordHuntGame from "~/app/_components/WordHuntGame";
import useSound from "use-sound";

export default function WordHunt() {
  const [userPose, setUserPose] = useState<any[]>([]);
  const [handPose, setHandPose] = useState<any[]>([]);

  const [backSound] = useSound("/audio/select.wav");

  return (
    <div className="flex h-screen w-full flex-col">
      <Link href="/play">
        <div
          className="fixed left-6 top-6 z-50 hover:translate-y-1"
          onClick={() => backSound()}
        >
          Back
        </div>
      </Link>
      <div className="flex">
        <div>
          <MainComponent setUserPose={setUserPose} setHandPose={setHandPose} />
        </div>
        <div>
          <WordHuntGame handPose={handPose} />
        </div>
      </div>
    </div>
  );
}
