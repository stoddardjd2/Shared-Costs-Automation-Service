# MongoDB Express MVC Project

A complete MongoDB + Express + Mongoose MVC application with authentication, validation, and best practices.

## Features

- ✅ Express.js server with MVC architecture
- ✅ MongoDB integration with Mongoose ODM
- ✅ User authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ Security middleware (helmet, cors, rate limiting)
- ✅ Error handling middleware
- ✅ Environment configuration
- ✅ RESTful API endpoints
- ✅ Pagination and search functionality

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── userController.js    # User business logic
├── models/
│   └── User.js             # User Mongoose model
├── routes/
│   └── userRoutes.js       # User route definitions
├── middleware/
│   └── auth.js             # Authentication middleware
├── utils/
│   └── errorHandler.js     # Error handling utilities
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies and scripts
├── server.js              # Main application file
└── README.md             # Project documentation
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and JWT secret

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Production start:**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users` - User registration

### Users (Protected)
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

## Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
```

## API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get users (with token)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Update `MONGODB_URI` in `.env`

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Adding New Models
1. Create model in `models/` directory
2. Create controller in `controllers/` directory
3. Create routes in `routes/` directory
4. Import routes in `server.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
