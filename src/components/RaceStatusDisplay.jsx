import React, { useEffect, useState } from "react";
import { raceStatusSocket } from "../socket"; // Используем raceStatusSocket

const RaceStatusDisplay = () => {
  const [raceStatus, setRaceStatus] = useState({
    connectionStatus: "Connecting...",
    raceId: "Unknown",
    raceName: "No data",
    status: "No data"
  });

  const restoreRaceState = async () => {
    try {
      const response = await fetch("http://localhost:3000/race-sessions/current-race");

      if (!response.ok) {
        // Если нет активной гонки, очищаем localStorage
        localStorage.removeItem('currentRace');
        localStorage.removeItem('currentTimer');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data.sessionId !== "Unknown") {
        setRaceStatus({
          connectionStatus: "Connected",
          raceId: result.data.sessionId,
          raceName: result.data.sessionName,
          status: result.data.status
        });
      } else {
        // Если нет активной гонки, очищаем localStorage и состояние
        localStorage.removeItem('currentRace');
        localStorage.removeItem('currentTimer');
        setRaceStatus({
          connectionStatus: "Connected",
          raceId: "Unknown",
          raceName: "No data",
          status: "No data"
        });
      }
    } catch (error) {
      // При ошибке очищаем localStorage
      localStorage.removeItem('currentRace');
      localStorage.removeItem('currentTimer');
      console.error("Error restoring race state:", error);
      setRaceStatus({
        connectionStatus: "Error",
        raceId: "Unknown",
        raceName: "Error loading data",
        status: "Error"
      });
    }
  };

  useEffect(() => {
    // Восстанавливаем состояние при первой загрузке
    restoreRaceState();

    // Обработка подключения WebSocket
    const handleConnect = () => {
      setRaceStatus(prev => ({
        ...prev,
        connectionStatus: "Connected"
      }));
    };

    const handleDisconnect = () => {
      setRaceStatus(prev => ({
        ...prev,
        connectionStatus: "Disconnected"
      }));
    };

    // Слушаем обновления статуса гонки
    raceStatusSocket.on("connect", handleConnect);
    raceStatusSocket.on("disconnect", handleDisconnect);
    raceStatusSocket.on("raceStatusUpdate", (data) => {
      setRaceStatus(prev => ({
        ...prev,
        raceId: data.sessionId || "Unknown",
        raceName: data.sessionName || "No data",
        status: data.status || "No data"
      }));
    });

    // Очищаем слушатели при размонтировании
    return () => {
      raceStatusSocket.off("connect", handleConnect);
      raceStatusSocket.off("disconnect", handleDisconnect);
      raceStatusSocket.off("raceStatusUpdate");
    };
  }, []);

  return (
      <div className="race-status-container">
        <h2>Текущий статус гонки</h2>
        <p>Статус соединения: <strong>{raceStatus.connectionStatus}</strong></p>
        <p>Гонка ID: <strong>{raceStatus.raceId}</strong></p>
        <p>Имя гонки: <strong>{raceStatus.raceName}</strong></p>
        <p>Статус: <strong>{raceStatus.status}</strong></p>
      </div>
  );
};

export default RaceStatusDisplay;