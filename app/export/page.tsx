'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

export default function ExportPage() {
  const [exportStatus, setExportStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({
    csv: 'idle',
    json: 'idle',
  });

  const handleExport = async (format: 'csv' | 'json') => {
    setExportStatus(prev => ({ ...prev, [format]: 'loading' }));

    try {
      let url = '';
      if (format === 'csv') {
        url = '/api/export/csv';
      } else if (format === 'json') {
        url = '/api/export/json';
      }

      const response = await fetch(url);
      
      if (response.ok) {
        // Create a blob from the response and trigger download
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `transactions.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
        setExportStatus(prev => ({ ...prev, [format]: 'success' }));
        
        // Reset status after 2 seconds
        setTimeout(() => {
          setExportStatus(prev => ({ ...prev, [format]: 'idle' }));
        }, 2000);
      } else {
        throw new Error(`Export failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      setExportStatus(prev => ({ ...prev, [format]: 'error' }));
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, [format]: 'idle' }));
      }, 2000);
    }
  };

  return (
    <div dir="rtl" className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">خروجی گزارش‌ها</h1>
        <p className="text-muted-foreground mt-2">دانلود داده‌های مالی در فرمت‌های مختلف</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>فرمت‌های خروجی</CardTitle>
          <CardDescription className='mt-1'>
            داده‌های مالی را در فرمت‌های مختلف دانلود کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">CSV</h3>
                <Badge variant="outline">متنی</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                فرمت جداشده با کاما مناسب برای اکسل و نرم‌افزارهای تحلیل داده
              </p>
              <Button 
                onClick={() => handleExport('csv')} 
                disabled={exportStatus.csv === 'loading'}
                className="w-full"
              >
                {exportStatus.csv === 'loading' ? (
                  <>
                    <span>در حال پردازش...</span>
                  </>
                ) : (
                  <>
                    <Download className="ml-2 h-4 w-4" />
                    دانلود CSV
                  </>
                )}
              </Button>
              {exportStatus.csv === 'success' && (
                <p className="mt-2 text-sm text-green-600">دانلود با موفقیت انجام شد!</p>
              )}
              {exportStatus.csv === 'error' && (
                <p className="mt-2 text-sm text-red-600">خطا در دانلود فایل</p>
              )}
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">JSON</h3>
                <Badge variant="outline">ساختار یافته</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                فرمت ساختار یافته مناسب برای برنامه‌نویسان و سیستم‌های دیگر
              </p>
              <Button 
                onClick={() => handleExport('json')} 
                disabled={exportStatus.json === 'loading'}
                className="w-full"
              >
                {exportStatus.json === 'loading' ? (
                  <>
                    <span>در حال پردازش...</span>
                  </>
                ) : (
                  <>
                    <Download className="ml-2 h-4 w-4" />
                    دانلود JSON
                  </>
                )}
              </Button>
              {exportStatus.json === 'success' && (
                <p className="mt-2 text-sm text-green-600">دانلود با موفقیت انجام شد!</p>
              )}
              {exportStatus.json === 'error' && (
                <p className="mt-2 text-sm text-red-600">خطا در دانلود فایل</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>درباره فرمت‌های خروجی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">CSV (Comma-Separated Values)</h4>
              <p className="text-muted-foreground">
                فرمت متنی ساده که با کاما ارزش‌ها را از هم جدا می‌کند. مناسب برای وارد کردن به نرم‌افزارهای 
                صفحه گسترده مانند Microsoft Excel یا Google Sheets.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">JSON (JavaScript Object Notation)</h4>
              <p className="text-muted-foreground">
                فرمت ساختار یافته‌ای که برای تبادل داده بین سیستم‌ها استفاده می‌شود. مناسب برای 
                برنامه‌نویسان و سیستم‌های دیگری که نیاز به تحلیل خودکار داده‌ها دارند.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}