import Link from "next/link";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-950 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-full text-amber-700 dark:text-amber-400">
              <Coffee className="w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-xl">Admin Login</CardTitle>
          <CardDescription>
            Masuk untuk mengelola menu dan kategori Chillax Coffee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@chillax.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Masuk
            </Button>
            <div className="text-center text-xs text-muted-foreground pt-2">
              <Link href="/" className="hover:underline">
                &larr; Kembali ke Menu Pelanggan
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
