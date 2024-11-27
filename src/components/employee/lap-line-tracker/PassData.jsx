import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000/fast");

const PassData = ({ fastestLapsData, passingLapData }) => {
  const [responseMessage, setResponseMessage] = useState("");
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    if (fastestLapsData.length > 0 || passingLapData.length > 0) {
      socket.emit("createLapData", {
        fastestLapsData,
        passingLapData,
      });
    }

    socket.on("lapDataResponse", (response) => {
      console.log("Received response from server:", response);
      setResponseMessage(response.message);
      setResponseData(response);
    });

    return () => {
      socket.off("lapDataResponse");
    };
  }, [fastestLapsData, passingLapData]);

  return (
    <div className="pass-data-container">
      <div className="fastest-laps-data">
        <h3>Fastest Laps Data</h3>
        <ul>
          {fastestLapsData.map((lap, index) => (
            <li key={index}>
              Car №{lap.carNumber}: {lap.driverName} - {lap.lapTime}
            </li>
          ))}
        </ul>
      </div>

      <div className="passing-lap-data">
        <h3>Passing Lap Data</h3>
        <ul>
          {passingLapData.map((lap, index) => (
            <li key={index}>
              Car №{lap.carNumber}: {lap.driverName} - Lap {lap.lapNumber} (
              {lap.lapTime})
            </li>
          ))}
        </ul>
      </div>

      {responseMessage && (
        <div className="response-message">
          <p>Server Response: {responseMessage}</p>{" "}
        </div>
      )}

      {responseData && (
        <div className="response-data">
          <h3>Response Data</h3>
          <div>
            <h4>Fastest Laps Data</h4>
            <pre>{JSON.stringify(responseData.fastestLapsData, null, 2)}</pre>
          </div>
          <div>
            <h4>Passing Lap Data</h4>
            <pre>{JSON.stringify(responseData.passingLapData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassData;
