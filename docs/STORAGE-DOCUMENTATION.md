# 🔐 Session Storage & LocalStorage Documentation

## Session Storage in User Authentication

### What is Session Storage?
Session storage in this application refers to storing user authentication data in the browser's localStorage to maintain login sessions across browser refreshes and visits.

### User Login Session Storage
When a user logs in successfully:

```javascript
// User session data stored in localStorage
const userSession = {
  user: {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name,
    loginTime: new Date().toISOString(),
  },
}
localStorage.setItem("radhika_user_session", JSON.stringify(userSession))
```

**Location**: `app/login/page.tsx` (lines 95-107)
**Storage Key**: `"radhika_user_session"`

### Admin Login Session Storage
When an admin logs in:

```javascript
// Admin session data
const session = {
  user: { ...user, password: undefined }, // Password excluded for security
  loginTime: new Date().toISOString(),
  expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
}
localStorage.setItem("radhika_admin_session", JSON.stringify(session))
```

**Location**: `lib/admin-auth.ts` (lines 68-77)
**Storage Key**: `"radhika_admin_session"`

### How It Works
1. **Login**: User credentials are verified against MongoDB
2. **Session Creation**: User data is stored in localStorage
3. **Session Persistence**: Data persists across browser sessions
4. **Auto-Login**: App checks localStorage on page load
5. **Logout**: Session data is removed from localStorage

### Security Considerations
- Passwords are never stored in localStorage
- Admin sessions have expiration times
- Session data is validated before use
- Logout properly clears all session data

---

## LocalStorage Persistence in Transaction Management

### What is LocalStorage Persistence?
In the admin transaction management system, all transaction data is stored locally in the browser's localStorage instead of a database.

### Transaction Storage Structure
```javascript
// Transaction data structure
const transactions = [
  {
    id: "1234567890",
    date: "2024-01-15",
    type: "income", // or "expense"
    description: "Product Sale",
    amount: 15000,
    category: "Sales",
    paymentMethod: "Cash",
    notes: "Optional notes",
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z"
  }
]
```

**Location**: `lib/transaction-store.ts`
**Storage Key**: `"radhika_transactions"`

### How Transaction Persistence Works
1. **Initial Load**: Transactions are loaded from localStorage on app start
2. **Real-time Updates**: Every transaction change is immediately saved to localStorage
3. **Data Persistence**: Data survives browser refreshes and reopening
4. **Export Capability**: Data can be exported for backup

### Benefits
- **Offline Functionality**: Works without internet connection
- **Fast Performance**: No API calls needed for basic operations
- **Data Ownership**: All data stays on user's device
- **No Server Costs**: No database storage costs

### Limitations
- **Device Specific**: Data doesn't sync across devices
- **Browser Specific**: Data is tied to specific browser
- **Storage Limits**: Browser localStorage has size limitations (~5-10MB)
- **No Backup**: Data loss if browser data is cleared

---

## Best Practices

### For Session Storage
- Always validate session data before use
- Implement proper logout functionality
- Set reasonable session expiration times
- Never store sensitive data like passwords

### For Transaction LocalStorage
- Regularly backup data (export feature)
- Validate data integrity on load
- Handle localStorage quota exceeded errors
- Provide clear data management options to users
