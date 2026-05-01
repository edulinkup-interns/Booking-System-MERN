# Booking System – MERN Stack

An advanced full-stack **Appointment Booking System** built using the MERN stack (MongoDB, Express.js, React, Node.js).
This application enables users to schedule appointments, manage bookings, and receive automated email notifications.

##  Project Overview

This system is designed for service-based businesses to efficiently manage appointment scheduling with:

*  Interactive calendar booking
*  Time slot management
*  Email notifications
*  Rescheduling & cancellation
*  Booking analytics

## Tech Stack

### Frontend

* React.js
* React Calendar
* Axios
* Bootstrap / CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Other Tools

* Nodemailer (Email Service)
* JWT Authentication

## ✨ Features

### 👤 User Features

* User Registration & Login
* View calendar and available slots
* Book appointments
* Reschedule or cancel bookings
* View booking history
* Receive email confirmations

### 🧑‍💼 Provider Features

* Manage availability
* Create services
* View appointments
* Analyze booking trends

## ⚙️ System Architecture

Frontend (React - Vercel)
        ↓
Backend (Node/Express - Render)
        ↓
Database (MongoDB Atlas)

## 🔄 How It Works

1. User selects a date using calendar
2. Available time slots are displayed
3. User books an appointment
4. Booking is stored in database
5. Confirmation email is sent


## 🧠 Availability Logic

* Prevents overlapping bookings
* Applies buffer time between slots
* Filters booked slots dynamically


##  Notification System

Using Nodemailer:

* Booking confirmation emails
* Cancellation notifications
* Reminder alerts


##  Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/edulinkup-interns/Booking-System-MERN.git
cd Booking-System-MERN
```

### 2️⃣ Install Dependencies

#### Backend

cd server
npm install

#### Frontend

cd client
npm start


### 3️ Environment Variables

Create `.env` file in `/server`:


PORT=5000
MONGO_URI=mongodb+srv://siva:Siva123456@cluster0.w3ftivq.mongodb.net/booking-system?appName=Cluster0
JWT_SECRET=supersecretkey123456789012345678

###  Run the Project

#### Start Backend
cd server
npm start

#### Start Frontend
cd client
npm start

##  Evaluation Criteria Covered

* ✔ MERN stack implementation
* ✔ Calendar integration
* ✔ Email notifications
* ✔ Authentication & security
* ✔ Booking logic & validation
* ✔ Deployment


##  Security Features

* JWT-based authentication
* Password hashing
* API validation

##  Future Enhancements

*  Payment integration
*  Mobile responsiveness improvements
*  SMS notifications
*  AI-based scheduling


