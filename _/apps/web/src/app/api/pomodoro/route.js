import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get pomodoro sessions
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "week";

    let dateFilter = "NOW() - INTERVAL '7 days'";
    if (timeRange === "month") {
      dateFilter = "NOW() - INTERVAL '30 days'";
    } else if (timeRange === "year") {
      dateFilter = "NOW() - INTERVAL '365 days'";
    }

    const sessions = await sql(
      `
      SELECT 
        ps.id, 
        ps.subject_id, 
        ps.duration_minutes, 
        ps.session_type, 
        ps.completed_at,
        s.name as subject_name,
        s.color as subject_color
      FROM pomodoro_sessions ps
      LEFT JOIN subjects s ON ps.subject_id = s.id
      WHERE ps.user_id = $1 AND ps.completed_at >= ${dateFilter}
      ORDER BY ps.completed_at DESC
    `,
      [session.user.id],
    );

    return Response.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}

// Create a pomodoro session
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId, durationMinutes, sessionType } = await request.json();

    if (!durationMinutes || !sessionType) {
      return Response.json(
        { error: "Duration and session type required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO pomodoro_sessions (user_id, subject_id, duration_minutes, session_type)
      VALUES (${session.user.id}, ${subjectId || null}, ${durationMinutes}, ${sessionType})
      RETURNING id, subject_id, duration_minutes, session_type, completed_at
    `;

    return Response.json({ session: result[0] });
  } catch (error) {
    console.error("Error creating session:", error);
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
