"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import useSound from 'use-sound';

interface LeaderboardItem {
    id: number;
    user_id: number;
    name: string;
    email: string;
    song: string;
    dance_duration: string; // Keep as string for display
    average_score: number;
    timestamp: string; // Change to string to directly accept the timestamp format from PostgreSQL
}

export default function Leaderboards() {
    const [data, setData] = useState<LeaderboardItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [backSound] = useSound("/audio/select.wav")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/leaderboards');

                if (!response.ok) {
                    throw new Error("Leaderboard data could not be fetched.");
                }

                const result = await response.json();
                console.log(result);
                setData(result);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch leaderboard data.");
            }
        };

        fetchData();
    }, []);

    // Log the data whenever it changes
    useEffect(() => {
        console.log(data);
    }, [data]);

    if (error) {
        return <div>{error}</div>;
    }

    if (data.length === 0) {
        return <div>Loading leaderboard data...</div>;
    }

    return (
        <div>
            <Link href="/">
                <div
                    onClick={() => backSound()}
                    className="fixed left-6 top-6 z-50 hover:translate-y-1"
                >
                    Back
                </div>
            </Link>

            <h1 className='mt-20 ml-6 text-4xl'>Leaderboards</h1>
            <table className='m-10 w-11/12'>
                <thead>
                    <tr>
                        <th className='text-start'>Rank</th>
                        <th className='text-start'>Name</th>
                        <th className='text-start'>Email</th>
                        <th className='text-start'>Song</th>
                        <th className='text-start'>Dance Duration</th>
                        <th className='text-start'>Score</th>
                        <th className='text-start'>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item: LeaderboardItem) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.song.replaceAll('.mp4', '').replaceAll('/songs/', '').replaceAll('_', ' ')}</td>
                            <td>{item.dance_duration}</td> {/* Display the interval directly */}
                            <td>{item.average_score}</td>
                            <td>
                                {/* Directly use the timestamp since it's already a string */}
                                {new Intl.DateTimeFormat('en-US', {
                                    year: '2-digit',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }).format(new Date(item.timestamp))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}