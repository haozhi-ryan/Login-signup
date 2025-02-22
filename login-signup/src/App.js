import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from './Components/LoginSignup';
import Dashboard from "./Components/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

import './App.css';

function App() {
  return (
    <AuthProvider> {/* Wrapping the entire app so all children can access AuthProvider's data*/}
      <Router>
          <Routes>
              <Route path="/" element={<LoginSignup />} />
              <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
              </Route>
          </Routes>
      </Router>
  </AuthProvider>
  )
}


export default App;
