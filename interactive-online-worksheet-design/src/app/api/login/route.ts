import { acceptedPasswords, normalizePassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// تحقق كلمة مرور المعلم — يعيد إشارة واضحة للنجاح أو الرفض مع تلميح لتوجيه العطل
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const given = typeof body.password === "string" ? body.password : "";
  const ok = acceptedPasswords().includes(normalizePassword(given));
  return Response.json({ ok }, { status: ok ? 200 : 401 });
}

// معلومات التشخيص: هل المتغيرات متاحة وقت التشغيل؟ (لا تُظهر القيم)
export async function GET() {
  const list = acceptedPasswords();
  return Response.json({
    configured: {
      TEACHER_PASSWORD: !!process.env.TEACHER_PASSWORD,
      ALI_RAJHI: !!(process.env.ali_rajhi || process.env.ALI_RAJHI),
      default_1234: list.includes("1234"),
    },
    count: list.length,
  });
}
