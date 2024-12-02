import React from "react";
import { useNavigate } from "react-router-dom";
import Timer from "../../timer/Timer"; // Исправленный импорт
import StartRaceButton from "../../../assets/button/StartRaceButton"; // Импорт кнопки
import RaceStatusDisplay from "../../RaceStatusDisplay";
import FlagBearers from "../flag-bearers/FlagBearers"; // Импорт FlagBearers

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
            {/* Кнопка назад */}
            <button className="back-to-main" onClick={() => navigate("/")}>
                Back to Main
            </button>

            <h2 className="race-control-title">Race Control Interface</h2>
            <p>Manage the race operations here</p>

            {/* Встраиваем компонент таймера */}
            <div className="timer-section">
                <Timer onTimerFinish={handleTimerFinish} />
            </div>

            {/* Встраиваем кнопку начала гонки */}
            <div className="start-race-section">
                <StartRaceButton onClick={handleStartRace}>
                    Start Race
                </StartRaceButton>
            </div>

            {/* Отображение статуса гонки */}
            <div className="race-status-display">
                <RaceStatusDisplay />
            </div>

            {/* Компонент FlagBearers */}
            <div className="flag-bearers-section">
                <FlagBearers />
            </div>
        </div>
    );
};

export default RaceControl;