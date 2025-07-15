import React from "react";
import Register from "./authpages/Register";
import Login from "./authpages/Login";
import { ToastContainer } from "react-toastify";
import { Route, Routes, Navigate } from "react-router-dom";
import UserDashboard from "./employee/UserDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import Header from "./authpages/Header";
import { useStoreContext } from "./store/ContextStore";

const App = () => {
  const { userDet } = useStoreContext();

  return (
    <div>
      {userDet && <Header />}

      <Routes>
        {/* Public Routes with redirect if already logged in */}

        <Route
          path="/"
          element={
            userDet ? (
              userDet.role === "admin" ? (
                <Navigate to="/admindash" />
              ) : (
                <Navigate to="/userdash" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/login"
          element={
            userDet ? (
              userDet.role === "admin" ? (
                <Navigate to="/admindash" />
              ) : (
                <Navigate to="/userdash" />
              )
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            userDet ? (
              userDet.role === "admin" ? (
                <Navigate to="/admindash" />
              ) : (
                <Navigate to="/userdash" />
              )
            ) : (
              <Register />
            )
          }
        />

        {/* Protected Employee and admin routes */}
        <Route
          path="/userdash"
          element={
            userDet?.role === "employee" ? (
              <UserDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admindash"
          element={
            userDet?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <ToastContainer position="top-center" autoClose={1000} />
    </div>
  );
};

export default App;
