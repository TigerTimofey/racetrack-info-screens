import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import loadingAnimation from "../../../assets/lottie-animations/flag.json";
import { useRaces } from "./hooks/useRaces";
import { useRaceFlag } from "./hooks/useRaceFlag";
import "./FlagBearers.css";

const FlagBearers = () => {
  const navigate = useNavigate();
  const [selectedRace, setSelectedRace] = useState("");
  const { races, isLoading: isRacesLoading, error: racesError } = useRaces();
  const {
    currentFlag,
    setCurrentFlag,
    sessionName,
    isLoading: isFlagLoading,
    error: flagError,
  } = useRaceFlag(selectedRace);

  // Update flag options to include Chequered Black/White flag
  const flagOptions = [
    { name: "Safe", color: "#2ecc71" },
    { name: "Hazard", color: "#f1c40f" },
    { name: "Danger", color: "#e74c3c" },
    { name: "Finish", isChequered: true }, // Add a flag for chequered
  ];

  const handleFlagChange = async (newFlag) => {
    if (!selectedRace) return alert("Please select a race");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/race-sessions/${selectedRace}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentFlag: newFlag }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setCurrentFlag(newFlag);
      } else {
        console.error(data.message || "Failed to update flag");
      }
    } catch (error) {
      console.error("Error updating flag:", error);
      alert("An error occurred while updating the flag");
    }
  };

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
  };

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
      <h2 className="race-control-title">Flag Bearers Interface</h2>

      {/* Race Selection */}
      <div className="select-dropdown">
        <label>Select Race: </label>
        <select
          value={selectedRace}
          onChange={(e) => setSelectedRace(e.target.value)}
        >
          <option value="">Choose a race</option>
          {races.map((race) => (
            <option key={race.id} value={race.id}>
              {race.sessionName}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Animation */}
      <div className="loading-animation">
        <Lottie options={lottieOptions} width={350} />
      </div>

      {/* Error Handling */}
      {racesError && (
        <p className="error-message">Error fetching races: {racesError}</p>
      )}
      {flagError && (
        <p className="error-message">Error fetching flag data: {flagError}</p>
      )}

      {/* Current Flag Status */}
      <div className="current-flag-display">
        {true && (
          <p>
            {selectedRace
              ? `${sessionName} flag is ${currentFlag}`
              : "Please select a race to see flag."}
          </p>
        )}
      </div>

      {/* Flag Options */}
      {selectedRace && (
        <div className="flag-circles-container">
          {flagOptions.map((flag) => (
            <div
              key={flag.name}
              className={`flag-circle ${
                currentFlag === flag.name ? "active-flag" : ""
              } ${flag.isChequered ? "chequered-flag" : ""}`}
              style={{
                backgroundColor: flag.isChequered ? "transparent" : flag.color,
              }}
              onClick={() => handleFlagChange(flag.name)}
              title={flag.name}
            >
              {flag.isChequered ? (
                <div className="chequered-pattern"></div> // Show chequered pattern
              ) : (
                <span className="flag-name">{flag.name}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlagBearers;
