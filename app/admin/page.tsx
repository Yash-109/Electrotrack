"use client"

import { AdminRouteGuard } from "@/components/admin-route-guard"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, CreditCard, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useTransactionStore } from "@/lib/transaction-store"
import { adminAuth } from "@/lib/admin-auth"
import { useMemo } from "react"

export default function AdminDashboard() {
  const { transactions, getStats } = useTransactionStore()
  const currentUser = adminAuth.getCurrentUser()

  // Memoize stats to prevent unnecessary recalculations
  const stats = useMemo(() => getStats(), [getStats])

  // Ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  const quickStats = useMemo(() => [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Expenses",
      value: `₹${stats.totalExpenses.toLocaleString()}`,
      change: "+8.2%",
      changeType: "negative" as const,
      icon: CreditCard,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Net Profit",
      value: `₹${stats.netProfit.toLocaleString()}`,
      change: "+15.3%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Transactions",
      value: safeTransactions.length.toString(),
      change: "+23",
      changeType: "positive" as const,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ], [stats.totalRevenue, stats.totalExpenses, stats.netProfit, safeTransactions.length])

  const recentTransactions = useMemo(() => safeTransactions
    .filter(transaction =>
      transaction &&
      typeof transaction === 'object' &&
      transaction.id &&
      transaction.date &&
      transaction.description &&
      typeof transaction.amount === 'number'
    ) // Filter out invalid transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5), [safeTransactions])

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser?.name}!</h1>
            <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your business today.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={`stat-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      {stat.change && (
                        <div className="flex items-center mt-2">
                          {stat.changeType === "positive" ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`text-sm font-medium ml-1 ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                              }`}
                          >
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">from last month</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest financial activities</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/transactions">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction, index) => (
                        <div key={`transaction-${transaction.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                                }`}
                            >
                              {transaction.type === "income" ? (
                                <TrendingUp
                                  className={`h-4 w-4 ${transaction.type === "income" ? "text-green-600" : "text-red-600"
                                    }`}
                                />
                              ) : (
                                <CreditCard className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description || "No description"}</p>
                              <p className="text-sm text-gray-500">
                                {transaction.date ? new Date(transaction.date).toLocaleDateString() : "No date"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"
                                }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}₹{transaction.amount?.toLocaleString() || "0"}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category || "No category"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No transactions yet</p>
                        <Button asChild className="mt-4" size="sm">
                          <Link href="/admin/transactions/manage">Add Transaction</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                    <Link href="/admin/contact-messages">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Messages
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                    <Link href="/admin/transactions/manage">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                    <Link href="/admin/analytics">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                    <Link href="/admin/transactions">
                      <Activity className="h-4 w-4 mr-2" />
                      Manage Transactions
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AdminRouteGuard>
  )
}
