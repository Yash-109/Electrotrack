"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Mail, MapPin, Users, Award, Star, CheckCircle } from "lucide-react"
import { Clock } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 rounded-b-3xl mx-4 mt-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Radhika Electronics</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your trusted partner for premium electronics in Surat. We've been serving customers with quality products
            and exceptional service since our establishment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-blue-500 px-4 py-2 rounded-full text-sm font-medium">Trusted Brand</span>
            <span className="bg-blue-500 px-4 py-2 rounded-full text-sm font-medium">Quality Products</span>
            <span className="bg-blue-500 px-4 py-2 rounded-full text-sm font-medium">Expert Service</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Meet Our Founder */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">JS</span>
                </div>
                <h2 className="text-2xl font-bold text-blue-600 mb-2">Jayeshbhai Savaliya</h2>
                <p className="text-gray-600 mb-4">Founder & Owner</p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                With over 15 years of experience in the electronics industry, Jayeshbhai has built Radhika Electronics
                from the ground up, focusing on customer satisfaction and quality products. His vision is to make
                premium electronics accessible to every household.
              </p>
            </CardContent>
          </Card>

          {/* Our Location */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Our Location</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Store Address</h3>
                  <p className="text-gray-600">18-gala minibazar, matavadi circle</p>
                  <p className="text-gray-600">Surat, Gujarat 394107</p>
                  <p className="text-gray-600">India</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">+91 95108 86281</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">jayeshsavaliya3011@gmail.com</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Business Hours</h3>
                  <p className="text-gray-600">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                  <p className="text-gray-600">Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Our Achievements */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-600 mb-2">5000+</div>
                <p className="text-gray-600">Happy Customers</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
                <p className="text-gray-600">Years Experience</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-600 mb-2">4.8/5</div>
                <p className="text-gray-600">Customer Rating</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-600 mb-2">99%</div>
                <p className="text-gray-600">Customer Satisfaction</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Our Story</h2>
          <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
            <p>
              Radhika Electronics was founded with a simple mission: to provide high-quality electronics at competitive
              prices with exceptional customer service. What started as a small shop has grown into one of Surat's most
              trusted electronics retailers.
            </p>
            <p>
              We specialize in a comprehensive range of electronics including fans, air conditioners, televisions, and
              cooling appliances. Our commitment to quality means we only stock products from reputable brands that meet
              our stringent quality standards.
            </p>
            <p>
              Over the years, we've built lasting relationships with our customers by providing honest advice,
              competitive pricing, and reliable after-sales service. Our team of experienced professionals is always
              ready to help you find the perfect electronic solution for your needs.
            </p>
          </div>
        </section>

        {/* Our Services */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,7H18V6A2,2 0 0,0 16,4H8A2,2 0 0,0 6,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M8,6H16V7H8V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H18V19Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Free Delivery</h3>
                <p className="text-gray-600 text-sm">Free delivery within Surat city for orders above ₹5,000</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.71,8.71C20.25,7.25 18.16,6.33 15.97,6.33C13.78,6.33 11.69,7.25 10.23,8.71L9.69,9.25L10.23,9.79C11.69,11.25 13.78,12.17 15.97,12.17C18.16,12.17 20.25,11.25 21.71,9.79L22.25,9.25L21.71,8.71Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Installation Service</h3>
                <p className="text-gray-600 text-sm">Professional installation by certified technicians</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Warranty Support</h3>
                <p className="text-gray-600 text-sm">Comprehensive warranty support for all products</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">Round-the-clock customer support for your queries</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Find Our Store with Google Maps */}
        <section className="bg-blue-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">Find Our Store</h2>
          <p className="text-gray-600 mb-8 text-center">Visit our showroom to see our complete range of electronics</p>

          <div className="max-w-2xl mx-auto">
            {/* Store Information */}
            <div className="bg-white rounded-xl p-6">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Radhika Electronics</h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Address</p>
                    <p className="text-gray-600">18-gala minibazar, matavadi circle</p>
                    <p className="text-gray-600">Surat, Gujarat 394107, India</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Phone</p>
                    <p className="text-gray-600">+91 95108 86281</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Business Hours</p>
                    <p className="text-gray-600">Mon-Sat: 9:00 AM - 8:00 PM</p>
                    <p className="text-gray-600">Sunday: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() =>
                    window.open(
                      "https://www.google.com/maps/dir/?api=1&destination=18-gala+minibazar+matavadi+circle+Surat+Gujarat+394107",
                      "_blank",
                    )
                  }
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </button>

                <button
                  onClick={() =>
                    window.open(
                      "https://www.google.com/maps/place/18-gala+minibazar+matavadi+circle+Surat+Gujarat+394107",
                      "_blank",
                    )
                  }
                  className="flex-1 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  View on Google Maps
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
