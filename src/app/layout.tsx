import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Smart Fit – Fitnessstudio Verwaltung",
  description: "Verwaltung von Mitgliedern, Tarifen, Kursen und Buchungen",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
