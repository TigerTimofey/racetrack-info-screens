import React, { useEffect, useState } from "react";
import { timerSocket } from "../../socket";
import { raceStatusSocket } from "../../socket";
import "./Timer.css";

const Timer = ({ onTimerFinish }) => {
    const [timer, setTimer] = useState("00:00");

    useEffect(() => {
        // Проверяем сохраненное время при загрузке
        const savedTimer = localStorage.getItem('currentTimer');
        if (savedTimer) {
            setTimer(savedTimer);
        }

        // Подписываемся на события таймера
        timerSocket.on("timeUpdate", (time) => {
            setTimer(time);
            // Сохраняем текущее время в localStorage
            localStorage.setItem('currentTimer', time);
        });

        timerSocket.on("message", (msg) => {
            if (msg === "Timer finished") {
                setTimer("00:00");
                localStorage.removeItem('currentTimer');

                // Send race finished status to backend
                raceStatusSocket.emit("updateRaceStatus", {
                    status: "Finished",
                    flag: "Finish"
                });

                if (onTimerFinish) {
                    onTimerFinish();
                }
            }
        });

        // Отписываемся от событий при размонтировании компонента
        return () => {
            timerSocket.off("timeUpdate");
            timerSocket.off("message");
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