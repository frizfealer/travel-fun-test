"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { SendHorizontal, Bot, User, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Image from "next/image"
import ExperienceDetailModal from "./experience-detail-modal"
import TravelPlanningCard from "./travel-planning-card"

// Add this type at the top of the file
interface ScheduleSuggestion {
  title: string
  experiences: Array<{
    id: string
    title: string
    imageType: string
    duration: string
    price: number
    city: string
    category: string
    suggestedTime: string
  }>
}

// Update the Message interface to support schedule suggestions and travel planning
interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  experiences?: Array<{
    id: string
    title: string
    imageType: string
    duration: string
    price: number
    city: string
    category: string
    time?: string
  }>
  scheduleSuggestion?: ScheduleSuggestion
  showTravelPlanningCard?: boolean
}

// Update the ActivityChatProps interface to include addToItinerary
interface ActivityChatProps {
  onSuggestionSelect: (activity: { title: string; location: string; time: string }) => void
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

// Make sure to use the addToItinerary prop in the component
export default function ActivityChat({ onSuggestionSelect, addToItinerary }: ActivityChatProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I can help you plan activities for your trip. What kind of activity are you looking for?",
      role: "assistant",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [selectedExperience, setSelectedExperience] = useState<{
    title: string
    category: string
    duration: string
    price: number
    city: string
    imageType: string
  } | null>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Add this function inside the ActivityChat component
  const generateScheduleSuggestion = (experiences: Message["experiences"]) => {
    if (!experiences) return null

    // Sort experiences by type to create a logical order
    const sortedExperiences = [...experiences].sort((a, b) => {
      const typeOrder = {
        "Wine Tasting": 1,
        "Cooking Class": 2,
        "Restaurant Visit": 3,
        "Food Tour": 4,
        "Museum Tour": 5,
        "Cultural Landmark": 6,
      }
      return (typeOrder[a.title as keyof typeof typeOrder] || 99) - (typeOrder[b.title as keyof typeof typeOrder] || 99)
    })

    // Assign suggested times based on activity type
    const suggestedExperiences = sortedExperiences.map((exp, index) => {
      let suggestedTime = "12:00" // Default time

      if (exp.title.includes("Wine") || exp.title.includes("Cooking")) {
        suggestedTime = "10:00"
      } else if (exp.title.includes("Restaurant")) {
        suggestedTime = "19:00"
      } else if (exp.title.includes("Tour")) {
        suggestedTime = "14:00"
      } else if (exp.title.includes("Museum")) {
        suggestedTime = "11:00"
      }

      return {
        ...exp,
        suggestedTime,
      }
    })

    return {
      title: "Suggested Schedule",
      experiences: suggestedExperiences,
    }
  }

  // Function to check if a message is a travel planning question
  const isTravelPlanningQuestion = (text: string): boolean => {
    const planningKeywords = [
      "plan",
      "planning",
      "trip",
      "vacation",
      "travel",
      "itinerary",
      "schedule",
      "visit",
      "going to",
      "traveling to",
    ]

    const questionWords = ["how", "can", "could", "would", "help", "need", "want", "looking"]

    // Check if the message contains planning keywords and question words
    const hasPlanningKeyword = planningKeywords.some((keyword) => text.toLowerCase().includes(keyword))

    const hasQuestionWord = questionWords.some((word) => text.toLowerCase().includes(word))

    return hasPlanningKeyword && hasQuestionWord
  }

  // Handle travel plan creation
  const handleTravelPlanCreated = (plan: {
    city: string
    people: number
    startDate: Date
    endDate: Date
  }) => {
    const cityName = plan.city ? plan.city.charAt(0).toUpperCase() + plan.city.slice(1) : "your destination"
    const startDate = plan.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const endDate = plan.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const days = Math.ceil((plan.endDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24))

    const assistantMessage: Message = {
      id: Date.now().toString(),
      content: `Great! I've created a travel plan for ${cityName} for ${plan.people} ${plan.people === 1 ? "person" : "people"} from ${startDate} to ${endDate} (${days} days). Here are some recommended experiences for your trip:`,
      role: "assistant",
      experiences: generateSuggestions(`${cityName} experiences`).map((exp) => ({
        id: exp.id,
        title: exp.title,
        imageType: exp.imageType,
        duration: exp.duration,
        price: exp.price,
        city: cityName,
        category: exp.category,
      })),
    }

    setMessages((prev) => [...prev, assistantMessage])
  }

  // Update the handleSend function to include travel planning detection
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Check if this is a travel planning question
    const isTravelPlanning = isTravelPlanningQuestion(input)
    const isTravelQuery =
      /travel|experience|activity|tour|visit|see|do|explore|adventure|food|restaurant|museum|attraction/i.test(input)

    setTimeout(() => {
      if (isTravelPlanning) {
        // Show travel planning card
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'd be happy to help you plan your trip! Please fill out the details below:",
          role: "assistant",
          showTravelPlanningCard: true,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else if (isTravelQuery) {
        const experiences = generateSuggestions(input)
        const scheduleSuggestion = generateScheduleSuggestion(experiences)

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Here's a suggested schedule for your activities:",
          role: "assistant",
          experiences: experiences.map((exp) => ({
            id: exp.id,
            title: exp.title,
            imageType: exp.imageType,
            duration: exp.duration,
            price: exp.price,
            city: exp.location,
            category: exp.category,
          })),
          scheduleSuggestion: scheduleSuggestion,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        // Regular text response for non-travel queries
        const responseContent =
          "I can help you plan your trip! Ask me about activities, restaurants, or attractions you'd like to explore."

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          role: "assistant",
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
      setIsLoading(false)
    }, 1000)
  }

  // Update the generateSuggestions function to return more detailed experience data
  const generateSuggestions = (
    input: string,
  ): Array<{
    id: string
    title: string
    location: string
    time: string
    imageType: string
    duration: string
    price: number
    category: string
  }> => {
    const keywords = {
      food: ["Restaurant Visit", "Food Tour", "Cooking Class", "Wine Tasting", "Street Food Experience"],
      sightseeing: ["Museum Tour", "Historic Site Visit", "Guided City Walk", "Architecture Tour", "Cultural Landmark"],
      activity: ["Hiking Trip", "Bike Tour", "Boat Excursion", "Workshop", "Adventure Activity"],
    }

    const locations = ["Downtown", "City Center", "Old Town", "Riverside", "Arts District"]
    const times = ["09:00", "11:30", "14:00", "16:30", "19:00"]
    const durations = ["1-2 hours", "2-3 hours", "Half day", "3-4 hours", "Full day"]

    let category = "activity"
    if (
      input.toLowerCase().includes("eat") ||
      input.toLowerCase().includes("food") ||
      input.toLowerCase().includes("restaurant")
    ) {
      category = "food"
    } else if (
      input.toLowerCase().includes("see") ||
      input.toLowerCase().includes("visit") ||
      input.toLowerCase().includes("museum") ||
      input.toLowerCase().includes("tour")
    ) {
      category = "sightseeing"
    }

    return Array.from({ length: 3 }, (_, i) => {
      const options = keywords[category as keyof typeof keywords]
      const selectedCategory =
        category === "food"
          ? "Food"
          : category === "sightseeing"
            ? "Culture"
            : ["Adventure", "Art", "Outdoor"][Math.floor(Math.random() * 3)]

      return {
        id: `suggestion-${Date.now()}-${i}`,
        title: `${options[Math.floor(Math.random() * options.length)]}`,
        location: `${locations[Math.floor(Math.random() * locations.length)]}`,
        time: `${times[Math.floor(Math.random() * times.length)]}`,
        imageType: category,
        duration: `${durations[Math.floor(Math.random() * durations.length)]}`,
        price: Math.floor(Math.random() * 50) + 30,
        category: selectedCategory,
      }
    })
  }

  // Add this component inside ActivityChat to render the schedule suggestion
  function ScheduleSuggestionCard({
    suggestion,
    onAddAll,
  }: {
    suggestion: ScheduleSuggestion
    onAddAll: () => void
  }) {
    return (
      <div className="bg-background rounded-lg border p-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Suggested Schedule</h4>
          <Button size="sm" onClick={onAddAll} className="h-7">
            Add All to Schedule
          </Button>
        </div>
        <div className="space-y-3">
          {suggestion.experiences.map((exp) => (
            <div key={exp.id} className="flex items-center gap-3 text-sm">
              <div className="font-medium w-16">{exp.suggestedTime}</div>
              <div className="flex-1">{exp.title}</div>
              <div className="text-muted-foreground">{exp.duration}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Update the JSX to render experience cards in chat messages
  return (
    <div className="border rounded-lg overflow-hidden flex flex-col h-[600px]">
      <div className="bg-primary p-3">
        <h3 className="text-primary-foreground font-medium">Travel Assistant</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                <div className="flex items-start gap-2">
                  {message.role === "assistant" ? (
                    <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div>{message.content}</div>

                    {message.showTravelPlanningCard && (
                      <div className="mt-4">
                        <TravelPlanningCard onPlanCreated={handleTravelPlanCreated} />
                      </div>
                    )}

                    {message.scheduleSuggestion && (
                      <ScheduleSuggestionCard
                        suggestion={message.scheduleSuggestion}
                        onAddAll={() => {
                          message.scheduleSuggestion?.experiences.forEach((exp) => {
                            const itineraryItem = {
                              id: exp.id,
                              title: exp.title,
                              duration: exp.duration,
                              price: exp.price,
                              city: exp.city,
                              category: exp.category,
                              time: exp.suggestedTime,
                            }
                            addToItinerary(itineraryItem)
                          })

                          setMessages((prev) => [
                            ...prev,
                            {
                              id: Date.now().toString(),
                              content: "I've added all experiences to your schedule!",
                              role: "assistant",
                            },
                          ])
                        }}
                      />
                    )}

                    {message.experiences && message.experiences.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {message.experiences.map((exp) => (
                          <div key={exp.id} className="bg-background rounded-md overflow-hidden border shadow-sm">
                            <div className="flex">
                              <div className="relative h-25 w-25 flex-shrink-0">
                                <Image
                                  src={`/placeholder.svg?height=100&width=100&text=${exp.category}`}
                                  alt={exp.title}
                                  className="object-cover"
                                  fill
                                />
                              </div>
                              <div className="p-3 flex-1">
                                <h4 className="font-medium text-sm mb-1">{exp.title}</h4>
                                <div className="text-xs text-muted-foreground mb-3">
                                  {exp.duration} · ${exp.price}/person
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-7"
                                    onClick={() => setSelectedExperience(exp)}
                                  >
                                    View More
                                  </Button>
                                  <Button
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      const time =
                                        exp.time ||
                                        (() => {
                                          const hours = Math.floor(Math.random() * (17 - 9) + 9)
                                          const minutes = Math.random() < 0.5 ? "00" : "30"
                                          return `${hours.toString().padStart(2, "0")}:${minutes}`
                                        })()

                                      onSuggestionSelect({
                                        title: exp.title,
                                        location: exp.city,
                                        time: time,
                                      })

                                      const itineraryItem = {
                                        id: exp.id,
                                        title: exp.title,
                                        duration: exp.duration,
                                        price: exp.price,
                                        city: exp.city,
                                        category: exp.category,
                                        time: time,
                                      }

                                      addToItinerary(itineraryItem)

                                      setMessages((prev) => [
                                        ...prev,
                                        {
                                          id: Date.now().toString(),
                                          content: `I've added "${exp.title}" to your schedule at ${time}.`,
                                          role: "assistant",
                                        },
                                      ])
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for activity suggestions..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>
      <ExperienceDetailModal
        open={selectedExperience !== null}
        onOpenChange={(open) => !open && setSelectedExperience(null)}
        experience={selectedExperience}
      />
    </div>
  )
}

