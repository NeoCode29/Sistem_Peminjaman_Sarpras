"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { getLogApplicationAction } from "@/actions/logActions";
import { toast } from "sonner";

interface LogData {
  id: string;
  log: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

export default function LogAplikasiClient() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await getLogApplicationAction({
        page: 1,
        limit: 50,
      });

      if (result.success && result.data) {
        setLogs(result.data.logs);
      } else {
        toast.error(result.message || "Gagal memuat log aplikasi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getModuleBadgeColor = (log: string) => {
    if (log.includes('[SARANA]')) return 'bg-blue-100 text-blue-800';
    if (log.includes('[PRASARANA]')) return 'bg-green-100 text-green-800';
    if (log.includes('[PEMINJAMAN]')) return 'bg-purple-100 text-purple-800';
    if (log.includes('[USER_MANAGEMENT]')) return 'bg-red-100 text-red-800';
    if (log.includes('[AUTH]')) return 'bg-yellow-100 text-yellow-800';
    if (log.includes('[DASHBOARD]')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-slate-100 text-slate-800';
  };

  const extractModuleFromLog = (log: string) => {
    const match = log.match(/\[([^\]]+)\]/);
    return match ? match[1] : 'SYSTEM';
  };

  const formatLogMessage = (log: string) => {
    return log.replace(/^\[[^\]]+\]\s*/, '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Aktivitas Terbaru</CardTitle>
        <CardDescription>
          Daftar aktivitas pengguna dalam aplikasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Aktivitas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(log.createdAt, "dd/MM/yyyy HH:mm:ss", { locale: id })}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{log.user.name || log.user.email}</div>
                        <Badge variant={log.user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                          {log.user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getModuleBadgeColor(log.log)}>
                        {extractModuleFromLog(log.log)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={formatLogMessage(log.log)}>
                        {formatLogMessage(log.log)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Tidak ada log ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
