import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { currentUser, authChecked } = useSelector((state) => state.user);

  if (!authChecked) {
    return <p>Проверка авторизации...</p>;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;