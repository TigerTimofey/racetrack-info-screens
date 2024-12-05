import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backButton, carPersona } from "../../../assets/button/buttons";
import Timer from "../../timer/Timer";

import "./LapLineTracker.css";
import PassData from "./passing-data-socket/PassData";

import { raceStatusSocket, fastSocket } from "../../../socket";

const LapLineTracker = () => {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [raceEnded, setRaceEnded] = useState(false);
  const [lapTimes, setLapTimes] = useState({});
  const [fastestLaps, setFastestLaps] = useState({});
  const [lapStartTimes, setLapStartTimes] = useState({});
  const [races, setRaces] = useState([]);
  const [currentRace, setCurrentRace] = useState(null);
  const [raceStatus, setRaceStatus] = useState({
    id: "no id",
    status: "no status",
    name: "",
  });
  const [fastestLapsData, setFastestLapsData] = useState([]);
  const [passingLapData, setPassingLapData] = useState([]);

  useEffect(() => {
    // Listen for race status updates
    raceStatusSocket.on("raceStatusUpdate", (data) => {
      console.log("socket data:", data);
      setRaceStatus({
        id: data.sessionId || "no id",
        status: data.status || "no data",
      });
    });

    // Listen for flag updates
    raceStatusSocket.on("flagUpdate", (data) => {
      console.log("Received flagUpdate data:", JSON.stringify(data));
      if (data.flag) {
        console.log("Flag is:", data.flag);
        // You can set or update state here if needed for flags
      } else {
        console.log("Flag property is missing in the data");
      }
    });

    // Cleanup listeners on component unmount
    return () => {
      raceStatusSocket.off("raceStatusUpdate");
      raceStatusSocket.off("flagUpdate");
    };
  }, []);

  useEffect(() => {
    const matchingRace = races.find(
      (race) => race.id === Number(raceStatus.id)
    );
    if (matchingRace) {
      setCurrentRace(matchingRace);
      setFastestLaps({});
      setLapTimes({});
      setPassingLapData([]);
    } else {
      setCurrentRace(null);
    }
  }, [raceStatus, races]);

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
        laps[driver.carNumber] =
          driver.fastestLap && driver.fastestLap !== Infinity
            ? driver.fastestLap
            : "No fastest lap set yet";
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
              currentRace?.drivers.find(
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

    const labelAction = lapInProgress
      ? `Finish Lap ${lapCount}`
      : `Start Lap ${lapCount}`;

    return (
      <>
        {carPersona} №{carNumber} {labelAction}
      </>
    );
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
  useEffect(() => {
    const savedFastestLapsData = localStorage.getItem("fastestLapsData");
    const savedPassingLapData = localStorage.getItem("passingLapData");

    if (savedFastestLapsData && savedPassingLapData) {
      setFastestLapsData(JSON.parse(savedFastestLapsData));
      setPassingLapData(JSON.parse(savedPassingLapData));
    }
  }, []);
  useEffect(() => {
    fastSocket.on("lapDataResponse", (response) => {
      console.log("RESPONSE FROM PassData: ", response);

      // Update localStorage with the new lap data
      localStorage.setItem(
        "fastestLapsData",
        JSON.stringify(response.fastestLapsData)
      );
      localStorage.setItem(
        "passingLapData",
        JSON.stringify(response.passingLapData)
      );

      // Update state with the new lap data
      setFastestLapsData(response.fastestLapsData);
      setPassingLapData(response.passingLapData);
    });

    return () => {
      fastSocket.off("lapDataResponse");
    };
  }, []);

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Lap Line Tracker Interface</h2>

      {races.length > 0 ? (
        <>
          <div className="race-selection">
            <label htmlFor="race-select">
              <h1>{currentRace?.sessionName}</h1>
            </label>
          </div>

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
                    {getButtonLabel(carNumber)}
                  </button>
                ))
              ) : (
                <p>No cars available for this race.</p>
              )}
            </div>

            {raceEnded && (
              <p className="session-ended-message">Race session has ended.</p>
            )}

            <div className="passing-laps">
              <h3>Passing Lap Data</h3>
              <div className="passing-laps-grid">
                {passingLapData.length > 0 ? (
                  passingLapData.map(
                    ({ carNumber, driverName, lapNumber, lapTime }) => (
                      <div
                        key={`${carNumber}-${lapNumber}`}
                        className="passing-lap-card"
                      >
                        <h4>
                          {driverName} - Car {carNumber}
                        </h4>
                        <ul>
                          <li>{`Lap Number: ${lapNumber}`}</li>
                          <li>{`Lap Time: ${lapTime}`}</li>
                        </ul>
                      </div>
                    )
                  )
                ) : (
                  <p>No passing lap data available.</p>
                )}
              </div>
            </div>

            <div className="fastest-laps">
              <h3>Fastest Laps</h3>
              <ul>
                {fastestLapsData.map(({ carNumber, driverName, lapTime }) => (
                  <li key={carNumber}>
                    {driverName} - Car {carNumber}:{" "}
                    {lapTime !== "No fastest lap set yet"
                      ? lapTime
                      : "No fastest lap set yet"}
                  </li>
                ))}
              </ul>
            </div>
          </>
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
