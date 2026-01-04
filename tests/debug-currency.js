// Debug script to test invoice data processing
// This will help identify where the "1"s are coming from

function debugFormatCurrency(amount, label) {
    console.log(`=== Testing ${label} ===`)
    console.log('Input amount:', amount, typeof amount)

    if (!amount || isNaN(amount)) {
        console.log('Result: ₹0.00 (invalid input)')
        return '₹0.00'
    }

    // Convert to number and ensure it's valid
    const num = parseFloat(amount.toString())
    console.log('Parsed number:', num)

    if (isNaN(num)) {
        console.log('Result: ₹0.00 (NaN after parsing)')
        return '₹0.00'
    }

    // Format with 2 decimal places
    const formatted = num.toFixed(2)
    console.log('After toFixed(2):', formatted)

    const parts = formatted.split('.')
    console.log('Split parts:', parts)

    // Add thousands separator manually
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    console.log('After comma formatting:', parts)

    const result = `₹${parts.join('.')}`
    console.log('Final result:', result)
    console.log('========================\n')

    return result
}

// Test with problematic values
console.log('TESTING CURRENCY FORMATTING ISSUES:')
console.log('====================================\n')

// Test cases that might be causing the "1"s
debugFormatCurrency(4999, 'Normal number')
debugFormatCurrency('4999', 'String number')
debugFormatCurrency(4999.00, 'Number with decimals')
debugFormatCurrency('4999.00', 'String with decimals')

// Test potential problematic inputs
debugFormatCurrency('₹4999', 'String with currency symbol')
debugFormatCurrency('4,999.00', 'String with commas')
debugFormatCurrency('14999', 'Number starting with 1')
debugFormatCurrency('1₹4999', 'Malformed input with 1')

// Test the exact values from your screenshot
debugFormatCurrency(4999.00, 'Screenshot price value')
debugFormatCurrency(899.82, 'Screenshot tax value')
debugFormatCurrency(500.00, 'Screenshot shipping value')
debugFormatCurrency(6398.82, 'Screenshot total value')
