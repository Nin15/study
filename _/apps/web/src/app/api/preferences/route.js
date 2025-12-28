import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user preferences
export async function GET(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [preferences] = await sql`
      SELECT * FROM user_preferences WHERE user_id = ${session.user.id}
    `;

    // Return default preferences if none exist
    if (!preferences) {
      return Response.json({
        preferences: {
          theme: "default",
          accent_color: "#2962FF",
          layout: "default",
          timer_sound: "default",
        },
      });
    }

    return Response.json({ preferences });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return Response.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

// Update user preferences
export async function PUT(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { theme, accentColor, layout, timerSound } = await request.json();

    // Check if user is premium for premium features
    const [user] = await sql`
      SELECT is_premium FROM auth_users WHERE id = ${session.user.id}
    `;

    const isPremium = user?.is_premium || false;

    // Premium themes
    const premiumThemes = ["forest", "sunset", "midnight", "cherry"];
    const premiumLayouts = ["compact", "spacious"];

    if (!isPremium) {
      if (theme && premiumThemes.includes(theme)) {
        return Response.json(
          { error: "This theme requires premium" },
          { status: 403 },
        );
      }
      if (layout && premiumLayouts.includes(layout)) {
        return Response.json(
          { error: "This layout requires premium" },
          { status: 403 },
        );
      }
      if (timerSound && timerSound !== "default") {
        return Response.json(
          { error: "Custom timer sounds require premium" },
          { status: 403 },
        );
      }
      if (accentColor && accentColor !== "#2962FF") {
        return Response.json(
          { error: "Custom accent colors require premium" },
          { status: 403 },
        );
      }
    }

    // Insert or update preferences - use EXCLUDED to reference the new values
    const queryStr = `
      INSERT INTO user_preferences (user_id, theme, accent_color, layout, timer_sound, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET
        theme = COALESCE($2, user_preferences.theme),
        accent_color = COALESCE($3, user_preferences.accent_color),
        layout = COALESCE($4, user_preferences.layout),
        timer_sound = COALESCE($5, user_preferences.timer_sound),
        updated_at = NOW()
      RETURNING *
    `;

    const [preferences] = await sql(queryStr, [
      session.user.id,
      theme || null,
      accentColor || null,
      layout || null,
      timerSound || null,
    ]);

    return Response.json({ preferences });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return Response.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
