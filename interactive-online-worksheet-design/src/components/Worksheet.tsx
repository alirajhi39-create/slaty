"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  type Answers,
  emptyAnswers,
  MCQS,
  type MCQ,
  PRAYERS,
  Q1_BANK,
  Q1_KEY,
  Q1_PARTS,
  sameWord,
  Q6_STATEMENTS,
  Q7_OPTIONS,
  grade,
  AUTO_TOTAL,
} from "@/lib/worksheet";

const DRAFT_KEY = "salah-worksheet-draft-v1";
const toAr = (n: number) => n.toLocaleString("ar-EG");

type Result = { id: string; score: number; total: number };

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-SA";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function SpeakBtn({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      title="استمع للسؤال"
      className="no-print inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-soft text-base hover:bg-teal-brand hover:text-white transition"
    >
      🔊
    </button>
  );
}

function Card({
  num,
  title,
  badge,
  children,
  tone = "teal",
  points,
}: {
  num: number;
  title: string;
  badge?: string;
  children: ReactNode;
  tone?: "teal" | "brown";
  points?: string;
}) {
  const head = tone === "teal" ? "bg-teal-brand" : "bg-brown";
  return (
    <section className="relative mt-10">
      <div className="flex items-end gap-2">
        <div className={`${head} flex items-center gap-3 rounded-t-2xl px-5 py-2 text-white shadow`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-lg font-extrabold">
            {toAr(num)}
          </span>
          <span className="text-lg font-bold">{badge ?? "سؤال"}</span>
        </div>
        {points && <span className="mb-1 rounded-full bg-white px-3 py-0.5 text-xs font-bold text-brown shadow-sm">{points}</span>}
      </div>
      <div className={`rounded-2xl rounded-tr-none border-2 ${tone === "teal" ? "border-teal-brand/40" : "border-brown/40"} bg-white p-5 shadow-md sm:p-6`}>
        <div className="mb-4 flex items-start gap-2">
          <span className="text-2xl">✏️</span>
          <h3 className="flex-1 text-lg font-bold leading-relaxed sm:text-xl">{title}</h3>
          <SpeakBtn text={title} />
        </div>
        {children}
      </div>
    </section>
  );
}

function MCQBlock({
  q,
  value,
  onChange,
  locked,
}: {
  q: MCQ;
  value: string | null;
  onChange: (v: string) => void;
  locked: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {q.options.map((opt, i) => {
        const selected = value === opt;
        const isCorrect = sameWord(opt, q.answer);
        let cls = "border-slate-200 bg-slate-50 hover:border-teal-brand hover:bg-teal-soft";
        if (selected && !locked) cls = "border-teal-brand bg-teal-soft ring-2 ring-teal-brand/40";
        if (locked) {
          if (isCorrect) cls = "border-emerald-500 bg-emerald-50";
          else if (selected) cls = "border-rose-400 bg-rose-50 line-through decoration-rose-400";
          else cls = "border-slate-200 bg-slate-50 opacity-60";
        }
        return (
          <button
            key={opt}
            type="button"
            disabled={locked}
            onClick={() => onChange(opt)}
            className={`flex items-center gap-3 rounded-xl border-2 p-3 text-right text-lg transition ${cls} ${opt.startsWith("﴿") ? "quran text-xl" : ""}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold ${
                selected ? "bg-teal-brand text-white" : "bg-white text-teal-dark border border-teal-brand/40"
              }`}
            >
              {["أ", "ب", "ج", "د"][i]}
            </span>
            <span className="flex-1">{opt}</span>
            {locked && isCorrect && <span>✅</span>}
            {locked && selected && !isCorrect && <span>❌</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function Worksheet() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showLesson, setShowLesson] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // استعادة المسودة
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.answers) {
          const merged: Answers = { ...emptyAnswers(), ...d.answers };
          // توحيد رسم الكلمات المحفوظة في مسودة قديمة مع الرسم الحالي
          if (Array.isArray(merged.q1)) merged.q1 = merged.q1.map((v) => (v && sameWord(v, "النبيُّ") ? "النبيُّ" : v));
          if (Array.isArray(merged.q7a)) merged.q7a = merged.q7a.map((v) => (Q7_OPTIONS.find((o) => sameWord(o.text, v))?.text ?? v));
          setAnswers(merged);
        }
        if (d.studentName) setStudentName(d.studentName);
        if (d.studentClass) setStudentClass(d.studentClass);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || result) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, studentName, studentClass }));
  }, [answers, studentName, studentClass, loaded, result]);

  const locked = result !== null;
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setAnswers((a) => ({ ...a, [k]: v }));

  const progress = useMemo(() => {
    const checks = [
      answers.q1.every(Boolean),
      !!answers.q2,
      !!answers.q3,
      !!answers.q4,
      answers.q6.every((v) => v !== null),
      answers.q7a.length > 0,
      answers.q8.every((c) => c.name && c.rakaat),
    ];
    return { done: checks.filter(Boolean).length, total: checks.length };
  }, [answers]);

  const graded = useMemo(() => (locked ? grade(answers) : null), [locked, answers]);
  const scoreOf = (key: string) => graded?.results.find((r) => r.key === key);
  // الدرجات القصوى لكل سؤال تُؤخذ من دالة التصحيح نفسها حتى تبقى متطابقة دائمًا
  const baseTotals = useMemo(() => grade(emptyAnswers()).results, []);
  const totalOf = (key: string) => baseTotals.find((r) => r.key === key)?.total ?? 0;
  const pointsLabel = (key: string) =>
    locked ? `${toAr(scoreOf(key)?.score ?? 0)} / ${toAr(totalOf(key))}` : `${toAr(totalOf(key))} ${totalOf(key) > 1 ? "درجات" : "درجة"}`;

  // تعبئة الفراغات
  const fillBlank = (word: string) => {
    if (locked) return;
    const idx = answers.q1.findIndex((x) => !x);
    if (idx === -1) return;
    const next = [...answers.q1];
    next[idx] = word;
    set("q1", next);
  };
  const clearBlank = (i: number) => {
    if (locked) return;
    const next = [...answers.q1];
    next[i] = null;
    set("q1", next);
  };

  async function submit() {
    setError("");
    if (!studentName.trim()) {
      setError("من فضلك اكتب اسمك في أعلى الورقة قبل الإرسال ✍️");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (progress.done < progress.total) {
      const ok = window.confirm(`لم تُجِب عن كل الأسئلة (${toAr(progress.done)} من ${toAr(progress.total)}). هل تريد الإرسال الآن؟`);
      if (!ok) return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, studentClass, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult({ id: data.id, score: data.score, total: data.total });
      setShowModal(true);
      localStorage.removeItem(DRAFT_KEY);
      const ids: string[] = JSON.parse(localStorage.getItem("salah-my-submissions") || "[]");
      localStorage.setItem("salah-my-submissions", JSON.stringify([data.id, ...ids].slice(0, 10)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر الإرسال، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  const pct = result ? result.score / result.total : 0;
  const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
  const usedWords = answers.q1.filter(Boolean) as string[];

  return (
    <div className="islamic-bg min-h-screen pb-32">
      {/* الشريط الجانبي الزخرفي */}
      <div className="side-border fixed inset-y-0 right-0 hidden w-5 md:block" />
      <div className="side-border fixed inset-y-0 left-0 hidden w-5 md:block" />

      <div className="mx-auto max-w-3xl px-4 pt-6">
        {/* الترويسة */}
        <header className="overflow-hidden rounded-3xl bg-white shadow-lg">
          <div className="flex items-stretch">
            <div className="flex w-20 items-center justify-center bg-teal-dark text-5xl font-extrabold text-white sm:w-24">٥</div>
            <div className="flex-1 bg-teal-brand px-5 py-4 text-white">
              <p className="text-sm font-bold text-amber-100">الدَّرْسُ الخامِسُ</p>
              <h1 className="text-3xl font-extrabold sm:text-4xl">إقامُ الصَّلاةِ</h1>
            </div>
            <div className="hidden items-center bg-teal-brand pl-5 text-6xl sm:flex">🕌</div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 bg-cream px-5 py-3 text-sm text-brown-dark">
            <span>📘 ورقة عمل تفاعلية — الدراسات الإسلامية</span>
            <span>🎒 الصف الثالث الابتدائي</span>
            <span>
              ⭐ الدرجة: {toAr(AUTO_TOTAL)}
            </span>
          </div>

          {/* بيانات الطالب */}
          <div className="grid gap-3 p-5 sm:grid-cols-[2fr_1fr]">
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-teal-dark">👦 اسم الطالب / الطالبة</span>
              <input
                value={studentName}
                disabled={locked}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="اكتب اسمك الثلاثي هنا"
                className="w-full rounded-xl border-2 border-teal-brand/30 bg-teal-soft/40 px-4 py-3 text-lg outline-none focus:border-teal-brand"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-teal-dark">🏫 الفصل</span>
              <select
                value={studentClass}
                disabled={locked}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full rounded-xl border-2 border-teal-brand/30 bg-teal-soft/40 px-4 py-3 text-lg outline-none focus:border-teal-brand"
              >
                <option value="">اختر الفصل</option>
                {["٣/١", "٣/٢"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {error && (
          <div className="animate-shake mt-4 rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-center font-bold text-rose-700">{error}</div>
        )}

        {/* ملخص الدرس */}
        <section className="mt-8 rounded-3xl border-2 border-amber-200 bg-cream p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setShowLesson((s) => !s)}
            className="flex w-full items-center justify-between text-right"
          >
            <span className="text-xl font-extrabold text-brown">📖 تَذَكَّرْ قَبْلَ أَنْ تَبْدَأَ</span>
            <span className="text-brown">{showLesson ? "▲ إخفاء" : "▼ عرض"}</span>
          </button>
          {showLesson && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border-2 border-amber-300 bg-white p-4">
                <p className="font-bold text-rose-700">مَعْنى إقامِ الصَّلاةِ:</p>
                <p className="mt-1 text-lg leading-loose">
                  أداءُ الصَّلواتِ الخَمْسِ المَفْروضَةِ في الأوقاتِ المُحَدَّدَةِ، بالصِّفَةِ الَّتي بَيَّنَها النَّبِيُّ ﷺ تَقَرُّبًا إلى اللهِ.
                </p>
              </div>
              <p className="text-lg">
                <span className="font-bold text-rose-700">دَليلُ وُجوبِ الصَّلاةِ: </span>
                قَوْلُ اللهِ تَعالى: <span className="quran text-2xl text-emerald-700">﴿وَأَقِيمُوا الصَّلَاةَ﴾</span>
              </p>
              <div className="rounded-2xl bg-teal-soft p-4">
                <p className="font-bold text-rose-700">فَضْلُ الصَّلاةِ:</p>
                <p className="mt-1 text-lg leading-loose">
                  قالَ رَسولُ اللهِ ﷺ: <span className="text-teal-dark font-bold">«وَالصَّلاةُ نورٌ»</span>، وقالَ ﷺ:{" "}
                  <span className="text-teal-dark font-bold">
                    «مَثَلُ الصَّلَواتِ الخَمْسِ كَمَثَلِ نَهْرٍ جارٍ، غَمْرٍ على بابِ أَحَدِكُمْ، يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرّاتٍ»
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-brown px-4 py-3 text-white">
                <span className="text-3xl">💡</span>
                <p className="font-bold leading-relaxed">الصَّلاةُ عِبادَةٌ يَجِبُ فيها الإخْلاصُ للهِ تَعالى وَحْدَهُ لا شَريكَ لَهُ، والمُتابَعَةُ لِسُنَّةِ النَّبِيِّ ﷺ.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-gold/90 px-4 py-3 text-white">
                <span className="rounded-lg bg-white/25 px-2 py-1 text-sm font-bold">إضاءة</span>
                <p className="font-bold">أنا أُحافِظُ على أداءِ الصَّلاةِ في وَقْتِها.</p>
              </div>
            </div>
          )}
        </section>

        {/* س١: أكمل الفراغات */}
        <Card num={1} title="أَكْمِلِ الفَراغاتِ بالكَلِمَةِ المُناسِبَةِ لِتُكْمِلَ مَعْنى إقامِ الصَّلاةِ:" points={pointsLabel("q1")}>
          <p className="mb-3 text-sm text-slate-500">👆 اضغط على الكلمة لتضعها في الفراغ، واضغط على الفراغ لتمسحه.</p>
          <div className="mb-5 flex flex-wrap justify-center gap-3 rounded-2xl bg-amber-50 p-4">
            {Q1_BANK.map((w) => {
              const used = usedWords.includes(w);
              return (
                <button
                  key={w}
                  type="button"
                  disabled={used || locked}
                  onClick={() => fillBlank(w)}
                  className={`rounded-full border-2 px-5 py-2 text-lg font-bold transition ${
                    used ? "border-slate-200 bg-slate-100 text-slate-300" : "border-brown bg-white text-brown hover:bg-brown hover:text-white shadow-sm"
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>
          <p className="text-xl leading-[3.2rem]">
            {Q1_PARTS.map((part, i) => (
              <span key={i}>
                {part}{" "}
                {i < Q1_KEY.length && (
                  <>
                    <button
                      type="button"
                      onClick={() => clearBlank(i)}
                      className={`mx-1 inline-block min-w-28 rounded-lg border-b-4 px-3 py-0.5 text-center font-bold transition ${
                        locked
                          ? sameWord(answers.q1[i], Q1_KEY[i])
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-rose-400 bg-rose-50 text-rose-700"
                          : answers.q1[i]
                            ? "animate-pop border-teal-brand bg-teal-soft text-teal-dark"
                            : "border-dashed border-slate-300 bg-slate-50 text-slate-300"
                      }`}
                    >
                      {answers.q1[i] ?? "......"}
                    </button>
                    {locked && !sameWord(answers.q1[i], Q1_KEY[i]) && (
                      <span className="text-base text-emerald-700">({Q1_KEY[i]})</span>
                    )}{" "}
                  </>
                )}
              </span>
            ))}
          </p>
        </Card>

        {/* أسئلة الاختيار */}
        {(["q2", "q3", "q4"] as const).map((id, idx) => (
          <Card
            key={id}
            num={idx + 2}
            badge={MCQS[id].title}
            title={MCQS[id].prompt}
            points={pointsLabel(id)}
          >
            {id === "q4" && (
              <p className="mb-4 rounded-xl bg-teal-soft p-3 text-lg leading-loose text-teal-dark">
                قالَ ﷺ: «مَثَلُ الصَّلَواتِ الخَمْسِ كَمَثَلِ نَهْرٍ جارٍ، غَمْرٍ على بابِ أَحَدِكُمْ، يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرّاتٍ» 🏞️
              </p>
            )}
            <MCQBlock q={MCQS[id]} value={answers[id]} onChange={(v) => set(id, v)} locked={locked} />
          </Card>
        ))}

        {/* صح أو خطأ */}
        <Card num={6} badge="صح أم خطأ" title="ضَعْ ✔ أمامَ العِبارَةِ الصَّحيحَةِ و ✘ أمامَ العِبارَةِ الخاطِئَةِ:" points={pointsLabel("q6")}>
          <div className="space-y-3">
            {Q6_STATEMENTS.map((s, i) => {
              const v = answers.q6[i];
              const right = locked && v === s.answer;
              const wrong = locked && v !== s.answer;
              return (
                <div
                  key={i}
                  className={`flex flex-col gap-3 rounded-xl border-2 p-3 sm:flex-row sm:items-center ${
                    right ? "border-emerald-400 bg-emerald-50" : wrong ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <span className="flex-1 text-lg">
                    <span className="ml-2 font-bold text-teal-dark">{toAr(i + 1)}.</span>
                    {s.text}
                    {wrong && <span className="mr-2 text-sm font-bold text-emerald-700">(الصواب: {s.answer ? "صح ✔" : "خطأ ✘"})</span>}
                  </span>
                  <div className="flex gap-2">
                    {[true, false].map((b) => (
                      <button
                        key={String(b)}
                        type="button"
                        disabled={locked}
                        onClick={() => {
                          const n = [...answers.q6];
                          n[i] = b;
                          set("q6", n);
                        }}
                        className={`h-12 w-16 rounded-xl border-2 text-2xl font-bold transition ${
                          v === b
                            ? b
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-rose-500 bg-rose-500 text-white"
                            : "border-slate-300 bg-white hover:border-teal-brand"
                        }`}
                      >
                        {b ? "✔" : "✘"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* نشاط ١ */}
        <Card
          num={1}
          badge="نشاط"
          title="الصَّلاةُ رُكْنٌ عَظيمٌ مِنْ أَرْكانِ الإسْلامِ فَرَضَها اللهُ على جَميعِ المُسْلِمينَ. فَعَلى ماذا نَحْصُلُ إذا حافَظْنا على الصَّلاةِ في وَقْتِها؟"
          points={pointsLabel("q7a")}
        >
          <p className="mb-3 font-bold text-brown">اخْتَرْ كُلَّ الإجاباتِ الصَّحيحَةِ (ثلاث إجابات):</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {Q7_OPTIONS.map((o) => {
              const sel = answers.q7a.some((x) => sameWord(x, o.text));
              let cls = sel ? "border-teal-brand bg-teal-soft" : "border-slate-200 bg-slate-50 hover:border-teal-brand";
              if (locked) cls = o.correct ? "border-emerald-500 bg-emerald-50" : sel ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-slate-50 opacity-60";
              return (
                <button
                  key={o.text}
                  type="button"
                  disabled={locked}
                  onClick={() => set("q7a", sel ? answers.q7a.filter((x) => !sameWord(x, o.text)) : [...answers.q7a, o.text])}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-right text-lg transition ${cls}`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md border-2 text-sm ${
                      sel ? "border-teal-brand bg-teal-brand text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {sel ? "✓" : ""}
                  </span>
                  <span className="text-2xl">{o.icon}</span>
                  <span className="flex-1">{o.text}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* نشاط ٢ */}
        <Card
          num={2}
          badge="نشاط"
          title="أَكْمِلِ الجَدْوَلَ بِأَسْماءِ الصَّلَواتِ المَفْروضَةِ، وعَدَدِ رَكَعاتِ كُلِّ صَلاةٍ:"
          points={pointsLabel("q8")}
        >
          <p className="mb-3 text-sm text-slate-500">👆 اختر اسم الصلاة من القائمة، ثم اضغط على عدد ركعاتها.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-1">
              <tbody>
                <tr>
                  <th className="w-32 rounded-lg bg-amber-50 p-2 text-rose-700">الصَّلاةُ المَفْروضَةُ</th>
                  {answers.q8.map((cell, i) => {
                    const p = PRAYERS.find((x) => x.name === cell.name);
                    const dup = answers.q8.findIndex((c) => c.name === cell.name) !== i;
                    const ok = locked && p && !dup;
                    return (
                      <td key={i} className={`rounded-lg border-2 p-1.5 ${locked ? (ok ? "border-emerald-400 bg-emerald-50" : "border-rose-300 bg-rose-50") : "border-teal-brand/30 bg-white"}`}>
                        <div className="text-center text-2xl">{p?.icon ?? "🕋"}</div>
                        <select
                          value={cell.name}
                          disabled={locked}
                          onChange={(e) => {
                            const n = answers.q8.map((c, j) => (j === i ? { ...c, name: e.target.value } : c));
                            set("q8", n);
                          }}
                          className="mt-1 w-full rounded-md bg-teal-soft/60 px-1 py-1.5 text-center font-bold outline-none"
                        >
                          <option value="">اختر</option>
                          {PRAYERS.map((pr) => (
                            <option key={pr.name} value={pr.name}>
                              {pr.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <th className="rounded-lg bg-amber-50 p-2 text-rose-700">عَدَدُ رَكَعاتِها</th>
                  {answers.q8.map((cell, i) => {
                    const p = PRAYERS.find((x) => x.name === cell.name);
                    const ok = locked && p && cell.rakaat === p.rakaat;
                    return (
                      <td key={i} className={`rounded-lg border-2 p-1.5 ${locked ? (ok ? "border-emerald-400 bg-emerald-50" : "border-rose-300 bg-rose-50") : "border-teal-brand/30 bg-white"}`}>
                        <div className="flex justify-center gap-1">
                          {[2, 3, 4].map((n) => (
                            <button
                              key={n}
                              type="button"
                              disabled={locked}
                              onClick={() => set("q8", answers.q8.map((c, j) => (j === i ? { ...c, rakaat: n } : c)))}
                              className={`h-9 w-9 rounded-full border-2 font-bold transition ${
                                cell.rakaat === n ? "border-brown bg-brown text-white" : "border-slate-200 bg-white hover:border-brown"
                              }`}
                            >
                              {toAr(n)}
                            </button>
                          ))}
                        </div>
                        {locked && p && cell.rakaat !== p.rakaat && (
                          <p className="mt-1 text-center text-xs font-bold text-emerald-700">الصواب: {toAr(p.rakaat)}</p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* زر الإرسال */}
        <div className="no-print mt-12 text-center">
          {!locked ? (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="rounded-full bg-gradient-to-l from-teal-brand to-teal-dark px-12 py-4 text-2xl font-extrabold text-white shadow-xl transition hover:scale-105 disabled:opacity-60"
            >
              {submitting ? "⏳ جارٍ الإرسال..." : "📨 أَرْسِلْ إجاباتي لِلْمُعَلِّمِ"}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-lg font-bold text-emerald-700">✅ تم إرسال إجاباتك إلى المعلم بنجاح!</p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href={`/result/${result.id}`} className="rounded-full bg-teal-brand px-6 py-3 font-bold text-white shadow">
                  📄 صفحة نتيجتي وملاحظات المعلم
                </a>
                <button type="button" onClick={() => window.print()} className="rounded-full bg-white px-6 py-3 font-bold text-teal-dark shadow">
                  🖨️ طباعة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* شريط التقدم */}
      {!locked && (
        <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-teal-brand/20 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <span className="text-sm font-bold text-teal-dark whitespace-nowrap">
              أجبتَ عن {toAr(progress.done)} من {toAr(progress.total)}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-l from-teal-brand to-emerald-400 transition-all duration-500"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
            <span className="text-xl">{progress.done === progress.total ? "🌟" : "📝"}</span>
          </div>
        </div>
      )}

      {/* نافذة النتيجة */}
      {showModal && result && (
        <>
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="confetti"
              style={{
                left: `${(i * 37) % 100}%`,
                background: ["#2ba9a0", "#b8692b", "#f5c542", "#e05a8a", "#5aa0e0"][i % 5],
                animationDuration: `${2 + ((i * 13) % 20) / 10}s`,
                animationDelay: `${((i * 7) % 10) / 10}s`,
                borderRadius: i % 2 ? "50%" : "2px",
              }}
            />
          ))}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="animate-pop w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
              <div className="text-5xl tracking-widest">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={s <= stars ? "" : "opacity-20 grayscale"}>
                    ⭐
                  </span>
                ))}
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-teal-dark">
                {stars === 3 ? "ممتاز! بارك الله فيك 🌟" : stars === 2 ? "أحسنت! واصل التقدم 👏" : "محاولة جيدة! راجع الدرس 💪"}
              </h2>
              <p className="mt-2 text-slate-600">{studentName}</p>
              <div className="mx-auto mt-5 w-fit rounded-2xl bg-teal-soft px-8 py-4">
                <p className="text-sm text-teal-dark">درجتك في ورقة العمل</p>
                <p className="text-4xl font-extrabold text-teal-dark">
                  {toAr(result.score)} <span className="text-xl text-slate-400">/ {toAr(result.total)}</span>
                </p>
              </div>
              <p className="mt-4 text-sm text-slate-500">📨 وصلت إجاباتك إلى المعلم بنجاح.</p>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-6 rounded-full bg-teal-brand px-8 py-3 text-lg font-bold text-white shadow hover:bg-teal-dark"
              >
                شاهد التصحيح 👀
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
