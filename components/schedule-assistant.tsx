"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, X, Coffee, UtensilsCrossed, Landmark } from "lucide-react"
import { useItinerary } from "@/contexts/ItineraryContext"
import CitySelector, { cities, categories } from "./city-selector"
import CategoryChips from "./category-chips"
import ExperienceCard from "./experience-card"
import AddExperienceCard from "./add-experience-card"
import RecommendedExperiencesModal from "./recommended-experiences-modal"
// Import the ActivityChat component at the top of the file
import ActivityChat from "./activity-chat"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

type ScheduleItem = {
  id: string
  time: string
  title: string
  location?: string
  icon: React.ReactNode
  isDefault?: boolean
  duration?: string
  price?: number
  category?: string
}

export default function ScheduleAssistant() {
  const { itinerary, removeFromItinerary, addToItinerary } = useItinerary()
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showExperiences, setShowExperiences] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [selectedTime, setSelectedTime] = useState("")

  const defaultSchedule: ScheduleItem[] = [
    { id: "breakfast", time: "08:00", title: "Breakfast", icon: <Coffee className="h-4 w-4" />, isDefault: true },
    { id: "lunch", time: "13:00", title: "Lunch", icon: <UtensilsCrossed className="h-4 w-4" />, isDefault: true },
    { id: "dinner", time: "19:00", title: "19:00", icon: <UtensilsCrossed className="h-4 w-4" />, isDefault: true },
  ]

  const handleCityChange = (value: string) => {
    setSelectedCity(value)
    setSelectedCategories([])
    setShowExperiences(false)
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleFunExperiences = () => {
    setShowExperiences(true)
  }

  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "history":
        return <Landmark className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const scheduleItems: ScheduleItem[] = [
    ...defaultSchedule,
    ...itinerary.map((item) => ({
      id: item.id,
      time: item.time,
      title: item.title,
      location: item.city,
      duration: item.duration,
      price: item.price,
      category: item.category,
      icon: getCategoryIcon(item.category),
    })),
  ].sort((a, b) => {
    const getMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number)
      return hours * 60 + minutes
    }
    return getMinutes(a.time) - getMinutes(b.time)
  })

  // Group schedule items by time
  const groupedScheduleItems = scheduleItems.reduce(
    (acc, item) => {
      if (!acc[item.time]) {
        acc[item.time] = []
      }
      acc[item.time].push(item)
      return acc
    },
    {} as Record<string, ScheduleItem[]>,
  )

  // Convert back to array and sort by time
  const sortedTimeSlots = Object.keys(groupedScheduleItems).sort((a, b) => {
    const getMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number)
      return hours * 60 + minutes
    }
    return getMinutes(a) - getMinutes(b)
  })

  // Function to get available time slots between schedule items
  const getTimeSlots = () => {
    const slots: { time: string; afterId: string }[] = []
    const sortedItems = [...scheduleItems].sort((a, b) => {
      const getMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number)
        return hours * 60 + minutes
      }
      return getMinutes(a.time) - getMinutes(b.time)
    })

    for (let i = 0; i < sortedItems.length - 1; i++) {
      const current = sortedItems[i]
      const next = sortedItems[i + 1]

      const [currentHour, currentMinute] = current.time.split(":").map(Number)
      const [nextHour, nextMinute] = next.time.split(":").map(Number)

      const currentTimeInMinutes = currentHour * 60 + (currentMinute || 0)
      const nextTimeInMinutes = nextHour * 60 + (nextMinute || 0)

      if (nextTimeInMinutes - currentTimeInMinutes > 60) {
        const middleTimeInMinutes = Math.floor((currentTimeInMinutes + nextTimeInMinutes) / 2)
        const middleHour = Math.floor(middleTimeInMinutes / 60)
        slots.push({
          time: `${middleHour.toString().padStart(2, "0")}:00`,
          afterId: current.id,
        })
      }
    }

    return slots
  }

  // Create a handler function for the AddExperienceCard click
  const handleAddExperienceClick = (time: string) => {
    setSelectedTime(time)
    setShowRecommendations(true)
  }

  const timeSlots = getTimeSlots()

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Your Travel Schedule</h2>
      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          {/* City and Category Selection */}
          <div className="space-y-6">
            <CitySelector onCityChange={handleCityChange} />

            {selectedCity && categories[selectedCity as keyof typeof categories] && (
              <CategoryChips
                categories={categories[selectedCity as keyof typeof categories]}
                selectedCategories={selectedCategories}
                onToggle={handleCategoryToggle}
              />
            )}

            <Button
              onClick={handleFunExperiences}
              disabled={!selectedCity || selectedCategories.length === 0}
              className="w-full"
            >
              Find Fun Experiences
            </Button>
          </div>

          {/* Experience Cards */}
          {showExperiences && selectedCity && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{selectedCategories.length} categories selected</h3>
              <div className="space-y-4">
                {selectedCategories.map((category, index) => (
                  <ExperienceCard
                    key={index}
                    id={`${selectedCity}-${category}-${index}`}
                    title={`${category} Experience in ${cities.find((city) => city.value === selectedCity)?.label}`}
                    imageType={category.toLowerCase() as "food" | "photo" | "perfume" | "craft" | "tour"}
                    duration="2-3 hours"
                    price={Math.floor(Math.random() * 100) + 50}
                    isNew={Math.random() > 0.5}
                    city={cities.find((city) => city.value === selectedCity)?.label || ""}
                    category={category}
                    addToItinerary={addToItinerary}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Activity Form */}
          <div>
            <h3 className="text-lg font-medium mb-2">Add Custom Activity</h3>
            <ActivityChat onSuggestionSelect={() => {}} addToItinerary={addToItinerary} />
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-medium mb-4">Your Itinerary</h3>
          <div className="space-y-4 relative max-w-md">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>

            {sortedTimeSlots.map((timeSlot) => {
              const items = groupedScheduleItems[timeSlot]
              const hasMultipleItems = items.length > 1 && !items[0].isDefault

              return (
                <React.Fragment key={timeSlot}>
                  <div className="relative pl-8">
                    <div
                      className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-background ${
                        items[0].isDefault ? "bg-secondary" : "bg-primary"
                      }`}
                    ></div>

                    {hasMultipleItems ? (
                      <div className="bg-card rounded-lg p-4 shadow-sm">
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{timeSlot}</span>
                        </div>

                        <Carousel className="w-full">
                          <CarouselContent>
                            {items.map((item) => (
                              <CarouselItem key={item.id}>
                                <div className="bg-background rounded-lg border p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                      {item.icon}
                                      <h4 className="font-medium text-lg ml-2">{item.title}</h4>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeFromItinerary(item.id)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {item.location && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <MapPin className="mr-2 h-4 w-4" />
                                      <span>{item.location}</span>
                                    </div>
                                  )}
                                  {item.duration && (
                                    <div className="text-sm text-muted-foreground mt-1">Duration: {item.duration}</div>
                                  )}
                                  {item.price && !item.isDefault && (
                                    <div className="mt-2 text-sm font-medium">From ${item.price} / person</div>
                                  )}
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-1 h-7 w-7" />
                          <CarouselNext className="right-1 h-7 w-7" />
                        </Carousel>
                      </div>
                    ) : (
                      <div className="bg-card rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{items[0].time}</span>
                            {items[0].duration && !items[0].isDefault && (
                              <>
                                <span className="mx-2">·</span>
                                <span>{items[0].duration}</span>
                              </>
                            )}
                          </div>
                          {!items[0].isDefault && (
                            <Button variant="ghost" size="sm" onClick={() => removeFromItinerary(items[0].id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center mb-1">
                          {items[0].icon}
                          <h4 className="font-medium text-lg ml-2">{items[0].title}</h4>
                        </div>
                        {items[0].location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{items[0].location}</span>
                          </div>
                        )}
                        {items[0].price && !items[0].isDefault && (
                          <div className="mt-2 text-sm font-medium">From ${items[0].price} / person</div>
                        )}
                      </div>
                    )}
                  </div>

                  {timeSlots.find((slot) => slot.afterId === items[0].id) && (
                    <AddExperienceCard
                      time={timeSlots.find((slot) => slot.afterId === items[0].id)!.time}
                      onClick={() =>
                        handleAddExperienceClick(timeSlots.find((slot) => slot.afterId === items[0].id)!.time)
                      }
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      <RecommendedExperiencesModal
        open={showRecommendations}
        onOpenChange={setShowRecommendations}
        selectedTime={selectedTime}
        cityValue={selectedCity || undefined}
      />
    </div>
  )
}

