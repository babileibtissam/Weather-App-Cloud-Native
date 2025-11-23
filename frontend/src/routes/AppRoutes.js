import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Weather from "../components/Weather";
import Login from "../components/Login";
import Register from "../components/Register";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  console.log('AppRoutes - loading:', loading); // ← DEBUG
  console.log('AppRoutes - isAuthenticated:', isAuthenticated); // ← DEBUG

  // Pendant le chargement, affichez un loading ou rien
  if (loading) {
    console.log('AppRoutes - Showing loading screen'); // ← DEBUG
    return <div>Chargement...</div>;
  }

  console.log('AppRoutes - Rendering routes, isAuthenticated:', isAuthenticated); // ← DEBUG

  return (
    <Routes>
      {/* Page d'accueil : Weather si authentifié, sinon redirige vers login */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Weather /> : <Navigate to="/login" replace />} 
      />
      
      {/* Login : seulement si NON authentifié */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
      />
      
      {/* Register : accessible à tous */}
      <Route path="/register" element={<Register />} />
      
      {/* Route de secours */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;