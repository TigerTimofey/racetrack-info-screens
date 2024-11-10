import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

// Define roles based on the user type
const roles = {
  Employee: {
    SafetyOfficial:
      "An employee who ensures safety and controls the race. Highly trained and always on-the-go.",
    LapLineObserver:
      "An employee who records when cars cross the lap line, stationed at the track with a portable device.",
    FlagBearer:
      "An employee who communicates safety instructions to race drivers using flags.",
    Receptionist:
      "An employee responsible for welcoming guests and registering race drivers at the front desk.",
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

  return (
    <div className="welcome-container">
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

      {/* Reserved Space for Role Description */}
      <div className="role-description-placeholder">
        {selectedRole && (
          <div className="role-description">
            <p>{roles[userType][selectedRole]}</p>
            {selectedRole === "Receptionist" && (
              <button
                className="welcome-button"
                onClick={() => navigate("/front-desk")}
              >
                Go to Front Desk
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
