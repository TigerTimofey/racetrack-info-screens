import React, { useEffect, useState } from "react";
import { timerSocket } from "../../socket"; // Используем именованный экспорт timerSocket
import "./Timer.css"; // Подключаем CSS

const Timer = ({ onTimerFinish }) => {
    const [timer, setTimer] = useState("00:00");

    useEffect(() => {
        // Подписываемся на события таймера
        timerSocket.on("timeUpdate", (time) => {
            setTimer(time);
        });

        timerSocket.on("message", (msg) => {
            if (msg === "Timer finished") {
                setTimer("00:00");
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
