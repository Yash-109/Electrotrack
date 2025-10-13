import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole } from '@/lib/admin-middleware'

export const POST = requireAdminRole('admin')(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { transactions, startDate, endDate, filterType } = body

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transactions data' },
        { status: 400 }
      )
    }

    // Filter transactions by date range if provided
    let filteredTransactions = transactions

    if (startDate || endDate) {
      filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null

        if (start && end) {
          return transactionDate >= start && transactionDate <= end
        } else if (start) {
          return transactionDate >= start
        } else if (end) {
          return transactionDate <= end
        }
        return true
      })
    }

    // Filter by transaction type if specified
    if (filterType && filterType !== 'all') {
      filteredTransactions = filteredTransactions.filter(
        transaction => transaction.type === filterType
      )
    }

    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Generate CSV content with Excel-friendly formatting
    const csvHeaders = [
      'Date',
      'Item',
      'Category',
      'Type',
      'Amount',
      'Notes'
    ]

    const csvRows = filteredTransactions.map(transaction => {
      // Handle multiple date formats and ensure compact output
      let dateStr = 'N/A'

      try {
        let date
        if (transaction.date) {
          // Handle different date formats
          if (typeof transaction.date === 'string') {
            // Remove any time zone info and parse
            const cleanDate = transaction.date.replace(/[TZ]/g, ' ').trim()
            date = new Date(cleanDate)
          } else {
            date = new Date(transaction.date)
          }

          // Ensure we have a valid date
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = String(date.getFullYear()).slice(-2) // Use 2-digit year
            dateStr = `${day}/${month}/${year}`
          }
        }
      } catch (error) {
        console.error('Date parsing error for transaction:', transaction.id, error)
        dateStr = 'N/A'
      }

      // Clean and escape CSV values with fallbacks
      const description = (transaction.description || 'N/A').toString().replace(/"/g, '""').substring(0, 50) // Limit length
      const notes = (transaction.notes || '').toString().replace(/"/g, '""').substring(0, 100) // Limit length
      const category = (transaction.category || 'Other').toString()
      const type = (transaction.type || 'other').toString()
      const amount = Number(transaction.amount) || 0

      return [
        dateStr,
        `"${description}"`,
        category,
        type.charAt(0).toUpperCase() + type.slice(1),
        amount,
        `"${notes}"`
      ]
    })

    // Combine headers and rows
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Calculate summary statistics
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const summary = {
      totalTransactions: filteredTransactions.length,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      dateRange: {
        start: startDate || 'All time',
        end: endDate || 'All time'
      }
    }

    // Add summary to CSV with simple formatting
    const exportDate = new Date()
    const exportDay = String(exportDate.getDate()).padStart(2, '0')
    const exportMonth = String(exportDate.getMonth() + 1).padStart(2, '0')
    const exportYear = String(exportDate.getFullYear()).slice(-2) // Use 2-digit year
    const exportDateStr = `${exportDay}/${exportMonth}/${exportYear}`

    const summarySection = [
      '',
      '',
      'SUMMARY',
      `Total Transactions,${summary.totalTransactions}`,
      `Total Income,${summary.totalIncome}`,
      `Total Expenses,${summary.totalExpenses}`,
      `Net Profit,${summary.netProfit}`,
      `Date Range,"${summary.dateRange.start} to ${summary.dateRange.end}"`,
      `Export Date,${exportDateStr}`
    ].join('\n')

    const finalCsvContent = csvContent + '\n' + summarySection

    // Generate filename with date range
    const dateStr = new Date().toISOString().split('T')[0]
    const rangeStr = startDate && endDate
      ? `${startDate}_to_${endDate}`
      : startDate
        ? `from_${startDate}`
        : endDate
          ? `until_${endDate}`
          : 'all_time'

    const filename = `transactions_export_${rangeStr}_${dateStr}.csv`

    return NextResponse.json({
      success: true,
      csvContent: finalCsvContent,
      filename,
      summary
    })

  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate CSV export'
      },
      { status: 500 }
    )
  }
})
