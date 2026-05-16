import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'عيسى للتدريب',
  description: 'منصة التدريب التنفيذي — اتفاقية الازدهار',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
