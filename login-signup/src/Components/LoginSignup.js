import { useState, useRef, useEffect } from 'react';
import './LoginSignup.css';
import userIcon from '../Components/assets/person.png';
import emailIcon from '../Components/assets/email.png';
import passwordIcon from '../Components/assets/password.png';

const LoginSignup = () => {
    const [action, setAction] = useState("Sign Up");
    const [userData, setUserData] = useState([]);
    const [signUpError, setSignUpError] = useState(false);
    const [loginError, setLoginError] = useState(true);
    const [movies, setMovies] = useState([]);
    const [newMovie, setNewMovie] = useState(""); // Store input for new movie

    useEffect(() => {
        fetch("http://localhost:5000/movies") // GET request to backend
          .then((res) => res.json())
          .then((data) => {
            console.log("Fetched movies:", data); // Debugging log
            setMovies(data);
            })    
          .catch((err) => console.error("Error fetching movies:", err));
      }, []);

     // Function to handle form submission
    const addMovie = async (e) => {
        e.preventDefault(); // Prevent form reload
        console.log("Submitting movie:", newMovie); // Debug log
        if (!newMovie) return alert("Movie title is required!");

        try {
            const response = await fetch("http://localhost:5000/movies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newMovie }),
            });
            const result = await response.json();
            console.log("Server Response:", result.message);

            if (!response.ok) throw new Error("Failed to add movie");

            setMovies([...movies, { title: newMovie }]); // Update UI
            setNewMovie(""); // Clear input field
        } catch (error) {
            console.error("Error adding movie:", error);
        }
    };

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const handleSubmit = () => {
        if (action === "Sign Up") {
            const name = nameRef.current?.value || "";
            const email = emailRef.current?.value || "";
            const password = passwordRef.current?.value || "";
            
            if (!name || !email || !password) {
                console.log("Invalid credentials: Please fill in all fields");
                setSignUpError(true);
                return;
            }

            setUserData(prevData => {
                const updatedData = [...prevData, { name, email, password }];
                console.log("Updated User Data:", updatedData);
                return updatedData;
            });
            
            setSignUpError(false);
            alert("User signed up successfully!");

            if (nameRef.current) nameRef.current.value = "";
            if (emailRef.current) emailRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
        } else {
            const email = emailRef.current?.value || "";
            const password = passwordRef.current?.value || "";
            
            const accountFound = userData.find(user => user.email === email && user.password === password);

            if (accountFound) {
                setLoginError(false);
                alert(`Welcome back, ${accountFound.name}!`);
            } else {
                setLoginError(true);
                alert("Account not found");
                console.log("Login failed: account not found");
            }
        }
    };

    return (
        // <div className='container'>

        //     <div className="header">
        //         <div className="text">{action}</div>
        //         <div className="underline"></div>
        //     </div>

        //     <div className='inputs'>
        //         {action === "Sign Up" && (
        //             <div className='input'>
        //                 <img src={userIcon} alt="" />
        //                 <input type="text" placeholder="Name" ref={nameRef} />
        //             </div>
        //         )}
        //         <div className='input'>
        //             <img src={emailIcon} alt="" />
        //             <input type="email" placeholder='Email' ref={emailRef} />
        //         </div>
        //         <div className='input'>
        //             <img src={passwordIcon} alt="" />
        //             <input type="password" placeholder='Password' ref={passwordRef} />
        //         </div>
        //     </div>
            
        //     {action === "Sign Up" ? (
        //         <div>
        //             <div className='login' onClick={() => {
        //                 setAction("Login");
        //                 setSignUpError(false);
        //             }}>
        //                 Already have an account?
        //             </div>
        //             {signUpError && (
        //                 <div className="invalid-credentials" style={{ color: "red", paddingLeft: '62px', marginTop: '20px' }}>
        //                     Invalid: please fill in all fields correctly
        //                 </div>
        //             )}
        //         </div>
        //     ) : (
        //         <div>
        //             <div className='forgot-password'>
        //                 Forgot your password?
        //             </div>
        //             <div className='create-account' onClick={() => {
        //                 setAction("Sign Up");
        //                 setLoginError(false);
        //             }}>
        //                 Sign Up
        //             </div>
        //             {loginError && (
        //                 <div className="account-not-found" style={{ color: "red", marginTop: '20px' }}>
        //                     Account does not exist
        //                 </div>
        //             )}
        //         </div>
        //     )}
            
        //     <div className='submit-container'>
        //         <div className='submit' onClick={handleSubmit}>{action}</div>
        //     </div>
        // </div>

    <div>
      <h1>Movie List</h1>

      {/* Input Form to Add Movies */}
      <form onSubmit={addMovie}>
        <input
          type="text"
          value={newMovie}
          onChange={(e) => setNewMovie(e.target.value)}
          placeholder="Enter movie title"
        />
        <button type="submit">Add Movie</button>
      </form>

      {/* Display Movies */}
      <ul>
        {movies.map((movie, index) => (
          <li key={index}>{movie.title}</li>
        ))}
      </ul>
    </div>

    );
}

export default LoginSignup;