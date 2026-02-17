# Ashkar

سامانه ثبت شفاف تراکنش های مالی با تمرکز روی یکپارچگی داده ها (Hash Chain)، گزارش گیری، و پنل مدیریت.

## معرفی پروژه
`Ashkar` یک پروژه مبتنی بر `Next.js` (App Router) و `Prisma + PostgreSQL` است که امکانات زیر را فراهم می کند:

- ثبت تراکنش مالی (درآمد/هزینه)
- نگهداری زنجیره هش برای تشخیص دستکاری
- داشبورد آماری و گزارش های نموداری
- خروجی CSV و JSON
- پنل مدیریت برای لاگین ادمین، مدیریت کاربران و تراکنش ها

## تکنولوژی ها

- `Next.js 16` + `React 19`
- `TypeScript`
- `Prisma 7` + `@prisma/adapter-pg`
- `PostgreSQL`
- `Zod` برای اعتبارسنجی ورودی
- `bcrypt` برای هش رمز عبور
- `Tailwind CSS 4` + `shadcn/ui`
- `Recharts` برای نمودار

## ساختار پروژه

```text
app/
  api/
    admin/...
    reports/...
    export/...
    transactions/
    verify/
  admin/...
  dashboard/
  transactions/
  reports/
  export/
  verify/
components/
lib/
  admin-auth.ts
  user-service.ts
  transaction-service.ts
  hash-chain.ts
  export-service.ts
prisma/
  schema.prisma
  migrations/
scripts/
  create-admin.ts
  test-db.ts
docs/
  API.md
  ARCHITECTURE.md
```

## پیش نیازها

- `Node.js` نسخه 20 یا بالاتر
- `pnpm`
- `PostgreSQL` در حال اجرا

## راه اندازی سریع

1. نصب وابستگی ها

```bash
pnpm install
```

2. تنظیم متغیر محیطی در `.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
```

3. اجرای Migration ها

```bash
pnpm exec prisma migrate dev
```

4. ساخت ادمین اولیه

```bash
pnpm run admin:create -- --username admin --email admin@example.com --password StrongPass123
```

5. اجرای پروژه

```bash
pnpm dev
```

پروژه روی `http://localhost:3000` در دسترس است.

## دستورات اصلی

- `pnpm dev` اجرای توسعه
- `pnpm build` بیلد تولید
- `pnpm start` اجرای نسخه تولید
- `pnpm lint` بررسی ESLint
- `pnpm run db:test` تست اتصال دیتابیس
- `pnpm run admin:create -- --username ... --email ... --password ...` ساخت/به روزرسانی ادمین

## مسیرهای اصلی UI

- `/dashboard` داشبورد
- `/transactions` لیست تراکنش ها
- `/reports` گزارش های آماری
- `/verify` تایید صحت زنجیره
- `/export` خروجی عمومی
- `/admin/login` ورود ادمین
- `/admin` داشبورد ادمین
- `/admin/users` مدیریت کاربران
- `/admin/transactions` مدیریت تراکنش ها
- `/admin/export` خروجی در پنل ادمین

## احراز هویت ادمین

- با API مسیر `/api/admin/login` انجام می شود.
- سشن در کوکی `admin_token` ذخیره می شود.
- middleware پروژه (`proxy.ts`) مسیرهای `/admin/*` را بدون کوکی به `/admin/login` ریدایرکت می کند.

## مستندات تکمیلی

- معماری: `docs/ARCHITECTURE.md`
- مرجع API: `docs/API.md`
- راهنمای مشارکت: `CONTRIBUTING.md`

## نکات مهم برای توسعه تیمی

- قبل از PR حتما `pnpm lint` و تست دستی مسیرهای تحت تاثیر را اجرا کنید.
- مدل های دیتابیس فقط از طریق `prisma/schema.prisma` و migration تغییر کند.
- APIهای جدید باید در `docs/API.md` ثبت شوند.

## محدودیت ها / نکات فعلی

- در صفحه `app/admin/export/page.tsx` گزینه `stats-json` به مسیر `/api/export/stats` اشاره می کند، اما در وضعیت فعلی این endpoint در `app/api/export` پیاده سازی نشده است.

## License

فعلا لایسنس صریحی برای پروژه تعریف نشده است.
