# مشارکت در Ashkar

این سند برای یکپارچه سازی نحوه توسعه تیمی نوشته شده تا مشارکت کننده های جدید سریع و امن وارد پروژه شوند.

## پیش نیاز مشارکت

- Node.js 20+
- pnpm
- PostgreSQL
- آشنایی با Next.js App Router و Prisma

## جریان کار پیشنهادی

1. از `main` یک branch جدید بسازید:

```bash
git checkout -b feat/short-description
```

2. تغییرات را کوچک و موضوعی نگه دارید.

3. قبل از commit موارد زیر را اجرا کنید:

```bash
pnpm lint
pnpm run db:test
```

4. پیام commit واضح و قابل جستجو باشد.

نمونه:

- `feat(api): add monthly expense breakdown endpoint`
- `fix(admin): prevent self role downgrade`
- `docs(readme): add onboarding steps`

5. Pull Request با توضیح دقیق ایجاد کنید.

## چک لیست PR

- [ ] تغییرات از نظر عملکردی تست شده است.
- [ ] lint بدون خطا اجرا می شود.
- [ ] اگر schema تغییر کرده، migration اضافه شده است.
- [ ] مستندات مرتبط (`README`/`docs/API.md`) آپدیت شده است.
- [ ] تغییرات breaking در توضیح PR ذکر شده است.

## استانداردهای کدنویسی

- TypeScript با تایپ دقیق، از `any` تا حد امکان پرهیز شود.
- اعتبارسنجی ورودی API با `zod` انجام شود.
- منطق دسترسی به دیتابیس در `lib/*-service.ts` متمرکز بماند.
- مسیرهای ادمین حتما بررسی سشن و نقش داشته باشند.

## راهنمای تغییرات دیتابیس

1. تغییر مدل در `prisma/schema.prisma`
2. ساخت migration:

```bash
pnpm exec prisma migrate dev --name your_migration_name
```

3. در PR توضیح دهید چه تغییر داده ای انجام شده و اثر آن روی API چیست.

## امنیت

- فایل `.env` هرگز commit نشود.
- از انتشار رمزهای واقعی دیتابیس یا حساب ادمین خودداری کنید.
- خطاهای سرور را sanitize کنید تا اطلاعات حساس نشت نکند.

## پیشنهاد برای PRهای بزرگ

برای تغییرات وسیع (مثلا بازطراحی auth یا تغییر schema)، ابتدا یک Issue/Design Note کوتاه ثبت کنید تا تیم روی طراحی توافق داشته باشد.
