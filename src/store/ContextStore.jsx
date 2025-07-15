import React, { createContext, useContext, useEffect, useState } from "react";

const ContextData = createContext();

export const useStoreContext = () => {
  return useContext(ContextData);
};

const OFFICE_LOCATION = { lat: 17.4359 , lng:  78.4564 }; //office exact

// const OFFICE_LOCATION = { lat: 17.4318288, lng: 78.4638163 };

const ContextStore = ({ children }) => {
  const [userDet, setUserDet] = useState(() => {
    const stored = localStorage.getItem("user-data");
    return stored ? JSON.parse(stored) : null;
  });

  const [coords, _setCoords] = useState(() => {
    try {
      const stored = localStorage.getItem("user-coords");
      const parsed = stored ? JSON.parse(stored) : null;

      if (
        parsed &&
        typeof parsed.lat === "number" &&
        typeof parsed.lng === "number"
      ) {
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn("Invalid user-coords in localStorage:", err);
      return null;
    }
  });

  const setCoords = (newCoords) => {
    if (
      !newCoords ||
      typeof newCoords.lat !== "number" ||
      typeof newCoords.lng !== "number"
    ) {
      console.warn("Invalid coords passed to setCoords:", newCoords);
      return;
    }

    localStorage.setItem("user-coords", JSON.stringify(newCoords));
    _setCoords(newCoords);
  };

  // admin userd data
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const values = {
    userDet,
    setUserDet,
    coords,
    setCoords,
    OFFICE_LOCATION,

    users,
    setUsers,
    selectedUser,
    setSelectedUser,
  };

  return <ContextData.Provider value={values}>{children}</ContextData.Provider>;
};

export default ContextStore;
