import { io } from 'socket.io-client';

// Подключение для таймера
export const timerSocket = io('http://localhost:3000/timer');

// Подключение для статуса гонки
export const raceStatusSocket = io('http://localhost:3000/race-status');
