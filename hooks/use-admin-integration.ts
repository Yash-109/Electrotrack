"use client"
import { transactionStore } from "@/lib/transaction-store"

// Hook to integrate online sales with admin system
export function useAdminIntegration() {
  const addOnlineSale = (orderData: {
    description: string
    category: string
    amount: number
    paymentMethod: string
    customer: string
    orderId: string
    orderDate?: string // Add optional order date
  }) => {
    try {
      const transaction = transactionStore.addOnlineSale(orderData)
      return transaction
    } catch (error) {
      return null
    }
  }

  const addExpense = (expenseData: {
    description: string
    category: string
    amount: number
    paymentMethod: string
  }) => {
    try {
      const transaction = transactionStore.addTransaction({
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        ...expenseData,
      })
      return transaction
    } catch (error) {
      return null
    }
  }

  return {
    addOnlineSale,
    addExpense,
  }
}

// Simulate automatic integration when orders are placed
export function simulateOnlineOrder(
  productName: string,
  category: string,
  amount: number,
  customer: string,
  paymentMethod: string,
) {
  const orderData = {
    description: productName,
    category,
    amount,
    paymentMethod,
    customer,
    orderId: `ORD${Date.now()}`,
  }

  return transactionStore.addOnlineSale(orderData)
}
