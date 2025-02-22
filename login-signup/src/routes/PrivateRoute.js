import { Navigate, Outlet } from "react-router-dom"; // Import navigation utilities from React Router
import { useAuth } from "../context/AuthContext"; // Import authentication context to check user status

const PrivateRoute = () => {
    const { user } = useAuth(); // Get the current authenticated user from the context

    return user ? <Outlet /> : <Navigate to="/" />; 
    // If user is logged in, render child routes (Outlet)
    // If not, redirect them to the home page ("/")
};

export default PrivateRoute; // Export the component for use in route configuration
