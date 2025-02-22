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

# @app.post("/route") tells FastAPI that the function below should run when a client sends a POST request to that route.
@app.post("/generate-otp")
def generate_opt(request: EmailRequest):
    """Generates a QR code and OTP secret for a given user email"""
    # Generates a random secret
    secret = pyotp.random_base32()

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




