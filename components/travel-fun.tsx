"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CategoryChips from "./category-chips"
import ExperienceCard from "./experience-card"
import { useItinerary } from "@/contexts/ItineraryContext"
import CitySelector, { cities, categories } from "./city-selector" // Update this import

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

      {showExperiences && selectedCity && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{selectedCategories.length} categories selected</h2>
          <div className="space-y-4">
            {selectedCategories.map((category, index) => (
              <ExperienceCard
                key={index}
                id={`${selectedCity}-${category}-${index}`}
                title={`${category} Experience in ${cities.find((city) => city.value === selectedCity)?.label}`}
                imageUrl={`/placeholder.svg?height=150&width=200&text=${category.replace(/\s+/g, '+')}+Experience`}
                duration="2-3 hours"
                price={Math.floor(Math.random() * 100) + 50}
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

