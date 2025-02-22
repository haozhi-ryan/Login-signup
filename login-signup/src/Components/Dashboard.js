import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div>
            <h1>Welcome, {user?.email}!</h1>
            <p>This is your private page</p>
            <button onClick={() => { logout(); navigate("/"); }}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;