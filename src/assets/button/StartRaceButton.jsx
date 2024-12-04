import React, { useEffect, useState } from "react";
import { raceStatusSocket } from "../../socket";
import "./StartRaceButton.css";

const StartRaceButton = () => {
  const [upcomingRace, setUpcomingRace] = useState(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Проверяем localStorage при загрузке компонента
    const savedRace = localStorage.getItem('currentRace');
    if (savedRace) {
      const parsedRace = JSON.parse(savedRace);
      setUpcomingRace(parsedRace);
      setRaceStarted(true);
    }

    // Fetch the upcoming race
    const fetchUpcomingRace = async () => {
      try {
        const response = await fetch("http://localhost:3000/race-sessions");
        if (!response.ok) throw new Error("Failed to fetch race sessions");

        const raceSessions = await response.json();
        const pendingRaces = raceSessions.filter((race) => race.status === "Pending");
        setUpcomingRace(pendingRaces.length > 0 ? pendingRaces[0] : null);
      } catch (error) {
        console.error("Error fetching race sessions:", error);
        setErrorMessage("Could not fetch race sessions. Please try again.");
      }
    };

    if (!savedRace) {
      fetchUpcomingRace();
    }

    // Listen for race updates via WebSocket
    raceStatusSocket.on("raceStatusUpdate", (data) => {
      if (data.flag === "Finish") {
        console.log("Race finished. Preparing the next race.");
        setRaceStarted(false);
        localStorage.removeItem('currentRace');
        fetchUpcomingRace();
      }
    });

    return () => {
      raceStatusSocket.off("raceStatusUpdate");
    };
  }, []);

  const handleStartRace = async () => {
    if (upcomingRace) {
      try {
        // Update race status
        const statusResponse = await fetch(`http://localhost:3000/race-sessions/${upcomingRace.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "InProgress" }),
        });
        if (!statusResponse.ok) throw new Error("Failed to update race status");

        // Start the timer
        const timerResponse = await fetch(`http://localhost:3000/timer/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration: 10 }),
        });
        if (!timerResponse.ok) throw new Error("Failed to start timer");

        // Notify other clients via WebSocket
        raceStatusSocket.emit("updateRaceStatus", {
          sessionId: upcomingRace.id,
          status: "InProgress",
          sessionName: upcomingRace.sessionName,
          flag: "Safe",
        });

        // Сохраняем информацию о текущей гонке в localStorage
        localStorage.setItem('currentRace', JSON.stringify(upcomingRace));

        console.log(`Race "${upcomingRace.sessionName}" started with flag "Safe".`);
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