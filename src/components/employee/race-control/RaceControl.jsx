import React, { useState, useEffect } from "react";
import { useSocket } from "../../../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import config from "../../../config";
import "./RaceControl.css";

const RaceControl = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (socket && !authenticated) {
      console.log("Attempting to authenticate...");
      setLoading(true);

      //PROVIDE PASSWORD FROM USER
      const loadingTimeout = setTimeout(() => {
        socket.emit("authenticate", { key: config.keys.safety });

        socket.on("authenticated", (status) => {
          setLoading(false);
          if (status) {
            setAuthenticated(true);
          } else {
            setError("Invalid access key");
          }
        });
      }, 2000);

      return () => clearTimeout(loadingTimeout);
    }
  }, [socket, authenticated]);

  if (loading) {
    // Show loading spinner while authenticating
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Authenticating Safety Official</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>{error}</h3>
          <div className="back-to-main" onClick={() => navigate("/")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="60"
              fill="#ffd814"
              className="bi bi-arrow-left-circle-fill"
              viewBox="0 0 16 16"
            >
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <div>{error || "Authenticating..."}</div>;
  }

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          fill="#ffd814"
          className="bi bi-arrow-left-circle-fill"
          viewBox="0 0 16 16"
        >
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
      </div>
      <h2 className="race-control-title">Race Control Interface</h2>
      <p>Manage the race operations here</p>
    </div>
  );
};

export default RaceControl;
