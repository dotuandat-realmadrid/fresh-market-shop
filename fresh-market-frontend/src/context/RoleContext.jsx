import React, { createContext, useContext, useEffect, useState } from 'react';
import { API } from '../api/auth';

// Tạo Context
const RoleContext = createContext();

// Provider component
export const RoleProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Gọi API một lần khi component mount
    fetch(`${API}/roles`)
      .then(response => response.json())
      .then(data => setRoles(data.result));
  }, []);
  
  return (
    <RoleContext.Provider value={roles}>
      {children}
    </RoleContext.Provider>
  );
};

// Hook để sử dụng roles trong các component
export const useRoles = () => useContext(RoleContext);