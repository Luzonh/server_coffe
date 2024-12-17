import React, { useState } from 'react';
import { auth, provider } from './firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import './styles/login.css';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Guardar el usuario completo para tener acceso al token
      setUser(result.user);
    } catch (error) {
      console.error(error);
      setError('Error al iniciar sesión con Google.');
    }
  };

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch (error) {
      console.error(error);
      setError('Error al iniciar sesión. Verifica el correo y la contraseña.');
    }
  };

  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch (error) {
      console.error(error);
      setError('Error al registrar la cuenta. Verifica los datos.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h2>
        <p>{isRegistering ? 'Crea una cuenta nueva' : 'Ingresa con tu cuenta'}</p>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        {isRegistering ? (
          <button className="login-btn" onClick={handleRegister}>
            Crear cuenta
          </button>
        ) : (
          <button className="login-btn" onClick={handleEmailLogin}>
            Iniciar sesión
          </button>
        )}

        {!isRegistering && (
          <button className="login-btn" onClick={handleLogin}>
            Iniciar sesión con Google
          </button>
        )}

        <button 
          className="toggle-btn" 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 
            '¿Ya tienes una cuenta? Inicia sesión' : 
            '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
}

export default Login;