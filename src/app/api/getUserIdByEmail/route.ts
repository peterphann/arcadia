// app/api/getUserIdByEmail/route.ts
import { query } from "~/lib/db"; // Adjust to your db configuration
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    console.log(email);
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ userId: result.rows[0].id });
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user ID" },
      { status: 500 },
    );
  }
}
