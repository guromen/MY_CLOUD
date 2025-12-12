import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./UserContext";

const ProtectedRoute = () => {
  const { currentUser, loading } = useContext(UserContext);

  if (loading) return <p>Загрузка...</p>;

  return currentUser ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;