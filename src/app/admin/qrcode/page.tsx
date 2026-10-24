import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Printer } from "lucide-react";

export default function AdminQRCodePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Code Meja</h1>
          <p className="text-sm text-muted-foreground">
            Generate QR Code untuk diletakkan di setiap meja pelanggan.
          </p>
        </div>
        <Button className="gap-2" variant="outline">
          <Printer className="w-4 h-4" />
          Cetak QR Code
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="text-center p-6 space-y-4">
          <div className="flex justify-center p-4 bg-white rounded-lg border inline-block mx-auto">
            <QrCode className="w-32 h-32 text-stone-800" />
          </div>
          <div>
            <h3 className="font-bold text-lg">QR Code Utama (Menu Umum)</h3>
            <p className="text-xs text-muted-foreground">Mengarahkan ke halaman menu utama</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
