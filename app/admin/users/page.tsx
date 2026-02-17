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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { UserRole } from "@/lib/generated/prisma/client";

export default function AdminUsersPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER" as UserRole,
    isActive: true,
  });
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "USER" as UserRole,
    isActive: true,
  });
  const router = useRouter();

  const itemsPerPage = 10;

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
        await fetchUsers(currentPage);
      } catch (err) {
        console.error("Error checking auth or fetching data:", err);
        setError("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router, currentPage]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async (page: number) => {
    try {
      const response = await fetch(
        `/api/admin/users?page=${page}&limit=${itemsPerPage}`,
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setFilteredUsers(data.data.users);
        setTotalPages(data.data.totalPages);
        setCurrentPage(data.data.currentPage);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("An error occurred while fetching users");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("User created successfully!");
        setShowCreateDialog(false);
        setCreateForm({
          username: "",
          email: "",
          password: "",
          role: "USER",
          isActive: true,
        });
        await fetchUsers(currentPage); // Refresh the list
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      setError("An error occurred while creating the user");
      console.error("User creation error:", err);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("User updated successfully!");
        setShowEditDialog(false);
        await fetchUsers(currentPage); // Refresh the list
      } else {
        setError(data.message || "Failed to update user");
      }
    } catch (err) {
      setError("An error occurred while updating the user");
      console.error("User update error:", err);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;

    try {
      const response = await fetch(`/api/admin/users/${deletingUserId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("User deleted successfully!");
        await fetchUsers(currentPage); // Refresh the list
      } else {
        setError(data.message || "Failed to delete user");
      }
    } catch (err) {
      setError("An error occurred while deleting the user");
      console.error("User deletion error:", err);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setShowEditDialog(true);
  };

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
          <h1 className="text-3xl font-bold">مدیریت کاربران</h1>
          <p className="text-muted-foreground mt-2">
            مشاهده و مدیریت حساب‌های کاربری
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={() => router.push("/admin")}>
            بازگشت به داشبورد
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            خروج
          </Button>
        </div>
      </div>

      {(error || successMessage) && (
        <Alert className={`mb-6 ${error ? "border-destructive" : ""}`}>
          <AlertDescription>{error || successMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>جستجو و فیلتر</CardTitle>
            <CardDescription className="mt-2">
              جستجو در لیست کاربران
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>ایجاد کاربر جدید</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>ایجاد کاربر جدید</DialogTitle>
                <DialogDescription>
                  اطلاعات کاربر جدید را وارد کنید
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">نام کاربری</Label>
                    <Input
                      id="username"
                      value={createForm.username}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          username: e.target.value,
                        })
                      }
                      placeholder="نام کاربری"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email: e.target.value })
                      }
                      placeholder="ایمیل"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">رمز عبور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          password: e.target.value,
                        })
                      }
                      placeholder="رمز عبور"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">نقش</Label>
                    <Select
                      value={createForm.role}
                      onValueChange={(value) =>
                        setCreateForm({
                          ...createForm,
                          role: value as UserRole,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب نقش" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">کاربر</SelectItem>
                        <SelectItem value="ADMIN">مدیر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch
                      id="isActive"
                      checked={createForm.isActive}
                      onCheckedChange={(checked) =>
                        setCreateForm({ ...createForm, isActive: checked })
                      }
                    />
                    <Label htmlFor="isActive">فعال</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">ایجاد کاربر</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                جستجو
              </Label>
              <Input
                id="search"
                placeholder="جستجو بر اساس نام کاربری، ایمیل یا نقش..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست کاربران</CardTitle>
          <CardDescription className="mt-1">
            تعداد کل کاربران: {filteredUsers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">نام کاربری</TableHead>
                  <TableHead className="text-start">ایمیل</TableHead>
                  <TableHead className="text-start">نقش</TableHead>
                  <TableHead className="text-start">وضعیت</TableHead>
                  <TableHead className="text-start">تاریخ عضویت</TableHead>
                  <TableHead className="text-start">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role === "ADMIN" ? "مدیر" : "کاربر"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                      >
                        {user.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          ویرایش
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingUserId(user.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                قبلی
              </Button>

              <div className="flex items-center space-x-1 space-x-reverse">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                بعدی
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
            <DialogDescription>اطلاعات کاربر را ویرایش کنید</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">نام کاربری</Label>
                  <Input
                    id="edit-username"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    placeholder="نام کاربری"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">ایمیل</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="ایمیل"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">نقش</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, role: value as UserRole })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نقش" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">کاربر</SelectItem>
                      <SelectItem value="ADMIN">مدیر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="edit-isActive"
                    checked={editForm.isActive}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, isActive: checked })
                    }
                  />
                  <Label htmlFor="edit-isActive">فعال</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">به‌روزرسانی</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deletingUserId && (
        <Dialog
          open={!!deletingUserId}
          onOpenChange={() => setDeletingUserId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تایید حذف کاربر</DialogTitle>
              <DialogDescription>
                آیا از حذف این کاربر اطمینان دارید؟ این عمل غیرقابل بازگشت است.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingUserId(null)}>
                لغو
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
