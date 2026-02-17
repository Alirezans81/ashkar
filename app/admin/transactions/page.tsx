"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminTransactionsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        // Check if user is authenticated
        const response = await fetch("/api/admin/check-auth");
        const data = await response.json();

        if (!data.authenticated) {
          router.push("/admin/login");
          return;
        }

        setIsAdmin(true);

        // Fetch transactions
        const transactionsResponse = await fetch("/api/admin/transactions");
        const transactionsData = await transactionsResponse.json();

        if (transactionsData.success) {
          setTransactions(transactionsData.data);
          setFilteredTransactions(transactionsData.data);
        } else {
          setError(transactionsData.message || "Failed to fetch transactions");
        }
      } catch (err) {
        console.error("Error checking auth or fetching data:", err);
        setError("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(
        (tx) =>
          tx.id.includes(searchTerm) ||
          tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.type.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
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
          <h1 className="text-3xl font-bold">مدیریت تراکنش‌ها</h1>
          <p className="text-muted-foreground mt-2">
            مشاهده و ویرایش تمام تراکنش‌های ثبت شده
          </p>
        </div>
        <div className="flex gap-2 items-end">
          <Button onClick={() => router.push("/admin")}>
            بازگشت به داشبورد
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            خروج
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>جستجو و فیلتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium mb-2"
              >
                جستجو در تراکنش‌ها
              </label>
              <Input
                id="search"
                placeholder="جستجو بر اساس شناسه، دسته‌بندی، توضیحات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست تراکنش‌ها</CardTitle>
          <CardDescription className="mt-1">
            تعداد کل تراکنش‌ها: {filteredTransactions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">شماره</TableHead>
                  <TableHead className="text-start">مبلغ</TableHead>
                  <TableHead className="text-start">نوع</TableHead>
                  <TableHead className="text-start">دسته‌بندی</TableHead>
                  <TableHead className="text-start">توضیحات</TableHead>
                  <TableHead className="text-start">مبدأ</TableHead>
                  <TableHead className="text-start">مقصد</TableHead>
                  <TableHead className="text-start">تاریخ</TableHead>
                  <TableHead className="text-start">هش</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>{Number(tx.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.type === "INCOME" ? "default" : "destructive"
                        }
                      >
                        {tx.type === "INCOME" ? "درآمد" : "هزینه"}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.category}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell>{tx.source}</TableCell>
                    <TableCell>{tx.destination}</TableCell>
                    <TableCell>
                      {new Date(tx.createdAt).toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate">
                      {tx.hash.substring(0, 10)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
