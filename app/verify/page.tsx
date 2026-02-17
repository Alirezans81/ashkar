'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyPage() {
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [integrityResult, setIntegrityResult] = useState<any>(null);

  const handleVerify = async () => {
    setVerificationStatus('verifying');

    try {
      const response = await fetch('/api/verify');
      const result = await response.json();

      if (result.status === 'success') {
        setIntegrityResult(result.data);
        setVerificationStatus(result.data.isValid ? 'verified' : 'failed');
      } else {
        setVerificationStatus('failed');
        setIntegrityResult({
          isValid: false,
          invalidTransactions: [],
          totalTransactions: 0,
          verificationTime: new Date().toISOString(),
          error: result.message
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('failed');
      setIntegrityResult({
        isValid: false,
        invalidTransactions: [],
        totalTransactions: 0,
        verificationTime: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <div dir="rtl" className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">تایید صحت داده‌ها</h1>
        <p className="text-muted-foreground mt-1">
          بررسی یکپارچگی زنجیره تراکنش‌ها و عدم دستکاری
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>تایید یکپارچگی داده‌ها</CardTitle>
          <CardDescription className='mt-1'>
            این ابزار تمام تراکنش‌های ثبت شده را بررسی می‌کند و اطمینان می‌دهد که هیچ داده‌ای دستکاری نشده است
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8">
            {verificationStatus === 'idle' && (
              <>
                <div className="rounded-full bg-blue-100 p-4 mb-4">
                  <CheckCircle className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-center mb-6">
                  برای بررسی یکپارچگی داده‌ها، دکمه زیر را فشار دهید
                </p>
                <Button onClick={handleVerify} size="lg">
                  آغاز تایید صحت
                </Button>
              </>
            )}

            {verificationStatus === 'verifying' && (
              <>
                <div className="rounded-full bg-yellow-100 p-4 mb-4">
                  <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" />
                </div>
                <p className="text-center mb-4">
                  در حال بررسی یکپارچگی زنجیره تراکنش‌ها...
                </p>
              </>
            )}

            {verificationStatus === 'verified' && integrityResult && (
              <>
                <div className="rounded-full bg-green-100 p-4 mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">داده‌ها معتبر هستند</h3>
                <p className="text-center mb-4 text-muted-foreground">
                  تمام {integrityResult.totalTransactions} تراکنش بررسی شدند و هیچ دستکاری شناسایی نشد
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  زمان تایید: {new Date(integrityResult.verificationTime).toLocaleString('fa-IR')}
                </p>
                <Button onClick={handleVerify}>
                  انجام یک بررسی جدید
                </Button>
              </>
            )}

            {verificationStatus === 'failed' && integrityResult && (
              <>
                <div className="rounded-full bg-red-100 p-4 mb-4">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-red-600">داده‌ها دستکاری شده‌اند!</h3>
                <p className="text-center mb-4 text-muted-foreground">
                  {integrityResult.invalidTransactions?.length || 0} تراکنش مشکل دارند
                </p>
                <Alert className="w-full max-w-md mb-4">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>هشدار امنیتی</AlertTitle>
                  <AlertDescription>
                    یک یا چند تراکنش دستکاری شده‌اند. این موضوع نیاز به بررسی فوری دارد.
                  </AlertDescription>
                </Alert>
                <Button variant="destructive" onClick={handleVerify}>
                  انجام یک بررسی جدید
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>درباره فرآیند تایید</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">چگونه کار می‌کند؟</h4>
              <p className="text-muted-foreground">
                هر تراکنش شامل یک هش رمزنگاری شده از داده‌های قبلی است. این فرآیند یک زنجیره ایجاد می‌کند که 
                هر تغییری در یک تراکنش، باعث بروز مشکل در زنجیره می‌شود.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">چرا مهم است؟</h4>
              <p className="text-muted-foreground">
                این فرآیند اطمینان می‌دهد که داده‌های مالی دستکاری نشده‌اند و کل سوابق مالی قابل اعتماد هستند.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}