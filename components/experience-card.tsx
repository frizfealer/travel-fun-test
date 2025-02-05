"use client"

import { Heart, Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ExperienceCardProps {
  id: string
  title: string
  description?: string
  imageType: "food" | "photo" | "perfume" | "craft" | "tour"
  duration: string
  price: number
  isNew: boolean
  city: string
  category: string
  rating?: number
  imageUrl?: string
  location?: string
  addToItinerary: (experience: any) => void
}

export default function ExperienceCard({
  id,
  title,
  description,
  imageType,
  duration,
  price,
  isNew,
  city,
  category,
  rating,
  imageUrl,
  location,
  addToItinerary,
}: ExperienceCardProps) {
  const router = useRouter()

  const handleClick = () => {
    const params = new URLSearchParams({
      title,
      imageType,
      rating: rating?.toString() || "",
      duration,
      price: price.toString(),
      isNew: isNew ? "true" : "false",
      city,
      category,
    })
    router.push(`/experience/${id}?${params.toString()}`)
  }

  // Generate different placeholder images based on the type
  const getPlaceholderImage = (type: string) => {
    const width = 600
    const height = 400
    switch (type) {
      case "food":
        return `/placeholder.svg?height=${height}&width=${width}&text=Food+Experience`
      case "photo":
        return `/placeholder.svg?height=${height}&width=${width}&text=Photography+Session`
      case "perfume":
        return `/placeholder.svg?height=${height}&width=${width}&text=Perfume+Workshop`
      case "craft":
        return `/placeholder.svg?height=${height}&width=${width}&text=Craft+Workshop`
      case "tour":
        return `/placeholder.svg?height=${height}&width=${width}&text=City+Tour`
      default:
        return `/placeholder.svg?height=${height}&width=${width}&text=Experience`
    }
  }

  return (
    <div className="group relative flex cursor-pointer flex-col gap-2" onClick={handleClick}>
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-secondary">
        <Image
          src={imageUrl || getPlaceholderImage(imageType)}
          alt={title}
          className="object-cover transition-transform group-hover:scale-105"
          fill
        />
        <div className="absolute right-3 top-3 flex gap-2">
          <button className="rounded-full bg-white/80 p-2 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <Heart className="h-5 w-5" />
          </button>
          <button
            className="rounded-full bg-primary text-primary-foreground p-2"
            onClick={(e) => {
              e.stopPropagation()
              // Suggest a time between 9:00 and 17:00, avoiding meal times
              const suggestedTime = (() => {
                const hours = Math.floor(Math.random() * (17 - 9) + 9)
                const minutes = Math.random() < 0.5 ? "00" : "30"
                // Avoid meal times (8:00, 13:00, 19:00)
                if (hours === 13) return "14:00"
                return `${hours.toString().padStart(2, "0")}:${minutes}`
              })()
              addToItinerary({
                id,
                title,
                duration,
                price,
                city,
                category,
                time: suggestedTime,
              })
            }}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isNew ? (
          <div className="flex items-center gap-2">
            <span className="font-medium">New</span>
            <span className="text-gray-600">·</span>
          </div>
        ) : rating && (
          <div className="flex items-center gap-2">
            <span>★ {rating.toFixed(1)}</span>
            <span className="text-gray-600">·</span>
          </div>
        )}
        <span>{duration}</span>
      </div>
      <h3 className="font-medium">{title}</h3>
      {description && <p className="text-sm text-gray-600 line-clamp-2">{description}</p>}
      {location && <p className="text-sm text-gray-500">{location}</p>}
      <p>From ${price} / person</p>
    </div>
  )
}

