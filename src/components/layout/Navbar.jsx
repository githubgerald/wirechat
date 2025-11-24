// src/components/layout/Navbar.jsx
import React from 'react';

const Navbar = ({ onLogout }) => {
  return (
    <nav className="navbar">
      <div 
        className="icon"
      />
      <span className="softwareName">wirechat</span>
      {onLogout && (
        <button 
          className="logout-button" 
          onClick={onLogout}
          title="Logout"
        >
          ⊗
        </button>
      )}
    </nav>
  );
};

export default Navbar;