"use client"

import TripPlannerWithChat from "../../components/trip-planner-with-chat"
import { ItineraryProvider } from "@/contexts/ItineraryContext"

export default function TripPlannerPage() {
    // Handle suggestion selection
    const handleSuggestionSelect = (activity: { title: string; location: string; time: string }) => {
        console.log("Activity selected:", activity)
    }

    // Handle itinerary updates
    const handleItineraryUpdate = (itinerary: any) => {
        console.log("Itinerary updated:", itinerary)
    }

    return (
        <main className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Trip Planner</h1>
            <div className="max-w-3xl mx-auto">
                <ItineraryProvider>
                    <TripPlannerWithChat
                        onSuggestionSelect={handleSuggestionSelect}
                        onItineraryUpdate={handleItineraryUpdate}
                        onSessionReset={() => {
                            console.log("Resetting itinerary state in TripPlannerPage");
                            // No additional reset needed here since we don't maintain state at this level
                        }}
                    />
                </ItineraryProvider>
            </div>
        </main>
    )
}
