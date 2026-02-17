'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminExportPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportStatus, setExportStatus] = useState<{[key: string]: boolean}>({});
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const response = await fetch('/api/admin/check-auth');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin/login');
          return;
        }
        
        setIsAdmin(true);
      } catch (err) {
        console.error('Error checking auth:', err);
        setError('An error occurred while checking authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleExport = async (format: string) => {
    try {
      setExportStatus(prev => ({ ...prev, [format]: true }));
      
      let url = '';
      switch(format) {
        case 'csv':
          url = '/api/export/csv';
          break;
        case 'json':
          url = '/api/export/json';
          break;
        case 'stats-json':
          url = '/api/export/stats';
          break;
        default:
          throw new Error('Invalid export format');
      }
      
      // Create a temporary link to trigger download
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Set filename based on format
      let filename = `ashkar-export-${new Date().toISOString().split('T')[0]}`;
      switch(format) {
        case 'csv':
          filename += '.csv';
          break;
        case 'json':
        case 'stats-json':
          filename += '.json';
          break;
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
      setError(`Export ${format} failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExportStatus(prev => ({ ...prev, [format]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div dir="rtl" className="container mx-auto py-6 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">گزارش‌گیری و صدور داده‌ها</h1>
          <p className="text-muted-foreground mt-2">صادر کردن داده‌های تراکنش به فرمت‌های مختلف</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          خروج
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>صادرات CSV</CardTitle>
            <CardDescription>
              تمام تراکنش‌ها را در فرمت CSV صادر کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => handleExport('csv')}
              disabled={exportStatus['csv']}
            >
              {exportStatus['csv'] ? 'در حال صدور...' : 'صادر کردن CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>صادرات JSON</CardTitle>
            <CardDescription>
              تمام تراکنش‌ها را در فرمت JSON صادر کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => handleExport('json')}
              disabled={exportStatus['json']}
            >
              {exportStatus['json'] ? 'در حال صدور...' : 'صادر کردن JSON'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>صادرات گزارش آماری</CardTitle>
            <CardDescription>
              گزارش آماری تراکنش‌ها را صادر کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => handleExport('stats-json')}
              disabled={exportStatus['stats-json']}
            >
              {exportStatus['stats-json'] ? 'در حال صدور...' : 'صادر کردن گزارش'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>عملیات‌های دیگر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => router.push('/admin')}>
                بازگشت به داشبورد مدیریت
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/admin/transactions')}>
                مدیریت تراکنش‌ها
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}