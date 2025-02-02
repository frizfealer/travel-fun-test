import Link from "next/link"
import { useItinerary } from "@/contexts/ItineraryContext"
interface NavigationProps {
  activeTab: "explore" | "schedule"
}

export default function Navigation({ activeTab }: NavigationProps) {
  const { itinerary } = useItinerary()

  return (
    <div className="flex space-x-2 mb-6">
      <Link
        href="/"
        className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          activeTab === "explore"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        Explore
      </Link>
      <Link
        href="/schedule"
        className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          activeTab === "schedule"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        Schedule Assistant
        {itinerary.length > 0 && (
          <span className="ml-2 inline-flex items-center justify-center bg-secondary text-secondary-foreground rounded-full h-5 w-5 text-xs">
            {itinerary.length}
          </span>
        )}
      </Link>
    </div>
  )
}

