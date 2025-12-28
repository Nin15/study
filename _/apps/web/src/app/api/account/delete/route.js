import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete user (cascading deletes will handle related data)
    await sql`
      DELETE FROM auth_users WHERE id = ${userId}
    `;

    return Response.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
