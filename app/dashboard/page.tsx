"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, monthlyRes, recentRes] = await Promise.all([
          fetch('/api/reports/stats'),
          fetch('/api/reports/monthly'),
          fetch('/api/reports/recent?limit=5')
        ]);

        const [statsData, monthlyData, recentData] = await Promise.all([
          statsRes.json(),
          monthlyRes.json(),
          recentRes.json()
        ]);

        if (statsData.status === 'success') setStats(statsData.data);
        if (monthlyData.status === 'success') setMonthlyData(monthlyData.data);
        if (recentData.status === 'success') setRecentTransactions(recentData.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for pie chart
  const pieData = [
    { name: "درآمد", value: stats?.totalIncome || 0 },
    { name: "هزینه", value: stats?.totalExpense || 0 },
  ];

  if (loading) {
    return (
      <div dir="rtl" className="container mx-auto py-10 px-4">
        <div className="animate-pulse">
          <Skeleton className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardDescription>
                    <Skeleton className="h-4 bg-gray-200 rounded w-3/4" />
                  </CardDescription>
                  <CardTitle>
                    <Skeleton className="h-6 bg-gray-200 rounded w-1/2" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-16 bg-gray-200 rounded" />
                </CardContent>
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
                  <Skeleton className="h-64 bg-gray-200 rounded" />
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
              <Skeleton className="h-96 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">داشبورد</h1>
        <p className="text-muted-foreground mt-2">خلاصه وضعیت مالی و تراکنش‌ها</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>کل درآمد</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.totalIncome ? Number(stats.totalIncome).toLocaleString() : '0'} ریال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">درآمد</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>کل هزینه</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.totalExpense ? Number(stats.totalExpense).toLocaleString() : '0'} ریال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive">خرج</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>تراز مالی</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.balance ? Number(stats.balance).toLocaleString() : '0'} ریال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={stats?.balance >= 0 ? "default" : "destructive"}>
              {stats?.balance >= 0 ? "مثبت" : "منفی"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>تعداد تراکنش‌ها</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalCount || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">ثبت شده</Badge>
          </CardContent>
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}M`} />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString()} ریال`,
                    "مقدار",
                  ]}
                />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="درآمد" />
                <Bar dataKey="expense" fill="#EF4444" name="هزینه" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Income vs Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزیع درآمد و هزینه</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    Number(value).toLocaleString() + " ریال"
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>تراکنش‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="!text-start">شماره</TableHead>
                <TableHead className="!text-start">مبلغ</TableHead>
                <TableHead className="!text-start">نوع</TableHead>
                <TableHead className="!text-start">دسته‌بندی</TableHead>
                <TableHead className="!text-start">مبدأ</TableHead>
                <TableHead className="!text-start">مقصد</TableHead>
                <TableHead className="!text-start">تاریخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{Number(tx.amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.type === "INCOME" ? "default" : "destructive"}
                    >
                      {tx.type === "INCOME" ? "درآمد" : "هزینه"}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell>{tx.source}</TableCell>
                  <TableCell>{tx.destination}</TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleDateString('fa-IR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
