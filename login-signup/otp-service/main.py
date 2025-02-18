# Import required libraries
from fastapi import FastAPI, HTTPException  # FastAPI framework for creating APIs
from fastapi.responses import JSONResponse  # Used to return JSON responses
import pyotp  # Library for generating and verifying OTPs
import qrcode  # Generates QR codes
import io  # Handles in-memory image storage
import base64  # Encodes QR code images as a string to send to the frontend

# Initialize the FastAPI app
app = FastAPI()

# Generate a secret key
# A password that both sides use to generate and verify OTPs
SECRET_KEY = pyotp.random_base32()  # Generates a 32-character base32 secret


# This sets up a Time-based One-Time Password (TOTP) generator using the secret.
# It creates new OTPs every 30 seconds.
totp = pyotp.TOTP(SECRET_KEY)

@app.get("/generate_qr")
def generate_qr():
    """
    Generates a QR code containing the OTP secret and returns it as a Base64 string.
    The QR code can be scanned with Google Authenticator or another OTP app.
    """
    # Create a provisioning URI (used by authenticator apps)
    otp_uri = totp.provisioning_uri(name="user@example.com", issuer_name="MyApp")

    # Generate the QR code
    qr = qrcode.make(otp_uri)

    # Store the QR code in memory as a PNG image
    buf = io.BytesIO()
    qr.save(buf, format="PNG")

    # Convert the image to a Base64 string so the frontend can display it
    qr_base64 = base64.b64encode(buf.getvalue()).decode()

    # Return the QR code image and secret key as JSON
    return JSONResponse(content={"qr_code": qr_base64, "secret": SECRET_KEY})

@app.post("/verify_otp/{otp}")
def verify_otp(otp: str):
    """
    Verifies if the provided OTP is correct.
    """
    # Check if the OTP is valid
    if totp.verify(otp):
        return JSONResponse(content={"valid": True, "message": "OTP is valid!"})
    else:
        # Return an error if the OTP is incorrect
        raise HTTPException(status_code=400, detail="Invalid OTP")

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

