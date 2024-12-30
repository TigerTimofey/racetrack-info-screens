import React, { useEffect, useState } from "react";
import { fastSocket } from "../../../../socket";

const PassData = ({ fastestLapsData, passingLapData }) => {
  const [localFastestLapsData, setLocalFastestLapsData] =
    useState(fastestLapsData);
  const [localPassingLapData, setLocalPassingLapData] =
    useState(passingLapData);

  // Обновляем локальный стейт и localStorage при изменении данных
  useEffect(() => {
    if (fastestLapsData.length > 0 || passingLapData.length > 0) {
      fastSocket.emit("createLapData", {
        fastestLapsData,
        passingLapData,
      });
    }
  }, [fastestLapsData, passingLapData]);

  useEffect(() => {
    fastSocket.on("lapDataResponse", (response) => {
      console.log("RESPONSE FROM PassData: ", response);

      // Сохраняем данные в localStorage, если они изменились
      localStorage.setItem(
        "fastestLapsData",
        JSON.stringify(response.fastestLapsData)
      );
      localStorage.setItem(
        "passingLapData",
        JSON.stringify(response.passingLapData)
      );

      // Обновляем локальный стейт
      setLocalFastestLapsData(response.fastestLapsData);
      setLocalPassingLapData(response.passingLapData);
    });

    // Очистка слушателей при размонтировании компонента
    return () => {
      fastSocket.off("lapDataResponse");
    };
  }, []); // Пустой массив зависимостей, чтобы подписаться только при монтировании компонента

  return <></>;
};

export default PassData;
