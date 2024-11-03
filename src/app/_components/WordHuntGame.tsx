"use client";
import { useEffect, useRef, useState } from "react";
import * as cam from "@mediapipe/camera_utils";

type Letter = {
  letter: string;
  row: number;
  col: number;
  selected: boolean;
  hovered: boolean;
};

const ScoreMap: { [key: number]: number } = {
  3: 100,
  4: 400,
  5: 800,
  6: 1400,
  7: 1800,
  8: 2200,
};

const letterFrequencies: { [key: string]: number } = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
};

const createWeightedLetterArray = (): string[] => {
  const weightedLetters: string[] = [];
  for (const letter in letterFrequencies) {
    for (let i = 0; i < letterFrequencies[letter]!; i++) {
      weightedLetters.push(letter);
    }
  }
  return weightedLetters;
};

interface Props {
  handPose: any;
}

export default function WordHuntGame({ handPose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<Letter[][]>([]);
  const [selectedLetters, setSelectedLetters] = useState<Letter[]>([]);
  const [score, setScore] = useState(0);

  const isSelectingRef = useRef(false);
  const selectedRef = useRef<Letter[]>([]);
  const completeRef = useRef<string[]>([]);

  useEffect(() => {
    selectedRef.current = selectedLetters;
  }, [selectedLetters]);

  useEffect(() => {
    onResults(handPose);
  }, [handPose]);

  const initializeGrid = () => {
    const weightedLetters = createWeightedLetterArray();
    const gridArray: Letter[][] = [];

    for (let i = 0; i < 4; i++) {
      const row: Letter[] = [];
      for (let j = 0; j < 4; j++) {
        const randomIndex = Math.floor(Math.random() * weightedLetters.length);
        const letter = weightedLetters[randomIndex];
        row.push({
          letter: letter!,
          row: i,
          col: j,
          selected: false,
          hovered: false,
        });
      }
      gridArray.push(row);
    }
    setGrid(gridArray);
  };

  async function onResults(results: any) {
    if (canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext("2d");
      if (canvasCtx) {
        canvasCtx.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        );

        if (results) {
          const middle = results[9];

          let handX = 0;
          let handY = 0;

          if (middle) {
            handX =
              canvasRef.current.width - middle.x * canvasRef.current.width;
            handY = middle.y * canvasRef.current.height;
          }

          // Lock position when fist is closed
          const isFistClosed = detectFistClosed(results);
          if (isFistClosed) {
            isSelectingRef.current = true;
          } else {
            isSelectingRef.current = false;
          }

          // Draw the red dot
          canvasCtx.beginPath();
          canvasCtx.arc(handX, handY, 8, 0, 2 * Math.PI);
          canvasCtx.fillStyle = "red";
          canvasCtx.fill();

          // Update hover state
          updateHoverState(handX, handY);

          if (!isFistClosed) {
            if (selectedRef.current.length >= 3) {
              const word = selectedRef.current
                .map((letter) => letter.letter)
                .join("");
              const valid = await validateWord(word);
              if (valid && !completeRef.current.includes(word)) {
                setScore((prevScore) => prevScore + ScoreMap[word.length]!);
                completeRef.current.push(word);
              }
            }
            setSelectedLetters([]);
          }
        }
      }
    }
  }

  const detectFistClosed = (landmarks: any) => {
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const pinkyTip = landmarks[20];

    let distanceThumbToIndex = 1;
    let distancePinkyToIndex = 1;

    if (indexTip && thumbTip && pinkyTip) {
      distanceThumbToIndex = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2),
      );
      distancePinkyToIndex = Math.sqrt(
        Math.pow(pinkyTip.x - indexTip.x, 2) +
          Math.pow(pinkyTip.y - indexTip.y, 2),
      );
    }

    return distanceThumbToIndex < 0.15 && distancePinkyToIndex < 0.15;
  };

  const updateHoverState = (x: number, y: number) => {
    setGrid((prevGrid) =>
      prevGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Calculate cell width and height based on grid size (4x4 in this case)
          const cellWidth = 80;
          const cellHeight = 80;

          // Calculate the top-left corner of the current cell
          const cellX = (colIndex + 2) * cellWidth;
          const cellY = rowIndex * cellHeight;

          // Determine if the hand coordinates (x, y) are within the cell's bounding box
          const isHovered =
            x >= cellX + 20 &&
            x < cellX + cellWidth - 20 &&
            y >= cellY + 20 &&
            y < cellY + cellHeight - 20;

          if (isHovered && isSelectingRef.current) {
            // Add letter to selectedLetters if it's not already included
            setSelectedLetters((prevLetters) => {
              if (
                !prevLetters.some(
                  (prevLetter) =>
                    prevLetter.row === cell.row && prevLetter.col === cell.col,
                )
              ) {
                return [...prevLetters, cell]; // Add the letter if it's not already selected
              }
              return prevLetters; // No change if it's already included
            });
          }

          return {
            ...cell,
            hovered: isHovered,
            selected: isSelectingRef.current
              ? isHovered
                ? true
                : cell.selected
              : false,
          };
        }),
      ),
    );
  };

  const checkIfWordExists = async (word: any) => {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
    );
    if (!response.ok) {
      // Handle error (e.g., word not found)
      return false;
    }
    const data = await response.json();
    return data.length > 0; // Returns true if the word exists
  };

  // Example usage
  const validateWord = async (word: string) => {
    const isValidWord = await checkIfWordExists(word);
    return isValidWord;
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="m-6">Word Hunt</h1>
      <h1>Selected... {selectedLetters.map((cell) => cell.letter).join("")}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <video ref={videoRef} hidden />
      </div>

      <div
        style={{
          position: "relative",
          width: "640px",
          height: "480px",
          marginTop: "20px",
        }}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
        />

        <div>
          {grid.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{ display: "flex", justifyContent: "center" }}
            >
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  style={{
                    width: 80,
                    height: 80,
                    border: "1px solid gray",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: cell.selected
                      ? "lightgreen"
                      : cell.hovered
                        ? "lightblue"
                        : "white",
                    color: "black",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {cell.letter}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center gap-10">
          <div className="flex w-[200px] flex-col items-center justify-center">
            <h2>Found Words</h2>
            <p>{completeRef.current.join(", ")}</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <h2>Score</h2>
            <p>{score}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
