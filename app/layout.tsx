import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'عيسى للتدريب',
  description: 'منصة التوجيه والتدريب',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
