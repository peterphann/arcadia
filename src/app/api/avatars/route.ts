import { NextResponse } from "next/server";
import { query } from "~/lib/db";

export async function updateUserAvatar(userId: string, avatarPath: string) {
  const updateQuery = `
    UPDATE users
    SET avatar_path = $1
    WHERE id = $2
    RETURNING *;
  `;
  
  try {
    const result = await query(updateQuery, [avatarPath, userId]);
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    return NextResponse.json(result.rows); // Returns the updated user data
  } catch (error: any) {
    return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
  }
}