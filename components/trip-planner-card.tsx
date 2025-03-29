"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { cities } from "./city-selector"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface TripPlanningCardProps {
    onPlanCreated: (plan: {
        city: string
        people: number
        startDate: Date
        endDate: Date
        budget: number
    }) => void
    onFormValidityChange?: (isValid: boolean) => void
    onSubmissionStatusChange?: (isSubmitted: boolean) => void
}

// Interface for the API response
interface TripRequirementsResponse {
    status: string;
    session_id: string;
    message?: string;
}

export default function TripPlanningCard({
    onPlanCreated,
    onFormValidityChange,
    onSubmissionStatusChange
}: TripPlanningCardProps) {
    const [city, setCity] = useState<string>("")
    const [people, setPeople] = useState<number>(2)
    const [budget, setBudget] = useState<number>(1000)
    const [date, setDate] = useState<{
        from: Date
        to?: Date
    }>({
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 7)),
    })
    const [error, setError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formIsValid, setFormIsValid] = useState(false)

    // Check form validity whenever inputs change
    useEffect(() => {
        const isValid = Boolean(
            city &&
            people &&
            people > 0 &&
            date.from &&
            date.to
        );

        setFormIsValid(isValid);

        // Notify parent component about form validity
        if (onFormValidityChange) {
            onFormValidityChange(isValid);
        }
    }, [city, people, date, onFormValidityChange]);

    // Notify parent about submission status changes
    useEffect(() => {
        if (onSubmissionStatusChange) {
            onSubmissionStatusChange(submitted);
        }
    }, [submitted, onSubmissionStatusChange]);

    const handleSubmit = async () => {
        console.log("Form submission - validating inputs:");
        console.log("City:", city);
        console.log("People:", people);
        console.log("Dates:", date);
        console.log("Budget:", budget);

        // Clear previous error
        setError(null);

        // Validate required fields
        if (!city) {
            console.log("Validation failed: No city selected");
            setError("Please select a destination");
            return;
        }

        if (!people || people < 1) {
            console.log("Validation failed: Invalid number of people");
            setError("Please enter a valid number of people");
            return;
        }

        if (!date.from || !date.to) {
            console.log("Validation failed: Missing travel dates");
            setError("Please select your travel dates");
            return;
        }

        // Always ensure there's an end date
        const endDate = date.to || new Date(new Date().setDate(date.from.getDate() + 7));

        // Calculate number of days for the trip
        const days = Math.ceil((endDate.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24));

        console.log("Validation passed, preparing API call");

        // Set loading and submitted states
        setLoading(true);
        setSubmitted(true);

        // Prepare plan data for the UI callback
        const planData = {
            city: city,
            people,
            startDate: date.from,
            endDate: endDate,
            budget,
        };

        try {
            // Format dates for API
            const formattedStartDate = date.from.toISOString().split('T')[0]; // YYYY-MM-DD
            const formattedEndDate = endDate.toISOString().split('T')[0]; // YYYY-MM-DD

            // Prepare API payload
            const apiPayload = {
                city: city,
                days: days,
                starting_date: formattedStartDate,
                end_date: formattedEndDate,
                budget: budget
            };

            console.log("Calling real API with payload:", apiPayload);

            // Call the real API
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
            const response = await fetch(`${apiUrl}/api/py/post-trip-requirements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiPayload),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const responseData: TripRequirementsResponse = await response.json();
            console.log("API response:", responseData);

            // Check if the status is success
            if (responseData.status === "success") {
                // Save session ID to localStorage
                if (responseData.session_id) {
                    console.log("Saving session ID to localStorage:", responseData.session_id);
                    localStorage.setItem('chatSessionId', responseData.session_id);
                }

                // Call the onPlanCreated callback
                console.log("Calling onPlanCreated with:", planData);
                onPlanCreated(planData);
            } else {
                // Show error message from API if available
                const errorMessage = responseData.message || "Failed to submit your plan. Please try again.";
                console.error("API returned error status:", errorMessage);
                setError(errorMessage);
                setSubmitted(false);
            }
        } catch (error) {
            console.error("API call failed:", error);
            setError("Failed to submit your plan. Please try again.");
            setSubmitted(false);
        } finally {
            setLoading(false);
            console.log("Form submission completed");
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Plan Your Trip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="city">Destination</Label>
                    <Select value={city} onValueChange={(value) => {
                        setCity(value)
                        setError(null)
                    }}>
                        <SelectTrigger id="city" className={cn(error && !city ? "border-red-500" : "")}>
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
                    {error && !city && <p className="text-xs text-red-500 mt-1">Please select a destination</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="people">Number of People</Label>
                    <Input
                        id="people"
                        type="number"
                        min={1}
                        max={10}
                        value={people}
                        onChange={(e) => setPeople(Number.parseInt(e.target.value) || 1)}
                    />
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
                                onSelect={(newDate) => {
                                    setDate(newDate as { from: Date; to?: Date })
                                    setError(null)
                                }}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="budget">Budget</Label>
                        <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{budget}</span>
                        </div>
                    </div>
                    <Slider
                        id="budget"
                        min={100}
                        max={5000}
                        step={100}
                        value={[budget]}
                        onValueChange={(value) => setBudget(value[0])}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={submitted || loading || !formIsValid}
                >
                    {loading ? "Processing..." : submitted ? "Submitted" : "Submit"}
                </Button>
            </CardFooter>
        </Card>
    )
}
