import React, { useEffect, useState } from "react";

import { fastSocket } from "../../../../socket";

const PassData = ({ fastestLapsData, passingLapData }) => {
  const [responseMessage, setResponseMessage] = useState("");
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    if (fastestLapsData.length > 0 || passingLapData.length > 0) {
      fastSocket.emit("createLapData", {
        fastestLapsData,
        passingLapData,
      });
    }

    fastSocket.on("lapDataResponse", (response) => {
      console.log("", response);
      setResponseMessage(response.message);
      setResponseData(response);
    });

    return () => {
      fastSocket.off("lapDataResponse");
    };
  }, [fastestLapsData, passingLapData]);

  return <></>;
};

export default PassData;
