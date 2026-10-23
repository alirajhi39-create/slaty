import { createHmac } from "node:crypto";

// توحيد صيغة كلمة المرور: إزالة المسافات وتحويل الأرقام العربية (١٢٣٤) إلى (1234)
export function normalizePassword(value: string) {
  return value
    .trim()
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

// كلمات المرور المقبولة: المتغيّر TEACHER_PASSWORD أو أي متغيّر بيئة إضافي خصصه المعلم
export function acceptedPasswords(): string[] {
  const list = [
    process.env.TEACHER_PASSWORD,
    process.env.ali_rajhi,
    process.env.ALI_RAJHI,
    "1234", // كلمة مرور افتراضية مقبولة دائمًا حتى لا يُمنع المعلم عن لوحته
  ];
  return Array.from(
    new Set(
      list
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        .map((v) => normalizePassword(v.replace(/^"(.*)"$/, "$1"))),
    ),
  );
}

// ترويسات HTTP لا تنقل الحروف العربية مباشرة، لذا يرسلها المتصفح مُرمَّزة
function decodeHeader(raw: string) {
  const candidates = new Set<string>([raw]);
  try {
    candidates.add(decodeURIComponent(raw));
  } catch {}
  try {
    candidates.add(Buffer.from(raw, "latin1").toString("utf8"));
  } catch {}
  return Array.from(candidates);
}

export function isTeacher(req: Request) {
  const given = req.headers.get("x-teacher-password");
  if (!given) return false;
  const accepted = acceptedPasswords();
  return decodeHeader(given).some((v) => accepted.includes(normalizePassword(v)));
}

// ===== رمز الجلسة الموقَّع: يُصدر بعد نجاح كلمة المرور ويُرسل في جسم الطلب (وليس في ترويسة) =====
export function tokenFor(password: string) {
  const secret = process.env.DATABASE_URL || "salah-worksheet";
  return createHmac("sha256", secret).update("teacher:" + normalizePassword(password)).digest("hex");
}

// يعيد الرمز الصالح إن نجح التحقق (بكلمة المرور أو بالرمز المحفوظ)، وإلا null
export function verifyCredentials(body: { password?: unknown; token?: unknown }): string | null {
  const accepted = acceptedPasswords();
  if (typeof body.password === "string") {
    const pw = normalizePassword(body.password.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff\u200b]/g, ""));
    if (accepted.includes(pw)) return tokenFor(pw);
  }
  if (typeof body.token === "string") {
    const valid = accepted.map(tokenFor);
    if (valid.includes(body.token)) return body.token;
  }
  return null;
}
