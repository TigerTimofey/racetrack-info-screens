import React, { useEffect, useState } from "react";
import { raceStatusSocket } from "../socket";

const RaceStatusDisplay = () => {
  const [raceStatus, setRaceStatus] = useState({
    connectionStatus: "Connecting...",
    raceId: "Unknown",
    raceName: "No data",
    status: "No data"
  });

  useEffect(() => {
    // Явно подключаем сокет, если он не подключен
    if (!raceStatusSocket.connected) {
      console.log('Socket not connected, connecting...');
      raceStatusSocket.connect();
    }

    const handleConnect = () => {
      console.log('Socket connected successfully');
      setRaceStatus(prev => ({
        ...prev,
        connectionStatus: "Connected"
      }));
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setRaceStatus(prev => ({
        ...prev,
        connectionStatus: "Disconnected"
      }));
    };

    const handleRaceStatusUpdate = (data) => {
      console.log('Received race status update:', data);
      setRaceStatus(prev => ({
        ...prev,
        raceId: data.sessionId || "Unknown",
        raceName: data.sessionName || "No data",
        status: data.status || "No data"
      }));
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
      setRaceStatus(prev => ({
        ...prev,
        connectionStatus: "Error"
      }));
    };

    // Добавляем слушатели
    raceStatusSocket.on("connect", handleConnect);
    raceStatusSocket.on("disconnect", handleDisconnect);
    raceStatusSocket.on("connect_error", handleConnectError);
    raceStatusSocket.on("raceStatusUpdate", handleRaceStatusUpdate);

    // Вызываем restoreRaceState после установки соединения
    if (raceStatusSocket.connected) {
      restoreRaceState();
    }

    return () => {
      console.log('Cleaning up socket listeners');
      raceStatusSocket.off("connect", handleConnect);
      raceStatusSocket.off("disconnect", handleDisconnect);
      raceStatusSocket.off("connect_error", handleConnectError);
      raceStatusSocket.off("raceStatusUpdate", handleRaceStatusUpdate);
    };
  }, []);

  const restoreRaceState = async () => {
    try {
      console.log('Restoring race state...');
      const response = await fetch("http://localhost:3000/race-sessions/current-race");

      if (!response.ok) {
        localStorage.removeItem('currentRace');
        localStorage.removeItem('currentTimer');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Restored race state:', result);

      if (result.success && result.data.sessionId !== "Unknown") {
        setRaceStatus({
          connectionStatus: "Connected",
          raceId: result.data.sessionId,
          raceName: result.data.sessionName,
          status: result.data.status
        });
      } else {
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
      console.error("Error restoring race state:", error);
      localStorage.removeItem('currentRace');
      localStorage.removeItem('currentTimer');
      setRaceStatus({
        connectionStatus: "Error",
        raceId: "Unknown",
        raceName: "Error loading data",
        status: "Error"
      });
    }
  };

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