// app/api/getUserIdByEmail/route.ts
import { query } from "~/lib/db"; // Adjust to your db configuration
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        
        }
        const result = await query(
            "SELECT * FROM dance_sessions WHERE id = $1",
            [id],
        );
      

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Statistics not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching user ID:", error);
        return NextResponse.json(
            { error: "Failed to retrieve user ID" },
            { status: 500 },
        );
    }
}
