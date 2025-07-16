import React from "react";
import { useStoreContext } from "../store/ContextStore";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const Header = () => {
  const { userDet, setUserDet } = useStoreContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();

    try {
      await signOut(auth);

      if (userDet?.role === "employee") {
        localStorage.removeItem("user-coords");
        localStorage.removeItem("checkInTime");
        localStorage.removeItem("checkOutTime");
        localStorage.removeItem("watchId")
      }

      localStorage.removeItem("user-data");

      setUserDet(null);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div
      className="d-flex justify-content-between align-items-center border-bottom bg-light"
      style={{ padding: "18px 50px" }}
    >
      <h5 className="mb-0">
        {userDet?.role === "admin" ? "HR Dashboard" : "Employee Dashboard"}
      </h5>

      <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Header;
