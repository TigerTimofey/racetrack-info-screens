import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { backButton } from "../../../assets/button/buttons";

const socket = io("http://localhost:3000/fast");

const LeaderBoard = () => {
  const navigate = useNavigate();
  const [leaderBoardData, setLeaderBoardData] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    socket.emit("findAllFastestLap");

    socket.on("lapDataResponse", (response) => {
      console.log("Received response from server:", response);
      setResponseMessage(response.message);
      setResponseData(response);
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
      <p>Record lap crossings here</p>

      {responseMessage && (
        <div className="response-message">
          <p>Server Response: {responseMessage}</p>
        </div>
      )}

      {responseMessage === "OK" && responseData && (
        <div className="response-data">
          <h3>Fastest Laps Leaderboard</h3>
          <div>
            <h4>Fastest Laps Data</h4>
            <ul>
              {responseData.fastestLapsData &&
                responseData.fastestLapsData.map((lap, index) => (
                  <li key={index}>
                    <strong>
                      Car {lap.carNumber} - Driver: {lap.driverName}
                    </strong>
                    : {lap.lapTime} (Fastest Lap Time)
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h4>Passing Lap Data - SEE ONLY WHEN RACE IS ENDED!</h4>
            <pre>{JSON.stringify(responseData.passingLapData, null, 2)}</pre>
          </div>
        </div>
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
