"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, DollarSign } from "lucide-react"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExperienceDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experience: {
    title: string
    category: string
    duration: string
    price: number
    city: string
    imageType: string
  } | null
}

export default function ExperienceDetailModal({ open, onOpenChange, experience }: ExperienceDetailModalProps) {
  if (!experience) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">{experience.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="px-6 pb-6">
            <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
              <Image
                src={`/placeholder.svg?height=256&width=512&text=${experience.category}`}
                alt={experience.title}
                className="object-cover"
                fill
              />
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{experience.duration}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{experience.city}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>${experience.price} per person</span>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">About this experience</h3>
                <p className="text-muted-foreground">
                  Join us for an unforgettable {experience.category.toLowerCase()} experience in {experience.city}. This{" "}
                  {experience.duration.toLowerCase()} session will introduce you to local culture and traditions.
                  {/* Adding more content to demonstrate scrolling */}
                  <br />
                  <br />
                  During this experience, you'll learn from expert local guides who will share their knowledge and
                  passion. You'll get hands-on experience and take home memories that will last a lifetime.
                </p>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">What's included</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>Professional instructor</li>
                  <li>All necessary equipment</li>
                  <li>Welcome drinks</li>
                  <li>Photos of your experience</li>
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">What to expect</h3>
                <p className="text-muted-foreground">
                  This experience is suitable for all skill levels. No prior experience is necessary. We recommend
                  wearing comfortable clothing and bringing a camera to capture the memories.
                </p>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">Cancellation policy</h3>
                <p className="text-muted-foreground">
                  Free cancellation up to 24 hours before the experience starts. No refunds for cancellations made less
                  than 24 hours before the experience.
                </p>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">Location</h3>
                <p className="text-muted-foreground">
                  This experience takes place in the heart of {experience.city}. Detailed directions will be provided
                  after booking.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => {
                    // Generate a random time
                    const hours = Math.floor(Math.random() * (17 - 9) + 9)
                    const minutes = Math.random() < 0.5 ? "00" : "30"
                    const time = `${hours.toString().padStart(2, "0")}:${minutes}`

                    // Close the modal
                    onOpenChange(false)
                  }}
                >
                  Add to Schedule
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

