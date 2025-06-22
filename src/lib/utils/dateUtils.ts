import { Peminjaman } from "@prisma/client";

// Function to get days overdue for a peminjaman
export const getDaysOverdue = (peminjaman: Peminjaman): number => {
  if (!peminjaman.tanggal_acara_berakhir) return 0;
  
  const today = new Date();
  const scheduledReturnDate = new Date(peminjaman.tanggal_acara_berakhir);
  
  today.setHours(0, 0, 0, 0);
  scheduledReturnDate.setHours(0, 0, 0, 0);
  
  if (today <= scheduledReturnDate) return 0;
  
  const diffTime = today.getTime() - scheduledReturnDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Function to check if return is allowed based on scheduled date
export const isReturnAllowed = (tanggal_acara_berakhir: Date | null): boolean => {
  if (!tanggal_acara_berakhir) return true;
  
  const today = new Date();
  const scheduledReturnDate = new Date(tanggal_acara_berakhir);
  
  // Set time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  scheduledReturnDate.setHours(0, 0, 0, 0);
  
  return today >= scheduledReturnDate;
};

// Function to format return date in Indonesian
export const formatReturnDate = (tanggal_acara_berakhir: Date | null): string => {
  if (!tanggal_acara_berakhir) return '';
  
  const formatter = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return formatter.format(new Date(tanggal_acara_berakhir));
}; 