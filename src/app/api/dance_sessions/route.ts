// app/api/dance_sessions/route.ts
import { query } from "~/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the request body to get the session data
    const { userId, song, danceDuration, averageScore } = await request.json();
    console.log("User ID:", userId);
    console.log("Song:", song);
    console.log("Dance Duration:", danceDuration);
    console.log("Average Score:", averageScore);

    // Validate data before saving
    if (!userId || !song || !danceDuration || averageScore === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // SQL query to insert the new session
    const result = await query(
      `INSERT INTO dance_sessions (user_id, song, dance_duration, average_score)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [userId, song, danceDuration, averageScore],
    );

    // Return the inserted row
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error saving dance session:", error);
    return NextResponse.json(
      { error: "Failed to save dance session" },
      { status: 500 },
    );
  }
}
