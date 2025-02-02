"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Experience {
  id: string
  title: string
  duration: string
  price: number
  city: string
  category: string
  time: string
}

interface ItineraryContextType {
  itinerary: Experience[]
  addToItinerary: (experience: Experience) => void
  removeFromItinerary: (id: string) => void
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined)

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setItinerary] = useState<Experience[]>([])

  const addToItinerary = (experience: Experience) => {
    setItinerary((prev) => [...prev, experience])
  }

  const removeFromItinerary = (id: string) => {
    setItinerary((prev) => prev.filter((exp) => exp.id !== id))
  }

  return (
    <ItineraryContext.Provider value={{ itinerary, addToItinerary, removeFromItinerary }}>
      {children}
    </ItineraryContext.Provider>
  )
}

export function useItinerary() {
  const context = useContext(ItineraryContext)
  if (context === undefined) {
    throw new Error("useItinerary must be used within an ItineraryProvider")
  }
  return context
}

