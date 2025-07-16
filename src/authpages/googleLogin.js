
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export const handleGoogleLogin = async ({ setUserDet , navigate }) => {


  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check Firestore for registered user
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      localStorage.setItem("user-data", JSON.stringify(userData));
      setUserDet(userData);
    //   navigate("/dashboard"); // Change as per your app
    } else {
      toast.error(" Google account is not registered.");
      await signOut(auth);
    }
  } catch (error) {
    console.error("Google Login Failed:", error);
    toast.error("Google sign-in failed");
  }
};





















 // const handleCheckIn = () => {
  //   setError(null);
  //   setLoading(true);

  //   // Simulate fake location ~50m from office
  //   const dummyLat = OFFICE_LOCATION.lat + 0.00045;
  //   const dummyLng = OFFICE_LOCATION.lng + 0.00045;

  //   navigator.geolocation.getCurrentPosition(
  //     async (position) => {
  //       // Use DUMMY position for testing instead of actual device position
  //       const latitude = dummyLat;
  //       const longitude = dummyLng;

  //       const freshDistance = getDistanceMeters(
  //         latitude,
  //         longitude,
  //         OFFICE_LOCATION.lat,
  //         OFFICE_LOCATION.lng
  //       );

  //       setCoords({ lat: latitude, lng: longitude });
  //       setDistance(freshDistance);

  //       if (freshDistance > 100) {
  //         setError("You are too far from the office to check in.");
  //         setLoading(false);
  //         return;
  //       }

  //       const now = new Date().toISOString();
  //       const date = now.slice(0, 10);
  //       const docId = `${userData.uid}_${date}`;

  //       try {
  //         // Save initial check-in data
  //         await setDoc(doc(db, "usersCheckins", docId), {
  //           uid: userData.uid,
  //           name: userData.name,
  //           email: userData.email,
  //           role: userData.role,
  //           jobType: userData.jobType,
  //           checkInTime: now,
  //           isCheckedOut: false,
  //           coords: { lat: latitude, lng: longitude },
  //           officeCoords: OFFICE_LOCATION,
  //           date,
  //           createdAt: serverTimestamp(),
  //           updatedAt: serverTimestamp(),
  //         });

  //         // Start fake movement simulation every 10s
  //         const intervalId = setInterval(async () => {
  //           const angle = Math.random() * 2 * Math.PI;
  //           const radius = Math.random() * 100; // up to 100m

  //           const dx = radius * Math.cos(angle);
  //           const dy = radius * Math.sin(angle);

  //           // Convert meters to lat/lng
  //           const newLat = latitude + dy / 111111; // 1 deg lat ≈ 111,111 meters
  //           const newLng =
  //             longitude + dx / (111111 * Math.cos((latitude * Math.PI) / 180));

  //              const timestamp = new Date().toISOString();

  //           const logref = doc(
  //             db,
  //             "usersCheckins",
  //             docId,
  //             "locationLogs",
  //             timestamp
  //           );

  //           await setDoc(logref, {
  //             lat: newLat,
  //             lng: newLng,
  //             recordedAt: serverTimestamp(),
  //           });

  //           console.log("Fake tracked position:", newLat, newLng);
  //         }, 10000);

  //         localStorage.setItem("watchId", intervalId); // store for cleanup

  //         setCheckInTime(now);
  //         localStorage.setItem("checkInTime", now);
  //         setStatus("checkedIn");
  //       } catch (firestoreError) {
  //         console.error("Firestore error during check-in:", firestoreError);
  //         setError("Check-in failed due to server error. Try again.");
  //       } finally {
  //         setLoading(false);
  //       }
  //     },
  //     (err) => {
  //       console.error("Geolocation error:", err);
  //       setError("Location access denied or failed.");
  //       setLoading(false);
  //     },
  //     { enableHighAccuracy: true }
  //   );
  // };


