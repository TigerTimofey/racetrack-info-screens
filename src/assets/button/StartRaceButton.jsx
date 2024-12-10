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
      
      if (pendingRaces.length > 0) {
        setUpcomingRace(pendingRaces[0]);
        setRaceStarted(false);
      } else {
        setUpcomingRace(null);
      }
    } catch (error) {
      console.error("Error fetching race sessions:", error);
      setErrorMessage("Could not fetch race sessions. Please try again.");
    }
  };

  // Функция для проверки и обновления текущей гонки
  const checkAndUpdateRace = async () => {
    const savedRace = localStorage.getItem("currentRace");
    if (savedRace) {
      const raceData = JSON.parse(savedRace);
      // Проверяем статус сохраненной гонки
      try {
        const response = await fetch(`http://localhost:3000/race-sessions/${raceData.id}`);
        if (response.ok) {
          const currentRace = await response.json();
          if (currentRace.status === "Finished" || currentRace.status === "Pending") {
            localStorage.removeItem("currentRace");
            setRaceStarted(false);
            fetchUpcomingRace();
          } else if (currentRace.status === "InProgress") {
            setUpcomingRace(currentRace);
            setRaceStarted(true);
          }
        }
      } catch (error) {
        console.error("Error checking race status:", error);
        localStorage.removeItem("currentRace");
        fetchUpcomingRace();
      }
    } else {
      fetchUpcomingRace();
    }
  };

  useEffect(() => {
    checkAndUpdateRace();

    // Слушаем обновления флага
    raceStatusSocket.on("flagUpdate", (data) => {
      if (data.flag === "Finish") {
        setRaceStarted(false);
        localStorage.removeItem("currentRace");
        fetchUpcomingRace();
      }
    });

    // Слушаем обновления статуса гонки
    raceStatusSocket.on("raceStatusUpdate", (data) => {
      console.log("Race status update received:", data);
      if (data.status === "Finished") {
        setRaceStarted(false);
        localStorage.removeItem("currentRace");
        fetchUpcomingRace();
      }
    });

    // Слушаем информацию о следующей гонке
    raceStatusSocket.on("nextRace", (nextRaceData) => {
      console.log("Next race data received:", nextRaceData);
      if (nextRaceData) {
        setUpcomingRace(nextRaceData);
        setRaceStarted(false);
      } else {
        fetchUpcomingRace();
      }
    });

    // Слушаем завершение таймера
    raceStatusSocket.on("timerFinished", () => {
      console.log("Timer finished event received");
      setRaceStarted(false);
      localStorage.removeItem("currentRace");
      fetchUpcomingRace();
    });

    // Периодически проверяем статус гонки каждые 2 секунды
    const interval = setInterval(checkAndUpdateRace, 2000);

    return () => {
      clearInterval(interval);
      raceStatusSocket.off("flagUpdate");
      raceStatusSocket.off("raceStatusUpdate");
      raceStatusSocket.off("nextRace");
      raceStatusSocket.off("timerFinished");
    };
  }, []);

  const handleStartRace = async () => {
    if (upcomingRace) {
      try {
        await fetch(`http://localhost:3000/timer/stop`, {
          method: "POST",
        });

        const statusResponse = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/race-sessions/${upcomingRace.id}/status`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "InProgress" }),
          }
        );
        if (!statusResponse.ok) throw new Error("Failed to update race status");

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
