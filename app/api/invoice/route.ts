import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const orderId = url.searchParams.get('orderId')
        const userEmail = url.searchParams.get('userEmail')

        if (!orderId || !userEmail) {
            return NextResponse.json({ error: 'Order ID and user email are required' }, { status: 400 })
        }

        const db = await getDb()
        const orders = db.collection('orders')

        // Find the order and verify it belongs to the user
        const order = await orders.findOne({
            orderId,
            userEmail
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Generate HTML invoice template
        const invoiceHtml = generateInvoiceHTML(order, userEmail)

        return new NextResponse(invoiceHtml, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `attachment; filename="Invoice_${orderId}.html"`
            }
        })

    } catch (error) {
        console.error('Invoice generation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

function generateInvoiceHTML(order: any, customerEmail: string): string {
    const formatCurrency = (amount: number) => {
        if (!amount || isNaN(amount)) return '₹0.00'

        // Convert to number and ensure it's valid
        const num = parseFloat(amount.toString())
        if (isNaN(num)) return '₹0.00'

        // Format with 2 decimal places
        const formatted = num.toFixed(2)
        const parts = formatted.split('.')

        // Add thousands separator manually
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

        return `₹${parts.join('.')}`
    }

    const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })

    const subtotal = order.subtotal || (order.total - (order.shipping || 0) - (order.tax || 0))

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.orderId}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .invoice-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            color: #2563eb;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }
        .company-tagline {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0 0 0;
        }
        .invoice-title {
            font-size: 24px;
            color: #1f2937;
            margin: 20px 0;
        }
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
        }
        .detail-section h3 {
            color: #374151;
            margin-bottom: 10px;
            font-size: 16px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .detail-item {
            margin: 8px 0;
            font-size: 14px;
        }
        .detail-label {
            font-weight: 600;
            color: #4b5563;
        }
        .table-container {
            margin: 30px 0;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }
        th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        tr:nth-child(even) td {
            background: #f9fafb;
        }
        .totals-section {
            margin-top: 30px;
            text-align: right;
        }
        .totals-table {
            margin-left: auto;
            width: 300px;
        }
        .totals-table td {
            border: none;
            padding: 8px 12px;
        }
        .total-row {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #2563eb !important;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
        }
        .status-delivered { background: #dcfce7; color: #166534; }
        .status-shipped { background: #dbeafe; color: #1e40af; }
        .status-processing { background: #fef3c7; color: #92400e; }
        .status-cancelled { background: #fecaca; color: #dc2626; }

        @media print {
            body { background: white; }
            .invoice-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <h1 class="company-name">RADHIKA ELECTRONICS</h1>
            <p class="company-tagline">Premium Electronics Store</p>
            <h2 class="invoice-title">INVOICE</h2>
        </div>

        <div class="invoice-details">
            <div class="detail-section">
                <h3>Invoice Details</h3>
                <div class="detail-item">
                    <span class="detail-label">Order ID:</span> ${order.orderId}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Order Date:</span> ${formatDate(order.createdAt)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Payment Method:</span> ${order.paymentMethod}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
            </div>

            <div class="detail-section">
                <h3>Bill To</h3>
                <div class="detail-item">
                    <span class="detail-label">Name:</span> ${order.shippingAddress?.fullName || 'N/A'}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span> ${customerEmail}
                </div>
                ${order.shippingAddress?.phone ? `<div class="detail-item">
                    <span class="detail-label">Phone:</span> ${order.shippingAddress.phone}
                </div>` : ''}
            </div>
        </div>

        <div class="detail-section">
            <h3>Shipping Address</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 10px;">
                <strong>${order.shippingAddress?.fullName || 'N/A'}</strong><br>
                ${order.shippingAddress?.address || 'N/A'}<br>
                ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}<br>
                ${order.shippingAddress?.phone ? `Phone: ${order.shippingAddress.phone}` : ''}
            </div>
        </div>

        <div class="table-container">
            <h3>Order Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map((item: any) => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.category}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td>${formatCurrency(subtotal)}</td>
                </tr>
                ${order.tax && order.tax > 0 ? `
                <tr>
                    <td>Tax:</td>
                    <td>${formatCurrency(order.tax)}</td>
                </tr>` : ''}
                ${order.shipping && order.shipping > 0 ? `
                <tr>
                    <td>Shipping:</td>
                    <td>${formatCurrency(order.shipping)}</td>
                </tr>` : ''}
                <tr class="total-row">
                    <td><strong>Total:</strong></td>
                    <td><strong>${formatCurrency(order.total)}</strong></td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>For any queries, contact us at support@electrotrack.com or 1800-123-4567</p>
            <br>
            <p>Radhika Electronics | Premium Electronics Store</p>
            <p>GST No: 07AABCU9603R1ZZ | PAN: AABCU9603R</p>
        </div>
    </div>

    <script>
        // Auto-print functionality
        window.onload = function() {
            if (confirm('Would you like to print this invoice?')) {
                window.print();
            }
        }
    </script>
</body>
</html>
  `
}
