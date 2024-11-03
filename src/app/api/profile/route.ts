// app/api/profile/route.ts
import { query } from "~/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, modelPath } = await request.json();

    if (!userId || !modelPath) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if the user already has a model path saved
    const existingRecord = await query(
      `SELECT * FROM user_profiles WHERE user_id = $1`,
      [userId],
    );

    let result;
    if (existingRecord.rows.length > 0) {
      // Update the existing record with the new model path
      result = await query(
        `UPDATE user_profiles SET model_path = $2 WHERE user_id = $1 RETURNING *`,
        [userId, modelPath],
      );
    } else {
      // Insert a new record with the user ID and model path
      result = await query(
        `INSERT INTO user_profiles (user_id, model_path) VALUES ($1, $2) RETURNING *`,
        [userId, modelPath],
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error saving model path:", error);
    return NextResponse.json(
      { error: "Failed to save model path" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId parameter" },
      { status: 400 },
    );
  }

  try {
    const result = await query(
      `SELECT COALESCE((SELECT model_path FROM user_profiles WHERE user_id = $1), '/models/suki.vrm') AS model_path;
`,
      [userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching model path:", error);
    return NextResponse.json(
      { error: "Failed to fetch model path" },
      { status: 500 },
    );
  }
}
