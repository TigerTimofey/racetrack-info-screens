import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { backButton } from "../../../assets/button/buttons";
import "./LapLineTracker.css";

const LapLineTracker = () => {
  const navigate = useNavigate();
  const timerDuration = process.env.REACT_APP_TIMER_DURATION || 10 * 60 * 1000; // Default 10 minutes

  const [cars, setCars] = useState([]);
  const [races, setRaces] = useState([]);
  const [currentRace, setCurrentRace] = useState(null);
  const [raceEnded, setRaceEnded] = useState(false);
  const [lapTimes, setLapTimes] = useState({});
  const [fastestLaps, setFastestLaps] = useState({});
  const [raceStartTime, setRaceStartTime] = useState(null);
  const [lapStartTimes, setLapStartTimes] = useState({});
  const [timeLeft, setTimeLeft] = useState(timerDuration);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(interval);
          setRaceEnded(true); // Mark race as ended
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup timer
  }, [timerDuration]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/front-desk/sessions`
        );
        const result = await response.json();

        if (response.ok) {
          setRaces(result);
          if (result.length > 0) {
            setCurrentRace(result[0]);
            setRaceStartTime(new Date(result[0].startTime));
          }
        } else {
          alert("Error fetching races: " + result.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch races");
      }
    };
    fetchRaces();
  }, []);

  useEffect(() => {
    if (currentRace) {
      const carNumbers = currentRace.drivers.map((driver) => driver.carNumber);
      const fastestLaps = currentRace.drivers.reduce((laps, driver) => {
        laps[driver.carNumber] = driver.fastestLap || Infinity;
        return laps;
      }, {});

      setCars(carNumbers);
      setFastestLaps(fastestLaps);
      setRaceEnded(false);
      setTimeLeft(timerDuration);
    }
  }, [currentRace, timerDuration]);

  const handleLapCrossing = (carNumber) => {
    if (raceEnded) return;

    const currentTime = new Date();

    setLapStartTimes((prevLapStartTimes) => {
      const previousLapStartTime = prevLapStartTimes[carNumber];

      if (previousLapStartTime) {
        const lapTime = (currentTime - previousLapStartTime) / 1000;

        const minutes = Math.floor(lapTime / 60);
        const seconds = Math.floor(lapTime % 60);
        const formattedLapTime = `${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`;

        setLapTimes((prevLapTimes) => {
          const carLapTimes = prevLapTimes[carNumber] || [];
          return {
            ...prevLapTimes,
            [carNumber]: [...carLapTimes, formattedLapTime],
          };
        });

        setFastestLaps((prevFastestLaps) => {
          const currentFastestLap = prevFastestLaps[carNumber];
          if (!currentFastestLap || lapTime < currentFastestLap) {
            updateFastestLapBackend(carNumber, lapTime);
            return {
              ...prevFastestLaps,
              [carNumber]: lapTime,
            };
          }
          return prevFastestLaps;
        });
      }

      return {
        ...prevLapStartTimes,
        [carNumber]: currentTime,
      };
    });
  };

  const updateFastestLapBackend = async (carNumber, lapTime) => {
    const racer = currentRace?.drivers.find(
      (driver) => driver.carNumber === carNumber
    );
    if (racer) {
      const updatedRacer = { ...racer, fastestLap: lapTime };
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/race-drivers/${racer.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedRacer),
          }
        );
        if (!response.ok) {
          const result = await response.json();
          console.error("Failed to update fastest lap:", result.message);
        }
      } catch (error) {
        console.error("Error updating fastest lap:", error);
      }
    }
  };
  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Lap Line Tracker Interface</h2>
      {races.length > 0 ? (
        <>
          <h1>
            Time left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </h1>
          <div className="race-selection">
            <label htmlFor="race-select">Select Race:</label>
            <select
              id="race-select"
              onChange={(e) => {
                const selectedRace = races.find(
                  (race) => race.id === parseInt(e.target.value)
                );
                setCurrentRace(selectedRace);
              }}
            >
              {races.map((race) => (
                <option key={race.id} value={race.id}>
                  {race.sessionName}
                </option>
              ))}
            </select>
          </div>
          <div className="lap-buttons-container">
            {cars.length > 0 ? (
              cars.map((carNumber) => (
                <button
                  key={carNumber}
                  className="lap-button"
                  onClick={() => handleLapCrossing(carNumber)}
                  disabled={raceEnded}
                >
                  {carNumber}
                </button>
              ))
            ) : (
              <p>No cars available for this race.</p>
            )}
          </div>
          {raceEnded && (
            <p className="session-ended-message">Race session has ended.</p>
          )}
          <div className="lap-times">
            <h3>Lap Times</h3>
            <div className="lap-times-grid">
              {Object.entries(lapTimes).map(([carNumber, times]) => (
                <div key={carNumber} className="lap-time-card">
                  <h4>Car №{carNumber}</h4>
                  <ul>
                    {times.map((time, index) => (
                      <li key={index}>{`Lap ${index + 1}: ${time}`}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="fastest-laps">
            <h3>Fastest Laps</h3>
            <ul>
              {Object.entries(fastestLaps).map(([carNumber, time]) => (
                <li key={carNumber}>
                  Car №{carNumber}:{" "}
                  {Number.isFinite(time) && time > 0
                    ? `${String(Math.floor(time / 60)).padStart(
                        2,
                        "0"
                      )}:${String(Math.floor(time % 60)).padStart(2, "0")}`
                    : "No fastest lap set yet"}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="no-race">No races planned</div>
      )}
    </div>
  );
};

export default LapLineTracker;
