import { io } from "socket.io-client";

// Подключение для таймера
export const timerSocket = io(`${process.env.REACT_APP_SERVER_URL}/timer`);

// Подключение для статуса гонки
export const raceStatusSocket = io(
  `${process.env.REACT_APP_SERVER_URL}/race-status`
);

//Connecting for receive faster lap and lap time data
export const fastSocket = io(`${process.env.REACT_APP_SERVER_URL}/fast`);
