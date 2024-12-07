import React, { useEffect, useState } from "react";
import { raceStatusSocket } from "../../socket";
import "./StartRaceButton.css";

const StartRaceButton = () => {
  const [upcomingRace, setUpcomingRace] = useState(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchUpcomingRace = async () => {
    try {
      const response = await fetch("http://localhost:3000/race-sessions");
      if (!response.ok) throw new Error("Failed to fetch race sessions");

      const raceSessions = await response.json();
      const pendingRaces = raceSessions.filter(
        (race) => race.status === "Pending"
      );
      setUpcomingRace(pendingRaces.length > 0 ? pendingRaces[0] : null);
    } catch (error) {
      console.error("Error fetching race sessions:", error);
      setErrorMessage("Could not fetch race sessions. Please try again.");
    }
  };

  useEffect(() => {
    // Проверяем localStorage при загрузке компонента
    const savedRace = localStorage.getItem("currentRace");
    if (savedRace) {
      const parsedRace = JSON.parse(savedRace);
      setUpcomingRace(parsedRace);
      setRaceStarted(true);
    } else {
      fetchUpcomingRace();
    }

    // Слушаем обновления флага
    raceStatusSocket.on("flagUpdate", (data) => {
      if (data.flag === "Finish") {
        setRaceStarted(false);
        localStorage.removeItem("currentRace");
        fetchUpcomingRace();
      }
    });

    // Слушаем информацию о следующей гонке
    raceStatusSocket.on("nextRace", (nextRaceData) => {
      setUpcomingRace(nextRaceData);
      setRaceStarted(false);
    });

    // Слушаем завершение таймера
    raceStatusSocket.on("timerFinished", () => {
      setRaceStarted(false);
      fetchUpcomingRace();
    });

    return () => {
      raceStatusSocket.off("flagUpdate");
      raceStatusSocket.off("nextRace");
      raceStatusSocket.off("timerFinished");
    };
  }, []);

  const handleStartRace = async () => {
    if (upcomingRace) {
      try {
        // Убедимся, что предыдущий таймер остановлен
        await fetch(`http://localhost:3000/timer/stop`, {
          method: "POST",
        });

        const statusResponse = await fetch(
          `http://localhost:3000/race-sessions/${upcomingRace.id}/status`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "InProgress" }),
          }
        );
        if (!statusResponse.ok) throw new Error("Failed to update race status");

        // Запускаем таймер заново
        const timerResponse = await fetch(`http://localhost:3000/timer/start`, {
          method: "POST",
        });
        if (!timerResponse.ok) throw new Error("Failed to start timer");

        raceStatusSocket.emit("updateRaceStatus", {
          sessionId: upcomingRace.id,
          status: "InProgress",
          sessionName: upcomingRace.sessionName,
          flag: "Safe",
        });

        raceStatusSocket.emit("updateFlag", {
          sessionId: upcomingRace.id,
          flag: "Safe",
        });

        localStorage.setItem("currentRace", JSON.stringify(upcomingRace));
        setRaceStarted(true);
        setErrorMessage("");
      } catch (error) {
        console.error("Error starting the race:", error);
        setErrorMessage("Could not start the race. Please try again.");
      }
    }
  };

  return (
    <div>
      {upcomingRace ? (
        <button
          onClick={handleStartRace}
          className={`start-race-button ${raceStarted ? "started" : ""}`}
          disabled={raceStarted}
        >
          {raceStarted
            ? `Race in progress: ${upcomingRace.sessionName}`
            : `Start Race: ${upcomingRace.sessionName}`}
        </button>
      ) : (
        <p>No upcoming races available</p>
      )}

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default StartRaceButton;
