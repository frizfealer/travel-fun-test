"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ImageCarouselProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
}

export default function ImageCarousel({ open, onOpenChange, category }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Array of placeholder images representing different aspects of the experience
  const images = Array.from({ length: 10 }, (_, i) => ({
    src: `/placeholder.svg?height=600&width=800&text=${category}+${i + 1}`,
    alt: `${category} experience image ${i + 1}`,
  }))

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl border-none bg-background/95 p-0 backdrop-blur-sm">
        <div className="relative flex h-[80vh] items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 rounded-full bg-background/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-50 rounded-full bg-background/50 backdrop-blur-sm"
            onClick={previousImage}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-50 rounded-full bg-background/50 backdrop-blur-sm"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Current image */}
          <div className="relative h-full w-full">
            <Image
              src={images[currentIndex].src || "/placeholder.svg"}
              alt={images[currentIndex].alt}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/50 px-3 py-1 text-sm backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

