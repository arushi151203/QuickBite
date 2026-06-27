# 🍔 QuickBite

QuickBite is a modern full-stack food ordering web application that provides a seamless online food ordering experience. Users can browse restaurants, explore menus, add items to the cart, securely authenticate, place orders, and track deliveries in real time.

Designed with a clean, responsive interface inspired by modern food delivery platforms, QuickBite focuses on providing a smooth and intuitive user experience.

---

## 🚀 Features

### 👤 Authentication
- User Registration
- Secure Login
- JWT Authentication
- Protected Routes
- Email Verification
- Forgot & Reset Password

### 🍽️ Restaurant
- Browse Restaurants
- Restaurant Details
- Food Categories
- Veg / Non-Veg Menu
- Search Restaurants

### ❤️ Favorites
- Add/Remove Favorite Restaurants
- View Favorite List

### 🛒 Cart
- Add Items
- Update Quantity
- Remove Items
- Apply Coupons
- Price Calculation

### 💳 Checkout
- Delivery Address
- Order Summary
- Payment Options
- Place Order

### 📦 Orders
- My Orders
- Order History
- Real-Time Order Tracking

### ⚙️ User
- User Profile
- Settings
- Address Management

---

## 🛠 Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Context API
- Tailwind CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- Nodemailer

### Database
- PostgreSQL

---

## 📁 Project Structure

```
QuickBite
│
├── backend
│   ├── config
│   ├── db
│   ├── middleware
│   ├── routes
│   ├── utils
│   └── server.js
│
├── src
│   ├── components
│   ├── context
│   ├── data
│   ├── hooks
│   ├── services
│   ├── utils
│   ├── App.jsx
│   └── main.jsx
│
├── public
├── package.json
└── README.md
```

---

## ⚡ Installation

### Clone Repository

```bash
git clone https://github.com/arushi151203/QuickBite.git
```

### Frontend

```bash
cd QuickBite
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000

DATABASE_URL=your_database_url

JWT_SECRET=your_secret_key

EMAIL_USER=your_email

EMAIL_PASS=your_password
```

---

## 🎯 Future Enhancements

- Online Payment Gateway Integration
- Live Delivery Tracking with Maps
- Restaurant Dashboard
- Admin Dashboard
- Push Notifications
- Reviews & Ratings
- AI Food Recommendations
- Voice Search

---

## 👩‍💻 Author

**Arushi Lath**

GitHub: https://github.com/arushi151203

---

⭐ If you like this project, consider giving it a star!
