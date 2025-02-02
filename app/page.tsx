import TravelFun from "@/components/travel-fun"
import Navigation from "@/components/navigation"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Travel Fun</h1>
      <Navigation activeTab="explore" />
      <TravelFun />
    </main>
  )
}

