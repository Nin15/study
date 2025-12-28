import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sql`
      SELECT 
        study_duration, 
        short_break, 
        long_break, 
        auto_start_breaks, 
        auto_start_pomodoros, 
        notifications_enabled
      FROM user_settings
      WHERE user_id = ${session.user.id}
      LIMIT 1
    `;

    if (result.length === 0) {
      // Create default settings if none exist
      const newSettings = await sql`
        INSERT INTO user_settings (user_id)
        VALUES (${session.user.id})
        RETURNING study_duration, short_break, long_break, auto_start_breaks, auto_start_pomodoros, notifications_enabled
      `;
      return Response.json({ settings: newSettings[0] });
    }

    return Response.json({ settings: result[0] });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// Update user settings
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      studyDuration,
      shortBreak,
      longBreak,
      autoStartBreaks,
      autoStartPomodoros,
      notificationsEnabled,
    } = body;

    const setClauses = [];
    const values = [];

    if (studyDuration !== undefined) {
      setClauses.push(`study_duration = $${values.length + 1}`);
      values.push(studyDuration);
    }
    if (shortBreak !== undefined) {
      setClauses.push(`short_break = $${values.length + 1}`);
      values.push(shortBreak);
    }
    if (longBreak !== undefined) {
      setClauses.push(`long_break = $${values.length + 1}`);
      values.push(longBreak);
    }
    if (autoStartBreaks !== undefined) {
      setClauses.push(`auto_start_breaks = $${values.length + 1}`);
      values.push(autoStartBreaks);
    }
    if (autoStartPomodoros !== undefined) {
      setClauses.push(`auto_start_pomodoros = $${values.length + 1}`);
      values.push(autoStartPomodoros);
    }
    if (notificationsEnabled !== undefined) {
      setClauses.push(`notifications_enabled = $${values.length + 1}`);
      values.push(notificationsEnabled);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    setClauses.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE user_settings 
      SET ${setClauses.join(", ")}
      WHERE user_id = $${values.length + 1}
      RETURNING study_duration, short_break, long_break, auto_start_breaks, auto_start_pomodoros, notifications_enabled
    `;
    values.push(session.user.id);

    const result = await sql(updateQuery, values);

    if (result.length === 0) {
      // If no settings exist, create them
      const newSettings = await sql`
        INSERT INTO user_settings (
          user_id, 
          study_duration, 
          short_break, 
          long_break, 
          auto_start_breaks, 
          auto_start_pomodoros, 
          notifications_enabled
        )
        VALUES (
          ${session.user.id},
          ${studyDuration || 25},
          ${shortBreak || 5},
          ${longBreak || 15},
          ${autoStartBreaks || false},
          ${autoStartPomodoros || false},
          ${notificationsEnabled !== undefined ? notificationsEnabled : true}
        )
        RETURNING study_duration, short_break, long_break, auto_start_breaks, auto_start_pomodoros, notifications_enabled
      `;
      return Response.json({ settings: newSettings[0] });
    }

    return Response.json({ settings: result[0] });
  } catch (error) {
    console.error("Error updating settings:", error);
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
