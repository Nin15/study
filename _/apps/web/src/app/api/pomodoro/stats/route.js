import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "week";

    let dateFilter = "NOW() - INTERVAL '7 days'";
    let groupBy = "TO_CHAR(completed_at, 'Dy')";

    if (timeRange === "month") {
      dateFilter = "NOW() - INTERVAL '30 days'";
      groupBy = "TO_CHAR(completed_at, 'W')";
    }

    // Get total stats
    const totalStats = await sql(
      `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_minutes
      FROM pomodoro_sessions
      WHERE user_id = $1 
        AND session_type = 'work'
        AND completed_at >= ${dateFilter}
    `,
      [session.user.id],
    );

    // Get daily/weekly breakdown
    const timeBreakdown = await sql(
      `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as sessions,
        SUM(duration_minutes) as minutes
      FROM pomodoro_sessions
      WHERE user_id = $1 
        AND session_type = 'work'
        AND completed_at >= ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY MIN(completed_at) ASC
    `,
      [session.user.id],
    );

    // Get subject breakdown
    const subjectBreakdown = await sql`
      SELECT 
        s.id,
        s.name,
        s.color,
        COUNT(ps.id) as sessions,
        SUM(ps.duration_minutes) as minutes
      FROM subjects s
      LEFT JOIN pomodoro_sessions ps ON s.id = ps.subject_id 
        AND ps.user_id = ${session.user.id}
        AND ps.session_type = 'work'
        AND ps.completed_at >= NOW() - INTERVAL '7 days'
      WHERE s.user_id = ${session.user.id}
      GROUP BY s.id, s.name, s.color
      ORDER BY minutes DESC NULLS LAST
    `;

    return Response.json({
      totalSessions: parseInt(totalStats[0]?.total_sessions || 0),
      totalMinutes: parseInt(totalStats[0]?.total_minutes || 0),
      timeBreakdown,
      subjectBreakdown,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
