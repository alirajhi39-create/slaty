// بيانات ورقة العمل: درس إقام الصلاة - الصف الثالث الابتدائي

export type Answers = {
  q1: (string | null)[]; // تعبئة الفراغات (معنى إقام الصلاة)
  q2: string | null; // دليل وجوب الصلاة
  q3: string | null; // الصلاة نور
  q4: string | null; // تشبيه الصلوات بالنهر
  q5: string | null; // معنى غَمْر
  q6: (boolean | null)[]; // صح أو خطأ
  q7a: string[]; // نشاط 1 - اختيار متعدد
  q8: { name: string; rakaat: number | null }[]; // نشاط 2 - الجدول
  q9: string | null; // الركن الثاني
  q10: string; // معنى إقام الصلاة (كتابي)
};

export const Q1_PARTS = [
  "أداءُ الصَّلواتِ",
  "المَفْروضَةِ في الأوقاتِ",
  "، بالصِّفَةِ الَّتي بَيَّنَها",
  "ﷺ تَقَرُّبًا إلى",
  ".",
];
export const Q1_KEY = ["الخَمْسِ", "المُحَدَّدَةِ", "النَّبِيُّ", "اللهِ"];
export const Q1_BANK = ["اللهِ", "الخَمْسِ", "النَّبِيُّ", "المُحَدَّدَةِ"];

export type MCQ = { id: "q2" | "q3" | "q4" | "q5" | "q9"; title: string; prompt: string; options: string[]; answer: string };

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
  q5: {
    id: "q5",
    title: "مَعاني الكَلِماتِ",
    prompt: "مَعْنى كَلِمَةِ (غَمْرٍ) في الحَديثِ:",
    options: ["القَليلُ", "الكَثيرُ", "البَعيدُ"],
    answer: "الكَثيرُ",
  },
  q9: {
    id: "q9",
    title: "التَّقويم",
    prompt: "ما الرُّكْنُ الثّاني مِنْ أَرْكانِ الإسْلامِ؟",
    options: ["الشَّهادَتانِ", "الصَّلاةُ", "الزَّكاةُ", "صَوْمُ رَمَضانَ"],
    answer: "الصَّلاةُ",
  },
};

export const Q6_STATEMENTS: { text: string; answer: boolean }[] = [
  { text: "الصَّلاةُ عِبادَةٌ يَجِبُ فيها الإخْلاصُ للهِ تَعالى وَحْدَهُ لا شَريكَ لَهُ.", answer: true },
  { text: "نُصَلّي كَما كانَ النَّبِيُّ ﷺ يُصَلّي.", answer: true },
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

export const MANUAL_QUESTIONS = [
  { id: "q10" as const, label: "التقويم: ما مَعْنى إقامِ الصَّلاةِ؟", points: 3 },
];
// درجة نشاط ١ (اختيار متعدد فقط بعد حذف الجزء الكتابي)
export const ACTIVITY1_POINTS = 3;
export const MANUAL_TOTAL = MANUAL_QUESTIONS.reduce((s, q) => s + q.points, 0);
// الدرجة الكلية للورقة = ٣٠ (الأسئلة الموضوعية + الكتابية)
export const GRAND_TOTAL = 30;

export function emptyAnswers(): Answers {
  return {
    q1: [null, null, null, null],
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    q6: Q6_STATEMENTS.map(() => null),
    q7a: [],
    q8: PRAYERS.map(() => ({ name: "", rakaat: null })),
    q9: null,
    q10: "",
  };
}

export type QuestionResult = { key: string; label: string; score: number; total: number };

export function sanitize(raw: unknown): Answers {
  const base = emptyAnswers();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 2000) : null);
  if (Array.isArray(r.q1)) base.q1 = base.q1.map((_, i) => str((r.q1 as unknown[])[i]));
  for (const k of ["q2", "q3", "q4", "q5", "q9"] as const) base[k] = str(r[k]);
  if (Array.isArray(r.q6))
    base.q6 = base.q6.map((_, i) => {
      const v = (r.q6 as unknown[])[i];
      return typeof v === "boolean" ? v : null;
    });
  if (Array.isArray(r.q7a)) base.q7a = (r.q7a as unknown[]).filter((v): v is string => typeof v === "string").slice(0, 10);
  base.q10 = str(r.q10) ?? "";
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
    score: Q1_KEY.filter((k, i) => a.q1[i] === k).length,
    total: Q1_KEY.length,
  });

  for (const id of ["q2", "q3", "q4", "q5"] as const) {
    const m = MCQS[id];
    results.push({ key: id, label: m.prompt, score: a[id] === m.answer ? 1 : 0, total: 1 });
  }

  results.push({
    key: "q6",
    label: "صح أو خطأ",
    score: Q6_STATEMENTS.filter((s, i) => a.q6[i] === s.answer).length,
    total: Q6_STATEMENTS.length,
  });

  // نشاط ١: درجة عن كل اختيار صحيح، والاختيار الخاطئ يلغي درجة، بحد أدنى صفر
  const correctPicked = Q7_OPTIONS.filter((o) => o.correct && a.q7a.includes(o.text)).length;
  const wrongPicked = Q7_OPTIONS.filter((o) => !o.correct && a.q7a.includes(o.text)).length;
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

  results.push({ key: "q9", label: MCQS.q9.prompt, score: a.q9 === MCQS.q9.answer ? 1 : 0, total: 1 });

  const score = results.reduce((s, r) => s + r.score, 0);
  const total = results.reduce((s, r) => s + r.total, 0);
  return { results, score, total };
}

export const AUTO_TOTAL = grade(emptyAnswers()).total;
