# Two-Factor Authentication App

## Overview
This project implements a two-factor authentication (2FA) system using React, MongoDB, and Python. Users can sign up with their email and password, and a secret key is generated using `pyotp`. After registration, they scan a QR code with Google Authenticator to receive a one-time password (OTP) that refreshes every 30 seconds. During login, users must provide the OTP for successful authentication before accessing a private page.

## Features
- **User Signup:** Stores email, password, and a secret key in MongoDB.
- **React Frontend:** Handles user interactions.
- **OTP Generation:** Uses `pyotp` to generate time-based OTPs.
- **Google Authenticator Integration:** Users scan a QR code for OTP generation.
- **Secure Login:** Requires OTP verification before accessing private pages.

## How to Run
1. **Connect to MongoDB:**
   ```sh
   node connect.cjs
   ```
2. **Run OTP Service:**
   ```sh
   python main.py
   ```
3. **Start React Frontend:**
   ```sh
   npm start
   ```

## Prerequisites
- React 17
- Node.js
- Python (with `pyotp` installed)
- MongoDB Atlas (ensure your IP is whitelisted)

## Configuration
- Update the MongoDB connection string in the project to match your database settings.

## Notes
- Ensure your MongoDB Atlas is configured to accept connections from your IP.
- The OTP regenerates every 30 seconds, and users must enter it during login.

This project provides a secure and user-friendly authentication system using two-factor authentication (2FA).

