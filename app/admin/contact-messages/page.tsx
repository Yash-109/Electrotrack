"use client"

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin-header'
import { AdminRouteGuard } from '@/components/admin-route-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
    Mail,
    Phone,
    Calendar,
    User,
    MessageSquare,
    Filter,
    Search,
    MoreVertical,
    ExternalLink,
    Reply
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface ContactMessage {
    _id: string
    fullName: string
    email: string
    phone?: string
    subject: string
    message: string
    status: 'read' | 'unread'
    createdAt: string
    ipAddress?: string
    userAgent?: string
}

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
    const [stats, setStats] = useState({ total: 0, unread: 0 })
    const { toast } = useToast()

    // Fetch contact messages
    const fetchMessages = async () => {
        try {
            setLoading(true)
            const url = new URL('/api/contact', window.location.origin)
            if (filter !== 'all') {
                url.searchParams.set('status', filter)
            }

            const response = await fetch(url.toString())
            const data = await response.json()

            if (data.success) {
                setMessages(data.messages)
                setStats({
                    total: data.pagination.total,
                    unread: data.pagination.unread
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load contact messages",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
            toast({
                title: "Error",
                description: "Failed to load contact messages",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    // Mark message as read
    const markAsRead = async (messageId: string) => {
        try {
            const response = await fetch(`/api/contact/${messageId}/read`, {
                method: 'PATCH'
            })

            if (response.ok) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg._id === messageId
                            ? { ...msg, status: 'read' as const }
                            : msg
                    )
                )
                setStats(prev => ({ ...prev, unread: prev.unread - 1 }))
            }
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    // Filter messages based on search term
    const filteredMessages = messages.filter(message =>
        message.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        fetchMessages()
    }, [filter])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    const handleReplyClick = (message: ContactMessage) => {
        const emailBody = `Hi ${message.fullName},\n\nThank you for contacting Radhika Electronics regarding "${message.subject}".\n\n\n\nBest regards,\nRadhika Electronics Team`
        const mailtoUrl = `mailto:${message.email}?subject=Re: ${message.subject}&body=${encodeURIComponent(emailBody)}`
        window.open(mailtoUrl, '_blank')
    }

    return (
        <AdminRouteGuard>
            <div className="min-h-screen bg-gray-50">
                <AdminHeader />

                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages</h1>
                        <p className="text-gray-600">Manage customer inquiries and support requests</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Messages</p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                                    </div>
                                    <MessageSquare className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                                        <p className="text-3xl font-bold text-red-600">{stats.unread}</p>
                                    </div>
                                    <Mail className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Response Rate</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {stats.total > 0 ? Math.round(((stats.total - stats.unread) / stats.total) * 100) : 0}%
                                        </p>
                                    </div>
                                    <Reply className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search messages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Messages</SelectItem>
                                <SelectItem value="unread">Unread Only</SelectItem>
                                <SelectItem value="read">Read Only</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={fetchMessages} variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading messages...</p>
                                </CardContent>
                            </Card>
                        ) : filteredMessages.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                                    <p className="text-gray-600">
                                        {searchTerm ? 'Try adjusting your search terms.' : 'No contact messages yet.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredMessages.map((message) => (
                                <Card key={message._id} className={`hover:shadow-md transition-shadow ${message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                                                    <Badge variant={message.status === 'unread' ? 'destructive' : 'secondary'}>
                                                        {message.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <User className="h-4 w-4 mr-2" />
                                                        {message.fullName}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        {message.email}
                                                    </div>
                                                    {message.phone && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Phone className="h-4 w-4 mr-2" />
                                                            {message.phone}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {formatDate(message.createdAt)}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                    <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleReplyClick(message)}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Reply className="h-4 w-4 mr-2" />
                                                        Reply via Email
                                                    </Button>

                                                    {message.status === 'unread' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => markAsRead(message._id)}
                                                        >
                                                            Mark as Read
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleReplyClick(message)}>
                                                        <Reply className="h-4 w-4 mr-2" />
                                                        Reply
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.open(`mailto:${message.email}`)}>
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        Open Email Client
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminRouteGuard>
    )
}
