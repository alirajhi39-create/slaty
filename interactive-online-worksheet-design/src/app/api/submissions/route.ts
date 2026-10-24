import { db } from "@/db";
import { submissions } from "@/db/schema";
import { isTeacher } from "@/lib/auth";
import { grade, MANUAL_TOTAL, sanitize } from "@/lib/worksheet";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }
  const studentName = typeof body.studentName === "string" ? body.studentName.trim().slice(0, 100) : "";
  const studentClass = typeof body.studentClass === "string" ? body.studentClass.trim().slice(0, 50) : "";
  if (!studentName) return Response.json({ error: "اكتب اسمك من فضلك" }, { status: 400 });

  const answers = sanitize(body.answers);
  const { results, score, total } = grade(answers);

  const [row] = await db
    .insert(submissions)
    .values({
      studentName,
      studentClass,
      answers,
      autoScore: score,
      autoTotal: total,
      manualTotal: MANUAL_TOTAL,
    })
    .returning({ id: submissions.id });

  return Response.json({ id: row.id, score, total, results });
}

export async function GET(req: Request) {
  if (!isTeacher(req)) return Response.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
  const rows = await db.select().from(submissions).orderBy(desc(submissions.createdAt));
  return Response.json({ submissions: rows });
}
