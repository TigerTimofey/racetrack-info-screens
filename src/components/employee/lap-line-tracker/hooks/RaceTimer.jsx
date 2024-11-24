import React, { useEffect, useState } from "react";

const RaceTimer = () => {
  const timerDuration = process.env.REACT_APP_TIMER_DURATION || 10 * 60 * 1000; // 10 minutes default

  const [timeLeft, setTimeLeft] = useState(timerDuration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1000; // уменьшение на 1 секунду
      });
    }, 1000);

    return () => clearInterval(interval); // очистить интервал при размонтировании
  }, []);

  // Преобразование миллисекунд в минуты и секунды
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div>
      <h1>
        Time left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </h1>
    </div>
  );
};

export default RaceTimer;
