import ModelViewer from "./StaticModelViewer";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import useSound from "use-sound";

interface Props {
  name: string;
  path: string;
  setAvatar: any;
}

export default function ModelCard({ name, path, setAvatar }: Props) {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectSound] = useSound("/audio/select2.wav");

  useEffect(() => {
    if (!userId) {
      const fetchUserId = async () => {
        const session = await getSession();
        if (session?.user?.email) {
          // Fetch user ID logic
          try {
            const response = await fetch("/api/getUserIdByEmail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: session.user.email }),
            });
            const data = await response.json();
            if (response.ok) {
              setUserId(data.userId);
              console.log("Fetched userId:", data.userId);
            } else {
              console.error("Error fetching user ID:", data.error);
            }
          } catch (error) {
            console.error("Error fetching user ID:", error);
          }
        }
      };
      fetchUserId();
    }
  }, [userId]); // Only refetch if userId is missing

  const handleSaveAvatar = async () => {
    console.log("test");
    if (!userId) {
      console.error("User ID not found. Cannot save avatar.");
      return;
    }

    setLoading(true);
    try {
      const profileResponse = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, modelPath: path }),
      });

      if (profileResponse.ok) {
        setAvatar([name, path]);
        console.log("Model path saved successfully");
      } else {
        const errorData = await profileResponse.json();
        console.error("Failed to save model path:", errorData.error);
      }
    } catch (error) {
      console.error("Error saving model path:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="flex flex-col gap-4 text-center"
        onClick={() => {
          selectSound();
          handleSaveAvatar();
        }}
      >
        {loading ? (
          <div>Loading model...</div>
        ) : (
          <div className="hover:-translate-y-4 hover:cursor-pointer">
            <ModelViewer modelPath={path} />
          </div>
        )}
        <button className="hover:translate-y-1">{name}</button>
      </div>
    </>
  );
}
