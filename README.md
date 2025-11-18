# MagicCommerce – AI-Enhanced E-Commerce Platform for Small Retailers

## Overview

MagicCommerce is a full-stack e-commerce platform with AI-powered features designed for small-to-medium retailers and online stores. The platform combines traditional e-commerce functionality with intelligent product recommendations, automated inventory management, and AI-enhanced customer service to help SMEs compete with larger retailers.

Built for small businesses that need enterprise-grade e-commerce capabilities without the complexity, MagicCommerce leverages Azure AI to deliver personalized shopping experiences and automated operations that drive revenue growth.

**Demo**: https://magiccommerce.shtrial.com

## Features

- 🛍️ **Product Catalog**: Browse and search products with dynamic filtering
- 🛒 **Shopping Cart**: Add, remove, and manage items in your cart
- 👤 **User Authentication**: Secure user registration and login
- 💳 **Payment Processing**: Integrated Stripe checkout for secure payments
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 🚀 **Modern Stack**: Built with Next.js 15, React 18, and modern web technologies

## Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Custom authentication system
- **Payments**: Stripe
- **Deployment**: Replit (Cloud Run)

## Getting Started

### Prerequisites

- Node.js 20 or later
- PostgreSQL database
- Stripe account for payments

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shmindmaster/magiccommerce-platform.git
cd magiccommerce-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
- Database connection details (PostgreSQL)
- Stripe API keys
- Any other required configurations

4. Set up the database:
```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Database Schema

The application uses PostgreSQL with the following main tables:
- **Products**: Product catalog with pricing and descriptions
- **Users**: User authentication and profile data
- **Orders**: Order management and history
- **Addresses**: User shipping addresses
- **OrderItems**: Individual items within orders

## API Routes

- `/api/products` - Product management
- `/api/auth` - Authentication endpoints
- `/api/orders` - Order processing
- `/api/stripe` - Payment processing
- `/api/address` - Address management

## Deployment

This application is configured for deployment on Replit using Cloud Run:

1. Set up your production environment variables
2. Configure your PostgreSQL database
3. Deploy using Replit's deployment feature

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies and best practices
- Inspired by contemporary e-commerce platforms
- Designed for scalability and maintainability
