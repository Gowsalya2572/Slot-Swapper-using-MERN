// src/pages/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../store/useStore";

const ProtectedRoute = () => {
  const { token } = useStore();

  // If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the nested route
  return <Outlet />;
};

export default ProtectedRoute;

