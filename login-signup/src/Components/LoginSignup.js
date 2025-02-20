import { useState, useRef} from 'react';
import './LoginSignup.css';
import userIcon from '../Components/assets/person.png';
import emailIcon from '../Components/assets/email.png';
import passwordIcon from '../Components/assets/password.png';

const LoginSignup = () => {
    const [action, setAction] = useState("Sign Up");
    const [signUpError, setSignUpError] = useState(false);
    const [loginError, setLoginError] = useState(false);

    // Verify OTP button and input field
    const [otp, setOtp] = useState(""); // Stores the user's entered OTP
    const [secret, setSecret] = useState(null); // Stores the secret from backend
    const [message, setMessage] = useState("");

    // The state of the QR code
    const [qrCode, setQrCode] = useState(null);

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const handleSubmit = async () => {
        if (action === "Sign Up") {
            // HANDLES SIGN UP
            const name = nameRef.current?.value || "";
            const email = emailRef.current?.value || "";
            const password = passwordRef.current?.value || "";
            
            try {
                // Generates a OTP Secret if email is not empty
                if (!email) {
                    throw new Error("Email is empty");
                }
                // Generates the secret
                const data = await generateOTP(email);
                const secret = data.secret;
            
                // Send a POST request to the backend at PORT 5000
                // Stores the user information into the database
                const response = await fetch("http://localhost:5000/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, secret }),
                });

                // Generates the QR code when sign up is successfull
                setQrCode(data.qr_code);
                
                // Parse response from the server
                const result = await response.json();
                
                // Handle errors from the server
                if (!response.ok) {
                    setSignUpError(true)
                    throw new Error(result.error || "Failed to add user");
                }

                console.log("Server Response:", result.message);
                alert("User signed up successfully!"); // Notify user of success
    
                // Clear input fields after successful signup
                if (nameRef.current) nameRef.current.value = "";
                if (emailRef.current) emailRef.current.value = "";
                if (passwordRef.current) passwordRef.current.value = "";

                setSignUpError(false); // Reset error state
            } catch (error) {
                console.error("Error adding user to MongoDB:", error);
                setSignUpError(true);
                return;
            }

        } else {
            // HANDLES LOGIN

            const email = emailRef.current?.value || "";
            const password = passwordRef.current?.value || "";
            
            try {
                // Verifies the password
                const response = await fetch("http://localhost:5000/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                
                const result = await response.json();
                console.log("Login Response:", result);

                if (!response.ok) {
                    // Password is incorrect
                    setLoginError(true)
                    throw new Error(result.message || "Login failed");
                } 

                // Store secret and show OTP input field
                setSecret(result.user.secret);
                    
                alert(`Welcome back, ${result.user.name}!`);
                setLoginError(false)
                
            } catch (error) {
                console.error("Login error:", error);
                alert(error.message);
            }
        }
    };   

    // Generates a QR code and returns the secret
    const generateOTP = async (email) => {
        try {
            const response = await fetch("http://localhost:8000/generate-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json()
            console.log("API Response:", data);

            return data

        } catch (error) {
            console.error("Error generating OTP:", error);
        }
    }

    // Handles the verification of the QR code
    // Assumes the email and password are alreaydy verified
    const verifyOTP = async (secret, otp) => {

        try {
            const response = await fetch("http://localhost:8000/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secret, otp }),
            });

            const data = await response.json();
            console.log("OTP Verification Response:", data);

            if (response.ok) {
                setMessage("✅ OTP Verified! User authenticated.");
            } else {
                setMessage("❌ Invalid OTP. Please try again.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setMessage("❌ An error occurred. Please try again.");
        }
    };

 

    return (
        <div className='container'>

            <div className="header">
                <div className="text">{action}</div>
                <div className="underline"></div>
            </div>

            <div className='inputs'>
                {action === "Sign Up" && (
                    <div className='input'>
                        <img src={userIcon} alt="" />
                        <input type="text" placeholder="Name" ref={nameRef} />
                    </div>
                )}
                <div className='input'>
                    <img src={emailIcon} alt="" />
                    <input type="email" placeholder='Email' ref={emailRef} />
                </div>
                <div className='input'>
                    <img src={passwordIcon} alt="" />
                    <input type="password" placeholder='Password' ref={passwordRef} />
                </div>
            </div>
            
            {action === "Sign Up" ? (
                <div>
                    <div className='login' onClick={() => {
                        setAction("Login");

                        // Removes the picture of QR code if it's there
                        setQrCode(null)

                        // Removes the verify OTP if it's there
                        setSecret(null)

                        setSignUpError(false);
                    }}>
                        Already have an account?
                    </div>
                    {signUpError && (
                        <div className="invalid-credentials" style={{ color: "red", paddingLeft: '0px', marginTop: '20px' }}>
                            Invalid: please fill in all fields correctly
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div className='forgot-password'>
                        Forgot your password?
                    </div>
                    <div className='create-account' onClick={() => {
                        setAction("Sign Up");

                        // Removes the picture of QR code if it's there
                        setQrCode(null)

                        // Removes the verify OTP if it's there
                        setSecret(null)

                        setLoginError(false);
                    }}>
                        Sign Up
                    </div>
                    {loginError && (
                        <div className="account-not-found" style={{ color: "red", marginTop: '20px' }}>
                            Account does not exist
                        </div>
                    )}
                </div>
            )}
            
            <div className='submit-container'>
                <div className='submit' onClick={handleSubmit}>{action}</div>
            </div>
            
            {/* Adds a QR Code to the front end */}
            {qrCode && (
                <div>
                    <h3>Scan this QR Code:</h3>
                    <img src={qrCode} alt="OTP QR Code" />
                </div>
            )}

            {/* Adds an input field to verify the otp */}
            {secret && (
                <div>
                    <h3>Enter OTP</h3>
                    <input 
                        type="text" 
                        placeholder="Enter OTP" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                    />
                     <button onClick={() => verifyOTP(secret, otp)}>Submit OTP</button>
                    {message && <p>{message}</p>}
                </div>
            )}
        </div>
    );
}

export default LoginSignup;