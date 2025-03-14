"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

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
  const { toast } = useToast()

  const addToItinerary = (experience: Experience) => {
    setItinerary((prev) => {
      // Check if experience already exists
      if (prev.some((item) => item.id === experience.id)) {
        toast({
          title: "Already in schedule",
          description: "This experience is already in your schedule.",
        })
        return prev
      }

      // Add new experience and sort by time
      const newItinerary = [...prev, experience].sort((a, b) => {
        const timeA = a.time.split(":").map(Number)
        const timeB = b.time.split(":").map(Number)
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
      })

      // Log the updated itinerary
      console.log('Experience added to itinerary:', experience)
      console.log('Updated itinerary:', newItinerary)

      toast({
        title: "Added to schedule",
        description: `${experience.title} has been added to your schedule at ${experience.time}.`,
      })

      return newItinerary
    })
  }

  const removeFromItinerary = (id: string) => {
    setItinerary((prev) => {
      // Find the experience being removed for logging
      const experienceToRemove = prev.find(exp => exp.id === id)
      const updatedItinerary = prev.filter((exp) => exp.id !== id)

      // Log the removal and updated itinerary
      console.log('Experience removed from itinerary:', experienceToRemove)
      console.log('Updated itinerary after removal:', updatedItinerary)

      return updatedItinerary
    })

    toast({
      title: "Removed from schedule",
      description: "The experience has been removed from your schedule.",
    })
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

