// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/timer'); // Убедитесь, что путь совпадает с namespace на сервере

export default socket;
