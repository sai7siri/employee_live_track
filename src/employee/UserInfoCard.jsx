import React, { useState, useEffect } from "react";
import { useStoreContext } from "../store/ContextStore";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const UserInfoCard = () => {
  const userData = JSON.parse(localStorage.getItem("user-data"));
  const { coords, setCoords, OFFICE_LOCATION } = useStoreContext();

  const [checkInTime, setCheckInTime] = useState(
    () => localStorage.getItem("checkInTime") || ""
  );
  const [checkOutTime, setCheckOutTime] = useState(
    () => localStorage.getItem("checkOutTime") || ""
  );

  const [status, setStatus] = useState(() => {
    if (localStorage.getItem("checkOutTime")) return "checkedOut";
    if (localStorage.getItem("checkInTime")) return "checkedIn";
    return "notCheckedIn";
  });

  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Clear check-in/out if it's a new day
  useEffect(() => {
    const checkIn = localStorage.getItem("checkInTime");
    const checkOut = localStorage.getItem("checkOutTime");

    if (checkIn) {
      const checkInDate = new Date(checkIn);
      const today = new Date();

      const isSameDay =
        checkInDate.getFullYear() === today.getFullYear() &&
        checkInDate.getMonth() === today.getMonth() &&
        checkInDate.getDate() === today.getDate();

      if (!isSameDay) {
        // Optional: backup the session for admin history
        const history = JSON.parse(
          localStorage.getItem("checkInHistory") || "[]"
        );
        history.push({
          id: userData?.uid,
          email: userData?.email,
          name: userData?.name,
          checkInTime: checkIn,
          checkOutTime: checkOut || null,
          clearedAt: today.toISOString(),
          reason: "Auto-clear on new day",
        });
        localStorage.setItem("checkInHistory", JSON.stringify(history));

        // Now clear session
        localStorage.removeItem("checkInTime");
        localStorage.removeItem("checkOutTime");
        setCheckInTime("");
        setCheckOutTime("");
        setStatus("notCheckedIn");
      }
    }
  }, []);

  // Update distance when coords change
  useEffect(() => {
    if (!coords) return setDistance(null);
    const dist = getDistanceMeters(
      coords.lat,
      coords.lng,
      OFFICE_LOCATION.lat,
      OFFICE_LOCATION.lng
    );
    setDistance(dist);
  }, [coords]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCheckIn = () => {
    setError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const freshDistance = getDistanceMeters(
          latitude,
          longitude,
          OFFICE_LOCATION.lat,
          OFFICE_LOCATION.lng
        );

        setCoords({ lat: latitude, lng: longitude });
        setDistance(freshDistance);

        console.log(coords);

        if (freshDistance > 100) {
          setError("You are too far from the office to check in.");
          setLoading(false);
          return;
        }

        const now = new Date().toISOString();
        const date = now.slice(0, 10);

        try {
          await setDoc(doc(db, "usersCheckins", `${userData.uid}_${date}`), {
            uid: userData.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            jobType: userData.jobType,
            checkInTime: now,
            isCheckedOut: false,
            coords: { lat: latitude, lng: longitude },
            officeCoords: OFFICE_LOCATION,
            date,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // live tracking
          const watchId = navigator.geolocation.watchPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              const timestamp = new Date().toISOString();

              const logref = doc(
                db,
                "usersCheckins",
                `${userData.uid}_${date}`,
                "locationLogs",
                timestamp
              );

              await setDoc(logref, {
                lat: latitude,
                lng: longitude,
                recordedAt: serverTimestamp(),
              });

              console.log("track liveposion", timestamp);
            },
            (err) => {
              console.error("watchposition error", err);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000,
            }
          );

          localStorage.setItem("watchId" , watchId)

          //  Update local state
          setCheckInTime(now);
          localStorage.setItem("checkInTime", now);
          setStatus("checkedIn");


        } catch (firestoreError) {
          console.error("Firestore error during check-in:", firestoreError);
          setError("Check-in failed due to server error. Try again.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Location access denied or failed.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);

    const now = new Date().toISOString();
    const date = now.slice(0, 10);
    const docId = `${userData.uid}_${date}`;

    try {
      const checkInRef = doc(db, "usersCheckins", docId);

      await updateDoc(checkInRef, {
        isCheckedOut: true,
        checkOutTime: now,
        updatedAt: serverTimestamp(),
      });

      // stop the user tracking
      const watchId = localStorage.getItem("whatchId");
      if(watchId){
        navigator.geolocation.clearWatch(Number(watchId));
        localStorage.removeItem("watchId")
      }

      setCheckOutTime(now);
      localStorage.setItem("checkOutTime", now);
      setStatus("checkedOut");
    } catch (firestoreError) {
      console.error("Error checking out:", firestoreError);
      setError("Checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // convert meters to km
  const meters = Math.round(distance);
  const km = (meters / 1000).toFixed(2);

  return (
    <div className="border rounded-3 p-4 shadow-sm bg-white">
      <h5 className="mb-3 text-center">👤 User Information</h5>

      <p>
        <strong>Name:</strong> {userData?.name || "sai"}
      </p>
      <p>
        <strong>Email:</strong> {userData?.email}
      </p>
      <p>
        <strong>Job Type:</strong>{" "}
        <span className="badge bg-info text-dark">
          {userData?.jobType || userData?.job || "full stack developer"}
        </span>
      </p>

      <hr />

      {distance !== null && (
        <p className="text-center mb-3">
          📍 Distance from office:{" "}
          <strong>{` ${meters} meters | ${km} Km`}</strong>
        </p>
      )}

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {status === "notCheckedIn" && (
        <div className="d-grid">
          <button className="btn btn-success" onClick={handleCheckIn}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Checking In...
              </>
            ) : (
              "Check In"
            )}
          </button>
        </div>
      )}

      {status === "checkedIn" && (
        <>
          <div className="d-grid mb-3">
            <button className="btn btn-warning" onClick={handleCheckOut}>
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Checking Out...
                </>
              ) : (
                "Check Out"
              )}
            </button>
          </div>
          <div className="alert alert-success text-center" role="alert">
            Checked in at: <strong>{formatTime(checkInTime)}</strong>
          </div>
        </>
      )}

      {status === "checkedOut" && (
        <>
          <div className="alert alert-success text-center" role="alert">
            Checked in at: <strong>{formatTime(checkInTime)}</strong>
          </div>
          <div className="alert alert-danger text-center" role="alert">
            Checked out at: <strong>{formatTime(checkOutTime)}</strong>
          </div>
        </>
      )}
    </div>
  );
};

export default UserInfoCard;
