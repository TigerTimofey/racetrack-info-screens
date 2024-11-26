import React, { useEffect, useState } from "react";
import socket from "../../socket"; // Убедитесь, что путь верный
import "./Timer.css"; // Подключаем CSS

const Timer = ({ onTimerFinish }) => {
    const [timer, setTimer] = useState("00:00");

    useEffect(() => {
        socket.on("timeUpdate", (time) => {
            setTimer(time);
        });

        socket.on("message", (msg) => {
            if (msg === "Timer finished") {
                setTimer("00:00");
                if (onTimerFinish) {
                    onTimerFinish();
                }
            }
        });

        return () => {
            socket.off("timeUpdate");
            socket.off("message");
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
