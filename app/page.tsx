import { Header } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Fan, Tv, AirVent, Waves, Smartphone, Laptop } from "lucide-react"
import { Footer } from "@/components/footer"
import GetStartedButton from "@/components/get-started-button"

export default function HomePage() {
  const categories = [
    { name: "Fans", icon: Fan },
    { name: "TVs", icon: Tv },
    { name: "Air Conditioners", icon: AirVent },
    { name: "Coolers", icon: Waves },
    { name: "Mobile Phones", icon: Smartphone },
    { name: "Laptops", icon: Laptop },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to Radhika Electronics</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your trusted partner for premium electronics since years
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GetStartedButton />
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Product Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <category.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Radhika Electronics?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Quality Assurance</h3>
              <p className="text-gray-600">
                All products undergo rigorous quality checks before reaching our customers
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer First</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. We go the extra mile to ensure you're happy
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Trusted Service</h3>
              <p className="text-gray-600">Established reputation for honest business practices and reliable service</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
