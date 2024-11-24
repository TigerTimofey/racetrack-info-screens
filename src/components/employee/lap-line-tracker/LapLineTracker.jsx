import React from "react";

import { useNavigate } from "react-router-dom";
import RaceTimer from "./hooks/RaceTimer";
import { backButton } from "../../../assets/button/buttons";

const LapLineTracker = () => {
  const navigate = useNavigate();
  console.log(parseInt(process.env.REACT_APP_TIMER_DURATION, 10));

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Lap Line Tracker Interface</h2>
      <p>Record lap crossings here</p>
      <RaceTimer />
    </div>
  );
};

export default LapLineTracker;
