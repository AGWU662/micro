# GitHub Copilot Instructions for Crypto Trading Platform

## Project Overview

This is a comprehensive cryptocurrency trading platform built with Node.js, Express, and MongoDB. The platform provides features for crypto trading, wallet management, mining simulation, P2P trading, and transaction management.

## Technology Stack

- **Backend Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Real-time Communication**: Socket.io
- **Security**: Helmet, express-rate-limit, CORS
- **Validation**: express-validator
- **File Upload**: Multer
- **Email**: Nodemailer

## Project Structure

```
/
├── config/          # Configuration files (DB initialization, admin setup)
├── middleware/      # Express middleware (auth, validation, error handling)
├── models/          # Mongoose schemas and models
├── routes/          # API route handlers
├── utils/           # Utility functions and helpers
├── server.js        # Main application entry point
└── .env.example     # Environment variables template
```

## Code Organization

### Models (`/models`)
- `User.js` - User schema with authentication, KYC, and profile management
- `Wallet.js` - Cryptocurrency wallet management
- `Transaction.js` - Transaction records and history
- `Trade.js` - Trading orders and execution
- `P2PTrade.js` - Peer-to-peer trading
- `Mining.js` - Mining activities and rewards

### Routes (`/routes`)
All routes are prefixed with `/api/`:
- `/api/auth` - Authentication (register, login, password reset)
- `/api/users` - User profile management
- `/api/admin` - Admin panel operations
- `/api/wallet` - Wallet operations (balance, deposits, withdrawals)
- `/api/mining` - Mining pool and rewards
- `/api/trading` - Trading orders and market data
- `/api/p2p` - P2P trading marketplace
- `/api/transactions` - Transaction history and details

## Coding Conventions

### General Guidelines
1. Use async/await for asynchronous operations
2. Always handle errors with try-catch blocks
3. Use meaningful variable and function names
4. Follow RESTful API conventions
5. Keep functions small and focused on a single responsibility

### API Response Format
Consistent JSON response structure:
```javascript
// Success response
{
  success: true,
  data: { /* response data */ },
  message: "Optional success message"
}

// Error response
{
  success: false,
  message: "Error message",
  errors: [ /* validation errors if applicable */ ]
}
```

### Error Handling
- Use Express error handling middleware
- Return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Provide clear, user-friendly error messages
- Log errors with console.error for debugging

### Authentication
- Protect routes with JWT authentication middleware
- Use role-based access control (user, admin)
- Never expose sensitive data (passwords, JWT secrets)
- Implement password hashing with bcryptjs

### Database Conventions
- Use Mongoose schema validation
- Implement pre/post hooks for data manipulation
- Use indexes for frequently queried fields
- Handle unique constraints and validation errors gracefully

## Security Best Practices

1. **Input Validation**: Always validate and sanitize user input using express-validator
2. **Rate Limiting**: API endpoints are rate-limited to prevent abuse
3. **CORS**: Properly configure CORS for allowed origins
4. **Helmet**: Use Helmet middleware for security headers
5. **Password Security**: Hash passwords with bcrypt (salt rounds: 10)
6. **JWT Security**: Use strong secrets, set appropriate expiration times
7. **File Uploads**: Validate file types and sizes when using Multer
8. **MongoDB Injection**: Use Mongoose parameterized queries
9. **Sensitive Data**: Never commit secrets or credentials to version control

## Environment Variables

Required environment variables (see `.env.example`):
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRE` - JWT expiration time
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Initial admin credentials
- `CLIENT_URL` - Frontend application URL
- Email configuration (optional)
- Crypto API keys (optional)

## Socket.io Usage

Real-time features use Socket.io:
- Access io instance via `req.app.get('io')`
- Emit events for real-time updates (trades, prices, transactions)
- Handle client connections and disconnections
- Namespace socket events appropriately

## API Development Guidelines

1. **Route Handlers**: Keep route files focused on routing, move business logic to controllers or services
2. **Middleware**: Use middleware for authentication, validation, and error handling
3. **Validation**: Validate request body, params, and query using express-validator
4. **Pagination**: Implement pagination for list endpoints (limit, skip, page)
5. **Filtering**: Support filtering by common fields (status, date range, type)
6. **Sorting**: Allow sorting by relevant fields

## Testing Approach

- Write tests for critical business logic
- Test authentication and authorization flows
- Validate API responses match expected format
- Test error scenarios and edge cases
- Mock external dependencies (database, third-party APIs)

## Common Patterns

### Protected Route Example
```javascript
router.post('/endpoint',
  protect, // Authentication middleware
  [/* validation rules */],
  controllerFunction
);
```

### Async Route Handler Example
```javascript
const handlerFunction = async (req, res, next) => {
  try {
    // Business logic
    res.json({ success: true, data: result });
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

### Mongoose Query Example
```javascript
const results = await Model.find({ field: value })
  .populate('reference')
  .select('-sensitiveField')
  .sort({ createdAt: -1 })
  .limit(10);
```

## Development Workflow

1. Start development server: `npm run dev`
2. Start with client: `npm run dev:full`
3. Install all dependencies: `npm run install:all`
4. Ensure MongoDB is running before starting the server
5. Create `.env` file based on `.env.example`
6. Server initializes admin user on first run

## Additional Notes

- The platform uses Socket.io for real-time features
- Admin user is automatically created on first database connection
- All API routes are rate-limited to prevent abuse
- Static files (uploads) are served from `/uploads` directory
- The API welcome endpoint is at `/api` (GET)
- 404 and error handling middleware are implemented globally

## When Adding New Features

1. Create model schema if database entity is needed
2. Add validation rules using express-validator
3. Implement route handlers with proper error handling
4. Apply authentication and authorization middleware
5. Update Socket.io events if real-time updates are needed
6. Document new endpoints and their usage
7. Test thoroughly including edge cases
