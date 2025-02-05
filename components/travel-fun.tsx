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

interface Recommendation {
  name: string
  duration: number
  peopleCount: number
  cost: number
  category: string
  agenda: string
  time: string
  rating: number
  regular_opening_hours: string
  formatted_address: string
  website_uri: string
  editorial_summary: string
  photos: string[]
}

export default function TravelFun() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showExperiences, setShowExperiences] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { addToItinerary } = useItinerary()

  const handleCityChange = (value: string) => {
    setSelectedCity(value)
    setSelectedCategories([])
    setShowExperiences(false)
    setRecommendations([])
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleFunExperiences = async () => {
    if (!selectedCity || selectedCategories.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8001/api/py/recommendations', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: cities.find(city => city.value === selectedCity)?.label,
          n_recommendations: 4,
          people_count: 2,
          budget: 1000,
          interests: selectedCategories.join(', ')
        }),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response status:', response.status);
        console.error('Response text:', errorText);
        throw new Error(`Failed to fetch recommendations: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      setRecommendations(data || []);
      setShowExperiences(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert('Failed to fetch recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          disabled={!selectedCity || selectedCategories.length === 0 || isLoading}
          className="w-full"
        >
          {isLoading ? "Loading..." : "Find Fun Experiences"}
        </Button>
      </div>

      {showExperiences && selectedCity && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            {recommendations.length} experiences found
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommendations.map((recommendation, index) => (
              <ExperienceCard
                key={`${selectedCity}-${recommendation.name}-${index}`}
                id={`${selectedCity}-${recommendation.name}-${index}`}
                title={recommendation.name}
                description={recommendation.editorial_summary}
                imageType={recommendation.category.toLowerCase() as "food" | "photo" | "perfume" | "craft" | "tour"}
                duration={`${recommendation.duration} hours`}
                price={recommendation.cost}
                isNew={false}
                city={cities.find((city) => city.value === selectedCity)?.label || ""}
                category={recommendation.category}
                rating={recommendation.rating}
                imageUrl={recommendation.photos?.[0]}
                location={recommendation.formatted_address}
                addToItinerary={addToItinerary}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

