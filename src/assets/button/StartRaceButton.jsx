import React, { useEffect, useState } from "react";
import { raceStatusSocket } from "../../socket";
import "./StartRaceButton.css";

const StartRaceButton = () => {
  const [upcomingRace, setUpcomingRace] = useState(null);
  const [raceStarted, setRaceStarted] = useState(false);

  useEffect(() => {
    // Fetch upcoming races and determine the next race
    const fetchUpcomingRace = async () => {
      try {
        const response = await fetch("http://localhost:3000/race-sessions");
        if (!response.ok) {
          throw new Error("Error fetching race sessions");
        }

        const raceSessions = await response.json();
        const pendingRaces = raceSessions.filter((race) => race.status === "Pending");

        if (pendingRaces.length > 0) {
          const sortedRaces = pendingRaces.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          setUpcomingRace(sortedRaces[0]);
        }
      } catch (error) {
        console.error("Error fetching race sessions:", error);
      }
    };

    fetchUpcomingRace();

    // Listen for race status updates
    raceStatusSocket.on("raceStatusUpdate", (data) => {
      console.log("Received race status update:", data);

      if (data.flag === "Finish") {
        console.log("Race finished. Ready for the next race.");
        setRaceStarted(false); // Reset button state
        fetchUpcomingRace(); // Fetch next pending race
      }
    });

    // Cleanup listeners on unmount
    return () => {
      raceStatusSocket.off("raceStatusUpdate");
    };
  }, []);

  const handleStartRace = async () => {
    if (upcomingRace) {
      try {
        // Update race status on the server
        const statusResponse = await fetch(
            `http://localhost:3000/race-sessions/${upcomingRace.id}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: "InProgress" }),
            }
        );

        if (!statusResponse.ok) {
          throw new Error("Error updating race status");
        }

        // Start the timer on the server
        const timerResponse = await fetch("http://localhost:3000/timer/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!timerResponse.ok) {
          throw new Error("Error starting the timer");
        }

        // Notify all clients about the race status update
        raceStatusSocket.emit("updateRaceStatus", {
          sessionId: upcomingRace.id,
          status: "InProgress",
          sessionName: upcomingRace.sessionName,
          flag: "Safe", // Default flag when race starts
        });

        console.log(`Race "${upcomingRace.sessionName}" started and timer initialized.`);
        setRaceStarted(true); // Disable the button until the next race
      } catch (error) {
        console.error("Error starting the race:", error);
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
              {raceStarted ? `Race in progress: ${upcomingRace.sessionName}` : `Start Race: ${upcomingRace.sessionName}`}
            </button>
        ) : (
            <p>No upcoming races available</p>
        )}
      </div>
  );
};

export default StartRaceButton;
