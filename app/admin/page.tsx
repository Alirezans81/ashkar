'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TransactionType } from '@/lib/generated/prisma/enums';

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'IRR',
    type: 'INCOME' as TransactionType,
    category: '',
    description: '',
    source: '',
    destination: ''
  });
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setIsAdmin(true);
          
          // Fetch stats after authentication
          const statsResponse = await fetch('/api/reports/stats');
          const statsData = await statsResponse.json();
          
          if (statsData.status === 'success') {
            setStats(statsData.data);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/admin/login');
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
      
      setLogoutSuccess(true);
      setTimeout(() => {
        router.push('/admin/login');
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransactionError('');
    setTransactionSuccess(false);

    try {
      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          type: formData.type as TransactionType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTransactionSuccess(true);
        // Reset form
        setFormData({
          amount: '',
          currency: 'IRR',
          type: 'INCOME',
          category: '',
          description: '',
          source: '',
          destination: ''
        });
        
        // Hide success message after 3 seconds
        setTimeout(() => setTransactionSuccess(false), 3000);
      } else {
        setTransactionError(data.message || 'Failed to create transaction');
      }
    } catch (err) {
      setTransactionError('An error occurred while creating the transaction');
      console.error('Transaction creation error:', err);
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
          <h1 className="text-3xl font-bold">پنل مدیریت</h1>
          <p className="text-muted-foreground mt-2">مدیریت تراکنش‌ها و تنظیمات سیستم</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          خروج
        </Button>
      </div>

      {logoutSuccess && (
        <Alert className="mb-6">
          <AlertDescription>
            با موفقیت خارج شدید. در حال هدایت به صفحه ورود...
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle>ایجاد تراکنش جدید</CardTitle>
            <CardDescription className='mt-1'>
              یک تراکنش جدید را در سیستم ثبت کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTransaction}>
              <div className="space-y-4">
                {transactionSuccess && (
                  <Alert>
                    <AlertDescription>
                      تراکنش با موفقیت ایجاد شد!
                    </AlertDescription>
                  </Alert>
                )}
                
                {transactionError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {transactionError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="amount">مبلغ</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      required
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="مثلاً 1000000"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="currency">واحد پول</Label>
                    <Input
                      id="currency"
                      name="currency"
                      type="text"
                      value={formData.currency}
                      onChange={handleInputChange}
                      placeholder="IRR"
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="type">نوع تراکنش</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleSelectChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب نوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">درآمد</SelectItem>
                        <SelectItem value="EXPENSE">هزینه</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="category">دسته‌بندی</Label>
                    <Input
                      id="category"
                      name="category"
                      type="text"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="مثلاً حقوق، خرید، خدمات"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">توضیحات</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="توضیحات تراکنش (اختیاری)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="source">مبدأ</Label>
                    <Input
                      id="source"
                      name="source"
                      type="text"
                      required
                      value={formData.source}
                      onChange={handleInputChange}
                      placeholder="مثلاً حساب بانکی، نقدی"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="destination">مقصد</Label>
                    <Input
                      id="destination"
                      name="destination"
                      type="text"
                      required
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="مثلاً فروشگاه، خدمات"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  ایجاد تراکنش
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Admin Stats */}
        <Card>
          <CardHeader>
            <CardTitle>آمار سیستم</CardTitle>
            <CardDescription className="mt-1">
              اطلاعات کلی درباره سیستم و تراکنش‌ها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">تعداد کل تراکنش‌ها</h3>
                <p id="total-transactions" className="text-2xl font-bold mt-2">{stats?.totalCount || '...'} عدد</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">کل درآمدها</h3>
                <p id="total-income" className="text-2xl font-bold mt-2 text-green-600">{stats?.totalIncome ? Number(stats.totalIncome).toLocaleString() : '...'} ریال</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">کل هزینه‌ها</h3>
                <p id="total-expenses" className="text-2xl font-bold mt-2 text-red-600">{stats?.totalExpense ? Number(stats.totalExpense).toLocaleString() : '...'} ریال</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">تراز مالی</h3>
                <p id="balance" className="text-2xl font-bold mt-2">{stats?.balance ? Number(stats.balance).toLocaleString() : '...'} ریال</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">عملیات‌های مدیریتی</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/transactions')}>
                  مشاهده همه تراکنش‌ها
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/users')}>
                  مدیریت کاربران
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/admin/export')}>
                  گزارش‌گیری و صدور داده‌ها
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}