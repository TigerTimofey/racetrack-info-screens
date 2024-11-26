// src/components/employee/race-control/RaceControl.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

import Timer from "../../timer/Timer"; // Исправленный импорт
import "./RaceControl.css";


const RaceControl = () => {
    const navigate = useNavigate();

    // Колбэк, вызываемый, когда таймер завершается
    const handleTimerFinish = () => {
        console.log("Timer has finished in Race Control!");
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
            <h2 className="race-control-title">Race Control Interface</h2>
            <p>Manage the race operations here</p>


            {/* Встраиваем компонент таймера */}
            <div className="timer-section">
                <Timer onTimerFinish={handleTimerFinish} />
            </div>
        </div>
    );

};

export default RaceControl;
