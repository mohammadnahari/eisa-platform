import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale: string = 'ar-SA') {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date))
}

export function formatNumber(value: number, locale: string = 'ar-SA') {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatCurrency(amount: number, currency: string = 'SAR', locale: string = 'ar-SA') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

export const STATUS_LABELS: Record<string, string> = {
  green: 'أخضر',
  yellow: 'أصفر',
  red: 'أحمر',
  active: 'نشط',
  paused: 'متوقف',
  completed: 'مكتمل',
  dropped: 'منسحب',
  pending: 'معلّق',
  approved: 'موافق عليه',
  rejected: 'مرفوض',
  paid: 'مدفوع',
  failed: 'فاشل',
  refunded: 'مسترد',
}

export const STATUS_COLORS: Record<string, string> = {
  green: 'var(--color-status-green)',
  yellow: 'var(--color-status-yellow)',
  red: 'var(--color-status-red)',
}
