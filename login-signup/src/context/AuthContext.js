import { createContext, useContext, useState, useEffect } from "react"; // Import React context and state management hooks

// Creates a React Context object.
// A Context allows you to share values (like user data) across components without needing to pass props manually.
const AuthContext = createContext();

// AuthProvider component to wrap the app and manage authentication state
export const AuthProvider = ({ children }) => {
    // Retrieve user from localStorage on load
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Login function (called after OTP verification)
    const login = (userData) => {
        setUser(userData); // Update the 'user' state with the new user data
        
        // localStorage allows you to store data in your web browser's storage. It allows you to store key-value pairs in a persistent way. The data does not expire, meaning it remains even after refreshing or closing the browser.
        localStorage.setItem("user", JSON.stringify(userData)); // Store user data in local storage
    };

    // Logout function
    const logout = () => {
        setUser(null); // Clear user state
        localStorage.removeItem("user"); // Remove user data from local storage
    };

    return (
        // Provide authentication context to child components
        // i.e. It makes user, login, and logout accessible to all child components.
        <AuthContext.Provider value={{ user, login, logout }}>
            {children} {/* Render child components */}
        </AuthContext.Provider>
    );
};

// Custom hook to access authentication context
export const useAuth = () => useContext(AuthContext);
