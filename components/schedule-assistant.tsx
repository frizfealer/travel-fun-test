"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, MapPin, X, Coffee, UtensilsCrossed } from "lucide-react"
import { useItinerary } from "@/contexts/ItineraryContext"
import type React from "react" // Added import for React
import CitySelector, { categories, cities } from "@/components/city-selector" // Changed import statement

type City = typeof cities[number]['value']
type Categories = typeof categories

type ScheduleItem = {
  id: string
  time: string
  title: string
  location?: string
  icon: React.ReactNode
  isDefault?: boolean
}

export default function ScheduleAssistant() {
  const { itinerary, removeFromItinerary } = useItinerary()
  const [customActivity, setCustomActivity] = useState({ title: "", time: "", location: "" })
  const [selectedCity, setSelectedCity] = useState<City | "">("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const isCityInCategories = (city: City | ""): city is keyof Categories => {
    return city !== "" && city in categories
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const defaultSchedule: ScheduleItem[] = [
    { id: "breakfast", time: "08:00", title: "Breakfast", icon: <Coffee className="h-4 w-4" />, isDefault: true },
    { id: "lunch", time: "13:00", title: "Lunch", icon: <UtensilsCrossed className="h-4 w-4" />, isDefault: true },
    { id: "dinner", time: "19:00", title: "Dinner", icon: <UtensilsCrossed className="h-4 w-4" />, isDefault: true },
  ]

  const scheduleItems: ScheduleItem[] = [
    ...defaultSchedule,
    ...itinerary.map((item) => ({
      id: item.id,
      time: item.time, // Use the time from the experience
      title: item.title,
      location: item.city,
      icon: <MapPin className="h-4 w-4" />,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time))

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically add the custom activity to your itinerary state
    console.log("Adding custom activity:", customActivity)
    setCustomActivity({ title: "", time: "", location: "" })
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Your Travel Schedule</h2>
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <div>
          <div className="space-y-4">
            <div>
              <CitySelector onCityChange={(city: City) => {
                setSelectedCity(city)
                setSelectedCategories([]) // Reset categories when city changes
              }} />
            </div>
            {selectedCity && isCityInCategories(selectedCity) && (
              <div>
                <Label className="mb-2 block">Select Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categories[selectedCity].map((category: string) => (
                    <Button
                      key={category}
                      variant={selectedCategories.includes(category) ? "default" : "outline"}
                      onClick={() => toggleCategory(category)}
                      className="justify-center rounded-full text-sm px-3 py-1.5 whitespace-nowrap"
                      type="button"
                      size="sm"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <h3 className="text-lg font-medium my-6">Add Custom Activity</h3>
          <form className="space-y-4" onSubmit={handleAddCustomActivity}>
            <div>
              <Label htmlFor="activity">Activity</Label>
              <Input
                id="activity"
                value={customActivity.title}
                onChange={(e) => setCustomActivity((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter activity name"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={customActivity.location}
                onChange={(e) => setCustomActivity((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location"
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={customActivity.time}
                onChange={(e) => setCustomActivity((prev) => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <Button type="submit">Add to Schedule</Button>
          </form>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Your Itinerary</h3>
          <div className="space-y-8 relative">
            {/* Vertical line */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>

            {scheduleItems.map((item, index) => (
              <div key={item.id} className="relative pl-8">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-background ${item.isDefault ? "bg-secondary" : "bg-primary"}`}
                ></div>

                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{item.time}</span>
                    </div>
                    {!item.isDefault && (
                      <Button variant="ghost" size="sm" onClick={() => removeFromItinerary(item.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center mb-1">
                    {item.icon}
                    <h4 className="font-medium text-lg ml-2">{item.title}</h4>
                  </div>
                  {item.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                {index !== scheduleItems.length - 1 && (
                  <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

