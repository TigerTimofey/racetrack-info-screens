import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthComponent from "../Auth/auth"; // Импортируем AuthComponent
import "./WelcomePage.css";

import Lottie from "react-lottie";
import loadingAnimation from "../../assets/lottie-animations/race.json";

const roles = {
  Employee: {
    SafetyOfficial: "An employee who ensures safety and controls the race.",
    LapLineObserver: "Records when cars cross the lap line.",
    FlagBearer: "Communicates safety instructions using flags.",
    Receptionist:
        "Welcomes guests and registers race drivers at the desk.",
  },
  Guest: {
    RaceDriver:
        "A guest who will participate in a race as a non-professional driver.",
    Spectator:
        "A guest who watches the race and is interested in driver performances.",
  },
};

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

  // Функция обработки успешной аутентификации
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
            {/* SVG Icon */}
            Employee
          </button>
          <button
              className={`user-type-button ${
                  userType === "Guest" ? "selected" : ""
              }`}
              onClick={() => setUserType("Guest")}
          >
            {/* SVG Icon */}
            Guest
          </button>
        </div>
        {/* Reserved Space for Role Selection */}
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
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                    }}
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
        {/* Role Description and Buttons */}
        <div className="role-description-placeholder">
          {selectedRole && (
              <div className="role-description">
                <p>
                  <b>{roles[userType][selectedRole]}</b>
                </p>
                {/* Используем AuthComponent для ролей, требующих аутентификации */}
                {["Receptionist", "SafetyOfficial", "LapLineObserver"].includes(
                    selectedRole
                ) ? (
                    <AuthComponent
                        apiUrl="http://localhost:3000" // Замените на ваш реальный API URL
                        role={selectedRole}
                        onAuthenticated={handleAuthenticated}
                    />
                ) : (
                    // Для ролей, не требующих аутентификации, отображаем кнопки навигации
                    <div>
                      {selectedRole === "FlagBearer" && (
                          <button
                              className="welcome-button learn-more"
                              onClick={() => navigate("/flag-bearers")}
                          >
                            Flag Bearers
                          </button>
                      )}
                      {(selectedRole === "RaceDriver" ||
                          selectedRole === "Spectator") && (
                          <button
                              className="welcome-button learn-more"
                              onClick={() => navigate("/leader-board")}
                          >
                            Leader Board
                          </button>
                      )}
                      {selectedRole === "RaceDriver" && (
                          <>
                            <button
                                className="welcome-button learn-more"
                                onClick={() => navigate("/next-race")}
                            >
                              Next Race
                            </button>

                            <button
                                className="welcome-button learn-more"
                                onClick={() => navigate("/race-countdown")}
                            >
                              Race Countdown
                            </button>

                            <button
                                className="welcome-button learn-more"
                                onClick={() => navigate("/race-flags")}
                            >
                              Race Flags
                            </button>
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
