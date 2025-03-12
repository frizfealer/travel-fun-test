"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const cities = [
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

export const categories = {
  "new-york": ["Food", "Photography", "Arts & Crafts", "Sightseeing", "Shopping"],
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

interface CitySelectorProps {
  onCityChange: (city: string) => void
}

export default function CitySelector({ onCityChange }: CitySelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="city-select" className="block text-sm font-medium text-gray-700">
        Select a City
      </label>
      <Select onValueChange={onCityChange}>
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
  )
}

