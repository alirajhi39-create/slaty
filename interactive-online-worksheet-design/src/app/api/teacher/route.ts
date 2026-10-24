import { db } from "@/db";
import { submissions } from "@/db/schema";
import { verifyCredentials } from "@/lib/auth";
import { MANUAL_TOTAL } from "@/lib/worksheet";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f-]{36}$/i;

// نقطة واحدة لكل عمليات المعلم؛ كلمة المرور/الرمز تُرسل في جسم الطلب (UTF-8 آمن)
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const token = verifyCredentials(body);
  if (!token) return Response.json({ error: "unauthorized" }, { status: 401 });

  const action = body.action;

  if (action === "list") {
    const rows = await db.select().from(submissions).orderBy(desc(submissions.createdAt));
    return Response.json({ token, submissions: rows });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID_RE.test(id)) return Response.json({ error: "not found" }, { status: 404 });

  if (action === "update") {
    const update: Partial<typeof submissions.$inferInsert> = { reviewed: true };
    if (typeof body.manualScore === "number" && Number.isFinite(body.manualScore)) {
      update.manualScore = Math.max(0, Math.min(MANUAL_TOTAL, Math.round(body.manualScore)));
    }
    if (typeof body.feedback === "string") update.feedback = body.feedback.slice(0, 2000);
    const [row] = await db.update(submissions).set(update).where(eq(submissions.id, id)).returning();
    if (!row) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ submission: row });
  }

  if (action === "delete") {
    await db.delete(submissions).where(eq(submissions.id, id));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "bad action" }, { status: 400 });
}
