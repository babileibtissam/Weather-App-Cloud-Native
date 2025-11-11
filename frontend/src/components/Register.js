import React from 'react';
import { Link } from 'react-router-dom'; // ← Ajoutez cette importation
import './Auth.css';

const Register = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Inscription</h2>
        <form className="auth-form">
          <input type="text" placeholder="Nom complet" className="auth-input" />
          <input type="email" placeholder="Email" className="auth-input" />
          <input type="password" placeholder="Mot de passe" className="auth-input" />
          <button type="submit" className="auth-button">S'inscrire</button>
        </form>
        <p className="auth-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link> {/* ← Changez ici */}
        </p>
      </div>
    </div>
  );
};

export default Register;