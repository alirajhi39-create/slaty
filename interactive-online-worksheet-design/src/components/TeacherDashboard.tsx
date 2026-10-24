"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  type Answers,
  grade,
  MANUAL_QUESTIONS,
  MCQS,
  PRAYERS,
  Q1_KEY,
  Q6_STATEMENTS,
  Q7_OPTIONS,
  sanitize,
} from "@/lib/worksheet";

type Sub = {
  id: string;
  studentName: string;
  studentClass: string;
  answers: unknown;
  autoScore: number;
  autoTotal: number;
  manualScore: number | null;
  manualTotal: number;
  feedback: string;
  reviewed: boolean;
  createdAt: string;
};

const TOKEN_KEY = "salah-teacher-token";
// تخزين آمن: بعض المتصفحات/الإطارات تمنع localStorage فلا نريد أن ينهار الدخول بسببه
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
  del: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};
// كل طلبات المعلم POST إلى /api/teacher وكلمة المرور/الرمز داخل جسم الرسالة
async function teacherCall(body: Record<string, unknown>) {
  return fetch("/api/teacher", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}
const toAr = (n: number) => n.toLocaleString("ar-EG");
const fmtDate = (s: string) =>
  new Date(s).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short", calendar: "gregory" });

export default function TeacherDashboard() {
  const [pw, setPw] = useState("");
  const [token, setToken] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("");
  const [selected, setSelected] = useState<Sub | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [studentUrl, setStudentUrl] = useState("");
  const shareText = "📝 ورقة عمل تفاعلية: إقامُ الصَّلاةِ (الصف الثالث)\nحل مباشر بدون تسجيل — اكتب اسمك وابدأ:\n";

  // يعيد true عند نجاح الدخول. silent=true للمحاولات التلقائية (لا تُظهر خطأ أحمر)
  const enter = useCallback(async (cred: { password?: string; token?: string }, silent = false): Promise<boolean> => {
    setLoading(true);
    setErr("");
    setNotice("");
    try {
      const res = await teacherCall({ ...cred, action: "list" });
      if (res.status === 401) {
        setAuthed(false);
        if (cred.token) store.del(TOKEN_KEY);
        if (silent) {
          if (cred.token) setNotice("انتهت الجلسة السابقة، أدخل كلمة المرور للدخول.");
        } else {
          setErr("كلمة المرور غير صحيحة.");
        }
        return false;
      }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      setSubs(data.submissions);
      setToken(data.token);
      store.set(TOKEN_KEY, data.token);
      setAuthed(true);
      return true;
    } catch (e) {
      setErr(`تعذر الاتصال بالخادم (${e instanceof Error ? e.message : "خطأ"}). كلمة المرور لم تُرفض، أعد المحاولة.`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = store.get(TOKEN_KEY);
    if (saved) enter({ token: saved }, true);
  }, [enter]);

  const classes = useMemo(() => Array.from(new Set(subs.map((s) => s.studentClass).filter(Boolean))).sort(), [subs]);
  const filtered = useMemo(
    () => subs.filter((s) => (!cls || s.studentClass === cls) && (!q || s.studentName.includes(q.trim()))),
    [subs, q, cls],
  );

  const stats = useMemo(() => {
    const n = filtered.length;
    const avg = n ? filtered.reduce((a, s) => a + s.autoScore / s.autoTotal, 0) / n : 0;
    const pending = filtered.filter((s) => !s.reviewed).length;
    const excellent = filtered.filter((s) => s.autoScore / s.autoTotal >= 0.9).length;
    return { n, avg, pending, excellent };
  }, [filtered]);

  const questionStats = useMemo(() => {
    if (!filtered.length) return [];
    const map = new Map<string, { label: string; score: number; total: number }>();
    for (const s of filtered) {
      for (const r of grade(sanitize(s.answers)).results) {
        const m = map.get(r.key) ?? { label: r.label, score: 0, total: 0 };
        m.score += r.score;
        m.total += r.total;
        map.set(r.key, m);
      }
    }
    return Array.from(map.values());
  }, [filtered]);

  function exportCsv() {
    const header = ["الاسم", "الفصل", "التاريخ", "الدرجة الآلية", "من", "درجة المعلم", "من", "المجموع", "ملاحظة المعلم", "معنى إقام الصلاة (كتابي)"];
    const rows = filtered.map((s) => {
      const a = sanitize(s.answers);
      return [
        s.studentName,
        s.studentClass,
        new Date(s.createdAt).toLocaleString("en-GB"),
        s.autoScore,
        s.autoTotal,
        s.manualScore ?? "",
        s.manualTotal,
        s.autoScore + (s.manualScore ?? 0),
        s.feedback,
        a.q10,
      ];
    });
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "نتائج-ورقة-عمل-إقام-الصلاة.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function getStudentUrl() {
    if (typeof window === "undefined") return "";
    return window.location.origin + "/";
  }

  function openShare() {
    setStudentUrl(getStudentUrl());
    setShareOpen(true);
  }

  async function copyLink() {
    const url = getStudentUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const url = getStudentUrl();
    window.open("https://wa.me/?text=" + encodeURIComponent(shareText + url), "_blank");
  }

  if (!authed) {
    return (
      <main className="islamic-bg flex min-h-screen items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enter({ password: pw });
          }}
          className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl"
        >
          <div className="text-6xl">👩‍🏫</div>
          <h1 className="mt-3 text-2xl font-extrabold text-teal-dark">لوحة المعلم</h1>
          <p className="mt-1 text-sm text-slate-500">ورقة عمل: إقامُ الصَّلاةِ — الصف الثالث</p>
          <div className="relative mt-6">
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              autoComplete="off"
              dir="ltr"
              onChange={(e) => setPw(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full rounded-xl border-2 border-teal-brand/30 px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-teal-brand"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              title={showPw ? "إخفاء" : "إظهار"}
              className="absolute inset-y-0 left-2 my-auto h-8 w-8 rounded-full text-lg hover:bg-slate-100"
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          {err && <p className="mt-3 text-sm font-bold leading-relaxed text-rose-600">{err}</p>}
          {notice && <p className="mt-3 text-sm leading-relaxed text-amber-700">ℹ️ {notice}</p>}
          <button disabled={loading} className="mt-4 w-full rounded-xl bg-teal-brand py-3 text-lg font-bold text-white hover:bg-teal-dark disabled:opacity-60">
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            إن ظهر رفض متكرر: حدّث الصفحة بـ <b className="text-slate-500">Ctrl + Shift + R</b> لتحميل آخر نسخة.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-bold text-brown">↩️ العودة لورقة العمل</Link>
        </form>
      </main>
    );
  }

  return (
    <main className="islamic-bg min-h-screen pb-16">
      <header className="bg-teal-brand text-white shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-2xl font-extrabold">👩‍🏫 لوحة المعلم — إقامُ الصَّلاةِ</h1>
            <p className="text-sm text-teal-soft">متابعة إجابات طلاب الصف الثالث الابتدائي</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={openShare} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-extrabold text-teal-dark shadow hover:bg-amber-300">
              📤 مشاركة رابط الطلاب
            </button>
            <button onClick={copyLink} className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
              {copied ? "✅ تم النسخ" : "🔗 نسخ سريع"}
            </button>
            <button onClick={() => enter({ token })} className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30">
              {loading ? "⏳" : "🔄"} تحديث
            </button>
            <button onClick={exportCsv} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-teal-dark">
              ⬇️ تصدير Excel
            </button>
            <button
              onClick={() => {
                store.del(TOKEN_KEY);
                setToken("");
                setAuthed(false);
                setPw("");
              }}
              className="rounded-full bg-brown px-4 py-2 text-sm font-bold"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { l: "عدد الإجابات", v: toAr(stats.n), i: "📨", c: "text-teal-dark" },
            { l: "متوسط الدرجات الآلية", v: `${toAr(Math.round(stats.avg * 100))}٪`, i: "📊", c: "text-brown" },
            { l: "بانتظار التصحيح", v: toAr(stats.pending), i: "⏳", c: "text-amber-600" },
            { l: "متميزون (٩٠٪+)", v: toAr(stats.excellent), i: "🌟", c: "text-emerald-600" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white p-4 shadow">
              <div className="text-2xl">{s.i}</div>
              <p className={`mt-1 text-3xl font-extrabold ${s.c}`}>{s.v}</p>
              <p className="text-sm text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>

        {questionStats.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-3 font-bold text-teal-dark">📈 نسبة الإتقان لكل سؤال</h2>
            <div className="grid gap-2 md:grid-cols-2">
              {questionStats.map((s) => {
                const p = s.total ? Math.round((s.score / s.total) * 100) : 0;
                return (
                  <div key={s.label} className="text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="truncate">{s.label}</span>
                      <span className="font-bold">{toAr(p)}٪</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${p >= 80 ? "bg-emerald-500" : p >= 50 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 ابحث باسم الطالب"
            className="flex-1 rounded-xl border-2 border-teal-brand/20 bg-white px-4 py-2 outline-none focus:border-teal-brand"
          />
          <select value={cls} onChange={(e) => setCls(e.target.value)} className="rounded-xl border-2 border-teal-brand/20 bg-white px-4 py-2">
            <option value="">كل الفصول</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow">
          <table className="w-full min-w-[700px] text-right">
            <thead className="bg-teal-soft text-teal-dark">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">الطالب</th>
                <th className="p-3">الفصل</th>
                <th className="p-3">وقت الإرسال</th>
                <th className="p-3">الدرجة الآلية</th>
                <th className="p-3">المجموع</th>
                <th className="p-3">الحالة</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    لا توجد إجابات بعد. شارك رابط الورقة مع طلابك 📤
                  </td>
                </tr>
              )}
              {filtered.map((s, i) => {
                const p = s.autoScore / s.autoTotal;
                return (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3 text-slate-400">{toAr(i + 1)}</td>
                    <td className="p-3 font-bold">{s.studentName}</td>
                    <td className="p-3">{s.studentClass || "—"}</td>
                    <td className="p-3 text-sm text-slate-500">{fmtDate(s.createdAt)}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-3 py-1 text-sm font-bold ${p >= 0.9 ? "bg-emerald-100 text-emerald-700" : p >= 0.6 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                        {toAr(s.autoScore)} / {toAr(s.autoTotal)}
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      {s.reviewed ? `${toAr(s.autoScore + (s.manualScore ?? 0))} / ${toAr(s.autoTotal + s.manualTotal)}` : "—"}
                    </td>
                    <td className="p-3 text-sm">{s.reviewed ? "✅ مُصحَّحة" : "⏳ جديدة"}</td>
                    <td className="p-3">
                      <button onClick={() => setSelected(s)} className="rounded-full bg-teal-brand px-4 py-1.5 text-sm font-bold text-white hover:bg-teal-dark">
                        عرض وتصحيح
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <DetailModal
          sub={selected}
          token={token}
          onClose={() => setSelected(null)}
          onSaved={(u) => {
            setSubs((list) => list.map((x) => (x.id === u.id ? u : x)));
            setSelected(null);
          }}
          onDeleted={(id) => {
            setSubs((list) => list.filter((x) => x.id !== id));
            setSelected(null);
          }}
        />
      )}

      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShareOpen(false)}>
          <div className="animate-pop w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold text-teal-dark">📤 رابط الطلاب المباشر</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              بدون تسجيل دخول وبدون كلمة مرور
              <br />
              الطالب يفتح الرابط ← يكتب اسمه ← يحل ← يضغط إرسال ✅
            </p>
            {studentUrl && (
              <div className="mx-auto mt-4 w-fit rounded-2xl border-2 border-teal-brand/20 bg-white p-3">
                <QRCode value={studentUrl} size={160} />
              </div>
            )}
            <p className="mt-2 text-xs text-slate-400">امسح رمز QR بالجوال للدخول مباشرة</p>
            <div dir="ltr" className="mt-3 break-all rounded-xl bg-slate-100 p-3 text-sm font-mono">
              {studentUrl}
            </div>
            <div className="mt-4 grid gap-2">
              <button onClick={copyLink} className="rounded-xl bg-teal-brand py-3 font-bold text-white hover:bg-teal-dark">
                {copied ? "✅ تم نسخ الرابط" : "🔗 نسخ الرابط"}
              </button>
              <button onClick={shareWhatsApp} className="rounded-xl bg-[#25D366] py-3 font-bold text-white hover:brightness-95">
                💬 إرسال عبر واتساب
              </button>
              <button onClick={() => setShareOpen(false)} className="rounded-xl bg-slate-100 py-2 font-bold text-slate-600">
                إغلاق
              </button>
            </div>
            <p className="mt-3 rounded-xl bg-amber-50 p-2 text-xs leading-relaxed text-amber-700">
              ⚠️ هذا الرابط للطلاب فقط. رابط لوحة المعلم (/teacher) يبقى سريًا ويحتاج كلمة المرور.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function Mark({ ok }: { ok: boolean }) {
  return <span className={ok ? "text-emerald-600" : "text-rose-600"}>{ok ? "✅" : "❌"}</span>;
}

function DetailModal({
  sub,
  token,
  onClose,
  onSaved,
  onDeleted,
}: {
  sub: Sub;
  token: string;
  onClose: () => void;
  onSaved: (s: Sub) => void;
  onDeleted: (id: string) => void;
}) {
  const a: Answers = sanitize(sub.answers);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    // توزيع الدرجة المحفوظة على الأسئلة (تقريبي)
    const init: Record<string, number> = {};
    let rem = sub.manualScore ?? 0;
    for (const mq of MANUAL_QUESTIONS) {
      const v = Math.min(mq.points, rem);
      init[mq.id] = sub.manualScore === null ? 0 : v;
      rem -= v;
    }
    return init;
  });
  const [feedback, setFeedback] = useState(sub.feedback);
  const [saving, setSaving] = useState(false);
  const manual = Object.values(scores).reduce((x, y) => x + y, 0);

  async function save() {
    setSaving(true);
    const res = await teacherCall({ token, action: "update", id: sub.id, manualScore: manual, feedback });
    setSaving(false);
    if (res.ok) onSaved((await res.json()).submission);
    else alert("تعذر الحفظ");
  }

  async function remove() {
    if (!confirm(`حذف إجابة ${sub.studentName}؟`)) return;
    const res = await teacherCall({ token, action: "delete", id: sub.id });
    if (res.ok) onDeleted(sub.id);
  }

  const row = "rounded-xl bg-slate-50 p-3";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className="animate-pop my-6 w-full max-w-3xl rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between rounded-t-3xl bg-teal-brand p-5 text-white">
          <div>
            <h2 className="text-2xl font-extrabold">{sub.studentName}</h2>
            <p className="text-sm text-teal-soft">
              {sub.studentClass && `فصل ${sub.studentClass} • `}
              {fmtDate(sub.createdAt)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold">
              {toAr(sub.autoScore + manual)} / {toAr(sub.autoTotal + sub.manualTotal)}
            </p>
            <button onClick={onClose} className="text-sm underline">
              إغلاق ✕
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5 text-base">
          <div className={row}>
            <p className="mb-2 font-bold text-teal-dark">١) أكمل الفراغات (معنى إقام الصلاة)</p>
            <div className="flex flex-wrap gap-2">
              {Q1_KEY.map((k, i) => (
                <span key={i} className={`rounded-lg px-3 py-1 ${a.q1[i] === k ? "bg-emerald-100" : "bg-rose-100"}`}>
                  <Mark ok={a.q1[i] === k} /> {a.q1[i] ?? "—"} {a.q1[i] !== k && <span className="text-xs text-emerald-700">({k})</span>}
                </span>
              ))}
            </div>
          </div>

          {(["q2", "q3", "q4", "q5", "q9"] as const).map((id) => (
            <div key={id} className={row}>
              <p className="font-bold text-teal-dark">{MCQS[id].prompt}</p>
              <p className="mt-1">
                <Mark ok={a[id] === MCQS[id].answer} /> إجابة الطالب: <b>{a[id] ?? "لم يُجب"}</b>
                {a[id] !== MCQS[id].answer && <span className="mr-2 text-sm text-emerald-700">(الصواب: {MCQS[id].answer})</span>}
              </p>
            </div>
          ))}

          <div className={row}>
            <p className="mb-2 font-bold text-teal-dark">صح أم خطأ</p>
            <ul className="space-y-1">
              {Q6_STATEMENTS.map((s, i) => (
                <li key={i}>
                  <Mark ok={a.q6[i] === s.answer} /> {s.text} — <b>{a.q6[i] === null ? "لم يُجب" : a.q6[i] ? "صح" : "خطأ"}</b>
                </li>
              ))}
            </ul>
          </div>

          <div className={row}>
            <p className="mb-2 font-bold text-teal-dark">نشاط ١ (اختيار): ثمرات المحافظة على الصلاة</p>
            <div className="flex flex-wrap gap-2">
              {Q7_OPTIONS.map((o) => {
                const sel = a.q7a.includes(o.text);
                return (
                  <span key={o.text} className={`rounded-lg px-3 py-1 ${sel === o.correct ? "bg-emerald-100" : "bg-rose-100"}`}>
                    {sel ? "☑" : "☐"} {o.text}
                  </span>
                );
              })}
            </div>
          </div>

          <div className={row}>
            <p className="mb-2 font-bold text-teal-dark">نشاط ٢: جدول الصلوات</p>
            <div className="flex flex-wrap gap-2">
              {a.q8.map((c, i) => {
                const p = PRAYERS.find((x) => x.name === c.name);
                const ok = !!p && c.rakaat === p.rakaat;
                return (
                  <span key={i} className={`rounded-lg px-3 py-1 ${ok ? "bg-emerald-100" : "bg-rose-100"}`}>
                    {c.name || "—"}: {c.rakaat ? toAr(c.rakaat) : "—"}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-amber-300 bg-cream p-4">
            <p className="mb-3 text-lg font-extrabold text-brown">📝 الأسئلة الكتابية — تصحيح المعلم</p>
            {MANUAL_QUESTIONS.map((mq) => (
              <div key={mq.id} className="mb-4">
                <p className="font-bold">{mq.label}</p>
                <p className="mt-1 min-h-12 whitespace-pre-wrap rounded-xl bg-white p-3 text-lg">{a[mq.id] || <span className="text-slate-400">لم يكتب الطالب إجابة</span>}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">الدرجة:</span>
                  {Array.from({ length: mq.points + 1 }).map((_, n) => (
                    <button
                      key={n}
                      onClick={() => setScores((s) => ({ ...s, [mq.id]: n }))}
                      className={`h-9 w-9 rounded-full border-2 font-bold ${scores[mq.id] === n ? "border-brown bg-brown text-white" : "border-slate-300 bg-white"}`}
                    >
                      {toAr(n)}
                    </button>
                  ))}
                  <span className="text-sm text-slate-500">من {toAr(mq.points)}</span>
                </div>
              </div>
            ))}
            {MANUAL_QUESTIONS.some((m) => m.id === "q10") && (
              <p className="mb-3 rounded-lg bg-white/70 p-2 text-sm text-slate-600">
                💡 الإجابة النموذجية: أداء الصلوات الخمس المفروضة في الأوقات المحددة، بالصفة التي بينها النبي ﷺ تقربًا إلى الله.
              </p>
            )}
            <label className="block">
              <span className="font-bold">💬 ملاحظة للطالب:</span>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="أحسنت يا بطل! بارك الله فيك..."
                className="mt-1 w-full rounded-xl border-2 border-amber-200 bg-white p-3 outline-none focus:border-brown"
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["ممتاز! بارك الله فيك 🌟", "أحسنت، واصل تميزك 👏", "راجع معنى إقام الصلاة مرة أخرى 📖", "حافظ على صلاتك في وقتها 🕌"].map((t) => (
                <button key={t} onClick={() => setFeedback(t)} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm hover:bg-amber-100">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-5">
          <button onClick={remove} className="rounded-full px-4 py-2 font-bold text-rose-600 hover:bg-rose-50">
            🗑️ حذف
          </button>
          <div className="flex gap-2">
            <a href={`/result/${sub.id}`} target="_blank" className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-700">
              صفحة نتيجة الطالب
            </a>
            <button onClick={save} disabled={saving} className="rounded-full bg-teal-brand px-6 py-2 font-bold text-white hover:bg-teal-dark disabled:opacity-60">
              {saving ? "جارٍ الحفظ..." : "💾 حفظ التصحيح"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
