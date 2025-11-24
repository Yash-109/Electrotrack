import { jsPDF } from 'jspdf'

export interface InvoiceData {
    orderId: string
    orderDate: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    shippingAddress: {
        fullName: string
        address: string
        city: string
        state: string
        pincode: string
        phone: string
    }
    items: Array<{
        name: string
        category: string
        quantity: number
        price: number
        total: number
    }>
    subtotal: number
    tax?: number
    shipping?: number
    total: number
    paymentMethod: string
    status: string
}

export class InvoiceGenerator {
    private static formatCurrency(amount: number): string {
        if (!amount || isNaN(amount)) return '0.00'

        // Convert to number and ensure it's valid
        const num = parseFloat(amount.toString())
        if (isNaN(num)) return '0.00'

        // Format with 2 decimal places
        const formatted = num.toFixed(2)

        // Add thousands separator manually
        const parts = formatted.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

        return parts.join('.')
    }

    private static formatDate(date: string | Date): string {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    static generateInvoicePDF(invoiceData: InvoiceData): void {
        const doc = new jsPDF()

        // Colors and styling
        const primaryColor = [37, 99, 235] // Blue-600
        const secondaryColor = [107, 114, 128] // Gray-500
        const darkColor = [17, 24, 39] // Gray-900

        let yPosition = 20

        // Company Header
        doc.setFontSize(24)
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.setFont('helvetica', 'bold')
        doc.text('RADHIKA ELECTRONICS', 20, yPosition)

        yPosition += 8
        doc.setFontSize(12)
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
        doc.setFont('helvetica', 'normal')
        doc.text('Premium Electronics Store', 20, yPosition)

        // Invoice Title
        yPosition += 20
        doc.setFontSize(20)
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
        doc.setFont('helvetica', 'bold')
        doc.text('INVOICE', 20, yPosition)

        // Invoice Details
        yPosition += 15
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')

        // Left column - Invoice info
        doc.setFont('helvetica', 'bold')
        doc.text('Invoice Details:', 20, yPosition)
        yPosition += 6
        doc.setFont('helvetica', 'normal')
        doc.text(`Order ID: ${invoiceData.orderId}`, 20, yPosition)
        yPosition += 5
        doc.text(`Order Date: ${this.formatDate(invoiceData.orderDate)}`, 20, yPosition)
        yPosition += 5
        doc.text(`Payment Method: ${invoiceData.paymentMethod}`, 20, yPosition)
        yPosition += 5
        doc.text(`Status: ${invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}`, 20, yPosition)

        // Right column - Customer info
        const rightColumnX = 120
        let rightYPosition = yPosition - 21

        doc.setFont('helvetica', 'bold')
        doc.text('Bill To:', rightColumnX, rightYPosition)
        rightYPosition += 6
        doc.setFont('helvetica', 'normal')
        doc.text(invoiceData.customerName || invoiceData.shippingAddress.fullName, rightColumnX, rightYPosition)
        rightYPosition += 5
        doc.text(invoiceData.customerEmail, rightColumnX, rightYPosition)
        if (invoiceData.customerPhone) {
            rightYPosition += 5
            doc.text(invoiceData.customerPhone, rightColumnX, rightYPosition)
        }

        // Shipping Address
        yPosition += 20
        doc.setFont('helvetica', 'bold')
        doc.text('Shipping Address:', 20, yPosition)
        yPosition += 6
        doc.setFont('helvetica', 'normal')
        doc.text(invoiceData.shippingAddress.fullName, 20, yPosition)
        yPosition += 5
        doc.text(invoiceData.shippingAddress.address, 20, yPosition)
        yPosition += 5
        doc.text(`${invoiceData.shippingAddress.city}, ${invoiceData.shippingAddress.state} - ${invoiceData.shippingAddress.pincode}`, 20, yPosition)
        yPosition += 5
        doc.text(`Phone: ${invoiceData.shippingAddress.phone}`, 20, yPosition)

        // Items Table
        yPosition += 20

        // Table header
        doc.setFont('helvetica', 'bold')
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.rect(20, yPosition - 3, 170, 8, 'F')

        doc.setTextColor(255, 255, 255)
        doc.text('Item', 22, yPosition + 2)
        doc.text('Category', 80, yPosition + 2)
        doc.text('Qty', 125, yPosition + 2, { align: 'center' })
        doc.text('Price (₹)', 155, yPosition + 2, { align: 'right' })
        doc.text('Total (₹)', 185, yPosition + 2, { align: 'right' })

        yPosition += 12
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
        doc.setFont('helvetica', 'normal')

        // Table items
        invoiceData.items.forEach((item, index) => {
            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(249, 250, 251) // Gray-50
                doc.rect(20, yPosition - 3, 170, 7, 'F')
            }

            // Truncate long item names and ensure clean text
            const itemName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name
            const categoryText = item.category || ''
            const quantityText = String(item.quantity || 0)
            const priceText = this.formatCurrency(item.price || 0)
            const totalText = this.formatCurrency(item.total || 0)

            // Position text carefully to avoid overlaps
            doc.text(itemName, 22, yPosition + 1)
            doc.text(categoryText, 80, yPosition + 1)
            doc.text(quantityText, 125, yPosition + 1, { align: 'center' })
            doc.text(priceText, 155, yPosition + 1, { align: 'right' })
            doc.text(totalText, 185, yPosition + 1, { align: 'right' })

            yPosition += 8
        })

        // Totals section
        yPosition += 10
        const totalsX = 140

        doc.setFont('helvetica', 'normal')
        doc.text('Subtotal:', totalsX, yPosition)
        doc.text(this.formatCurrency(invoiceData.subtotal), 185, yPosition, { align: 'right' })

        if (invoiceData.tax && invoiceData.tax > 0) {
            yPosition += 6
            doc.text('Tax:', totalsX, yPosition)
            doc.text(this.formatCurrency(invoiceData.tax), 185, yPosition, { align: 'right' })
        }

        if (invoiceData.shipping && invoiceData.shipping > 0) {
            yPosition += 6
            doc.text('Shipping:', totalsX, yPosition)
            doc.text(this.formatCurrency(invoiceData.shipping), 185, yPosition, { align: 'right' })
        }

        // Total line
        yPosition += 8
        doc.line(totalsX, yPosition - 2, 185, yPosition - 2)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('Total:', totalsX, yPosition + 2)
        doc.text(this.formatCurrency(invoiceData.total), 185, yPosition + 2, { align: 'right' })

        // Footer
        yPosition += 25
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
        doc.text('Thank you for your business!', 20, yPosition)
        yPosition += 5
        doc.text('For any queries, contact us at support@electrotrack.com or 1800-123-4567', 20, yPosition)

        // Company info footer
        yPosition += 15
        doc.setFontSize(9)
        doc.text('Radhika Electronics | Premium Electronics Store', 20, yPosition)
        yPosition += 4
        doc.text('GST No: 07AABCU9603R1ZZ | PAN: AABCU9603R', 20, yPosition)

        // Save the PDF
        const fileName = `Invoice_${invoiceData.orderId}_${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
    }
}

// Utility function to convert order data to invoice format
export function orderToInvoiceData(order: any, customerEmail: string): InvoiceData {
    return {
        orderId: order.orderId,
        orderDate: order.createdAt,
        customerName: order.shippingAddress?.fullName || '',
        customerEmail: customerEmail,
        customerPhone: order.shippingAddress?.phone,
        shippingAddress: order.shippingAddress,
        items: order.items.map((item: any) => {
            const price = Number(item.price) || 0
            const quantity = Number(item.quantity) || 0
            return {
                name: item.name,
                category: item.category,
                quantity: quantity,
                price: price,
                total: price * quantity
            }
        }),
        subtotal: Number(order.subtotal) || (Number(order.total) - (Number(order.shipping) || 0) - (Number(order.tax) || 0)),
        tax: Number(order.tax) || 0,
        shipping: Number(order.shipping) || 0,
        total: Number(order.total) || 0,
        paymentMethod: order.paymentMethod,
        status: order.status
    }
}
