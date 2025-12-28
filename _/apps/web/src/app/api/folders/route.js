import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all folders for current user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    let folders;
    if (subjectId) {
      // Get folders for specific subject
      folders = await sql`
        SELECT f.id, f.name, f.subject_id, f.parent_folder_id, f.created_at,
               COUNT(d.id) as document_count
        FROM folders f
        LEFT JOIN documents d ON f.id = d.folder_id
        WHERE f.user_id = ${session.user.id} AND f.subject_id = ${subjectId}
        GROUP BY f.id, f.name, f.subject_id, f.parent_folder_id, f.created_at
        ORDER BY f.created_at ASC
      `;
    } else {
      // Get all folders
      folders = await sql`
        SELECT f.id, f.name, f.subject_id, f.parent_folder_id, f.created_at,
               COUNT(d.id) as document_count,
               s.name as subject_name, s.color as subject_color
        FROM folders f
        LEFT JOIN documents d ON f.id = d.folder_id
        LEFT JOIN subjects s ON f.subject_id = s.id
        WHERE f.user_id = ${session.user.id}
        GROUP BY f.id, f.name, f.subject_id, f.parent_folder_id, f.created_at, s.name, s.color
        ORDER BY f.created_at ASC
      `;
    }

    return Response.json({ folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return Response.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

// Create a new folder
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, subjectId, parentFolderId } = await request.json();

    if (!name) {
      return Response.json({ error: "Folder name required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO folders (user_id, subject_id, parent_folder_id, name)
      VALUES (${session.user.id}, ${subjectId || null}, ${parentFolderId || null}, ${name})
      RETURNING id, name, subject_id, parent_folder_id, created_at
    `;

    return Response.json({ folder: result[0] });
  } catch (error) {
    console.error("Error creating folder:", error);
    return Response.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

// Update folder name
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name } = await request.json();

    if (!id || !name) {
      return Response.json(
        { error: "Folder ID and name required" },
        { status: 400 },
      );
    }

    const result = await sql`
      UPDATE folders 
      SET name = ${name}
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING id, name, subject_id, parent_folder_id, created_at
    `;

    if (result.length === 0) {
      return Response.json({ error: "Folder not found" }, { status: 404 });
    }

    return Response.json({ folder: result[0] });
  } catch (error) {
    console.error("Error updating folder:", error);
    return Response.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

// Delete a folder
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("id");

    if (!folderId) {
      return Response.json({ error: "Folder ID required" }, { status: 400 });
    }

    await sql`
      DELETE FROM folders 
      WHERE id = ${folderId} AND user_id = ${session.user.id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return Response.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
