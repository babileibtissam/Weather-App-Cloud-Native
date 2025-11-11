import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Weather from "../components/Weather";      // ← Nom corrigé
import Login from "../components/Login";
import Register from "../components/Register";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Weather />} />    {/* ← Nom corrigé */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;