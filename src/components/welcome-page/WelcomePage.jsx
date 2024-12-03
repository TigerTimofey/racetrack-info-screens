import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthComponent from "../Auth/auth"; // Authentication Component
import "./WelcomePage.css";

import Lottie from "react-lottie";
import loadingAnimation from "../../assets/lottie-animations/race.json";

const roles = {
  Employee: {
    SafetyOfficial: "Ensures safety and controls the race.",
    LapLineObserver: "Records when cars cross the lap line.",
    Receptionist: "Welcomes guests and registers race drivers at the desk.",
  },
  Guest: {
    RaceDriver:
      "A guest who will participate in a race as a non-professional driver.",
    Spectator:
      "A guest who watches the race and is interested in driver performances.",
  },
};

// Reusable Button Component
const RoleButton = ({ text, onClick }) => (
  <button className="welcome-button learn-more" onClick={onClick}>
    <div className="circle">
      <div className="icon arrow"></div>
    </div>
    <span className="button-text">{text}</span>
  </button>
);

const WelcomePage = () => {
  const [userType, setUserType] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedRole("");
  }, [userType]);

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
  };

  const handleAuthenticated = () => {
    if (selectedRole === "Receptionist") {
      navigate("/front-desk");
    } else if (selectedRole === "SafetyOfficial") {
      navigate("/race-control");
    } else if (selectedRole === "LapLineObserver") {
      navigate("/lap-line-tracker");
    }
  };

  return (
    <div className="welcome-container">
      <div className="loading-animation">
        <Lottie options={lottieOptions} height={200} />
      </div>
      <h2 className="welcome-title">Welcome to the Beachside Racetrack</h2>
      <p className="welcome-subtitle">Select your role to get started</p>

      {/* Step 1: Choose User Type */}
      <div className="user-type-selection">
        <button
          className={`user-type-button ${
            userType === "Employee" ? "selected" : ""
          }`}
          onClick={() => setUserType("Employee")}
        >
          Employee
        </button>
        <button
          className={`user-type-button ${
            userType === "Guest" ? "selected" : ""
          }`}
          onClick={() => setUserType("Guest")}
        >
          Guest
        </button>
      </div>

      {/* Step 2: Role Selection */}
      <div className="role-selection-placeholder">
        {userType && (
          <div className="role-selection">
            <label htmlFor="role-select" className="role-label">
              Choose Role:
            </label>
            <select
              id="role-select"
              className="role-dropdown"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select a Role</option>
              {Object.keys(roles[userType]).map((roleKey) => (
                <option key={roleKey} value={roleKey}>
                  {roleKey.replace(/([A-Z])/g, " $1")}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Step 3: Role Description and Navigation Buttons */}
      <div className="role-description-placeholder">
        {selectedRole && (
          <div className="role-description">
            <p>
              <b>{roles[userType][selectedRole]}</b>
            </p>

            {/* Conditional Rendering of Buttons */}
            {["Receptionist", "SafetyOfficial", "LapLineObserver"].includes(
              selectedRole
            ) ? (
              <AuthComponent
                apiUrl={process.env.REACT_APP_SERVER_URL}
                role={selectedRole}
                onAuthenticated={handleAuthenticated}
              />
            ) : (
              <div>
                {(selectedRole === "RaceDriver" ||
                  selectedRole === "Spectator") && (
                  <RoleButton
                    text="Leader Board"
                    onClick={() => navigate("/leader-board")}
                  />
                )}
                {selectedRole === "RaceDriver" && (
                  <>
                    <RoleButton
                      text="Next Race"
                      onClick={() => navigate("/next-race")}
                    />
                    <RoleButton
                      text="Race Countdown"
                      onClick={() => navigate("/race-countdown")}
                    />
                    <RoleButton
                      text="Race Flags"
                      onClick={() => navigate("/race-flags")}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
