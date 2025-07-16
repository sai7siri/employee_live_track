import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import background from "../assets/back.jpg";

// React Icons
import { BiShow, BiHide } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useStoreContext } from "../store/ContextStore";
import { handleGoogleLogin } from "./googleLogin";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const { setUserDet } = useStoreContext();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const { email, password } = data;
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("Fetched userData from Firestore:", userData); // ✅ Debug
        localStorage.setItem("user-data", JSON.stringify(userData));
        setUserDet(userData); // ✅ Update context
        reset();
      } else {
        toast.error("User document not found in Firestore.");
        console.warn("No document found for UID:", user.uid);
      }
    } catch (error) {
      console.error("Login error:", error); // ✅ Catch block
      if (error.code === "auth/user-not-found") {
        setError("email", { type: "manual", message: "User not found" });
        toast.error("User not found");
      } else if (error.code === "auth/wrong-password") {
        setError("password", { type: "manual", message: "Incorrect password" });
        toast.error("Incorrect password");
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="border p-4 rounded-3 shadow-lg"
        style={{ maxWidth: "450px", width: "100%", background: "white" }}
      >
        <h3 className="mb-4 text-center">Login</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          {/* Password with toggle */}
          <div className="mb-3 position-relative">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                top: "25px",
                right: "12px",
                cursor: "pointer",
                userSelect: "none",
                color: "#6c757d",
                fontSize: "1.3rem",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              role="button"
            >
              {showPassword ? <BiHide /> : <BiShow />}
            </span>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        
          <div className="mt-3" />

        <button
          type="button"
          className="btn btn-outline-dark w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
          onClick={() => handleGoogleLogin({setUserDet , navigate})}
        >
          <FaGoogle /> Sign in with Google
        </button>

        <button
          className="btn btn-link w-100"
          style={{ textDecoration: "none" }}
          onClick={() => navigate("/register")}
        >
          Don’t have an account? Register
        </button>
        
      </div>
    </div>
  );
};

export default Login;
