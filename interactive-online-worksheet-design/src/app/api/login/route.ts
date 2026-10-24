import { acceptedPasswords, normalizePassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// تحقق كلمة مرور المعلم — لا يكشف أي تلميح عن كلمة المرور
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const given = typeof body.password === "string" ? body.password : "";
  const ok = acceptedPasswords().includes(normalizePassword(given));
  return Response.json({ ok }, { status: ok ? 200 : 401 });
}
