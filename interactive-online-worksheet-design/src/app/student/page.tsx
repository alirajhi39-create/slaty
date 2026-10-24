import Worksheet from "@/components/Worksheet";

export const metadata = { title: "حل ورقة العمل مباشرة | إقام الصلاة" };

export default function StudentPage() {
  return (
    <>
      <div className="islamic-bg border-b border-teal-brand/20 bg-white/80 px-4 py-2 text-center text-sm font-bold text-teal-dark backdrop-blur">
        🔗 رابط مباشر للطلاب — بدون تسجيل دخول: اكتب اسمك وابدأ الحل ثم أرسل للمعلم ✅
      </div>
      <Worksheet />
    </>
  );
}
