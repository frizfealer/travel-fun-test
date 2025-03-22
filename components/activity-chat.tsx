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
  onItineraryUpdate?: (itinerary: {
    days: Array<{
      Day: number
      "day-description": string
      "day-itinerary": Array<{
        time: string
        title: string
        type: string
      }>
    }>
  }) => void
}

// Add this interface for the API response
interface ConversationResponse {
  response: string;
  users_itinerary_details: any[];
  itinerary: {
    days: Array<{
      Day: number
      "day-description": string
      "day-itinerary": Array<{
        time: string
        title: string
        type: string
      }>
    }>
  };
  session_id: string;
}

// Make sure to use the addToItinerary prop in the component
export default function ActivityChat({ onSuggestionSelect, addToItinerary, onItineraryUpdate }: ActivityChatProps) {
  const [input, setInput] = useState("")
  // Initialize with a default welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-default",
      content: "Welcome to Travel Fun! I'm your travel assistant. How can I help you plan your next adventure?",
      role: "assistant",
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<null | HTMLDivElement>(null)
  const [initialized, setInitialized] = useState(false) // Flag to track if initialization happened

  // Helper function to scroll to the bottom of the chat
  const scrollToBottom = (forceScroll = false) => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        // Get the exact scroll height
        const scrollHeight = scrollElement.scrollHeight;
        const clientHeight = scrollElement.clientHeight;
        const currentScrollTop = scrollElement.scrollTop;

        // Only auto-scroll if the user is already near the bottom (within 100px)
        // or if forceScroll is true
        const isNearBottom = scrollHeight - (currentScrollTop + clientHeight) < 100;

        if (isNearBottom || forceScroll) {
          // Scroll to bottom of the chat area only
          scrollElement.scrollTop = scrollHeight;
        }
      }
    }
  };

  // Add debugging for localStorage initialization
  console.log("Component rendering - checking localStorage");
  const storedSessionId = typeof window !== 'undefined' ? localStorage.getItem('chatSessionId') : null;
  console.log("Stored session ID:", storedSessionId);

  const [sessionId, setSessionId] = useState<string | null>(null); // Initialize as null to ensure initialization happens

  // Function to clear session and get a new one
  const clearSession = () => {
    console.log("Clearing session ID from localStorage");
    localStorage.removeItem('chatSessionId');
    setSessionId(null);
    setMessages([]);
    setInitialized(false);
    initializeConversation();
  };

  const [selectedExperience, setSelectedExperience] = useState<{
    title: string
    category: string
    duration: string
    price: number
    city: string
    imageType: string
  } | null>(null)

  // Check localStorage on first mount and set sessionId if exists
  useEffect(() => {
    console.log("First useEffect - Checking localStorage for existing session");
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('chatSessionId');
      console.log("Found stored sessionId:", storedId);
      if (storedId) {
        setSessionId(storedId);
      }
    }
  }, []);

  // Save sessionId to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      console.log("Saving sessionId to localStorage:", sessionId);
      localStorage.setItem('chatSessionId', sessionId);
    }
  }, [sessionId]);

  // Ensure initialization happens exactly once
  useEffect(() => {
    if (initialized) {
      console.log("Already initialized, skipping");
      return;
    }

    console.log("Running one-time initialization check");

    // If we already have messages, we don't need to initialize
    if (messages.length > 0) {
      console.log("Messages already exist, marking as initialized");
      setInitialized(true);
      return;
    }

    // If we have a session ID but no messages, we should initialize
    if (!sessionId && !initialized) {
      console.log("No session ID and not initialized, triggering initialization");
      initializeConversation();
      setInitialized(true);
    }
  }, [messages.length, sessionId, initialized]);

  // Function to initialize conversation - moved outside the useEffect for reusability
  const initializeConversation = async () => {
    console.log("Running initializeConversation");
    setIsLoading(true);
    try {
      console.log("Making API request to initialize conversation");

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
      console.log(`Making request to API: ${apiUrl}`);

      const response = await fetch(`${apiUrl}/api/py/itinerary-details-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: null
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to initialize conversation: ${response.status} ${response.statusText}`);
      }

      const data: ConversationResponse = await response.json();
      console.log("Received initialization response from API:", data);
      console.log("New session ID:", data.session_id);

      // Save the session ID
      setSessionId(data.session_id);

      // Handle itinerary data if available
      if (data.itinerary && data.itinerary.days && data.itinerary.days.length > 0 && onItineraryUpdate) {
        onItineraryUpdate(data.itinerary);
      }

      // Replace the default welcome message with the API response
      setMessages([
        {
          id: "welcome",
          content: data.response,
          role: "assistant",
        },
      ]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      // Keep the default welcome message we already set
      // No need to set a new message as we already have a default one
    } finally {
      setIsLoading(false);
    }
  };

  // Function to force send a welcome message (for testing)
  const forceWelcomeMessage = () => {
    setMessages([
      {
        id: "welcome-forced",
        content: "Welcome to Travel Fun! I'm your travel assistant. How can I help you plan your next adventure?",
        role: "assistant",
      },
    ]);
  };

  // Simplified scroll logic - just check for DOM changes
  useEffect(() => {
    if (!scrollAreaRef.current) return;

    // Set up a MutationObserver to detect content changes (images loading, etc.)
    const observer = new MutationObserver(() => scrollToBottom());

    observer.observe(scrollAreaRef.current, {
      childList: true,
      subtree: true
    });

    // Clean up observer on unmount
    return () => observer.disconnect();
  }, []);

  // Handle scrolling when messages change - this is important for UI
  useEffect(() => {
    // When messages are added or change, scroll (forcefully for new messages)
    // For user messages and initial assistant messages
    const forceScroll = messages.length > 0 &&
      (messages[messages.length - 1].role === "user" || messages.length === 1);

    setTimeout(() => scrollToBottom(forceScroll), 0);
  }, [messages]);

  // Handle scrolling when loading state changes
  useEffect(() => {
    // When loading finishes, force scroll to show the assistant's new message
    if (!isLoading) {
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [isLoading]);

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

  // Update the handleSend function to use the conversation API
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

    // Force scroll is handled by the useEffect watching messages

    try {
      // Only send the current message, not the full history
      // The backend should maintain the conversation state using the session_id
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${apiUrl}/api/py/itinerary-details-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
          session_id: sessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // For specific error handling for session issues
        if (response.status === 401 || response.status === 403) {
          console.warn('Session expired or invalid, attempting to recover...');
          // Try to recover the session by re-initializing
          await initializeConversation();
          // Now try again with the new session ID
          const retryResponse = await fetch(`${apiUrl}/api/py/itinerary-details-conversation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: input }],
              session_id: sessionId,
            }),
          });

          if (!retryResponse.ok) {
            throw new Error(`Retry failed: ${retryResponse.status} ${retryResponse.statusText}`);
          }

          const retryData: ConversationResponse = await retryResponse.json();
          // Update session ID from the backend
          setSessionId(retryData.session_id);

          // Handle itinerary data if available
          if (retryData.itinerary && retryData.itinerary.days && retryData.itinerary.days.length > 0 && onItineraryUpdate) {
            onItineraryUpdate(retryData.itinerary);
          }

          // Add the response from the assistant
          const assistantMessage: Message = {
            id: Date.now().toString(),
            content: retryData.response,
            role: "assistant",
          };

          setMessages((prev) => [...prev, assistantMessage]);
          return;
        }

        throw new Error(`Failed to get response from conversation API: ${response.status} ${response.statusText}`);
      }

      const data: ConversationResponse = await response.json();
      console.log("Received API response with session ID:", data.session_id);

      // Check if we received a different session ID than what we sent
      if (sessionId && data.session_id !== sessionId) {
        console.warn("Backend returned a new session ID. Previous session may have expired.");
      }

      // Update session ID from the backend
      setSessionId(data.session_id);

      // Handle itinerary data if available
      if (data.itinerary && data.itinerary.days && data.itinerary.days.length > 0 && onItineraryUpdate) {
        onItineraryUpdate(data.itinerary);
      }

      // Add the response from the assistant
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: "assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in conversation:', error);
      // Fallback message if API fails
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        role: "assistant",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
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

  // Add this effect to detect if the app has been inactive/hidden and needs to verify session when returning
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && sessionId) {
        console.log('App became visible, verifying session...');
        verifySession();
      }
    };

    // Listen for visibility changes (tab switching, etc.)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId]);

  // Function to verify if the current session is still valid
  const verifySession = async () => {
    if (!sessionId) return;

    try {
      console.log('Verifying session validity...');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';

      const response = await fetch(`${apiUrl}/api/py/itinerary-details-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: "system", content: "verify_session" }],
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        console.log('Session verification failed, reinitializing...');
        // Reinitialize if verification failed
        clearSession();
        return;
      }

      const data = await response.json();

      // If we get a different session ID back, update ours
      if (data.session_id !== sessionId) {
        console.log('Session ID changed during verification, updating...');
        setSessionId(data.session_id);
      } else {
        console.log('Session verified successfully');
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      // Don't clear session on network errors to avoid disrupting the user experience
    }
  };

  // Update the JSX to render experience cards in chat messages
  return (
    <div className="border rounded-lg overflow-hidden flex flex-col h-[600px]">
      <div className="bg-primary p-3 flex justify-between items-center">
        <h3 className="text-primary-foreground font-medium">Travel Assistant</h3>
        <div className="flex gap-2">
          {messages.length === 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={forceWelcomeMessage}
              className="text-xs"
            >
              Debug: Show Welcome
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={clearSession}
            className="text-xs"
          >
            New Conversation
          </Button>
        </div>
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

                          // Add back explicit force scroll as this is a direct user action
                          setTimeout(() => scrollToBottom(true), 0);
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

                                      // Add back explicit force scroll as this is a direct user action
                                      setTimeout(() => scrollToBottom(true), 0);
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

