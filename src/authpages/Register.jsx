import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BiShow, BiHide } from "react-icons/bi";
import bg from "../assets/back.jpg"
import { useNavigate } from "react-router-dom";

const Register = () => {

  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm();

  const onSubmit = async (data) => {
    const { email, password, name, jobType } = data;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        jobType: jobType,
        role: "employee", 
        createdAt: new Date(),
      });

      toast.success("User registered successfully!");
      reset();
      navigate('/login')

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("email", {
          type: "manual",
          message: "Email already in use",
        });
        toast.error("Email already registered");
      } else if (error.code === "auth/weak-password") {
        setError("password", {
          type: "manual",
          message: "Password must be at least 6 characters",
        });
        toast.error("Weak password");
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100 px-2 px-sm-0" 
      style={{ 
        backgroundImage : `url(${bg})`,
        backgroundPosition : 'center',
        backgroundSize : "cover"
       }}
    >
      <div className="border p-4 rounded-3 shadow-lg" style={{ maxWidth: "450px", width: "100%" , backgroundColor : "white"}}>
        <h3 className="mb-4 text-center">Register</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Name */}
          <div className="mb-3">
            <label>User Name</label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              {...register("name", {
                required: "User name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name.message}</div>
            )}
          </div>

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

          {/* Job Type */}
          <div className="mb-3">
            <label>Job Type</label>
            <select
              className={`form-select ${errors.jobType ? "is-invalid" : ""}`}
              {...register("jobType", {
                required: "Job type is required",
              })}
            >
              <option value="">Select job type</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="QA Engineer">QA Engineer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
            </select>
            {errors.jobType && (
              <div className="invalid-feedback">{errors.jobType.message}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>

        <button
          className="btn btn-link w-100"
          style={{ textDecoration: "none" }}
          onClick={() => navigate("/login")}
        >
          You have an account? Login
        </button>
      </div>
    </div>
  );
};

export default Register;
