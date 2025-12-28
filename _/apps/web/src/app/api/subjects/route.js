import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all subjects for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjects = await sql`
      SELECT id, name, color, level, created_at 
      FROM subjects 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at ASC
    `;

    return Response.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return Response.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}

// Create multiple subjects (from onboarding)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjects } = await request.json();

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return Response.json({ error: "Invalid subjects data" }, { status: 400 });
    }

    // Insert all subjects
    const insertedSubjects = [];
    for (const subject of subjects) {
      const result = await sql`
        INSERT INTO subjects (user_id, name, color, level)
        VALUES (${session.user.id}, ${subject.name}, ${subject.color}, ${subject.level})
        RETURNING id, name, color, level, created_at
      `;
      insertedSubjects.push(result[0]);
    }

    // Create default folders for each subject
    for (const subject of insertedSubjects) {
      // Check if this is a language subject (Group 1 or Group 2)
      const isLanguageSubject =
        subject.name.toLowerCase().includes("language") ||
        subject.name.toLowerCase().includes("english") ||
        subject.name.toLowerCase().includes("spanish") ||
        subject.name.toLowerCase().includes("french") ||
        subject.name.toLowerCase().includes("german") ||
        subject.name.toLowerCase().includes("chinese") ||
        subject.name.toLowerCase().includes("mandarin") ||
        subject.name.toLowerCase().includes("japanese") ||
        subject.name.toLowerCase().includes("arabic") ||
        subject.name.toLowerCase().includes("literature");

      const assessmentFolderName = isLanguageSubject
        ? "Individual Oral"
        : "Internal Assessment";

      // Create folders
      await sql`
        INSERT INTO folders (user_id, subject_id, name)
        VALUES 
          (${session.user.id}, ${subject.id}, ${assessmentFolderName}),
          (${session.user.id}, ${subject.id}, 'Notes & Homework')
      `;
    }

    // Create TOK and EE folders (not subject-specific)
    await sql`
      INSERT INTO folders (user_id, subject_id, name)
      VALUES 
        (${session.user.id}, NULL, 'Theory of Knowledge (TOK)'),
        (${session.user.id}, NULL, 'Extended Essay (EE)')
    `;

    return Response.json({ subjects: insertedSubjects });
  } catch (error) {
    console.error("Error creating subjects:", error);
    return Response.json(
      { error: "Failed to create subjects" },
      { status: 500 },
    );
  }
}

// Delete a subject
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("id");

    if (!subjectId) {
      return Response.json({ error: "Subject ID required" }, { status: 400 });
    }

    await sql`
      DELETE FROM subjects 
      WHERE id = ${subjectId} AND user_id = ${session.user.id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return Response.json(
      { error: "Failed to delete subject" },
      { status: 500 },
    );
  }
}
