import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import LeaderBoardModal from "./LeaderBoardModal";
import "./WelcomePage.css";
import LeaderBoardModal from "../guest/leader-board/LeaderBoardModal";

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
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

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

      {/* Role Description and Buttons */}
      <div className="role-description-placeholder">
        {selectedRole && (
          <div className="role-description">
            <p>{roles[userType][selectedRole]}</p>
            {selectedRole === "Receptionist" && (
              <button
                className="welcome-button"
                onClick={() => navigate("/front-desk")}
              >
                Front Desk
              </button>
            )}
            {selectedRole === "SafetyOfficial" && (
              <button
                className="welcome-button"
                onClick={() => navigate("/race-control")}
              >
                Race Control
              </button>
            )}
            {selectedRole === "LapLineObserver" && (
              <>
                <button
                  className="welcome-button"
                  onClick={() => navigate("/lap-line-tracker")}
                >
                  Lap-line Tracker
                </button>
              </>
            )}
            {selectedRole === "RaceDriver" && (
              <button className="welcome-button" onClick={openModal}>
                Leader Board
              </button>
            )}
          </div>
        )}
      </div>

      <LeaderBoardModal isOpen={isModalOpen} onClose={closeModal} />
      {/* <LeaderBoardModal isOpen={isModalOpen} onClose={closeModal} /> */}
    </div>
  );
};

export default WelcomePage;
