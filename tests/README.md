# 🧪 Tests Directory

This directory contains test files and debugging scripts for the Electrotrack project.

## Test Files

### `test-currency-formatting.js`

Tests for currency formatting functionality across different locales and currencies.

### `test-pdf-rendering.js`

Tests for PDF invoice generation and rendering functionality.

### `debug-currency.js`

Debug script for troubleshooting currency-related issues.

## Running Tests

```bash
# Run individual test files
node tests/test-currency-formatting.js
node tests/test-pdf-rendering.js
node tests/debug-currency.js
```

## Adding New Tests

When adding new test files:

1. Use descriptive naming: `test-<feature-name>.js`
2. Include comments explaining what's being tested
3. Add entry to this README
4. Ensure tests can run independently

## Test Coverage

For production testing, consider implementing:

- Jest for unit tests
- Cypress for E2E tests
- React Testing Library for component tests
