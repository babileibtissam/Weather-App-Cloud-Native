import React from 'react';
import { Link } from 'react-router-dom'; // ← Ajoutez cette importation
import './Auth.css';

const Login = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Connexion</h2>
        <form className="auth-form">
          <input type="email" placeholder="Email" className="auth-input" />
          <input type="password" placeholder="Mot de passe" className="auth-input" />
          <button type="submit" className="auth-button">Se connecter</button>
        </form>
        <p className="auth-link">
          Pas de compte ? <Link to="/register">S'inscrire</Link> {/* ← Changez ici */}
        </p>
      </div>
    </div>
  );
};

export default Login;