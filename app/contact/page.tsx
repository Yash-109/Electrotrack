"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, Clock, MapPin, MessageSquare, Facebook, Instagram, Twitter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { log } from "@/lib/logger"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you as soon as possible.",
        })
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      } else {
        toast({
          title: "Failed to send message",
          description: data.error || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      log.error('Contact form error', error, 'ContactForm')
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-white py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            Get in touch with us for any questions, support, or electronics consultation. We&apos;re here to help you find
            the perfect solution.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Phone Number */}
                <div>
                  <div className="flex items-center mb-3">
                    <Phone className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold">Phone Number</h3>
                  </div>
                  <p className="text-gray-600 ml-7">+91 95108 86281</p>
                  <p className="text-sm text-gray-500 ml-7">Call for immediate assistance</p>
                </div>

                {/* Email Address */}
                <div>
                  <div className="flex items-center mb-3">
                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold">Email Address</h3>
                  </div>
                  <p className="text-gray-600 ml-7">jayeshsavaliya3011@gmail.com</p>
                  <p className="text-sm text-gray-500 ml-7">We'll respond within 24 hours</p>
                </div>

                {/* Business Hours */}
                <div>
                  <div className="flex items-center mb-3">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold">Business Hours</h3>
                  </div>
                  <div className="text-gray-600 ml-7 space-y-1">
                    <p>Monday - Saturday: 9:00 AM - 8:00 PM</p>
                    <p>Sunday: 10:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gray-500">Closed on major holidays</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Follow Us */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <button
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    aria-label="Visit our Facebook page"
                  >
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    aria-label="Visit our Instagram profile"
                  >
                    <Instagram className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    aria-label="Visit our Twitter profile"
                  >
                    <Twitter className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="What&apos;s this about?"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Sending Message..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Do you provide installation services?</h3>
                  <p className="text-gray-600">
                    Yes, we provide professional installation services for all electronics. Installation charges may
                    apply depending on the product and location.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">What is your warranty policy?</h3>
                  <p className="text-gray-600">
                    All products come with manufacturer warranty. We also provide extended warranty options for most
                    items. Service support is available throughout the warranty period.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Do you offer home delivery?</h3>
                  <p className="text-gray-600">
                    Yes, we offer free home delivery within Surat city for orders above ₹5,000. Delivery charges apply
                    for smaller orders and outside city limits.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Can I get a bulk discount?</h3>
                  <p className="text-gray-600">
                    Yes, we offer special pricing for bulk orders. Please contact us directly to discuss your
                    requirements and get a customized quote.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Find Our Store with Google Maps */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Find Our Store</CardTitle>
                <p className="text-gray-600">Visit our showroom to see our complete range of electronics</p>
              </CardHeader>
              <CardContent>
                {/* Store Info */}
                <div className="bg-blue-50 rounded-xl p-6 text-center mb-6">
                  <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Radhika Electronics</h3>
                  <p className="text-gray-600 mb-4">18-gala minibazar, matavadi circle, Surat, Gujarat 394107</p>

                  <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
                    <button
                      onClick={() =>
                        window.open(
                          "https://www.google.com/maps/dir/?api=1&destination=18-gala+minibazar+matavadi+circle+Surat+Gujarat+394107",
                          "_blank",
                        )
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
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
                      className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      View on Maps
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
