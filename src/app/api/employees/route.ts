// app/api/employees/route.ts
import { query } from "~/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await query("SELECT * FROM employees ORDER BY id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 },
    );
  }
}
