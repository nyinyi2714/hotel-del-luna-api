# Hotel Del Luna Backend API

This repository contains the backend API source code for the Hotel Del Luna hotel room reservation web application.

**Live Deployment:**
The backend API is live and hosted on [Render](https://hotel-del-luna-api.onrender.com/).

**Frontend Repository:**
[Hotel Del Luna Frontend Repository](https://github.com/nyinyi2714/hotel-reservation-react)

## API Endpoints

1. **User Authentication:**
   - `POST /api/register`: Register a new user.
   - `POST /api/login`: Log in and obtain a JWT token.
   - `POST /api/logout`: Log out and blacklist the JWT token.
   - `GET /api/checkAuth`: Check if the user is logged in.

2. **Reservation Management:**
   - `GET /api/reservations`: Get all reservations for the authenticated user.
   - `POST /api/reservation/new`: Create a new reservation.
   - `PATCH /api/reservation/update`: Update an existing reservation.
   - `DELETE /api/reservation/delete`: Delete an existing reservation.

3. **Room Information:**
   - `GET /api/rooms/json`: Get JSON data for available rooms.

4. **Price Calculation:**
   - `POST /api/calculate/room-price`: Calculate the room price based on check-in, check-out, and room type.

## Technology Stack

- **Backend Framework:** Node.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Token)
- **Hosting:** Render

## Prerequisites

Before you begin, make sure you have the following software installed on your system:

- **Node.js:** [Download and install Node.js here.](https://nodejs.org/)

## Getting Started

To run the backend API locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/nyinyi2714/hotel-del-luna-api.git

2. **Install Dependencies:**

    ```bash
    cd hotel-del-luna-api
    npm install
3. **Start the Server**

    ```bash
    npm start

The backend API will be running at http://localhost:5000.

