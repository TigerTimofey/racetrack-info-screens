import React, { useEffect, useState } from "react";
import { raceStatusSocket } from "../socket"; // Используем raceStatusSocket

const RaceStatusDisplay = () => {
  const [raceStatus, setRaceStatus] = useState({
    id: "Неизвестно",
    status: "Нет данных",
    sessionName: "Нет данных", // Добавлено поле sessionName
  });
  const [connectionStatus, setConnectionStatus] = useState("Не подключено");

  useEffect(() => {

    // Подключение к WebSocket
    raceStatusSocket.on("connect", () => {
      console.log("Подключение к WebSocket (Race Status) установлено");
      setConnectionStatus("Подключено");
    });

    raceStatusSocket.on("disconnect", () => {
      console.log("Соединение с WebSocket (Race Status) потеряно");
      setConnectionStatus("Не подключено");
    });

    raceStatusSocket.on("connect_error", (error) => {
      console.error("Ошибка подключения к WebSocket (Race Status):", error);
      setConnectionStatus("Ошибка подключения");
    });

    // Слушаем обновления статуса гонки
    raceStatusSocket.on("raceStatusUpdate", (data) => {
      console.log("Получено обновление статуса гонки:", data);
      setRaceStatus({
        id: data.sessionId || "Неизвестно",
        status: data.status || "Нет данных",
        sessionName: data.sessionName || "Нет данных", // Установка имени сессии
      });
    });

    // Очистка событий при размонтировании компонента
    return () => {
      raceStatusSocket.off("raceStatusUpdate");
      raceStatusSocket.off("connect");
      raceStatusSocket.off("disconnect");
      raceStatusSocket.off("connect_error");
    };
  }, []);

  return (
    <div className="race-status-display">
      <h2>Текущий статус гонки</h2>
      <p>
        Статус соединения: <strong>{connectionStatus}</strong>
      </p>
      <p>
        Гонка ID: <strong>{raceStatus.id}</strong>
      </p>
      <p>
        Имя гонки: <strong>{raceStatus.sessionName}</strong>
      </p>
      <p>
        Статус: <strong>{raceStatus.status}</strong>
      </p>
    </div>
  );
};

export default RaceStatusDisplay;
