import React, { useEffect, useState } from "react";
import { timerSocket } from "../../socket";
import "./Timer.css";

const Timer = ({ onTimerFinish }) => {
    const [timer, setTimer] = useState(() => {
        // Пытаемся восстановить время из localStorage
        const savedTimer = localStorage.getItem('currentTimer');
        return savedTimer || "00:00";
    });

    useEffect(() => {
        // При монтировании компонента запрашиваем текущее время у сервера
        timerSocket.emit("getCurrentTime");

        timerSocket.on("timeUpdate", (time) => {
            setTimer(time);
            localStorage.setItem('currentTimer', time);
        });

        timerSocket.on("message", (msg) => {
            if (msg === "Timer finished") {
                setTimer("00:00");
                localStorage.removeItem('currentTimer');

                if (onTimerFinish) {
                    onTimerFinish();
                }
            }
        });

        // Обработчик для получения текущего времени при подключении
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