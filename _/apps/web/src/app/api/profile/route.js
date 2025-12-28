import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Check if email exists (for signup validation)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (email) {
    // Check if email exists
    try {
      const users = await sql`
        SELECT id FROM auth_users WHERE email = ${email}
      `;
      return Response.json({ exists: users.length > 0 });
    } catch (error) {
      console.error("Error checking email:", error);
      return Response.json({ error: "Failed to check email" }, { status: 500 });
    }
  }

  // If no email param, return current user profile
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [user] = await sql`
      SELECT id, name, email, image, is_premium, last_seen
      FROM auth_users 
      WHERE id = ${session.user.id}
    `;

    return Response.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, image } = await request.json();

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (image !== undefined) {
      updates.push(`image = $${paramIndex++}`);
      values.push(image);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(session.user.id);

    const [updated] = await sql(
      `UPDATE auth_users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    return Response.json({ user: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

// Update last_seen timestamp
export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await sql`
      UPDATE auth_users 
      SET last_seen = NOW()
      WHERE id = ${session.user.id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating last_seen:", error);
    return Response.json(
      { error: "Failed to update last_seen" },
      { status: 500 },
    );
  }
}
