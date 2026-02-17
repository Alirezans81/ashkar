import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import localFont from "next/font/local";
import { MainNav } from "@/components/navigation";
import { Kanban } from "lucide-react";

const iransansFont = localFont({
  src: "../public/fonts/iransans.woff2",
});

export const metadata: Metadata = {
  title: "Ashkar | سامانه ثبت شفاف تراکنش‌های مالی",
  description: "سامانه ثبت شفاف تراکنش‌های مالی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={iransansFont.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen text-sm">
            {/* Header */}
            <header className="border-b">
              <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Kanban className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold">آشکار</span>
                  <span className="text-sm text-muted-foreground">|</span>
                  <span className="text-sm text-muted-foreground">
                    سامانه ثبت شفاف تراکنش‌های مالی
                  </span>
                </div>
                <MainNav />
                {/* <nav className="text-base sm:text-sm">
                  <ul className="flex space-x-6">
                    <li>
                      <Link
                        href="/dashboard"
                        className="hover:text-primary transition-colors"
                      >
                        داشبورد
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/transactions"
                        className="hover:text-primary transition-colors"
                      >
                        تراکنش‌ها
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/reports"
                        className="hover:text-primary transition-colors"
                      >
                        گزارش‌ها
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/verify"
                        className="hover:text-primary transition-colors"
                      >
                        تایید صحت
                      </Link>
                    </li>
                  </ul>
                </nav> */}
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">{children}</main>

            {/* Footer */}
            <footer className="border-t py-6 mt-auto">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>آشکار | سامانه ثبت شفاف تراکنش‌های مالی</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
