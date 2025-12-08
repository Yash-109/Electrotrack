"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { log } from "@/lib/logger"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, Edit, Save, X, Package, Trash2, Plus } from "lucide-react"
import { userAuth } from "@/lib/user-auth"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OrderTracking } from "@/components/order-tracking"

interface User {
  _id?: string
  name: string
  email: string
  phone?: string
  image?: string
  picture?: string
  provider?: string
  address?: string
  businessType?: string
  shippingAddresses?: Address[]
}

interface Order {
  _id: string
  orderId: string
  status: string
  total: number
  createdAt: string
  items: any[]
}

interface Address {
  id?: string
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  type?: 'home' | 'office' | 'other'
  isDefault?: boolean
}

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<Partial<User>>({})
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home',
    isDefault: false
  })
  const router = useRouter()
  const { toast } = useToast()

  // Fetch user profile data from API
  const fetchUserProfile = useCallback(async (userEmail: string) => {
    try {
      const response = await fetch(`/api/user/profile?userId=${encodeURIComponent(userEmail)}`)
      const data = await response.json()

      if (data.success) {
        setAddresses(data.user.shippingAddresses || [])
        return data.user
      }
    } catch (error) {
      log.error('Failed to fetch user profile', error, 'ProfilePage')
    }
    return null
  }, [])

  // Fetch user orders from API
  const fetchUserOrders = useCallback(async (userEmail: string) => {
    try {
      const response = await fetch(`/api/orders?userEmail=${encodeURIComponent(userEmail)}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      log.error('Failed to fetch user orders', error, 'ProfilePage')
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      if (!userAuth.isLoggedIn()) {
        router.push("/login")
        return
      }

      const user = userAuth.getCurrentUser()
      setCurrentUser(user)
      if (user) {
        setEditedUser(user)
      }

      if (user && user.email) {
        // Fetch profile and orders from API
        const profileData = await fetchUserProfile(user.email)
        if (profileData) {
          const updatedUser = { ...user, ...profileData }
          setCurrentUser(updatedUser)
          setEditedUser(updatedUser)
        }

        await fetchUserOrders(user.email)
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSaveProfile = async () => {
    if (!currentUser) return

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.email,
          action: 'update_profile',
          data: {
            name: editedUser.name,
            businessType: editedUser.businessType,
            phone: editedUser.phone
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update localStorage as well
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const userIndex = users.findIndex((u: User) => u.email === currentUser.email)

        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...editedUser }
          localStorage.setItem("users", JSON.stringify(users))
          localStorage.setItem("currentUser", JSON.stringify(users[userIndex]))
        }

        setCurrentUser(editedUser as User)
        setIsEditing(false)

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    if (currentUser) {
      setEditedUser(currentUser)
    }
    setIsEditing(false)
  }

  const handleAddAddress = async () => {
    if (!currentUser) return

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.email,
          action: 'add_address',
          data: newAddress
        })
      })

      const data = await response.json()

      if (data.success) {
        setAddresses([...addresses, data.address])
        setNewAddress({
          fullName: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          type: 'Home',
          isDefault: false
        })
        setIsAddingAddress(false)

        toast({
          title: "Address added",
          description: "Your delivery address has been added successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add address. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser) return

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.email,
          action: 'delete_address',
          data: { addressId }
        })
      })

      const data = await response.json()

      if (data.success) {
        setAddresses(addresses.filter(addr => addr.id !== addressId))

        toast({
          title: "Address deleted",
          description: "The delivery address has been removed.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete address. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser.picture || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {currentUser.name?.charAt(0)?.toUpperCase() || currentUser.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{currentUser.name || "User"}</CardTitle>
                  <CardDescription className="text-lg">{currentUser.email}</CardDescription>
                  {currentUser.provider && (
                    <Badge variant="outline" className="mt-2">
                      Signed in via {currentUser.provider === "google" ? "Google" : currentUser.provider}
                    </Badge>
                  )}
                </div>
                <Button
                  variant={isEditing ? "destructive" : "outline"}
                  onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                >
                  {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your personal details and contact information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editedUser.name || ""}
                          onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{currentUser.name || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{currentUser.email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editedUser.phone || ""}
                          onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{currentUser.phone || "Not provided"}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={editedUser.address || ""}
                          onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                          placeholder="Enter your address"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{currentUser.address || "Not provided"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Order History Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History & Tracking</CardTitle>
                  <CardDescription>Track your orders and view detailed order information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderTracking
                    orders={orders}
                    onRefresh={() => fetchUserOrders(currentUser.email)}
                    currentUserEmail={currentUser.email}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Delivery Addresses</CardTitle>
                      <CardDescription>Manage your delivery addresses for faster checkout.</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddingAddress(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isAddingAddress && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-medium mb-4">Add New Address</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                            placeholder="Enter full address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            placeholder="Enter state"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            placeholder="Enter pincode"
                          />
                        </div>
                        <div>
                          <Label htmlFor="type">Address Type</Label>
                          <select
                            id="type"
                            className="w-full p-2 border rounded"
                            value={newAddress.type}
                            onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        />
                        <Label htmlFor="isDefault">Set as default address</Label>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button onClick={handleAddAddress}>Save Address</Button>
                        <Button variant="outline" onClick={() => setIsAddingAddress(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {addresses.length > 0 ? (
                      addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant={address.isDefault ? "default" : "outline"}>
                                  {address.type || 'Home'}
                                </Badge>
                                {address.isDefault && <Badge variant="secondary">Default</Badge>}
                              </div>
                              <p className="font-medium">{address.fullName}</p>
                              <p className="text-sm text-gray-600">{address.address}</p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-sm text-gray-600">{address.phone}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => address.id && handleDeleteAddress(address.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No addresses found</p>
                        <p className="text-sm text-gray-400">Add a delivery address for faster checkout</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}
