"use client"

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import useSound from "use-sound";


export default function Stats() {
    const [backSound] = useSound('/audio/select.wav')

    interface DanceSession {
        average_score: string,
        dance_duration: {
            seconds: number
        },
        id: number,
        song: string,
        timestamp: string,
        user_id: number
    }

    const [stats, setStats] = useState<DanceSession[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStats = async () => {
            const session = await getSession();

            const response = await fetch("/api/getUserIdByEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session?.user.email }),
            });
            const data = await response.json()
            const id = data.userId

            const statsResponse = await fetch("/api/getUserStats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id }),
            })
            if (statsResponse.status != 200) {
                setStats([])
            } else {
                const statsData = await statsResponse.json()
                setStats(statsData)
            }
            setLoading(false)
        }
        fetchStats()
    }, [])

    return (
        <div className="ml-12 mt-32">
            <Link href="/">
                <div
                    onClick={() => backSound()}
                    className="fixed left-6 top-6 z-50 hover:translate-y-1"
                >
                    Back
                </div>
            </Link>

            <h1 className="text-4xl mb-10">Statistics</h1>
            <h2 className="text-2xl mb-3">Leap Dance</h2>


            {isLoading ? <p>Loading...</p> :
                stats.length > 0 ? <div>
                    <p>Personal Best - {Math.max(...stats.map(stat => parseFloat(stat.average_score))).toFixed(2)} secs</p>
                    <p>Games Played - {Object.keys(stats).length}</p>
                    <p>Longest Dance Duration - {Math.max(...stats.map(stat => stat.dance_duration.seconds))}</p>
                </div> :
                    <p>You don't have enough playtime!</p>}
        </div>
    )
}