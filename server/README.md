// ============================================
// TTIN Backend — Node.js + Express + MongoDB
// ============================================
// This folder contains the complete backend structure.
// To run: cd server && npm install && npm run dev
//
// Required environment variables (.env):
//   PORT=5000
//   MONGODB_URI=mongodb://localhost:27017/ttin
//   JWT_SECRET=your_jwt_secret_here
//   CLOUDINARY_URL=your_cloudinary_url (optional, for image uploads)
//
// Structure:
//   server/
//   ├── index.js          — Entry point
//   ├── package.json       — Dependencies
//   ├── .env.example       — Env template
//   ├── config/
//   │   └── db.js          — MongoDB connection
//   ├── models/
//   │   ├── User.js        — User/Admin model
//   │   ├── Testimony.js   — Testimony model
//   │   ├── Product.js     — Shop product model
//   │   ├── Order.js       — Order model
//   │   ├── Event.js       — Event model
//   │   ├── Resource.js    — Resource model
//   │   ├── Video.js       — Unashamed video model
//   │   └── Donation.js    — Donation/Partner model
//   ├── routes/
//   │   ├── auth.js        — Auth routes
//   │   ├── testimonies.js — Testimony routes
//   │   ├── products.js    — Product routes
//   │   ├── orders.js      — Order routes
//   │   ├── events.js      — Event routes
//   │   ├── resources.js   — Resource routes
//   │   ├── videos.js      — Video routes
//   │   └── donations.js   — Donation routes
//   ├── controllers/
//   │   ├── authController.js
//   │   ├── testimonyController.js
//   │   ├── productController.js
//   │   ├── orderController.js
//   │   ├── eventController.js
//   │   ├── resourceController.js
//   │   ├── videoController.js
//   │   └── donationController.js
//   └── middleware/
//       └── auth.js        — JWT auth middleware
