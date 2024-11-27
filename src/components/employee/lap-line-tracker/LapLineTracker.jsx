import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { backButton } from "../../../assets/button/buttons";
import Timer from "../../timer/Timer";

import "./LapLineTracker.css";
import PassData from "./passing-data-socket/PassData";

const LapLineTracker = () => {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [raceEnded, setRaceEnded] = useState(false);
  const [lapTimes, setLapTimes] = useState({});
  const [fastestLaps, setFastestLaps] = useState({});
  const [lapStartTimes, setLapStartTimes] = useState({});

  // ********* data will come by socket from safety official
  const [races, setRaces] = useState([]); // <- if .map races === SAFETY race -> handleNewButtonClick to true
  const [currentRace, setCurrentRace] = useState(null); // <- if currentRace NOW what comes from SAFETY race
  const [isNewButtonClicked, setIsNewButtonClicked] = useState(false);
  const handleNewButtonClick = () => {
    setIsNewButtonClicked(true);
  };
  // ************************************************************************

  // ***************************DATA TO PASS FORWARD********************************
  const [fastestLapsData, setFastestLapsData] = useState([]);
  const [passingLapData, setPassingLapData] = useState([]);
  // *********************************************************************************

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

      // Format the fastestLaps state into the required structure for PassData
      const formattedFastestLapsData = carNumbers.map((carNumber) => {
        const driverName = currentRace.drivers.find(
          (driver) => driver.carNumber === carNumber
        )?.name;
        const fastestLap = fastestLaps[carNumber] || "No fastest lap set yet";
        return {
          carNumber,
          driverName,
          lapTime: fastestLap,
        };
      });

      setFastestLapsData(formattedFastestLapsData);
    }
  }, [currentRace]);
  const handleLapCrossing = (carNumber) => {
    if (raceEnded) return;

    const currentTime = new Date();
    const carLapTimes = lapTimes[carNumber] || [];
    const lapCount = carLapTimes.length + 1;

    setLapStartTimes((prevLapStartTimes) => {
      const previousLapStartTime = prevLapStartTimes[carNumber];

      if (previousLapStartTime) {
        const lapTime = (currentTime - previousLapStartTime) / 1000;
        const minutes = Math.floor(lapTime / 60);
        const seconds = Math.floor(lapTime % 60);
        const formattedLapTime = `${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`;

        console.log(
          `Car ${carNumber} completed Lap ${lapCount}: ${formattedLapTime}`
        );

        setLapTimes((prevLapTimes) => ({
          ...prevLapTimes,
          [carNumber]: [
            ...carLapTimes,
            { lapNumber: lapCount, time: formattedLapTime },
          ],
        }));

        setFastestLaps((prevFastestLaps) => {
          const currentFastestLap = prevFastestLaps[carNumber];
          if (!currentFastestLap || lapTime < currentFastestLap) {
            updateFastestLapBackend(carNumber, lapTime);

            setFastestLapsData((prevFastestLapsData) => {
              const updatedFastestLaps = prevFastestLapsData.filter(
                (lap) => lap.carNumber !== carNumber
              );
              const fastestLapEntry = {
                carNumber,
                driverName:
                  currentRace.drivers.find(
                    (driver) => driver.carNumber === carNumber
                  )?.name || `Driver ${carNumber}`,
                lapTime: formattedLapTime,
              };

              return [...updatedFastestLaps, fastestLapEntry];
            });

            return {
              ...prevFastestLaps,
              [carNumber]: lapTime,
            };
          }
          return prevFastestLaps;
        });

        setPassingLapData((prevPassingLapData) => {
          const newPassingEntry = {
            carNumber,
            driverName:
              currentRace.drivers.find(
                (driver) => driver.carNumber === carNumber
              )?.name || `Driver ${carNumber}`,
            lapNumber: lapCount,
            lapTime: formattedLapTime,
          };

          const exists = prevPassingLapData.some(
            (entry) =>
              entry.carNumber === newPassingEntry.carNumber &&
              entry.lapNumber === newPassingEntry.lapNumber
          );

          if (exists) {
            return prevPassingLapData;
          }

          return [...prevPassingLapData, newPassingEntry];
        });

        return {
          ...prevLapStartTimes,
          [carNumber]: currentTime,
        };
      }

      return {
        ...prevLapStartTimes,
        [carNumber]: currentTime,
      };
    });
  };

  const getButtonLabel = (carNumber) => {
    const carLapTimes = lapTimes[carNumber] || [];
    const lapCount = carLapTimes.length + 1;
    const lapInProgress = lapStartTimes[carNumber];

    if (lapInProgress) {
      return `Car №${carNumber} Finish Lap ${lapCount}`;
    }

    return `Car №${carNumber} Start Lap ${lapCount}`;
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

  const handleRaceSelection = (e) => {
    const selectedRace = races.find(
      (race) => race.id === parseInt(e.target.value)
    );
    setCurrentRace(selectedRace);
    setIsNewButtonClicked(false);
  };

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Lap Line Tracker Interface</h2>

      {races.length > 0 ? (
        <>
          <div className="race-selection">
            <label htmlFor="race-select">Select Race:</label>
            <select id="race-select" onChange={handleRaceSelection}>
              <option value="">-- Select a Race --</option>
              {races.map((race) => (
                <option key={race.id} value={race.id}>
                  {race.sessionName}
                </option>
              ))}
            </select>
          </div>
          {/* 
          {isRaceSelected && (
            <>
              <button
                className="start-race-button"
                onClick={handleNewButtonClick}
                // disabled={true}
              >
                START RACE
              </button>
            </>
          )} */}

          {/* Show components only when NEW BUTTON is clicked */}
          {/* ************************************ Update state ************************************ */}
          {!isNewButtonClicked && (
            <>
              <Timer onTimerFinish={() => setRaceEnded(true)} />
              <PassData
                fastestLapsData={fastestLapsData}
                passingLapData={passingLapData}
              />
              <div className="lap-buttons-container">
                {cars.length > 0 ? (
                  cars.map((carNumber) => (
                    <button
                      key={carNumber}
                      className="lap-button"
                      onClick={() => handleLapCrossing(carNumber)}
                      disabled={raceEnded}
                    >
                      {getButtonLabel(carNumber)} s
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
                  {Object.entries(lapTimes).map(([carNumber, laps]) => (
                    <div key={carNumber} className="lap-time-card">
                      <h4>Car №{carNumber}</h4>
                      <ul>
                        {laps.map(({ lapNumber, time }, index) => (
                          <li key={index}>{`Lap ${lapNumber}: ${time}`}</li>
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
                          )}:${String(Math.floor(time % 60)).padStart(
                            2,
                            "0"
                          )} (${((time % 1) * 1000)
                            .toFixed(0)
                            .padStart(3, "0")} ms)`
                        : "No fastest lap set yet"}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="no-race">No races planned</div>
        </>
      )}
    </div>
  );
};

export default LapLineTracker;
