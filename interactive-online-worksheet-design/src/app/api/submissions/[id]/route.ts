import { db } from "@/db";
import { submissions } from "@/db/schema";
import { isTeacher } from "@/lib/auth";
import { MANUAL_TOTAL } from "@/lib/worksheet";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function PATCH(req: Request, ctx: RouteContext<"/api/submissions/[id]">) {
  if (!isTeacher(req)) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return Response.json({ error: "غير موجود" }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Partial<typeof submissions.$inferInsert> = { reviewed: true };
  if (typeof body.manualScore === "number" && Number.isFinite(body.manualScore)) {
    update.manualScore = Math.max(0, Math.min(MANUAL_TOTAL, Math.round(body.manualScore)));
  }
  if (typeof body.feedback === "string") update.feedback = body.feedback.slice(0, 2000);
  const [row] = await db.update(submissions).set(update).where(eq(submissions.id, id)).returning();
  if (!row) return Response.json({ error: "غير موجود" }, { status: 404 });
  return Response.json({ submission: row });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/submissions/[id]">) {
  if (!isTeacher(req)) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return Response.json({ error: "غير موجود" }, { status: 404 });
  await db.delete(submissions).where(eq(submissions.id, id));
  return Response.json({ ok: true });
}
