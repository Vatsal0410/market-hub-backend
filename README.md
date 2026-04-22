# MarketHub E-commerce API

A complete RESTful API for an e-commerce platform built with Node.js, Express, and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-19.x-green)
![Express](https://img.shields.io/badge/Express-5.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-9.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue)

## 🚀 Features

- **Authentication**
  - JWT-based authentication
  - Email verification with OTP
  - Password reset functionality
  - Rate limiting on auth endpoints

- **Role-Based Access Control**
  - Admin: Full access to products, categories, orders
  - User: Cart, orders, profile management

- **E-commerce Operations**
  - Product management (CRUD + soft delete)
  - Category management
  - Shopping cart with auto-calculated totals
  - Order placement and tracking

- **Developer Experience**
  - Full input validation
  - Global error handling
  - Pagination on all list endpoints
  - Swagger API documentation

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── validators/     # Input validation
│   └── index.ts        # App entry point
├── package.json
└── tsconfig.json
```

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.x
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Rate Limiting:** express-rate-limit
- **API Docs:** Swagger (swagger-jsdoc, swagger-ui-express)
- **Email:** Nodemailer

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |
| POST | `/api/auth/verify-email` | Verify email with OTP | Yes |
| POST | `/api/auth/resend-verification` | Resend verification OTP | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/verify-otp` | Verify OTP | No |
| POST | `/api/auth/reset-password` | Reset password | No |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Get all categories | No |
| GET | `/api/categories/:id` | Get category by ID | No |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |
| PUT | `/api/categories/:id/restore` | Restore category | Admin |

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Get all products | No |
| GET | `/api/products/:id` | Get product by ID | No |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| PUT | `/api/products/:id/restore` | Restore product | Admin |

### Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Get user cart | Yes |
| POST | `/api/cart` | Add item to cart | Yes |
| PUT | `/api/cart/:productId` | Update item quantity | Yes |
| DELETE | `/api/cart/:productId` | Remove item | Yes |
| DELETE | `/api/cart` | Clear cart | Yes |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders` | Get user orders | Yes |
| GET | `/api/orders/:id` | Get order by ID | Yes |
| POST | `/api/orders` | Create order | Yes |
| PUT | `/api/orders/:id/cancel` | Cancel order | Yes |
| GET | `/api/orders/all` | Get all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |
| DELETE | `/api/orders/:id` | Delete order | Admin |
| PUT | `/api/orders/:id/restore` | Restore order | Admin |

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/Vatsal0410/market-hub-backend.git
cd market-hub-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production
npm start
```

### Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/markethub
JWT_SECRET=your-super-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📚 API Documentation

Once the server is running, visit:
```
https://markethub-api-k2cq.onrender.com/api-docs
```

## 📝 License

This project is for educational purposes.

## 👨‍💻 Author

Vatsal Patel - [Vatsal0410](https://github.com/Vatsal0410)
