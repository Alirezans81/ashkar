'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        const data = await response.json();
        
        if (data.status === 'success') {
          setTransactions(data.data.transactions);
          setFilteredTransactions(data.data.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(tx =>
        tx.id.includes(searchTerm) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  if (loading) {
    return (
      <div dir="rtl" className="container mx-auto py-10 px-4">
        <div className="animate-pulse">
          <Skeleton className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 bg-gray-200 rounded w-1/4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Skeleton className="h-10 bg-gray-200 rounded w-full" />
                </div>
                <div className="flex items-end">
                  <Skeleton className="h-10 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 bg-gray-200 rounded w-1/4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 bg-gray-200 rounded" />
                ))}
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
        <h1 className="text-3xl font-bold">تراکنش‌ها</h1>
        <p className="text-muted-foreground mt-2">لیست تمام تراکنش‌های ثبت شده</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>جستجو و فیلتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">جستجو در تراکنش‌ها</Label>
              <Input
                id="search"
                placeholder="جستجو بر اساس شناسه، دسته‌بندی، توضیحات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='mt-2'
              />
            </div>
            <div className="flex items-end">
              <Button>جستجو</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست تراکنش‌ها</CardTitle>
          <CardDescription className='mt-1'>
            تعداد کل تراکنش‌ها: {filteredTransactions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>نوع</TableHead>
                <TableHead>دسته‌بندی</TableHead>
                <TableHead>توضیحات</TableHead>
                <TableHead>مبدأ</TableHead>
                <TableHead>مقصد</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>هش</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{Number(tx.amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'INCOME' ? 'default' : 'destructive'}>
                      {tx.type === 'INCOME' ? 'درآمد' : 'هزینه'}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell className="max-w-xs truncate">{tx.description}</TableCell>
                  <TableCell>{tx.source}</TableCell>
                  <TableCell>{tx.destination}</TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleDateString('fa-IR')}</TableCell>
                  <TableCell className="max-w-[100px] truncate">{tx.hash}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}