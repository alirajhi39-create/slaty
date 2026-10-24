import { db } from "@/db";
import { submissions } from "@/db/schema";
import { grade, sanitize } from "@/lib/worksheet";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const toAr = (n: number) => n.toLocaleString("ar-EG");

export default async function ResultPage({ params }: PageProps<"/result/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [row] = await db.select().from(submissions).where(eq(submissions.id, id));
  if (!row) notFound();

  const { results } = grade(sanitize(row.answers));
  const total = row.autoTotal + row.manualTotal;
  const score = row.autoScore + (row.manualScore ?? 0);

  return (
    <main className="islamic-bg min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="bg-teal-brand p-6 text-center text-white">
          <p className="text-sm text-amber-100">نتيجة ورقة العمل</p>
          <h1 className="text-3xl font-extrabold">إقامُ الصَّلاةِ 🕌</h1>
          <p className="mt-2 text-lg">
            {row.studentName} {row.studentClass && `— فصل ${row.studentClass}`}
          </p>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-teal-soft p-4 text-center">
              <p className="text-sm text-teal-dark">الدرجة الكلية</p>
              <p className="text-4xl font-extrabold text-teal-dark">
                {row.reviewed ? toAr(score) : toAr(row.autoScore)} <span className="text-lg text-slate-400">/ {toAr(total)}</span>
              </p>
            </div>
            <div className={`rounded-2xl p-4 text-center ${row.reviewed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <p className="text-sm">حالة التصحيح</p>
              <p className="mt-2 text-xl font-bold">{row.reviewed ? "✅ صحّحها المعلم" : "⏳ بانتظار تصحيح المعلم"}</p>
            </div>
          </div>

          {row.feedback && (
            <div className="mt-6 rounded-2xl border-2 border-amber-300 bg-cream p-4">
              <p className="font-bold text-brown">💬 ملاحظة المعلم:</p>
              <p className="mt-1 whitespace-pre-wrap text-lg">{row.feedback}</p>
            </div>
          )}

          <h2 className="mt-8 mb-3 text-xl font-bold text-teal-dark">تفاصيل الدرجات</h2>
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2">
                <span>{r.score === r.total ? "✅" : r.score > 0 ? "🟡" : "❌"} {r.label}</span>
                <span className="font-bold whitespace-nowrap">
                  {toAr(r.score)} / {toAr(r.total)}
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-2">
              <span>📝 الأسئلة الكتابية</span>
              <span className="font-bold">
                {row.manualScore !== null ? toAr(row.manualScore) : "—"} / {toAr(row.manualTotal)}
              </span>
            </li>
          </ul>

          <div className="mt-8 text-center">
            <Link href="/" className="rounded-full bg-brown px-6 py-3 font-bold text-white shadow">
              ↩️ العودة إلى ورقة العمل
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
