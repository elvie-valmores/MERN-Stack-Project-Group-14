import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return children;
  }

  try {
    const user = JSON.parse(storedUser);
    const token = user.token || user.user?.token;

    if (token) {
      return <Navigate to="/dashboard" replace />;
    }
  } catch (error) {
    localStorage.removeItem("user");
  }

  return children;
}

export default PublicRoute;
