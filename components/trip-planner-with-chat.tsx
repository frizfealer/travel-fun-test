"use client"

import { useState } from "react"
import TripPlanningCard from "./trip-planner-card"
import ActivityChat from "./activity-chat"

interface TripPlannerWithChatProps {
    onSuggestionSelect: (activity: { title: string; location: string; time: string }) => void
    onItineraryUpdate?: (itinerary: any) => void
    onSessionReset: () => void
}

// Mock API response interface
interface MockApiResponse {
    status: string
    session_id: string
    message?: string
}

export default function TripPlannerWithChat({
    onSuggestionSelect,
    onItineraryUpdate,
    onSessionReset,
}: TripPlannerWithChatProps) {
    // State to control visibility of components
    const [showChat, setShowChat] = useState(false)
    const [formIsValid, setFormIsValid] = useState(false)
    const [formIsSubmitted, setFormIsSubmitted] = useState(false)

    // Function to add activities to itinerary
    const addToItinerary = (experience: {
        id: string
        title: string
        duration: string
        price: number
        city: string
        category: string
        time: string
    }) => {
        console.log("Adding to itinerary:", experience)
        // In a real app, this would update some state or context
    }

    // Mock API call function
    const mockApiCall = async (planData: any): Promise<MockApiResponse> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check if required fields are present
        if (!planData.city || !planData.people || !planData.startDate || !planData.endDate) {
            return {
                status: "error",
                session_id: "",
                message: "Missing required fields"
            }
        }

        // Calculate days
        const days = Math.ceil(
            (planData.endDate.getTime() - planData.startDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Simulate successful response
        return {
            status: "success",
            session_id: `session-${Date.now()}`,
            message: `Successfully created trip plan for ${planData.city} with ${planData.people} people for ${days} days`
        }
    }

    // Handle plan creation and form submission
    const handlePlanCreated = async (planData: {
        city: string
        people: number
        startDate: Date
        endDate: Date
        budget: number
    }) => {
        console.log("Plan created with data:", planData)

        // Calculate days
        const days = Math.ceil(
            (planData.endDate.getTime() - planData.startDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Validate required fields
        if (!planData.city || !planData.people || days <= 0) {
            console.error("Missing required fields")
            return
        }

        try {
            // Call mock API
            const response = await mockApiCall(planData)
            console.log("API response:", response)

            if (response.status === "success") {
                // Save session ID to localStorage (similar to the real implementation)
                if (response.session_id) {
                    localStorage.setItem('chatSessionId', response.session_id)
                }

                // Show chat and hide planner
                setShowChat(true)
            } else {
                // Handle error (in a real app, you might show an error message)
                console.error("API error:", response.message)
            }
        } catch (error) {
            console.error("Error calling API:", error)
        }
    }

    // Track form validity changes
    const handleFormValidityChange = (isValid: boolean) => {
        console.log("Form validity changed:", isValid)
        setFormIsValid(isValid)
    }

    // Track form submission status
    const handleSubmissionStatusChange = (isSubmitted: boolean) => {
        console.log("Form submission status changed:", isSubmitted)
        setFormIsSubmitted(isSubmitted)
    }

    // Reset the component state
    const handleReset = () => {
        setShowChat(false)
        setFormIsValid(false)
        setFormIsSubmitted(false)
        onSessionReset()
    }

    return (
        <div className="space-y-4">
            {/* Show trip planner card when chat is not visible */}
            {!showChat && (
                <TripPlanningCard
                    onPlanCreated={handlePlanCreated}
                    onFormValidityChange={handleFormValidityChange}
                    onSubmissionStatusChange={handleSubmissionStatusChange}
                />
            )}

            {/* Show chat when it should be visible */}
            {showChat && (
                <div className="space-y-4">
                    <ActivityChat
                        onSuggestionSelect={onSuggestionSelect}
                        addToItinerary={addToItinerary}
                        onItineraryUpdate={onItineraryUpdate}
                    />

                    <div className="flex justify-end">
                        <button
                            onClick={handleReset}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Start a new trip plan
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
