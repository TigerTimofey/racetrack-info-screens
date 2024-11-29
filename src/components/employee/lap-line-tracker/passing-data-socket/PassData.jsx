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

  return <></>;
};

export default PassData;
