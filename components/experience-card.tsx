"use client"

import { Heart, Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ExperienceCardProps {
  id: string;  // We generate this on the frontend
  title: string;
  imageUrl: string;
  duration: string;
  price: number;
  city: string;
  category: string;
  addToItinerary: (experience: {
    id: string;
    title: string;
    duration: string;
    price: number;
    city: string;
    category: string;
    time: string;
  }) => void;
}

export default function ExperienceCard({
  id,
  title,
  imageUrl,
  duration,
  price,
  city,
  category,
  addToItinerary,
}: ExperienceCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  const handleClick = () => {
    const params = new URLSearchParams({
      title,
      imageUrl,
      duration,
      price: price.toString(),
      city,
      category,
    })
    router.push(`/experience/${id}?${params.toString()}`)
  }

  // Generate fallback image URL based on category
  const getFallbackImage = () => {
    const width = 200
    const height = 150
    const categoryText = category.replace(/\s+/g, '+')
    return `/placeholder.svg?height=${height}&width=${width}&text=${categoryText}+Experience`
  }

  return (
    <div
      className="group relative flex cursor-pointer border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="relative h-32 w-32 sm:h-40 sm:w-40 flex-shrink-0">
        <Image
          src={imageError ? getFallbackImage() : imageUrl}
          alt={title}
          className="object-cover"
          fill
          onError={() => setImageError(true)}
          unoptimized={imageError}
        />
      </div>

      <div className="flex flex-col justify-between p-4 flex-grow">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">{duration}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">{category}</span>
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
                e.stopPropagation();
                const suggestedTime = (() => {
                  const hours = Math.floor(Math.random() * (17 - 9) + 9);
                  const minutes = Math.random() < 0.5 ? "00" : "30";
                  if (hours === 13) return "14:00";
                  return `${hours.toString().padStart(2, "0")}:${minutes}`;
                })();

                addToItinerary({
                  id,
                  title,
                  duration,
                  price,
                  city,
                  category,
                  time: suggestedTime,
                });

                setTimeout(() => {
                  router.push("/schedule");
                }, 500);
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

