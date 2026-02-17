# Architecture

## نمای کلی

پروژه از معماری لایه ای سبک استفاده می کند:

- `app/*`: لایه UI (صفحات)
- `app/api/*`: لایه HTTP API
- `lib/*`: منطق دامنه (Service ها)
- `prisma/*`: مدل داده و migration

جریان اصلی:

1. UI درخواست را به API می فرستد.
2. Route Handler اعتبارسنجی اولیه و کنترل دسترسی را انجام می دهد.
3. Service در `lib/` عملیات دامنه و دیتابیس را انجام می دهد.
4. پاسخ JSON یا فایل خروجی بازگردانده می شود.

## ماژول های کلیدی

## 1) تراکنش ها

فایل های اصلی:

- `lib/transaction-service.ts`
- `lib/hash-chain.ts`
- `app/api/transactions/route.ts`
- `app/api/verify/route.ts`

قواعد:

- هر تراکنش یک `hash` دارد.
- هر تراکنش به `previousHash` تراکنش قبلی اشاره می کند.
- در ایجاد تراکنش جدید، زنجیره به روز می شود.
- تایید صحت زنجیره از طریق `verifyChainIntegrity` انجام می شود.

## 2) کاربران و ادمین

فایل های اصلی:

- `lib/user-service.ts`
- `lib/admin-auth.ts`
- `app/api/admin/*`
- `proxy.ts`

قواعد:

- رمز عبور با `bcrypt` هش می شود.
- نقش ها: `USER` و `ADMIN`.
- سشن ادمین در کوکی `admin_token` نگهداری می شود.
- middleware مسیرهای ادمین را محافظت می کند.

## 3) گزارش و خروجی

فایل های اصلی:

- `app/api/reports/*`
- `lib/export-service.ts`
- `app/api/export/*`

قواعد:

- گزارش های آماری از queryهای تجمیعی Prisma/SQL تولید می شوند.
- خروجی ها در فرمت CSV و JSON ارائه می شوند.

## مدل داده (Prisma)

## User

- `id` UUID
- `username` یکتا
- `email` یکتا
- `password` (hashed)
- `role` (`USER` | `ADMIN`)
- `isActive`
- `createdAt`, `updatedAt`

## Transaction

- `id` UUID
- `amount` Decimal
- `currency` (پیش فرض `IRR`)
- `type` (`INCOME` | `EXPENSE`)
- `category`, `description`
- `source`, `destination`
- `previousHash`, `hash`
- `createdAt`
- ارتباط با کاربر ایجادکننده (`createdById`)
- لینک های زنجیره ای `nextTransactionId`

## تصمیم های فنی مهم

- استفاده از `PrismaPg adapter` به جای اتصال پیش فرض Prisma
- جداسازی منطق دامنه در Service ها برای ساده شدن نگهداری
- استفاده از `zod` برای ورودی های حساس
- استفاده از raw SQL فقط در گزارش های تجمیعی

## ریسک ها و بدهی فنی فعلی

- endpoint برای `stats` export هنوز پیاده سازی نشده است ولی در UI ادمین مصرف می شود.
- توکن سشن ادمین در وضعیت فعلی امضا/رمزنگاری قوی ندارد و برای محیط تولید باید سخت گیرانه تر شود (JWT signed یا session store).
