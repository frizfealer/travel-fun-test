"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddExperienceCardProps {
  time: string
  onClick: () => void
}

export default function AddExperienceCard({ time, onClick }: AddExperienceCardProps) {
  return (
    <div className="relative pl-8 group">
      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-background bg-secondary group-hover:bg-primary transition-colors"></div>
      <Button
        variant="outline"
        className="w-full h-24 border-dashed flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
        onClick={onClick}
      >
        <Plus className="h-6 w-6" />
        <span className="text-sm text-muted-foreground">Add experience at {time}</span>
      </Button>
    </div>
  )
}

