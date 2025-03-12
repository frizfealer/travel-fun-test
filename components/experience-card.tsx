"use client"

import { Heart, Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ExperienceCardProps {
  id: string
  title: string
  imageType: string
  rating?: string
  reviews?: number
  duration: string
  price: number
  isNew?: boolean
  city: string
  category: string
  addToItinerary: (experience: {
    id: string
    title: string
    duration: string
    price: number
    city: string
    category: string
    time: string
  }) => void
}

export default function ExperienceCard({
  id,
  title,
  imageType,
  rating,
  reviews,
  duration,
  price,
  isNew,
  city,
  category,
  addToItinerary,
}: ExperienceCardProps) {
  const router = useRouter()

  const handleClick = () => {
    const params = new URLSearchParams({
      title,
      imageType,
      rating: rating || "",
      reviews: reviews?.toString() || "",
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
    const width = 200
    const height = 150
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
    <div
      className="group relative flex cursor-pointer border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="relative h-32 w-32 sm:h-40 sm:w-40 flex-shrink-0">
        <Image src={getPlaceholderImage(imageType) || "/placeholder.svg"} alt={title} className="object-cover" fill />
      </div>

      <div className="flex flex-col justify-between p-4 flex-grow">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isNew ? (
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">New</span>
            ) : rating ? (
              <div className="flex items-center gap-1 text-sm">
                <span>★ {rating}</span>
                <span className="text-muted-foreground">({reviews})</span>
              </div>
            ) : null}
            <span className="text-sm text-muted-foreground">{duration}</span>
          </div>

          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{city}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="font-medium">From ${price} / person</p>

          <div className="flex gap-2">
            <button
              className="rounded-full bg-secondary p-2 hover:bg-secondary/90"
              onClick={(e) => e.stopPropagation()}
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              className="rounded-full bg-primary text-primary-foreground p-2 hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation()
                const suggestedTime = (() => {
                  const hours = Math.floor(Math.random() * (17 - 9) + 9)
                  const minutes = Math.random() < 0.5 ? "00" : "30"
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

                setTimeout(() => {
                  router.push("/schedule")
                }, 500)
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

