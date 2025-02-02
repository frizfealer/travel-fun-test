import { ItineraryProvider } from "@/contexts/ItineraryContext"
import type React from "react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ItineraryProvider>{children}</ItineraryProvider>
      </body>
    </html>
  )
}



import './globals.css'