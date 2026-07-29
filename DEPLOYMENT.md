# دليل نشر منصة جعدي — Render (Backend) + Vercel (Frontend)

المشروع عبارة عن pnpm monorepo:

- **Backend**: `artifacts/api-server` (Express 5 + Drizzle + PostgreSQL/Neon)
- **Frontend**: `artifacts/djadi-academy` (React + Vite)

---

## 1) Backend على Render

أنشئ **Web Service** جديد من مستودع GitHub، بالإعدادات التالية:

| الإعداد | القيمة |
|---|---|
| Root Directory | *(اتركه فارغًا — جذر المستودع)* |
| Build Command | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build` |
| Start Command | `pnpm --filter @workspace/api-server run start` |
| Runtime | Node 20+ |

### متغيرات البيئة على Render

| المفتاح | القيمة |
|---|---|
| `DATABASE_URL` | رابط قاعدة بيانات Neon (نفس الرابط المستخدم حاليًا) |
| `NODE_ENV` | `production` |

> ملاحظة: Render يوفّر `PORT` تلقائيًا — السيرفر يقرأه بالفعل.

### تهيئة جداول قاعدة البيانات (مرة واحدة)

الجداول مُنشأة حاليًا. عند أي تعديل مستقبلي على المخطط، شغّل محليًا:

```bash
DATABASE_URL="<رابط Neon>" pnpm --filter @workspace/db run push
```

---

## 2) Frontend على Vercel

أنشئ مشروعًا جديدًا من نفس المستودع، بالإعدادات التالية:

| الإعداد | القيمة |
|---|---|
| Root Directory | `artifacts/djadi-academy` |
| Framework Preset | Vite |
| Build Command | `pnpm --filter @workspace/djadi-academy run build` |
| Output Directory | `dist` |
| Install Command | `cd ../.. && corepack enable && pnpm install --frozen-lockfile` |

### ربط الواجهة بالـ Backend

الواجهة تستدعي `/api/...` بمسارات نسبية، والملف `artifacts/djadi-academy/vercel.json` يعيد توجيهها إلى Render:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://YOUR-RENDER-SERVICE.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**مهم:** بعد إنشاء خدمة Render، استبدل `YOUR-RENDER-SERVICE.onrender.com` برابط خدمتك الفعلي ثم أعد النشر على Vercel.

> هذا الأسلوب (proxy عبر Vercel) يجعل الكوكيز تعمل بشكل صحيح لأن المتصفح يتعامل مع نطاق واحد فقط — لا حاجة لأي تعديل على CORS أو الكوكيز.

---

## 3) حساب الأدمن

| البريد | كلمة المرور |
|---|---|
| `djadi@admin.com` | `djadi2026bacapk` |

الحساب مُسجَّل في قاعدة البيانات بدور `super_admin`. (البريد يُخزَّن بأحرف صغيرة، وتسجيل الدخول يقبل أي حالة أحرف.)

---

## 4) اختبار سريع بعد النشر

```bash
# صحة السيرفر
curl https://YOUR-RENDER-SERVICE.onrender.com/api/health

# تسجيل دخول الأدمن
curl -X POST https://YOUR-RENDER-SERVICE.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"djadi@admin.com","password":"djadi2026bacapk"}'
```
