import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import "./WelcomePage.css";

import Lottie from "react-lottie";
import loadingAnimation from "../../assets/lottie-animations/race.json";

const roles = {
  Employee: {
    SafetyOfficial: "An employee who ensures safety and controls the race.",
    LapLineObserver: "Records when cars cross the lap line.",
    FlagBearer: "Communicates safety instructions using flags.",
    Receptionist: "Welcomes guests and registers race drivers at the desk.",
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
  const [userPassword, setUserPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    setSelectedRole("");
  }, [userType]);

  const handleAuthentication = () => {
    if (waiting) return;
    setLoading(true);
    setWaiting(true);

    socket.emit("authenticate", { key: userPassword, role: selectedRole });

    socket.on("authenticated", (status) => {
      setLoading(false);
      if (status) {
        setAuthenticated(true);
      } else {
        setError("Invalid access key");
        setUserPassword("");
      }
    });

    // Set precise 500ms timeout to reset waiting state
    setTimeout(() => {
      setWaiting(false);
      setError("");
    }, 500);
  };

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-person-lock"
            viewBox="0 0 16 16"
          >
            <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m0 5.996V14H3s-1 0-1-1 1-4 6-4q.845.002 1.544.107a4.5 4.5 0 0 0-.803.918A11 11 0 0 0 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664zM9 13a1 1 0 0 1 1-1v-1a2 2 0 1 1 4 0v1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm3-3a1 1 0 0 0-1 1v1h2v-1a1 1 0 0 0-1-1" />
          </svg>
          Employee
        </button>
        <button
          className={`user-type-button ${
            userType === "Guest" ? "selected" : ""
          }`}
          onClick={() => setUserType("Guest")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-person"
            viewBox="0 0 16 16"
          >
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
          </svg>
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
                if (
                  e.target.value === "Receptionist" ||
                  e.target.value === "LapLineObserver" ||
                  e.target.value === "SafetyOfficial"
                ) {
                  setAuthenticated(false);
                }
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
            {selectedRole === "Receptionist" && !authenticated && (
              <>
                <div className="password-container">
                  <input
                    type="password"
                    id="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <button
                    onClick={handleAuthentication}
                    disabled={loading || waiting}
                    className={`submit-button ${
                      loading || waiting ? "disabled" : ""
                    }`}
                  >
                    {loading || waiting ? "Authenticating..." : "Submit"}
                  </button>
                </div>{" "}
                {error && <p className="error-message-show">{error}</p>}
              </>
            )}
            {authenticated && selectedRole === "Receptionist" && (
              <button
                className="welcome-button learn-more"
                onClick={() => navigate("/front-desk")}
              >
                <div className="circle">
                  <div className="icon arrow"></div>
                </div>
                <span className="button-text">Front Desk</span>
              </button>
            )}
            {selectedRole === "SafetyOfficial" && !authenticated && (
              <>
                <div className="password-container">
                  <input
                    type="password"
                    id="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <button onClick={handleAuthentication} disabled={loading}>
                    {loading ? "Authenticating..." : "Submit"}
                  </button>
                </div>{" "}
                {error && <p className="error-message-show">{error}</p>}
              </>
            )}
            {authenticated && selectedRole === "SafetyOfficial" && (
              <button
                className="welcome-button learn-more"
                onClick={() => navigate("/race-control")}
              >
                <div className="circle">
                  <div className="icon arrow"></div>
                </div>
                <span className="button-text">Race Control</span>
              </button>
            )}
            {selectedRole === "LapLineObserver" && !authenticated && (
              <>
                <div className="password-container">
                  <input
                    type="password"
                    id="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <button onClick={handleAuthentication} disabled={loading}>
                    {loading ? "Authenticating..." : "Submit"}
                  </button>
                </div>{" "}
                {error && <p className="error-message-show">{error}</p>}
              </>
            )}
            {authenticated && selectedRole === "LapLineObserver" && (
              <button
                className="welcome-button learn-more"
                onClick={() => navigate("/lap-line-tracker")}
              >
                <div className="circle">
                  <div className="icon arrow"></div>
                </div>
                <span className="button-text">Lap-line Tracker</span>
              </button>
            )}

            {selectedRole === "FlagBearer" && (
              <button
                className="welcome-button learn-more"
                onClick={() => navigate("/flag-bearers")}
              >
                <div className="circle">
                  <div className="icon arrow"></div>
                </div>
                <span className="button-text">Flag Bearers</span>
              </button>
            )}
            {(selectedRole === "RaceDriver" ||
              selectedRole === "Spectator") && (
              <button
                className="welcome-button learn-more"
                onClick={() => navigate("/leader-board")}
              >
                <div className="circle">
                  <div className="icon arrow"></div>
                </div>
                <span className="button-text">Leader Board</span>
              </button>
            )}
            {selectedRole === "RaceDriver" && (
              <>
                <button
                  className="welcome-button learn-more"
                  onClick={() => navigate("/next-race")}
                >
                  <div className="circle">
                    <div className="icon arrow"></div>
                  </div>
                  <span className="button-text">Next Race</span>
                </button>

                <button
                  className="welcome-button learn-more"
                  onClick={() => navigate("/race-countdown")}
                >
                  <div className="circle">
                    <div className="icon arrow"></div>
                  </div>
                  <span className="button-text">Race Countdown</span>
                </button>

                <button
                  className="welcome-button learn-more"
                  onClick={() => navigate("/race-flags")}
                >
                  <div className="circle">
                    <div className="icon arrow"></div>
                  </div>
                  <span className="button-text">Race Flags</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
