"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MainComponent } from "~/app/_components/Main";
import VideoPlayer from "~/app/_components/VideoPlayer";
import ErrorBoundary from "~/app/_components/ErrorBoundary";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import Image from "next/image";
import useSound from "use-sound";

export default function Page() {
  const [userPose, setUserPose] = useState<any[]>([]);
  const [handPose, setHandPose] = useState<any[]>([]);
  const [videoPose, setVideoPose] = useState<any[]>([]);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [songSelected, hasSongSelected] = useState(false);
  const [selectSound] = useSound("/audio/select2.wav");
  const [playSound] = useSound("/audio/play.wav");
  const [backSound] = useSound("/audio/select.wav");
  const [current, setCurrent] = useState(0);
  const [songLocation, setSongLocation] = useState("");

  // Calculate similarity between userPose and videoPose
  const calculateSimilarity = (pose1: any[], pose2: any[]) => {
    if (pose1.length === 0 || pose2.length === 0) return null;

    let totalDifference = 0;
    const scalingFactor = 2.5; // Adjust this for sensitivity
    const keypoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]; // Shoulders, elbows, wrists

    keypoints.forEach((index) => {
      const point1 = pose1[index];
      const point2 = pose2[index];

      if (point1 && point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        totalDifference += distance;
      }
    });

    // Amplify the total difference to create a wider spread
    totalDifference *= scalingFactor;
    const maxDifference = keypoints.length * 2 * scalingFactor;

    // Calculate similarity, clamping between 0 and 100
    const similarity = (1 - totalDifference / maxDifference) * 100;
    return Math.max(0, Math.min(similarity, 100));
  };

  // Update similarity score whenever userPose or videoPose updates, but only if tracking is active
  useEffect(() => {
    if (isTracking && userPose.length > 0 && videoPose.length > 0) {
      const score = calculateSimilarity(userPose, videoPose);
      setSimilarityScore(score);
    }
  }, [isTracking, userPose, videoPose]);

  // Start and stop tracking
  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setSimilarityScore(null); // Reset similarity score when tracking stops
  };

  const songs = [
    {
      location: "/songs/hot_to_go.mp4",
      title: "HOT TO GO!",
      artist: "Chappell Roan",
      cover: "/covers/hot_to_go.jpg",
    },
    {
      location: "/songs/espresso.mp4",
      title: "Espresso",
      artist: "Sabrina Carpenter",
      cover: "/covers/espresso.png",
    },
    {
      location: "/songs/apt.mp4",
      title: "APT.",
      artist: "Rose and Bruno Mars",
      cover: "/covers/apt.png",
    },
  ];

  return (
    <ErrorBoundary>
      <Link href="/play">
        <div
          onClick={() => backSound()}
          className="fixed left-6 top-6 z-50 hover:translate-y-1"
        >
          Back
        </div>
      </Link>

      {songSelected ? (
        <div className="flex w-full overflow-hidden">
          <div className="flex flex-col">
            <MainComponent
              setUserPose={setUserPose}
              setHandPose={setHandPose}
            />
          </div>
          <VideoPlayer
            selected={songLocation}
            setVideoPose={(pose) => {
              if (isTracking) setVideoPose(pose); // Only set video pose when tracking is active
            }}
            similarityScore={similarityScore}
            isTracking={isTracking} // Pass tracking state as a prop
            setIsTracking={setIsTracking} // Pass setIsTracking to control tracking from VideoPlayer
          />
        </div>
      ) : (
        <div className="flex h-screen w-screen flex-col items-center justify-center">
          <h1 className="text-3xl">Select a song</h1>

          <Carousel className="relative mb-10 mt-10 h-auto w-[25vw] scale-90">
            <Image
              src="/bottom_left_thumbnail_frame.png"
              alt="Bottom left thumbnail frame"
              width={400}
              height={400}
              className="absolute -bottom-14 -left-[20px] z-40"
            />
            <Image
              src="/top_right_thumbnail_frame.png"
              alt="top right thumbnail frame"
              width={400}
              height={400}
              className="absolute -right-[20px] -top-[66px] z-40"
            />

            <CarouselContent>
              {songs.map((song, index) => (
                <CarouselItem key={index}>
                  <div className="flex h-full items-center justify-center">
                    <Image
                      src={song.cover}
                      alt="Song cover"
                      width={500}
                      height={500}
                      style={{ width: "20vw", height: "auto" }}
                      className="align-middle"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div
              onClick={() => {
                setCurrent((prev) => (prev - 1 + songs.length) % songs.length);
                selectSound();
              }}
            >
              <CarouselPrevious />
            </div>
            <div
              onClick={() => {
                setCurrent((prev) => (prev + 1) % songs.length);
                selectSound();
              }}
            >
              <CarouselNext />
            </div>
          </Carousel>

          <p>{songs[current]?.title}</p>
          <p>{songs[current]?.artist}</p>

          <button
            onClick={() => {
              playSound();
              setSongLocation(songs[current]?.location ?? "");
              hasSongSelected(true);
            }}
            className="mt-4 hover:scale-105 active:scale-95"
          >
            <Image
              src="/select_button.png"
              alt="Select"
              width={500}
              height={500}
              style={{ width: "20vw", height: "auto" }}
            />
          </button>
        </div>
      )}
    </ErrorBoundary>
  );
}
