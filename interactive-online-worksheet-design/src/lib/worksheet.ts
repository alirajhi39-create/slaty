// بيانات ورقة العمل: درس إقام الصلاة - الصف الثالث الابتدائي

export type Answers = {
  q1: (string | null)[]; // تعبئة الفراغات (معنى إقام الصلاة)
  q2: string | null; // دليل وجوب الصلاة
  q3: string | null; // الصلاة نور
  q4: string | null; // تشبيه الصلوات بالنهر
  q6: (boolean | null)[]; // صح أو خطأ
  q7a: string[]; // نشاط 1 - اختيار متعدد
  q8: { name: string; rakaat: number | null }[]; // نشاط 2 - الجدول
};

export const Q1_PARTS = [
  "أداءُ الصَّلواتِ",
  "المَفْروضَةِ في الأوقاتِ",
  "، بالصِّفَةِ الَّتي بَيَّنَها",
  "ﷺ تَقَرُّبًا إلى",
  ".",
];
export const Q1_KEY = ["الخَمْسِ", "المُحَدَّدَةِ", "النبيُّ", "اللهِ"];
export const Q1_BANK = ["اللهِ", "الخَمْسِ", "النبيُّ", "المُحَدَّدَةِ"];

export type MCQ = { id: "q2" | "q3" | "q4"; title: string; prompt: string; options: string[]; answer: string };

export const MCQS: Record<MCQ["id"], MCQ> = {
  q2: {
    id: "q2",
    title: "دليلُ وُجوبِ الصَّلاةِ",
    prompt: "اخْتَرِ الآيةَ الَّتي تَدُلُّ على وُجوبِ الصَّلاةِ:",
    options: ["﴿وَأَقِيمُوا الصَّلَاةَ﴾", "﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾", "﴿وَبِالْوَالِدَيْنِ إِحْسَانًا﴾"],
    answer: "﴿وَأَقِيمُوا الصَّلَاةَ﴾",
  },
  q3: {
    id: "q3",
    title: "فَضْلُ الصَّلاةِ",
    prompt: "أَكْمِلْ قَوْلَ رَسولِ اللهِ ﷺ: «وَالصَّلاةُ ......»",
    options: ["نُورٌ", "ماءٌ", "طَعامٌ"],
    answer: "نُورٌ",
  },
  q4: {
    id: "q4",
    title: "فَضْلُ الصَّلاةِ",
    prompt: "شَبَّهَ النَّبِيُّ ﷺ الصَّلواتِ الخَمْسَ بِـ:",
    options: ["نَهْرٍ جارٍ يَغْتَسِلُ مِنْهُ المُسْلِمُ خَمْسَ مَرَّاتٍ", "شَجَرَةٍ كَبيرَةٍ", "جَبَلٍ عالٍ"],
    answer: "نَهْرٍ جارٍ يَغْتَسِلُ مِنْهُ المُسْلِمُ خَمْسَ مَرَّاتٍ",
  },
};

export const Q6_STATEMENTS: { text: string; answer: boolean }[] = [
  { text: "الصَّلاةُ عِبادَةٌ يَجِبُ فيها الإخْلاصُ للهِ تَعالى وَحْدَهُ لا شَريكَ لَهُ.", answer: true },
  { text: "نُصَلّي كَما كانَ النبيُّ ﷺ يُصَلّي.", answer: true },
  { text: "يَجوزُ تَأْخيرُ الصَّلاةِ عَنْ وَقْتِها بِدونِ عُذْرٍ.", answer: false },
  { text: "الصَّلاةُ رُكْنٌ عَظيمٌ مِنْ أَرْكانِ الإسْلامِ.", answer: true },
  { text: "عَدَدُ الصَّلواتِ المَفْروضَةِ في اليَوْمِ ثَلاثُ صَلَواتٍ.", answer: false },
];

export const Q7_OPTIONS: { text: string; correct: boolean; icon: string }[] = [
  { text: "رِضا اللهِ تَعالى وَدُخولُ الجَنَّةِ", correct: true, icon: "🌿" },
  { text: "مَحْوُ الذُّنوبِ والخَطايا", correct: true, icon: "💧" },
  { text: "نورٌ في القَلْبِ والوَجْهِ", correct: true, icon: "✨" },
  { text: "الكَسَلُ والتَّعَبُ", correct: false, icon: "😴" },
];

export const PRAYERS: { name: string; rakaat: number; icon: string }[] = [
  { name: "الفَجْرُ", rakaat: 2, icon: "🌅" },
  { name: "الظُّهْرُ", rakaat: 4, icon: "☀️" },
  { name: "العَصْرُ", rakaat: 4, icon: "🌤️" },
  { name: "المَغْرِبُ", rakaat: 3, icon: "🌇" },
  { name: "العِشاءُ", rakaat: 4, icon: "🌙" },
];

// درجة نشاط ١ (اختيار متعدد)
export const ACTIVITY1_POINTS = 3;
export const MANUAL_TOTAL = 0;
// الدرجة الكلية للورقة = ٢٠
export const GRAND_TOTAL = 20;

// مقارنة تتجاهل الحركات والتشكيل والمسافات، حتى لا تتأثر الدرجة بشكل رسم الكلمة
const ARABIC_MARKS = /[\u064B-\u0652\u0670\u0640]/g;
export function sameWord(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  const clean = (v: string) =>
    v.replace(ARABIC_MARKS, "").replace(/\s+/g, " ").trim().replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
  return clean(a) === clean(b);
}

export function emptyAnswers(): Answers {
  return {
    q1: [null, null, null, null],
    q2: null,
    q3: null,
    q4: null,
    q6: Q6_STATEMENTS.map(() => null),
    q7a: [],
    q8: PRAYERS.map(() => ({ name: "", rakaat: null })),
  };
}

export type QuestionResult = { key: string; label: string; score: number; total: number };

export function sanitize(raw: unknown): Answers {
  const base = emptyAnswers();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 2000) : null);
  if (Array.isArray(r.q1)) base.q1 = base.q1.map((_, i) => str((r.q1 as unknown[])[i]));
  for (const k of ["q2", "q3", "q4"] as const) base[k] = str(r[k]);
  if (Array.isArray(r.q6))
    base.q6 = base.q6.map((_, i) => {
      const v = (r.q6 as unknown[])[i];
      return typeof v === "boolean" ? v : null;
    });
  if (Array.isArray(r.q7a)) base.q7a = (r.q7a as unknown[]).filter((v): v is string => typeof v === "string").slice(0, 10);
  if (Array.isArray(r.q8))
    base.q8 = base.q8.map((_, i) => {
      const c = (r.q8 as unknown[])[i] as Record<string, unknown> | undefined;
      return {
        name: typeof c?.name === "string" ? c.name : "",
        rakaat: typeof c?.rakaat === "number" ? c.rakaat : null,
      };
    });
  return base;
}

export function grade(a: Answers) {
  const results: QuestionResult[] = [];

  results.push({
    key: "q1",
    label: "معنى إقام الصلاة (أكمل الفراغات)",
    score: Q1_KEY.filter((k, i) => sameWord(a.q1[i], k)).length,
    total: Q1_KEY.length,
  });

  for (const id of ["q2", "q3", "q4"] as const) {
    const m = MCQS[id];
    results.push({ key: id, label: m.prompt, score: sameWord(a[id], m.answer) ? 1 : 0, total: 1 });
  }

  results.push({
    key: "q6",
    label: "صح أو خطأ",
    score: Q6_STATEMENTS.filter((s, i) => a.q6[i] === s.answer).length,
    total: Q6_STATEMENTS.length,
  });

  // نشاط ١: درجة عن كل اختيار صحيح، والاختيار الخاطئ يلغي درجة، بحد أدنى صفر
  const picked = (text: string) => a.q7a.some((x) => sameWord(x, text));
  const correctPicked = Q7_OPTIONS.filter((o) => o.correct && picked(o.text)).length;
  const wrongPicked = Q7_OPTIONS.filter((o) => !o.correct && picked(o.text)).length;
  results.push({
    key: "q7a",
    label: "نشاط ١: ثمرات المحافظة على الصلاة",
    score: Math.max(0, Math.min(ACTIVITY1_POINTS, correctPicked - wrongPicked)),
    total: ACTIVITY1_POINTS,
  });

  // درجة واحدة لكل صلاة يُكتب اسمها وعدد ركعاتها بشكل صحيح
  const seen = new Set<string>();
  let q8 = 0;
  for (const cell of a.q8) {
    const p = PRAYERS.find((x) => x.name === cell.name);
    if (p && !seen.has(p.name)) {
      seen.add(p.name);
      if (cell.rakaat === p.rakaat) q8 += 1;
    }
  }
  results.push({ key: "q8", label: "نشاط ٢: جدول الصلوات وعدد ركعاتها", score: q8, total: PRAYERS.length });


  const score = results.reduce((s, r) => s + r.score, 0);
  const total = results.reduce((s, r) => s + r.total, 0);
  return { results, score, total };
}

export const AUTO_TOTAL = grade(emptyAnswers()).total;
