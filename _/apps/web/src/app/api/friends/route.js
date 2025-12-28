import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get friends list
export async function GET(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const friends = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.image,
        u.last_seen,
        f.status,
        f.created_at,
        CASE 
          WHEN u.last_seen > NOW() - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online
      FROM friends f
      JOIN auth_users u ON (
        CASE 
          WHEN f.user_id = ${session.user.id} THEN u.id = f.friend_id
          ELSE u.id = f.user_id
        END
      )
      WHERE (f.user_id = ${session.user.id} OR f.friend_id = ${session.user.id})
      ORDER BY f.created_at DESC
    `;

    return Response.json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return Response.json({ error: "Failed to fetch friends" }, { status: 500 });
  }
}

// Send friend request
export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { friendEmail } = await request.json();

    // Find friend by email
    const [friend] = await sql`
      SELECT id FROM auth_users WHERE email = ${friendEmail}
    `;

    if (!friend) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (friend.id === session.user.id) {
      return Response.json(
        { error: "Cannot add yourself as friend" },
        { status: 400 },
      );
    }

    // Check if friendship already exists
    const [existing] = await sql`
      SELECT * FROM friends 
      WHERE (user_id = ${session.user.id} AND friend_id = ${friend.id})
         OR (user_id = ${friend.id} AND friend_id = ${session.user.id})
    `;

    if (existing) {
      return Response.json(
        { error: "Friend request already exists" },
        { status: 400 },
      );
    }

    // Create friend request
    const [newFriend] = await sql`
      INSERT INTO friends (user_id, friend_id, status)
      VALUES (${session.user.id}, ${friend.id}, 'pending')
      RETURNING *
    `;

    return Response.json({ friend: newFriend });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return Response.json(
      { error: "Failed to send friend request" },
      { status: 500 },
    );
  }
}

// Accept friend request
export async function PUT(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { friendId } = await request.json();

    const [updated] = await sql`
      UPDATE friends 
      SET status = 'accepted'
      WHERE friend_id = ${session.user.id} AND user_id = ${friendId} AND status = 'pending'
      RETURNING *
    `;

    if (!updated) {
      return Response.json(
        { error: "Friend request not found" },
        { status: 404 },
      );
    }

    return Response.json({ friend: updated });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return Response.json(
      { error: "Failed to accept friend request" },
      { status: 500 },
    );
  }
}

// Remove friend
export async function DELETE(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get("friendId");

    await sql`
      DELETE FROM friends 
      WHERE (user_id = ${session.user.id} AND friend_id = ${friendId})
         OR (user_id = ${friendId} AND friend_id = ${session.user.id})
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error);
    return Response.json({ error: "Failed to remove friend" }, { status: 500 });
  }
}
