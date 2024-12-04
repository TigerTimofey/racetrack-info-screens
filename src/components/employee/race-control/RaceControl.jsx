import React from "react";
import { useNavigate } from "react-router-dom";
import Timer from "../../timer/Timer";
import StartRaceButton from "../../../assets/button/StartRaceButton";
import RaceStatusDisplay from "../../RaceStatusDisplay";
import FlagFetcher from "../flag-bearers/FlagFetcher";
import { raceStatusSocket } from "../../../socket";
import { backButton } from "../../../assets/button/buttons"; // Добавляем импорт кнопки

const RaceControl = () => {
    const navigate = useNavigate();

    const handleTimerFinish = () => {
        console.log("Timer has finished in Race Control!");
    };

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

            <div className="timer-section">
                <Timer onTimerFinish={handleTimerFinish} />
            </div>

            <div className="start-race-section">
                <StartRaceButton onClick={handleStartRace}>
                    Start Race
                </StartRaceButton>
            </div>

            <div className="race-status-display">
                <RaceStatusDisplay />
            </div>

            <div className="flag-bearers-section">
                <FlagFetcher />
            </div>
        </div>
    );
};

export default RaceControl;