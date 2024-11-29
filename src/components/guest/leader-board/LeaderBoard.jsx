import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { backButton } from "../../../assets/button/buttons";
import Timer from "../../timer/Timer";
import "./LeaderBoard.css";
import { raceStatusSocket } from "../../../socket";

const socket = io("http://localhost:3000/fast");
const flagOptions = [
  { name: "Safe", color: "#2ecc71" },
  { name: "Hazard", color: "#f1c40f" },
  { name: "Danger", color: "#e74c3c" },
  { name: "Finish", isChequered: true }, // Add a flag for chequered
];

const LeaderBoard = () => {
  const navigate = useNavigate();
  const [leaderBoardData, setLeaderBoardData] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [showLaps, setShowLaps] = useState(false);
  const [raceEnded, setRaceEnded] = useState(false);

  //**************************************** COMES FROM SOCKET ****************************************************
  const [currentFlag, setCurrentFlag] = useState(flagOptions[0]);
  const [currentRace, setCurrentRace] = useState("HUI");
  const [raceStatus, setRaceStatus] = useState({
    id: "no id",
    status: "no data",
  });

  const handleSetCurrentRace = () => {
    setCurrentRace(); // WHAT WILL COME FROM SOCKET
  };
  useEffect(() => {
    // Слушаем обновления статуса гонки
    raceStatusSocket.on("raceStatusUpdate", (data) => {
      console.log("Получено обновление статуса гонки:", data);
      setRaceStatus({
        id: data.sessionId || "no id",
        status: data.status || "no status",
      });
    });

    return () => {
      raceStatusSocket.off("raceStatusUpdate");
    };
  }, []);
  // ***********************************************************************************************************

  useEffect(() => {
    socket.emit("findAllFastestLap");

    socket.on("lapDataResponse", (response) => {
      console.log("Received response from server:", response);
      setResponseMessage(response.message);
      setResponseData(response);
    });

    const timerSocket = io("http://localhost:3000/timer");
    timerSocket.on("message", (msg) => {
      if (msg === "Timer finished") {
        setShowLaps(true);
        setCurrentFlag(flagOptions[3]);
      }
    });

    return () => {
      socket.off("lapDataResponse");
    };
  }, []);

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Leader Board Interface</h2>

      {responseMessage === "OK" && responseData && (
        <>
          <div className="race-name">
            <h2 className="race-name-title">{`${currentRace}`} </h2>
            <div
              className={`flag-box ${
                currentFlag.isChequered ? "flag-box--chequered" : ""
              }`}
              style={{
                backgroundColor: currentFlag.isChequered
                  ? "transparent"
                  : currentFlag.color,
                display: "inline-block",
                marginRight: "10px",
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
                  responseData.fastestLapsData.map((lap, index) => {
                    let lapTimeToDisplay;

                    if (lap.lapTime === "00:00") {
                      lapTimeToDisplay = "00:00";
                    } else if (typeof lap.lapTime === "string") {
                      const [minutes, seconds] = lap.lapTime
                        .split(":")
                        .map(Number);
                      const lapTimeInMilliseconds =
                        (minutes * 60 + seconds) * 1000;

                      lapTimeToDisplay = `${String(
                        Math.floor(lapTimeInMilliseconds / 60000)
                      ).padStart(2, "0")}:${String(
                        Math.floor((lapTimeInMilliseconds % 60000) / 1000)
                      ).padStart(2, "0")}`;
                    } else if (typeof lap.lapTime === "number") {
                      const lapTimeInMilliseconds = lap.lapTime * 1000;
                      lapTimeToDisplay = `${String(
                        Math.floor(lapTimeInMilliseconds / 60000)
                      ).padStart(2, "0")}:${String(
                        Math.floor((lapTimeInMilliseconds % 60000) / 1000)
                      ).padStart(2, "0")}`;
                    } else if (lap.lapTime === null) {
                      lapTimeToDisplay = "On the way";
                    }

                    return (
                      <li key={index}>
                        <strong>
                          Car {lap.carNumber} - Driver: {lap.driverName}
                        </strong>
                        : {lapTimeToDisplay}
                      </li>
                    );
                  })}
              </ul>
            </div>

            {/* Passing Laps Card */}
            {!showLaps && <Timer onTimerFinish={() => setRaceEnded(true)} />}

            {showLaps && responseData.passingLapData && (
              <div className="passing-lap-card">
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
            )}
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
