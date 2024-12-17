import React from 'react';
import { Link } from 'react-router-dom';
import './styles/MainMenu.css'; // Archivo CSS

function MainMenu({ user, handleLogout }) {
  return (

    
    <div className="main-menu">
       <h1>Detección de Plagas</h1>
      <h2 className="welcome-message">Bienvenido, {user?.displayName || 'Usuario'}!</h2>
      
      <div className="button-container">
        <Link to="/upload">
          <button className="menu-button">
            <img src="/images/upload.jpg" alt="Realizar Detección" className="button-icon" />
            Realizar Detección
          </button>
        </Link>
        <Link to="/datos">
          <button className="menu-button">
            <img src="/images/view-data.jpg" alt="Ver Datos" className="button-icon" />
            Ver Datos
          </button>
        </Link>
      </div>
      <div>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </div>
    
  );
}

export default MainMenu;
