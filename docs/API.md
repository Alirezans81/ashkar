# API Reference

این سند مرجع endpointهای فعلی پروژه است.

## فرمت پاسخ

دو الگوی رایج وجود دارد:

1. فرم `success`:

```json
{ "success": true, "data": ... }
```

2. فرم `status`:

```json
{ "status": "success", "data": ... }
```

در توسعه های بعدی بهتر است یکدست شود.

## Public APIs

## `GET /api/health`

وضعیت سلامت + صحت زنجیره + آمار کلی.

## `GET /api/transactions`

لیست تراکنش ها به همراه نتیجه صحت زنجیره.

## `POST /api/transactions`

ایجاد تراکنش عمومی.

Body:

```json
{
  "amount": 1000000,
  "currency": "IRR",
  "type": "INCOME",
  "category": "Salary",
  "description": "Monthly salary",
  "source": "Company",
  "destination": "Bank Account"
}
```

## `GET /api/public/transactions`

نسخه read-only عمومی تراکنش ها با نتیجه integrity.

## `GET /api/verify`

بررسی یکپارچگی کل زنجیره تراکنش ها.

## Reports APIs

## `GET /api/reports/stats`

خروجی:

- `totalIncome`
- `totalExpense`
- `balance`
- `totalCount`

## `GET /api/reports/monthly`

گزارش ماهانه درآمد/هزینه.

## `GET /api/reports/categories`

توزیع مبلغ بر اساس دسته بندی.

## `GET /api/reports/recent?limit=5`

تراکنش های اخیر.

## Export APIs

## `GET /api/export/csv`

دانلود فایل CSV تراکنش ها.

## `GET /api/export/json`

دانلود فایل JSON تراکنش ها.

## Admin Auth APIs

## `POST /api/admin/login`

ورود ادمین.

Body:

```json
{ "username": "admin", "password": "StrongPass123" }
```

## `POST /api/admin/logout`

خروج ادمین (پاک کردن کوکی).

## `GET /api/admin/check-auth`

بررسی وضعیت احراز هویت ادمین.

## Admin Transaction APIs

## `GET /api/admin/transactions`

دریافت لیست تراکنش ها (نیازمند ادمین).

## `POST /api/admin/transactions`

ایجاد تراکنش با انتساب به ادمین ایجادکننده.

## Admin User APIs

## `GET /api/admin/users?page=1&limit=10`

لیست صفحه بندی شده کاربران.

## `POST /api/admin/users`

ایجاد کاربر جدید.

Body نمونه:

```json
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "StrongPass123",
  "role": "USER"
}
```

## `GET /api/admin/users/:id`

جزئیات کاربر.

## `PUT /api/admin/users/:id`

ویرایش کاربر.

## `DELETE /api/admin/users/:id`

حذف کاربر.

## خطاهای رایج

- `400`: ورودی نامعتبر یا ناقص
- `401`: احراز هویت نشده
- `403`: دسترسی غیرمجاز
- `404`: منبع یافت نشد
- `500`: خطای داخلی سرور

## نکته

در UI ادمین export گزینه `stats-json` به `/api/export/stats` اشاره دارد، اما endpoint متناظر در حال حاضر وجود ندارد.
