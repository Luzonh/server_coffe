import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import UploadImage from './UploadImage';
import Datos from './Datos';
import { signOut, auth } from './firebase';
import MainMenu from './MainMenu';

import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Router>
      <div className="App">
        {!user ? (
          <Login setUser={setUser} />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <MainMenu user={user} handleLogout={handleLogout} />
              }
            />
            <Route 
              path="/upload" 
              element={<UploadImage user={user} />} // Pasar el usuario como prop
            />
            <Route 
              path="/datos" 
              element={<Datos user={user} />} // Pasar el usuario como prop si es necesario
            />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;