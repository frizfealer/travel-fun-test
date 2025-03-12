"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { cities } from "./city-selector"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TravelPlanningCardProps {
  onPlanCreated: (plan: {
    city: string
    people: number
    startDate: Date
    endDate: Date
  }) => void
}

export default function TravelPlanningCard({ onPlanCreated }: TravelPlanningCardProps) {
  const [city, setCity] = useState<string>("")
  const [people, setPeople] = useState<number>(2)
  const [date, setDate] = useState<{
    from: Date
    to?: Date
  }>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  })

  const handleSubmit = () => {
    if (city && date.from && date.to) {
      onPlanCreated({
        city,
        people,
        startDate: date.from,
        endDate: date.to,
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Plan Your Trip</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="city">Destination</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger id="city">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="people">Number of People</Label>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Input
              id="people"
              type="number"
              min={1}
              max={10}
              value={people}
              onChange={(e) => setPeople(Number.parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Travel Dates</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(newDate) => setDate(newDate as { from: Date; to?: Date })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Create Travel Plan
        </Button>
      </CardFooter>
    </Card>
  )
}

