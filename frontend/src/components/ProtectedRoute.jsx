import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(storedUser);
    const token = user.token || user.user?.token;

    if (!token) {
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
