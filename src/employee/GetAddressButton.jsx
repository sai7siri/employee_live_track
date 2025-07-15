import React, { useState } from "react";
import { useStoreContext } from "../store/ContextStore";
import axios from "axios";

const GetAddressButton = () => {
  const { coords } = useStoreContext();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const apikey = import.meta.env.VITE_GETADDRESS_KEY

  const fetchAddress = async () => {
    if (!coords) {
      setError("Location access denied.");
      setAddress("");
      return;
    }
    setLoading(true);
    setAddress("");
    setError("");

    try {
      const {data} = await axios.get(
        `https://geocode.maps.co/reverse?lat=${coords?.lat}&lon=${coords?.lng}&api_key=${apikey}`
      );

      if (data.error) {
        setError("Address not found");
      } else {
        setAddress(data.display_name);
      }
    } catch (err) {
      setError("Failed to fetch address");
    }
    setLoading(false);
  };

  return (
    <div className="card p-3 shadow-sm mt-2">
      <h5 className="mb-3">Your Location</h5>
      <button
        className="btn btn-primary w-100 mb-3"
        onClick={fetchAddress}
        disabled={loading}
      >
        {loading ? "Fetching Address..." : "Get My Address"}
      </button>

      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

      {address && (
        <div className="border rounded p-3 bg-light" style={{whiteSpace: "pre-wrap"}}>
          <strong>Your - Address :</strong>
          <p className="mb-0 mt-1">{address}</p>
        </div>
      )}
    </div>
  );
};

export default GetAddressButton;
