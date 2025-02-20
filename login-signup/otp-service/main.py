# Import required libraries
from fastapi import FastAPI, HTTPException  # FastAPI framework for creating APIs
from fastapi.responses import JSONResponse  # Used to return JSON responses
from fastapi.middleware.cors import CORSMiddleware
import pyotp  # Library for generating and verifying OTPs
import qrcode  # Generates QR codes
import io  # Handles in-memory image storage
import base64  # Encodes QR code images as a string to send to the frontend
import uvicorn
from pydantic import BaseModel

# Initialize the FastAPI app
app = FastAPI()

# # Generate a secret key (temporary for testing)
# # A password that both sides use to generate and verify OTPs
# SECRET_KEY = pyotp.random_base32()  # Generates a 32-character base32 secret


# # This sets up a Time-based One-Time Password (TOTP) generator using the secret.
# # It creates new OTPs every 30 seconds.
# totp = pyotp.TOTP(SECRET_KEY)

# # This generates a QR code that contains the secret in a special format.
# # Scanning this QR code with an authenticator app (like Google Authenticator or Authy) allows the app to generate OTPs.
# otp_uri = totp.provisioning_uri(name="user@example.com", issuer_name="MyApp")
# qrcode.make(otp_uri).show()

# # Generate a current OTP
# print("Current OTP:", totp.now())  # Generates a new OTP

# # Verify user input
# user_otp = input("Enter OTP: ")
# if totp.verify(user_otp):
#     print("OTP is valid!")
# else:
#     print("Invalid OTP.")

# -------Steps to test it:-------
# Run the script.
# Scan the QR code using an app like Google Authenticator or Authy.
# The app will start showing a changing 6-digit OTP.
# Enter the OTP when prompted in the script.
# If it matches, you’ll see "OTP is valid!".


# Allow frontend (React running on localhost:3000) to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to ["http://localhost:3000"] for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    email: str  # Ensure email is expected in JSON format

class OTPVerificationRequest(BaseModel):
    secret: str
    otp: str

# In-memory storage for demo purposes (replace with DB in production)
users_secrets = {}

# dummy secret associated wiht an email
users_secrets["tests@gmail.com"] = pyotp.random_base32()

# @app.post("/route") tells FastAPI that the function below should run when a client sends a POST request to that route.
@app.post("/generate-otp")
def generate_opt(request: EmailRequest):
    """Generates a QR code and OTP secret for a given user email"""
    if request.email in users_secrets:
        secret = users_secrets[request.email]
    else:
        secret = pyotp.random_base32()
        users_secrets[request.email] = secret
    
    # It creates new OTPs every 30 seconds.
    totp = pyotp.TOTP(secret)

    # This generates a QR code that contains the secret in a special format.
    # Scanning this QR code with an authenticator app (like Google Authenticator or Authy) allows the app to generate OTPs.
    otp_uri = totp.provisioning_uri(name=request.email, issuer_name="MyApp")

    # Generate QR Code
    qr = qrcode.make(otp_uri)

    # Stores the QR code in memory (RAM) instead of a file for faster access
    buf = io.BytesIO()

    # Saves the QR code image into the buffer (buf) in PNG format.
    qr.save(buf, format="PNG")

    # Converts the image bytes into a Base64-encoded string.
    # This allows the QR code to be embedded in HTML or sent in an API response instead of sending an image file.
    qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    
    # Send the QR code to the front end
    return {
    "secret": secret,
    "qr_code": f"data:image/png;base64,{qr_base64}"
    }

@app.post("/verify-otp")
def verify_otp(request: OTPVerificationRequest):
    """Verifies the provided OTP against the stored secret."""
    secret = request.secret
    otp = request.otp

    totp = pyotp.TOTP(secret)
    
    if totp.verify(otp):
        return {"message": "✅ OTP is valid! User authenticated."}
    
    raise HTTPException(status_code=400, detail="❌ Invalid OTP! Access denied.")

#  For testing
@app.get("/")  
def home():
    return {"message": "FastAPI is running!"}


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)




