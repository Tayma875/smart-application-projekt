import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"

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
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
