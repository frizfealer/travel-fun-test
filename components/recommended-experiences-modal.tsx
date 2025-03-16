"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useItinerary } from "@/contexts/ItineraryContext"
import { cities } from "./city-selector"
import { useToast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { AlertCircle, Heart, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Experience {
  title: string;
  imageUrl: string;
  duration: string;
  price: number;
  city: string;
  category: string;
}

// Add helper function to handle image URLs
const getImageUrl = (imageData: string) => {
  // Check if the string is already a complete data URI or a regular URL
  if (imageData.startsWith('data:') || imageData.startsWith('http')) {
    return imageData;
  }
  // Assume it's a base64 string and add the data URI prefix
  return `data:image/jpeg;base64,${imageData}`;
};

interface RecommendedExperiencesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTime: string
  cityValue?: string
  selectedCategories?: string[]
}

export default function RecommendedExperiencesModal({
  open,
  onOpenChange,
  selectedTime,
  cityValue,
  selectedCategories = [],
}: RecommendedExperiencesModalProps) {
  const { itinerary, addToItinerary } = useItinerary()
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const DEFAULT_NUM_RECOMMENDATIONS = 3

  const cityLabel = cities.find((city) => city.value === cityValue)?.label || "New York"

  // Fetch recommendations when the modal opens
  useEffect(() => {
    if (open) {
      // Reset states
      setRecommendations([])
      setError(null)

      // Validate city and categories
      if (!cityValue) {
        setError("Please select a city first.")
        return
      }

      if (!selectedCategories || selectedCategories.length === 0) {
        setError("Please select at least one category first.")
        return
      }

      // Fetch recommendations from API
      fetchRecommendations()
    }
  }, [open, cityValue, selectedCategories])

  const fetchRecommendations = async () => {
    setIsLoading(true)

    // Get titles of experiences already in the itinerary to exclude them
    const excludedExperiences = itinerary.map(item => item.title)

    // Calculate the number of recommendations based on selected categories
    const numRecommendations = Math.max(DEFAULT_NUM_RECOMMENDATIONS, selectedCategories.length)

    try {
      const response = await fetch('http://127.0.0.1:8001/api/py/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: cityValue,
          num_recommendations: numRecommendations,
          interests: selectedCategories,
          excluded_recommendations: excludedExperiences
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setError('Failed to load recommendations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExperience = (experience: any) => {
    // Check if this experience is already in the itinerary by title
    const isDuplicateInItinerary = itinerary.some(item => item.title === experience.title)

    if (isDuplicateInItinerary) {
      toast({
        title: "Already in schedule",
        description: `${experience.title} is already in your schedule.`,
        variant: "destructive"
      })
      return
    }

    // Check if there's already an event at this time slot
    const timeSlotOccupied = itinerary.some(item => item.time === selectedTime)

    if (timeSlotOccupied) {
      toast({
        title: "Time slot occupied",
        description: `You already have an event scheduled at ${selectedTime}.`,
        variant: "destructive"
      })
      return
    }

    // Generate a unique ID for this experience
    const uniqueId = `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Create the new experience object
    const newExperience = {
      ...experience,
      id: uniqueId,
      time: selectedTime,
    }

    // Add to itinerary
    addToItinerary(newExperience)

    // Log the current itinerary with the new addition
    console.log('Experience added:', newExperience)
    console.log('Current itinerary:', [...itinerary, newExperience].sort((a, b) => {
      const timeA = a.time.split(":").map(Number)
      const timeB = b.time.split(":").map(Number)
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
    }))

    toast({
      title: "Experience added",
      description: `${experience.title} has been added to your schedule at ${selectedTime}`,
    })

    // Close the modal after adding an experience
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">Recommended Experiences for {selectedTime}</DialogTitle>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="relative px-4">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {recommendations.map((rec, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="relative rounded-lg border bg-card h-auto pb-4 overflow-visible">
                      <div className="relative h-32 w-full">
                        {rec.imageUrl ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${getImageUrl(rec.imageUrl)})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-muted" />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                            {rec.category}
                          </span>
                          <span className="text-sm text-muted-foreground">{rec.duration}</span>
                        </div>
                        <h3 className="font-medium mb-1 line-clamp-1">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{rec.city}</p>
                        <div className="flex items-center justify-between">
                          <p className="font-medium">From ${rec.price} / person</p>
                          <div className="flex gap-2">
                            <button
                              className="rounded-full bg-secondary p-2 hover:bg-secondary/90"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-full bg-primary text-primary-foreground p-2 hover:bg-primary/90"
                              onClick={() =>
                                handleAddExperience({
                                  title: rec.title,
                                  duration: rec.duration,
                                  price: rec.price,
                                  city: rec.city,
                                  category: rec.category,
                                  imageUrl: rec.imageUrl
                                })
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-3 h-8 w-8" />
              <CarouselNext className="-right-3 h-8 w-8" />
            </Carousel>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No recommendations available. Try selecting different categories.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

