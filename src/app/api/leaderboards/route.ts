import { query } from "~/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await query(`
            DROP VIEW IF EXISTS view_combined_dance_sessions;
        `);

        await query(`
            CREATE VIEW view_combined_dance_sessions AS
            SELECT 
            ds.id,
            ds.user_id,
            u.name,
            u.email,
            ds.song,
            CONCAT(
            LPAD(EXTRACT(MINUTE FROM ds.dance_duration)::text, 2, '0'), ':',
            LPAD(ROUND(EXTRACT(SECOND FROM ds.dance_duration))::text, 2, '0')
            ) AS dance_duration,
            ds.average_score,
            ds.timestamp
            FROM 
            dance_sessions AS ds
            JOIN 
            users AS u ON ds.user_id = u.id;
        `);
        
        const result = await query(
            `SELECT * FROM view_combined_dance_sessions`
        );

        return NextResponse.json(
            result.rows,
            { status: 200 }
        );
        
    } catch (error) {
        console.error("Error obtaining values for leaderboard.");

        return NextResponse.json(
            { error: "Failed to obtain table data." },
            { status: 500 }
        );
    }
}
