import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all documents for a folder
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      return Response.json({ error: "Folder ID required" }, { status: 400 });
    }

    const documents = await sql`
      SELECT id, folder_id, name, file_url, file_type, created_at
      FROM documents
      WHERE folder_id = ${folderId} AND user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    return Response.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return Response.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

// Create a new document/note
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { folderId, name, content, fileType } = await request.json();

    if (!folderId || !name) {
      return Response.json(
        { error: "Folder ID and name required" },
        { status: 400 },
      );
    }

    // For text notes, store content as data URI
    const fileUrl = content
      ? `data:text/plain;base64,${Buffer.from(content).toString("base64")}`
      : "";

    const result = await sql`
      INSERT INTO documents (user_id, folder_id, name, file_url, file_type)
      VALUES (${session.user.id}, ${folderId}, ${name}, ${fileUrl}, ${fileType || "note"})
      RETURNING id, folder_id, name, file_url, file_type, created_at
    `;

    return Response.json({ document: result[0] });
  } catch (error) {
    console.error("Error creating document:", error);
    return Response.json(
      { error: "Failed to create document" },
      { status: 500 },
    );
  }
}

// Update document content
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, content } = await request.json();

    if (!id) {
      return Response.json({ error: "Document ID required" }, { status: 400 });
    }

    let updateQuery = "UPDATE documents SET ";
    const values = [];
    const setClauses = [];

    if (name !== undefined) {
      setClauses.push(`name = $${values.length + 1}`);
      values.push(name);
    }

    if (content !== undefined) {
      const fileUrl = `data:text/plain;base64,${Buffer.from(content).toString("base64")}`;
      setClauses.push(`file_url = $${values.length + 1}`);
      values.push(fileUrl);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    updateQuery += setClauses.join(", ");
    updateQuery += ` WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING id, folder_id, name, file_url, file_type, created_at`;
    values.push(id, session.user.id);

    const result = await sql(updateQuery, values);

    if (result.length === 0) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    return Response.json({ document: result[0] });
  } catch (error) {
    console.error("Error updating document:", error);
    return Response.json(
      { error: "Failed to update document" },
      { status: 500 },
    );
  }
}

// Delete a document
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return Response.json({ error: "Document ID required" }, { status: 400 });
    }

    await sql`
      DELETE FROM documents 
      WHERE id = ${documentId} AND user_id = ${session.user.id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return Response.json(
      { error: "Failed to delete document" },
      { status: 500 },
    );
  }
}
