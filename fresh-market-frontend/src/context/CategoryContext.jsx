import React, { createContext, useContext, useEffect, useState } from "react";
import { getAll } from "../api/category";

// Tạo Context
const CategoryContext = createContext();

// Provider component
export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  const refreshCategories = async () => {
    const data = await getAll();
    setCategories(data);
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, refreshCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

// Hook để sử dụng categories trong các component
export const useCategories = () => useContext(CategoryContext);
