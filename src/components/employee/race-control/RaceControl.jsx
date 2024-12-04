import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backButton } from "../../../assets/button/buttons";
import StartRaceButton from "../../../assets/button/StartRaceButton";
import RaceStatusDisplay from "../../RaceStatusDisplay";
import Timer from "../../timer/Timer";
import FlagFetcher from "../flag-bearers/FlagFetcher";
import "./RaceControl.css";

const RaceControl = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreRaceState = async () => {
            try {
                const response = await fetch("http://localhost:3000/race-sessions/current-race");
                const result = await response.json();

                if (result.success && result.data.sessionId !== "Unknown") {
                    // Сохраняем информацию о текущей гонке
                    localStorage.setItem('currentRace', JSON.stringify(result.data));
                } else {
                    // Если активной гонки нет, очищаем localStorage
                    localStorage.removeItem('currentRace');
                }
            } catch (error) {
                console.error("Failed to restore race state:", error);
            } finally {
                setIsLoading(false);
            }
        };

        restoreRaceState();
    }, []);

    const handleTimerFinish = () => {
        console.log("Timer has finished in Race Control!");
    };

    const handleStartRace = () => {
        console.log("Race started!");
    };

    if (isLoading) {
        return <div className="loading-overlay">
            <div className="loading-spinner"></div>
        </div>;
    }

    return (
        <div className="race-control-container">
            <div className="back-to-main" onClick={() => navigate("/")}>
                {backButton}
            </div>

            <div className="race-control-content">
                <div className="race-control-header">
                    <h2 className="race-control-title">Race Control Interface</h2>
                    <p className="race-control-subtitle">Manage race operations and monitor status</p>
                </div>

                <div className="control-section timer-section">
                    <h3 className="section-title">Race Timer</h3>
                    <Timer onTimerFinish={handleTimerFinish} />
                </div>

                <div className="control-section start-race-section">
                    <h3 className="section-title">Race Control</h3>
                    <StartRaceButton onClick={handleStartRace}>
                        Start Race
                    </StartRaceButton>
                </div>

                <div className="control-section race-status-section">
                    <h3 className="section-title">Race Status</h3>
                    <RaceStatusDisplay />
                </div>

                <div className="control-section flag-bearers-section">
                    <h3 className="section-title">Flag Control</h3>
                    <FlagFetcher />
                </div>
            </div>
        </div>
    );
};

export default RaceControl;