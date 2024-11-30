// src/components/employee/race-control/RaceControl.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Timer from "../../timer/Timer"; // Исправленный импорт
import { backButton } from "../../../assets/button/buttons";
import StartRaceButton from "../../../assets/button/StartRaceButton"; // Импорт кнопки
import RaceStatusDisplay from "../../RaceStatusDisplay";

const RaceControl = () => {
  const navigate = useNavigate();

  // Колбэк, вызываемый, когда таймер завершается
  const handleTimerFinish = () => {
    console.log("Timer has finished in Race Control!");
  };

  // Колбэк для начала гонки
  const handleStartRace = () => {
    console.log("Race started!");
  };

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>

      <h2 className="race-control-title">Race Control Interface</h2>
      <p>Manage the race operations here</p>

      {/* Встраиваем компонент таймера */}
      <div className="timer-section">
        <Timer onTimerFinish={handleTimerFinish} />
      </div>

      {/* Встраиваем кнопку начала гонки */}
      <div className="start-race-section">
        <StartRaceButton onClick={handleStartRace}>Start Race</StartRaceButton>
      </div>
      <div className="race-control-container">
        <h2 className="race-control-title">Race Control Interface</h2>
        <RaceStatusDisplay />
      </div>
    </div>
  );
};

export default RaceControl;
