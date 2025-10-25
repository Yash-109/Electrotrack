# Environment Variables Documentation

This document describes all environment variables used in the Electrotrack application.

## Required Variables

### Database Configuration
```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/electrotrack
# Required for database connectivity
```

### NextAuth Configuration
```env
# NextAuth base URL (should match your deployment URL)
NEXTAUTH_URL=http://localhost:3001
# Required for authentication

# NextAuth secret for JWT encryption
NEXTAUTH_SECRET=your-random-secret-here
# Generate a secure random string for production
```

### Google OAuth
```env
# Google OAuth Client ID from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
# Get from Google Cloud Console > APIs & Services > Credentials

# Google OAuth Client Secret
GOOGLE_CLIENT_SECRET=your-google-client-secret
# Get from Google Cloud Console > APIs & Services > Credentials
```

### Email Service (Gmail SMTP)
```env
# Gmail account for sending emails
GMAIL_USER=your-email@gmail.com
# Use a dedicated Gmail account for the application

# Gmail app password (not your regular password)
GMAIL_APP_PASSWORD=your-16-character-app-password
# Generate from Google Account > Security > 2-Step Verification > App passwords
```

### Admin Authentication
```env
# Admin username for admin panel access
ADMIN_USERNAME_1=admin
# Default: admin

# Bcrypt hashed admin password
ADMIN_PASSWORD_1=$2b$10$WiofDVQ1bpt08EV7wE3dne.bS8m21cFDVO4kI9avuoFb6Mc7vQ2zu
# Default password: admin123
# Generate new hash: npx bcryptjs-cli hash-password your-password 10
```

## Optional Variables

### Development
```env
# Node environment
NODE_ENV=development
# Options: development, production, test

# Custom port for development
PORT=3001
# Default: 3000
```

### Logging
```env
# Log level for application logging
LOG_LEVEL=debug
# Options: debug, info, warn, error
# Default: debug in development, info in production
```

## Production Considerations

### Security
- Always use strong, randomly generated secrets in production
- Never commit real credentials to version control
- Use environment-specific values for different deployments
- Regularly rotate secrets and passwords

### Performance
- Use optimized MongoDB connection strings with connection pooling
- Configure appropriate timeouts for external services
- Use CDN URLs for static assets if applicable

### Monitoring
- Set up environment variables for monitoring services
- Configure error tracking and performance monitoring
- Set up alerts for critical environment variables

## Environment Setup Examples

### Local Development
```env
MONGODB_URI=mongodb://localhost:27017/electrotrack
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=development-secret-key
GOOGLE_CLIENT_ID=your-dev-client-id
GOOGLE_CLIENT_SECRET=your-dev-client-secret
GMAIL_USER=dev@example.com
GMAIL_APP_PASSWORD=your-dev-app-password
ADMIN_USERNAME_1=admin
ADMIN_PASSWORD_1=$2b$10$WiofDVQ1bpt08EV7wE3dne.bS8m21cFDVO4kI9avuoFb6Mc7vQ2zu
NODE_ENV=development
```

### Production
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/electrotrack
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=super-secure-random-secret-for-production
GOOGLE_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-prod-client-secret
GMAIL_USER=noreply@your-domain.com
GMAIL_APP_PASSWORD=production-app-password
ADMIN_USERNAME_1=admin
ADMIN_PASSWORD_1=production-hashed-password
NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGODB_URI format
   - Verify database server is running
   - Check network connectivity and firewall rules

2. **Google OAuth Error**
   - Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - Check authorized redirect URIs in Google Console
   - Ensure NEXTAUTH_URL matches your domain

3. **Email Service Not Working**
   - Verify Gmail account has 2-factor authentication enabled
   - Check GMAIL_APP_PASSWORD is correctly generated
   - Ensure "Less secure app access" is disabled (use app passwords)

4. **Admin Login Failed**
   - Verify ADMIN_PASSWORD_1 is properly hashed with bcrypt
   - Check ADMIN_USERNAME_1 matches your input
   - Ensure no trailing spaces in credentials

### Environment Validation

The application includes environment validation on startup. Check the console for any missing or invalid environment variables.

## Security Best Practices

1. **Use .env.local for local development** - This file is automatically ignored by Git
2. **Never commit sensitive data** - Use .env.example for documentation
3. **Rotate secrets regularly** - Update passwords and secrets periodically
4. **Use different credentials per environment** - Don't reuse production credentials in development
5. **Monitor environment access** - Log and monitor access to sensitive configuration
