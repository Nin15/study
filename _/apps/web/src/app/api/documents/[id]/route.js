import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get a single document
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const result = await sql`
      SELECT id, folder_id, name, file_url, file_type, created_at
      FROM documents
      WHERE id = ${id} AND user_id = ${session.user.id}
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    const document = result[0];

    // Decode content if it's a note
    if (
      document.file_type === "note" &&
      document.file_url.startsWith("data:text/plain;base64,")
    ) {
      const base64Content = document.file_url.replace(
        "data:text/plain;base64,",
        "",
      );
      const content = Buffer.from(base64Content, "base64").toString("utf-8");
      document.content = content;
    }

    return Response.json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return Response.json(
      { error: "Failed to fetch document" },
      { status: 500 },
    );
  }
}
