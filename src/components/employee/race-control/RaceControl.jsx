import React from "react";
import { useNavigate } from "react-router-dom";
import { backButton } from "../../../assets/button/buttons";

const RaceControl = () => {
  const navigate = useNavigate();

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="race-control-title">Race Control Interface</h2>
      <p>Manage the race operations here</p>
    </div>
  );
};

export default RaceControl;
