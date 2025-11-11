import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import './Register.css';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Inscription:', { fullName, email, password });
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        {/* Card principale */}
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <div className="register-icon">
              <User className="icon-user" />
            </div>
            <h2 className="register-title">Créer un compte</h2>
            <p className="register-subtitle">Rejoignez-nous dès aujourd'hui</p>
          </div>

          {/* Formulaire */}
          <div className="register-form">
            {/* Champ Nom complet */}
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <User className="icon" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            {/* Champ Email */}
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Mail className="icon" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Lock className="icon" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input password-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="icon" />
                  ) : (
                    <Eye className="icon" />
                  )}
                </button>
              </div>
            </div>

            {/* Conditions d'utilisation */}
            <div className="terms-wrapper">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox" />
                <span className="checkbox-text">
                  J'accepte les{' '}
                  <a href="#" className="terms-link">
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="#" className="terms-link">
                    politique de confidentialité
                  </a>
                </span>
              </label>
            </div>

            {/* Bouton d'inscription */}
            <button onClick={handleSubmit} className="submit-button">
              S'inscrire
            </button>
          </div>

          {/* Footer */}
          <p className="register-footer">
            Déjà un compte ?{' '}
            <a href="#" className="login-link">
              Se connecter
            </a>
          </p>
        </div>

        {/* Note de sécurité */}
        <p className="security-note">
          Vos données sont protégées et sécurisées
        </p>
      </div>
    </div>
  );
};

export default Register;