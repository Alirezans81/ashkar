'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, monthlyRes, categoryRes] = await Promise.all([
          fetch('/api/reports/stats'),
          fetch('/api/reports/monthly'),
          fetch('/api/reports/categories')
        ]);

        const [statsData, monthlyData, categoryData] = await Promise.all([
          statsRes.json(),
          monthlyRes.json(),
          categoryRes.json()
        ]);

        if (statsData.status === 'success') setStats(statsData.data);
        if (monthlyData.status === 'success') setMonthlyData(monthlyData.data);
        if (categoryData.status === 'success') setCategoryData(categoryData.data);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div dir="rtl" className="container mx-auto py-10 px-4">
        <div className="animate-pulse">
          <Skeleton className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardDescription>
                    <Skeleton className="h-4 bg-gray-200 rounded w-3/4" />
                  </CardDescription>
                  <CardTitle>
                    <Skeleton className="h-6 bg-gray-200 rounded w-1/2" />
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 bg-gray-200 rounded w-1/3" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-96 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 bg-gray-200 rounded w-1/4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-10 w-48 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">گزارش‌ها</h1>
        <p className="text-muted-foreground mt-2">تجزیه و تحلیل داده‌های مالی</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>کل درآمد</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.totalIncome ? Number(stats.totalIncome).toLocaleString() : '0'} ریال
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>کل هزینه</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.totalExpense ? Number(stats.totalExpense).toLocaleString() : '0'} ریال
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>تراز مالی</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.balance ? Number(stats.balance).toLocaleString() : '0'} ریال
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Income vs Expense Chart */}
        <Card>
          <CardHeader>
            <CardTitle>درآمد و هزینه ماهانه</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}M`} />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ریال`, 'مقدار']} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="درآمد" />
                <Bar dataKey="expense" fill="#EF4444" name="هزینه" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزیع بر اساس دسته‌بندی</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => Number(value).toLocaleString() + ' ریال'} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>خروجی گزارش</CardTitle>
          <CardDescription className='mt-1'>
            گزارش‌های مالی را در فرمت‌های مختلف دریافت کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a href="/export">مدیریت خروجی گزارش‌ها</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}