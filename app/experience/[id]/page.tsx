"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronRight, Share, Heart, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageCarousel from "@/components/image-carousel"

export default function ExperiencePage() {
  const [showCarousel, setShowCarousel] = useState(false)
  const searchParams = useSearchParams()

  const title = searchParams.get("title") || "Experience"
  const imageType = searchParams.get("imageType") || "default"
  const rating = searchParams.get("rating") || ""
  const reviews = searchParams.get("reviews") || ""
  const duration = searchParams.get("duration") || "2-3 hours"
  const price = searchParams.get("price") || "50"
  const isNew = searchParams.get("isNew") === "true"
  const city = searchParams.get("city") || "Unknown City"
  const category = searchParams.get("category") || "Experience"

  // Preview images for the gallery
  const previewImages = [
    {
      src: `/placeholder.svg?height=600&width=800&text=${category}+1`,
      alt: `${category} experience preview 1`,
    },
    {
      src: `/placeholder.svg?height=600&width=800&text=${category}+2`,
      alt: `${category} experience preview 2`,
    },
    {
      src: `/placeholder.svg?height=600&width=800&text=${category}+3`,
      alt: `${category} experience preview 3`,
    },
    {
      src: `/placeholder.svg?height=600&width=800&text=${category}+4`,
      alt: `${category} experience preview 4`,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          {city}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/" className="hover:underline">
          {category}
        </Link>
      </nav>

      <main className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Title */}
            <div className="mb-6 flex items-start justify-between">
              <h1 className="text-3xl font-bold">{title}</h1>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Share className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Location */}
            <Link href="/" className="mb-6 block text-lg hover:underline">
              {city}
            </Link>

            {/* Image Gallery */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={previewImages[0].src || "/placeholder.svg"}
                  alt={previewImages[0].alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid gap-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={previewImages[1].src || "/placeholder.svg"}
                    alt={previewImages[1].alt}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button className="w-full" variant="outline" onClick={() => setShowCarousel(true)}>
                  Show all photos
                </Button>
              </div>
            </div>

            {/* Experience Details */}
            <div className="grid gap-8">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full">
                  <Image src="/placeholder.svg" alt="Host" fill className="object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Experience hosted by Local Expert</h2>
                  <p className="text-muted-foreground">{duration} · Hosted in English</p>
                </div>
              </div>

              <Separator />

              {/* What you'll do */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold">What you'll do</h2>
                <p className="mb-4 text-muted-foreground">
                  Immerse yourself in this unique {category.toLowerCase()} experience in the heart of {city}. This
                  hands-on adventure will take you through every step of {title.toLowerCase()}, from start to finish.
                </p>
                <p className="text-muted-foreground">
                  You'll learn the secrets behind {city}'s famous {category.toLowerCase()} scene, guided by our expert
                  local host who will share stories and techniques passed down through generations.
                </p>
                <Button variant="link" className="px-0">
                  Read more
                </Button>
              </section>

              <Separator />

              {/* What's included */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold">What's included</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border">🎨</div>
                    <div>
                      <h3 className="font-medium">Equipment</h3>
                      <p className="text-sm text-muted-foreground">All necessary tools provided</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border">🍹</div>
                    <div>
                      <h3 className="font-medium">Refreshments</h3>
                      <p className="text-sm text-muted-foreground">Light snacks and drinks</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="lg:sticky lg:top-4">
            <div className="rounded-xl border p-6 shadow-sm">
              <div className="mb-6">
                <div className="mb-2 text-2xl font-semibold">
                  From ${price} <span className="text-base font-normal text-muted-foreground">/ person</span>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">DATES</label>
                  <Select defaultValue="mar-1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mar-1">Mar 1 - 9</SelectItem>
                      <SelectItem value="mar-10">Mar 10 - 16</SelectItem>
                      <SelectItem value="mar-17">Mar 17 - 23</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">GUESTS</label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 guest</SelectItem>
                      <SelectItem value="2">2 guests</SelectItem>
                      <SelectItem value="3">3 guests</SelectItem>
                      <SelectItem value="4">4 guests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button size="lg" className="w-full">
                  Reserve
                </Button>
              </div>

              <div className="mt-6 text-center">
                <Button variant="ghost" className="text-muted-foreground">
                  <Flag className="mr-2 h-4 w-4" />
                  Report this experience
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ImageCarousel open={showCarousel} onOpenChange={setShowCarousel} category={category} />
    </div>
  )
}

