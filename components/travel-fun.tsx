"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import CategoryChips from "./category-chips"
import ExperienceCard from "./experience-card"
import { useItinerary } from "@/contexts/ItineraryContext"

const cities = [
  { label: "New York", value: "new-york" },
  { label: "Paris", value: "paris" },
  { label: "Tokyo", value: "tokyo" },
  { label: "London", value: "london" },
  { label: "Rome", value: "rome" },
  { label: "Barcelona", value: "barcelona" },
  { label: "Sydney", value: "sydney" },
  { label: "Dubai", value: "dubai" },
  { label: "Amsterdam", value: "amsterdam" },
  { label: "San Francisco", value: "san-francisco" },
]

const categories = {
  "new-york": ["Food", "Photography", "Arts & Crafts", "Sightseeing"],
  paris: ["Art", "Cuisine", "History", "Fashion"],
  tokyo: ["Technology", "Anime", "Cuisine", "Traditional Culture"],
  london: ["History", "Theatre", "Music", "Royal Experience"],
  rome: ["Ancient History", "Art", "Cuisine", "Architecture"],
  barcelona: ["Architecture", "Beach", "Cuisine", "Nightlife"],
  sydney: ["Beach", "Wildlife", "Adventure", "Culture"],
  dubai: ["Luxury", "Desert Adventure", "Shopping", "Architecture"],
  amsterdam: ["Cycling", "Art", "Canals", "Nightlife"],
  "san-francisco": ["Tech", "Food", "Nature", "LGBTQ+ Culture"],
}

export default function TravelFun() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showExperiences, setShowExperiences] = useState(false)

  const { addToItinerary } = useItinerary()

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

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="city-select" className="block text-sm font-medium text-gray-700">
            Select a City
          </label>
          <Select onValueChange={handleCityChange}>
            <SelectTrigger id="city-select" className="w-full">
              <SelectValue placeholder="Choose a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCity && (
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

      {showExperiences && selectedCity && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{selectedCategories.length} categories selected</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  )
}

