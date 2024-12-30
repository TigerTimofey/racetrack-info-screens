import React, { useEffect, useState } from "react";
import { raceStatusSocket, timerSocket } from "../../socket";
import "./Timer.css";

const Timer = ({ onTimerFinish }) => {
    const [timer, setTimer] = useState(() => {
        const savedTimer = localStorage.getItem('currentTimer');
        return savedTimer || "00:00";
    });

    const handleTimerFinish = async () => {
        try {
            const timerResponse = await fetch("http://localhost:3000/timer/stop", {
                method: "POST",
            });

            if (!timerResponse.ok) {
                throw new Error("Failed to stop timer");
            }

            localStorage.removeItem("currentTimer");
            
            const savedRace = localStorage.getItem("currentRace");
            if (savedRace) {
                const raceData = JSON.parse(savedRace);
                
                // Сначала отправляем обновление статуса
                raceStatusSocket.emit('raceStatusUpdate', {
                    sessionId: raceData.id,
                    status: "Finished",
                    sessionName: raceData.sessionName,
                    flag: "Finish"
                });

                // Затем отправляем обновление флага
                raceStatusSocket.emit("updateFlag", {
                    sessionId: raceData.id,
                    flag: "Finish",
                });

                localStorage.removeItem("currentRace");

                // Запрашиваем следующую гонку
                try {
                    const response = await fetch("http://localhost:3000/race-sessions");
                    if (response.ok) {
                        const raceSessions = await response.json();
                        const pendingRaces = raceSessions.filter(race => race.status === "Pending");
                        if (pendingRaces.length > 0) {
                            raceStatusSocket.emit("nextRace", pendingRaces[0]);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching next race:", error);
                }
            }

            setTimer("00:00");

            if (onTimerFinish) {
                onTimerFinish();
            }
        } catch (error) {
            console.error("Error finishing timer:", error);
        }
    };

    useEffect(() => {
        timerSocket.emit("getCurrentTime");

        timerSocket.on("timeUpdate", (time) => {
            setTimer(time);
            localStorage.setItem('currentTimer', time);
            
            if (time === "00:00") {
                handleTimerFinish();
            }
        });

        timerSocket.on("message", async (msg) => {
            if (msg === "Timer finished") {
                await handleTimerFinish();
            }
        });

        timerSocket.on("currentTime", (time) => {
            if (time !== "00:00") {
                setTimer(time);
                localStorage.setItem('currentTimer', time);
            }
        });

        return () => {
            timerSocket.off("timeUpdate");
            timerSocket.off("message");
            timerSocket.off("currentTime");
        };
    }, [onTimerFinish]);

    return (
        <div className="timer">
            <h2>{timer}</h2>
            <small>Remaining time</small>
        </div>
    );
};

export default Timer;