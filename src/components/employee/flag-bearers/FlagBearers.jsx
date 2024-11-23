import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import loadingAnimation from "../../../assets/lottie-animations/flag.json";
import "./FlagBearers.css";

const FlagBearers = () => {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState("");
  const [currentFlag, setCurrentFlag] = useState("Safe");
  const [isLottieVisible, setIsLottieVisible] = useState(true);
  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
  };

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/front-desk/sessions`
        );
        const result = await response.json();

        if (response.ok) {
          setRaces(result);
          console.log(result);
        } else {
          alert("Error fetching races: " + result.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch races");
      }
    };

    fetchRaces();
  }, []);

  const handleFlagChange = async (newFlag) => {
    if (!selectedRace) {
      alert("Please select a race");
      return;
    }

    try {
      // Assuming the selectedRace is the sessionId for the race
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/race-sessions/${selectedRace}`, // Updated endpoint
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentFlag: newFlag, // Send the updated currentFlag in the body
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setCurrentFlag(newFlag);
      } else {
        console.log(data.message || "Failed to update flag");
      }
    } catch (error) {
      console.error("Error updating flag:", error);
      console.log("An error occurred while updating the flag");
    }
  };

  // Set current flag when a race is selected
  useEffect(() => {
    if (selectedRace) {
      const selectedRaceData = races.find((race) => race._id === selectedRace);
      if (selectedRaceData) {
        setCurrentFlag(selectedRaceData.raceFlags || "Safe");
      }
    }
  }, [selectedRace, races]);

  const flagOptions = [
    { name: "Safe", color: "#2ecc71" },
    { name: "Hazard", color: "#f1c40f" },
    { name: "Danger", color: "#e74c3c" },
    { name: "Finish", color: "#3498db" },
  ];

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
      <div className="loading-animation">
        {isLottieVisible && <Lottie options={lottieOptions} width={350} />}
      </div>

      {/* Current Flag Status */}
      <div className="current-flag-display">
        <p>
          {selectedRace
            ? `${
                races.find((race) => race._id === selectedRace)?.sessionName
              } flag is ${currentFlag}`
            : "Please select a race to see flag."}
        </p>
      </div>

      {/* Flag Options - Disabled if no race is selected */}
      {selectedRace && (
        <div className="flag-circles-container">
          {flagOptions.map((flag) => (
            <div
              key={flag.name}
              className={`flag-circle ${
                currentFlag === flag.name ? "active-flag" : ""
              }`}
              style={{ backgroundColor: flag.color }}
              onClick={() => handleFlagChange(flag.name)}
              title={flag.name}
            >
              <span className="flag-name">{flag.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlagBearers;
