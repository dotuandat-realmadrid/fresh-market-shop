import React, { createContext, useContext, useEffect, useState } from "react";
import { getAll } from "../api/supplier";

// Tạo Context
const SupplierContext = createContext();

// Provider component
export const SupplierProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);

  const refreshSuppliers = async () => {
    const data = await getAll();
    setSuppliers(data);
  };

  useEffect(() => {
    refreshSuppliers();
  }, []);

  return (
    <SupplierContext.Provider value={{ suppliers, refreshSuppliers }}>
      {children}
    </SupplierContext.Provider>
  );
};

// Hook để sử dụng suppliers trong các component
export const useSuppliers = () => useContext(SupplierContext);
