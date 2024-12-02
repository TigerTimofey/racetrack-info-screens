import { io } from "socket.io-client";

// Подключение для таймера
export const timerSocket = io("http://localhost:3000/timer");

// Подключение для статуса гонки
export const raceStatusSocket = io("http://localhost:3000/race-status");

//Connecting for receive faster lap and lap time data
export const fastSocket = io("http://localhost:3000/fast");
