import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { backButton, carPersona } from "../../../assets/button/buttons";
import { fastSocket, raceStatusSocket, timerSocket } from "../../../socket";
import Timer from "../../timer/Timer";
import "./LeaderBoard.css";

const flagOptions = [
  { name: "Safe", color: "#2ecc71" },
  { name: "Hazard", color: "#f1c40f" },
  { name: "Danger", color: "#e74c3c" },
  { name: "Finish", isChequered: true },
];

const LeaderBoard = () => {
  const navigate = useNavigate();
  const [responseMessage, setResponseMessage] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [showLaps, setShowLaps] = useState(false);
  const [raceEnded, setRaceEnded] = useState(false);

  //**************************************** COMES FROM SOCKET ****************************************************
  const [currentFlag, setCurrentFlag] = useState("Safe");

  const [raceStatus, setRaceStatus] = useState({
    id: "no id",
    status: "no data",
    sessionName: "",
    flag: "Finish",
    //ADD FLAG
  });
  useEffect(() => {
    // Listen for race status updates
    raceStatusSocket.on("raceStatusUpdate", (data) => {
      setRaceStatus({
        id: data.sessionId || "no id",
        status: data.status || "no status",
        sessionName: data.sessionName || "",
        flag: data.flag,
      });
    });

    raceStatusSocket.on("flagUpdate", (data) => {
      console.log("Received flagUpdate data:", JSON.stringify(data));

      if (data.flag) {
        const matchingFlag = flagOptions.find(
          (flag) => flag.name === data.flag
        );
        if (matchingFlag) {
          setCurrentFlag(matchingFlag);
        } else {
          console.error(`Unknown flag received: ${data.flag}`);
        }
      }
    });

    return () => {
      // Clean up listeners to avoid memory leaks
      raceStatusSocket.off("raceStatusUpdate");
      raceStatusSocket.off("flagUpdate");
    };
  }, []);

  // ***********************************************************************************************************

  useEffect(() => {
    fastSocket.emit("findAllFastestLap");

    fastSocket.on("lapDataResponse", (response) => {
      setResponseMessage(response.message);
      setResponseData(response);
      if (!responseData && currentFlag.name === "Safe") {
        console.log("First lap data received with 'Safe' flag.");
      }
    });

    timerSocket.on("message", (msg) => {
      if (msg === "Timer finished") {
        setShowLaps(true);
        setCurrentFlag(flagOptions[3]);
      }
    });

    return () => {
      fastSocket.off("lapDataResponse");
      timerSocket.off("message"); // Remove the message listener
    };
  }, [currentFlag, responseData]);

  // new
  const resetRaceState = () => {
    setResponseMessage("");
    setResponseData(null);
    setRaceStatus({
      id: "no id",
      status: "no data",
      sessionName: "",
      flag: "Safe",
    });
    setCurrentFlag("Safe");
    setShowLaps(false);
    setRaceEnded(false);
  };
  useEffect(() => {
    raceStatusSocket.on("newRaceStarted", (data) => {
      console.log("New race started:", data);
      resetRaceState(); // Reset state for the new race
      setRaceStatus({
        id: data.sessionId,
        status: data.status,
        sessionName: data.sessionName,
        flag: data.flag || "Safe",
      });
    });

    return () => {
      raceStatusSocket.off("newRaceStarted"); // Clean up listener
    };
  }, []);
  useEffect(() => {
    if (raceStatus.id !== "no id") {
      fastSocket.emit("findAllFastestLap", { raceId: raceStatus.id });
    }
  }, [raceStatus.id]);

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Leader Board Interface</h2>

      {responseMessage === "OK" && responseData && (
        <>
          {" "}
          <Timer onTimerFinish={() => setRaceEnded(true)} />
          <div className="race-name-leader">
            <h2 className="race-name-title-leader">
              {`${raceStatus.sessionName}`}{" "}
            </h2>

            <div
              className={`flag-box ${
                currentFlag.isChequered ? "flag-box--chequered" : ""
              }`}
              style={{
                backgroundColor: currentFlag.isChequered
                  ? "transparent"
                  : currentFlag.color,
              }}
              title={currentFlag.name}
            >
              {currentFlag.isChequered && (
                <div className="flag-box__pattern"></div>
              )}
            </div>
          </div>
          <div className="response-data">
            <div className="fastest-lap-card">
              <h4>Fastest Laps</h4>
              <ul>
                {responseData.fastestLapsData &&
                  responseData.fastestLapsData
                    .filter(
                      (lap) =>
                        lap.lapTime !== "On the way" && lap.lapTime !== null
                    ) // Exclude "On the way" and null
                    .sort((lapA, lapB) => {
                      const convertLapTimeToSeconds = (lapTime) => {
                        if (lapTime === "00:00") {
                          return 0;
                        }
                        if (typeof lapTime === "string") {
                          const [minutes, seconds] = lapTime
                            .split(":")
                            .map(Number);
                          return minutes * 60 + seconds;
                        }
                        return lapTime;
                      };

                      return (
                        convertLapTimeToSeconds(lapA.lapTime) -
                        convertLapTimeToSeconds(lapB.lapTime)
                      );
                    })
                    .map((lap, index) => {
                      let lapTimeToDisplay;

                      if (lap.lapTime === "00:00") {
                        lapTimeToDisplay = "00:00"; // Fastest lap time display
                      } else if (typeof lap.lapTime === "string") {
                        lapTimeToDisplay = lap.lapTime; // Display as is for string times
                      } else if (typeof lap.lapTime === "number") {
                        const lapTimeInMilliseconds = lap.lapTime * 1000;
                        lapTimeToDisplay = `${String(
                          Math.floor(lapTimeInMilliseconds / 60000)
                        ).padStart(2, "0")}:${String(
                          Math.floor((lapTimeInMilliseconds % 60000) / 1000)
                        ).padStart(2, "0")}`;
                      }

                      return (
                        <li key={index}>
                          <strong>
                            {carPersona} № {lap.carNumber} - Driver:{" "}
                            {lap.driverName}
                          </strong>
                          : {lapTimeToDisplay}
                          {responseData.passingLapData &&
                            (() => {
                              const fastestLap = responseData.passingLapData
                                .filter(
                                  (passingLap) =>
                                    passingLap.carNumber === lap.carNumber
                                )
                                .reduce(
                                  (fastest, current) =>
                                    current.lapTime < fastest.lapTime
                                      ? current
                                      : fastest,
                                  responseData.passingLapData[0]
                                );

                              return fastestLap
                                ? ` (Lap ${fastestLap.lapNumber})`
                                : "";
                            })()}
                        </li>
                      );
                    })}
              </ul>
            </div>

            {/* Passing Laps Card */}
            {/* {!raceEnded && <Timer onTimerFinish={() => setRaceEnded(true)} />} */}
            {/* <Timer onTimerFinish={() => setRaceEnded(true)} /> */}

            {/* {raceEnded && responseData.passingLapData && ( */}
            <div className="passing-lap-card-leader">
              <h4>Passing Laps</h4>
              {Object.entries(
                responseData.passingLapData.reduce((grouped, lap) => {
                  const key = `Car ${lap.carNumber} - Driver: ${lap.driverName}`;
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(`Lap ${lap.lapNumber}: ${lap.lapTime}`);
                  return grouped;
                }, {})
              ).map(([key, laps], index) => (
                <div key={index} className="lap-details">
                  <h5>{key}</h5>
                  <p>{laps.join(" | ")}</p>
                </div>
              ))}
            </div>
            {/* )} */}
          </div>
        </>
      )}

      {responseMessage !== "OK" && responseMessage && (
        <div className="error-message">
          <p>Error: Failed to fetch data</p>
        </div>
      )}
    </div>
  );
};

export default LeaderBoard;
