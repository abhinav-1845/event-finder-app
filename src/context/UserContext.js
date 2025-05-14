import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  return (
    <UserContext.Provider value={{ userData, setUserData, darkMode, setDarkMode }}>
      {children}
    </UserContext.Provider>
  );
};
