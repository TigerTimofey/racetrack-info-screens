import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import loadingAnimation from "../../../assets/lottie-animations/flag.json";
import { raceStatusSocket } from "../../../socket";
import "./FlagBearers.css";

const FlagFetcher = () => {
  const [currentRace, setCurrentRace] = useState({
    id: "Unknown",
    sessionName: "No data",
    status: "No data",
    flag: "Safe",
  });

  const [currentFlag, setCurrentFlag] = useState(() => {
    const savedRace = localStorage.getItem("currentRace");
    return savedRace ? JSON.parse(savedRace).flag || "Safe" : "Safe";
  });
  const [updateMessage, setUpdateMessage] = useState("");
  const [nextRace, setNextRace] = useState(null);

  // Flag options
  const flagOptions = [
    { name: "Safe", color: "#2ecc71" },
    { name: "Hazard", color: "#f1c40f" },
    { name: "Danger", color: "#e74c3c" },
    { name: "Finish", isChequered: true },
  ];

  // Функция для восстановления состояния гонки
  const restoreRaceState = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/race-control/current-race"
      );

      if (!response.ok) {
        // Если нет активной гонки, очищаем localStorage
        localStorage.removeItem("currentRace");
        localStorage.removeItem("currentTimer");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data.sessionId !== "Unknown") {
        // Если есть активная гонка, обновляем состояние
        const raceData = {
          id: result.data.sessionId,
          sessionName: result.data.sessionName,
          status: result.data.status,
          flag: result.data.flag,
        };
        setCurrentRace(raceData);
        setCurrentFlag(raceData.flag);
        // Обновляем localStorage только если гонка реально существует
        localStorage.setItem("currentRace", JSON.stringify(raceData));
      } else {
        // Если нет активной гонки, очищаем localStorage и состояние
        localStorage.removeItem("currentRace");
        localStorage.removeItem("currentTimer");
        setCurrentRace({
          id: "Unknown",
          sessionName: "No data",
          status: "No data",
          flag: "Safe",
        });
        setCurrentFlag("Safe");
      }
    } catch (error) {
      // При ошибке очищаем localStorage
      localStorage.removeItem("currentRace");
      localStorage.removeItem("currentTimer");
      console.error("Error restoring race state:", error);
      setCurrentRace({
        id: "Unknown",
        sessionName: "Error loading data",
        status: "Error",
        flag: "Safe",
      });
      setCurrentFlag("Safe");
    }
  };

  useEffect(() => {
    // При первой загрузке пытаемся восстановить состояние
    restoreRaceState();

    // Слушаем события WebSocket
    raceStatusSocket.on("raceStatusUpdate", (data) => {
      console.log("Received race status update in FlagFetcher:", data);
      const updatedRace = {
        id: data.sessionId || "Unknown",
        sessionName: data.sessionName || "No data",
        status: data.status || "No data",
        flag: data.flag || currentFlag,
      };
      setCurrentRace(updatedRace);
      localStorage.setItem("currentRace", JSON.stringify(updatedRace));

      if (data.flag) {
        setCurrentFlag(data.flag);
      }
    });

    raceStatusSocket.on("nextRace", (data) => {
      console.log("Next race prepared:", data);
      setNextRace(data);
    });

    raceStatusSocket.on("flagUpdate", (data) => {
      console.log("Received flagUpdate data:", JSON.stringify(data));
      if (data.flag) {
        setCurrentFlag(data.flag);
        // Обновляем флаг в localStorage
        const savedRace = localStorage.getItem("currentRace");
        if (savedRace) {
          const raceData = JSON.parse(savedRace);
          raceData.flag = data.flag;
          localStorage.setItem("currentRace", JSON.stringify(raceData));
        }
      }
    });

    // Очищаем слушатели при размонтировании
    return () => {
      raceStatusSocket.off("raceStatusUpdate");
      raceStatusSocket.off("nextRace");
      raceStatusSocket.off("flagUpdate");
    };
  }, []);
  const handleFlagChange = async (newFlag) => {
    if (currentRace.id === "Unknown") {
      alert("No race selected.");
      return;
    }

    try {
      if (newFlag === "Finish") {
        // Останавливаем таймер
        const timerResponse = await fetch("http://localhost:3000/timer/stop", {
          method: "POST",
        });

        if (!timerResponse.ok) {
          throw new Error("Failed to stop timer");
        }

        // Обновляем статус гонки на Finished
        // const response = await fetch(
        //   `http://localhost:3000/race-sessions/${currentRace.id}/status`,
        //   {
        //     method: "PUT",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       status: "Finished",
        //       flag: "Finish",
        //     }),
        //   }
        // );

        // if (!response.ok) {
        //   throw new Error("Failed to finish race");
        // }

        // Очищаем локальное хранилище
        localStorage.removeItem("currentRace");
        localStorage.removeItem("currentTimer");

        // Отправляем сообщение через сокет о завершении гонки
        raceStatusSocket.emit("updateRaceStatus", {
          sessionId: currentRace.id,
          status: "Finished",
          flag: "Finish",
        });
      }

      // Отправляем обновление флага
      raceStatusSocket.emit("updateFlag", {
        sessionId: currentRace.id,
        flag: newFlag,
      });

      setCurrentFlag(newFlag);
      setUpdateMessage(`Flag successfully updated to: ${newFlag}`);
      setTimeout(() => setUpdateMessage(""), 5000);
    } catch (error) {
      console.error("Error updating flag:", error);
      setUpdateMessage("Error updating flag");
      setTimeout(() => setUpdateMessage(""), 5000);
    }
  };

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
  };

  return (
    <div className="flag-bearers-container">
      <h2>Flag Management</h2>
      <p>
        Current Race: <strong>{currentRace.sessionName}</strong>
      </p>
      <p>
        Current Race Status: <strong>{currentRace.status}</strong>
      </p>

      {/* Flag update notification */}
      {updateMessage && (
        <div className="update-message">
          <p>{updateMessage}</p>
        </div>
      )}

      {/* Loading animation */}
      {currentRace.id === "Unknown" && (
        <div className="loading-animation">
          <Lottie options={lottieOptions} width={150} />
        </div>
      )}

      {/* Flag options */}
      {currentRace.id !== "Unknown" && (
        <div className="flag-circles-container">
          {flagOptions.map((flag) => (
            <div
              key={flag.name}
              className={`flag-circle ${
                currentFlag === flag.name ? "active-flag" : ""
              } ${flag.isChequered ? "chequered-flag" : ""}`}
              style={{
                backgroundColor: flag.isChequered ? "transparent" : flag.color,
              }}
              onClick={() => handleFlagChange(flag.name)}
              title={flag.name}
            >
              {flag.isChequered ? (
                <div className="chequered-pattern"></div>
              ) : (
                <span className="flag-name">{flag.name}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlagFetcher;
