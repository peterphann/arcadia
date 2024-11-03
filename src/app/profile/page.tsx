"use client";

import Link from "next/link";
import ModelCard from "../_components/ModelCard";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import useSound from "use-sound";

export default function Page() {
  const [avatar, setAvatar] = useState();
  const [backSound] = useSound("/audio/select.wav");

  if (avatar) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div>
          <h1 className="mb-4 text-xl">Set up your profile</h1>
        </div>
        <Link href="/">
          <div
            onClick={() => backSound()}
            className="fixed left-6 top-6 z-50 hover:translate-y-1"
          >
            Back
          </div>
        </Link>
        <div className="flex flex-col items-center justify-center">
          <h1 className="mb-4">Nice choice!</h1>
          <div className="flex">
            <ModelCard
              name={avatar[0]!}
              path={avatar[1]!}
              setAvatar={setAvatar}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-left">
      <Link href="/">
        <div
          onClick={() => backSound()}
          className="fixed left-6 top-6 hover:translate-y-1"
        >
          Back
        </div>
      </Link>

      <div>
        <h1 className="mb-4 text-xl">Set up your profile</h1>
      </div>
      <div className="flex flex-col">
        <h1 className="mb-4">Choose your avatar</h1>
        <div className="flex">
        <ModelCard
            name="Suki"
            path="/models/suki.vrm"
            setAvatar={setAvatar}
          />
          <ModelCard
            name="Cyber"
            path="/models/cyber.vrm"
            setAvatar={setAvatar}
          />
          <ModelCard name="Rei" path="/models/rei.vrm" setAvatar={setAvatar} />
          <ModelCard
            name="David"
            path="/models/david.vrm"
            setAvatar={setAvatar}
          />
          <ModelCard
            name="Bun"
            path="/models/bunny.vrm"
            setAvatar={setAvatar}
          />
        </div>
      </div>
    </div>
  );
}
