"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useItinerary } from "@/contexts/ItineraryContext"
import { cities } from "./city-selector"
import { useToast } from "@/components/ui/use-toast"

interface RecommendedExperiencesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTime: string
  cityValue?: string
}

export default function RecommendedExperiencesModal({
  open,
  onOpenChange,
  selectedTime,
  cityValue = "new-york",
}: RecommendedExperiencesModalProps) {
  const { addToItinerary } = useItinerary()
  const { toast } = useToast()

  // Mock recommended experiences with more variety
  const recommendations = [
    {
      category: "Food",
      title: "Local Food Tour",
      duration: "2 hours",
      price: 65,
      isNew: true,
    },
    {
      category: "Culture",
      title: "Museum Visit",
      duration: "3 hours",
      price: 45,
      isNew: false,
    },
    {
      category: "Adventure",
      title: "City Walking Tour",
      duration: "2.5 hours",
      price: 35,
      isNew: true,
    },
    {
      category: "Art",
      title: "Gallery Experience",
      duration: "1.5 hours",
      price: 40,
      isNew: false,
    },
  ]

  const cityLabel = cities.find((city) => city.value === cityValue)?.label || "New York"

  const handleAddExperience = (experience: any) => {
    addToItinerary({
      ...experience,
      time: selectedTime,
    })

    toast({
      title: "Experience added",
      description: `${experience.title} has been added to your schedule at ${selectedTime}`,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">Recommended Experiences for {selectedTime}</DialogTitle>
        </DialogHeader>
        <div className="relative px-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {recommendations.map((rec, index) => (
                <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="relative h-[280px] rounded-lg border bg-card">
                    <div className="relative h-32 w-full">
                      <div className="absolute inset-0 bg-muted" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        {rec.isNew && (
                          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                            New
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">{rec.duration}</span>
                      </div>
                      <h3 className="font-medium mb-1">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{cityLabel}</p>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">From ${rec.price} / person</p>
                        <div className="flex gap-2">
                          <button
                            className="rounded-full bg-secondary p-2 hover:bg-secondary/90"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              className="h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                          </button>
                          <button
                            className="rounded-full bg-primary text-primary-foreground p-2 hover:bg-primary/90"
                            onClick={() =>
                              handleAddExperience({
                                id: `rec-${index}`,
                                title: rec.title,
                                duration: rec.duration,
                                price: rec.price,
                                city: cityLabel,
                                category: rec.category,
                              })
                            }
                          >
                            <svg
                              className="h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  )
}

