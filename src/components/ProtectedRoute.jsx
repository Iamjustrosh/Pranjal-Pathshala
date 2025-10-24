import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>; // waits while Firebase checks login
  if (!user) return <Navigate to="/login" replace />; // redirect if not logged in

  return children; // if logged in, show the protected page
};

export default ProtectedRoute;
