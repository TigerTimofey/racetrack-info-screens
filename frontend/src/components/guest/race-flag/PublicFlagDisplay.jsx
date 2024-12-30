import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backButton } from "../../../assets/button/buttons";
import { raceStatusSocket } from "../../../socket";
import "./PublicFlagDisplay.css";

const PublicFlagDisplay = () => {
  const navigate = useNavigate();
  const [currentFlag, setCurrentFlag] = useState(() => {
    const savedRace = localStorage.getItem("currentRace");
    if (savedRace) {
      const { flag } = JSON.parse(savedRace);
      const flagColors = {
        Safe: "#2ecc71",
        Hazard: "#f1c40f",
        Danger: "#e74c3c",
        Finish: null,
      };
      return {
        name: flag || "Safe",
        color: flagColors[flag] || "#2ecc71",
      };
    }
    return {
      name: "Safe",
      color: "#2ecc71",
    };
  });

  const [raceStatus, setRaceStatus] = useState(() => {
    const savedRace = localStorage.getItem("currentRace");
    return savedRace
      ? JSON.parse(savedRace)
      : {
          id: "Unknown",
          status: "No data",
          sessionName: "No active race",
        };
  });

  useEffect(() => {
    const fetchCurrentRace = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/race-control/current-race`
        );
        const result = await response.json();

        if (result.success && result.data.sessionId !== "Unknown") {
          const raceData = {
            id: result.data.sessionId,
            status: result.data.status,
            sessionName: result.data.sessionName,
            flag: result.data.flag,
          };

          setRaceStatus(raceData);
          localStorage.setItem("currentRace", JSON.stringify(raceData));

          if (result.data.flag) {
            const flagColors = {
              Safe: "#2ecc71",
              Hazard: "#f1c40f",
              Danger: "#e74c3c",
              Finish: null,
            };

            setCurrentFlag({
              name: result.data.flag,
              color: flagColors[result.data.flag],
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch current race:", error);
      }
    };

    fetchCurrentRace();

    raceStatusSocket.on("raceStatusUpdate", (data) => {
      const updatedStatus = {
        id: data.sessionId || "Unknown",
        status: data.status || "No data",
        sessionName: data.sessionName || "No active race",
        flag: data.flag || currentFlag.name,
      };
      setRaceStatus(updatedStatus);
      localStorage.setItem("currentRace", JSON.stringify(updatedStatus));
    });

    raceStatusSocket.on("flagUpdate", (data) => {
      if (data.flag) {
        const flagColors = {
          Safe: "#2ecc71",
          Hazard: "#f1c40f",
          Danger: "#e74c3c",
          Finish: { isChequered: true },
        };

        const updatedFlag = {
          name: data.flag,
          color: flagColors[data.flag],
        };

        setCurrentFlag(updatedFlag);

        // Обновляем флаг в сохраненном состоянии гонки
        const savedRace = localStorage.getItem("currentRace");
        if (savedRace) {
          const raceData = JSON.parse(savedRace);
          raceData.flag = data.flag;
          localStorage.setItem("currentRace", JSON.stringify(raceData));
        }
      }
    });

    return () => {
      raceStatusSocket.off("raceStatusUpdate");
      raceStatusSocket.off("flagUpdate");
    };
  }, []);

  return (
    <div className="public-flag-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>

      <div className="flag-display-content">
        <h2 className="flag-display-title">Current Race Flag</h2>

        <div className="race-info-display">
          <h3>{raceStatus.sessionName}</h3>
          <p className="race-status">Status: {raceStatus.status}</p>
          {raceStatus.status === "Finished" && (
            <p>Race mode changes to "Danger"</p>
          )}
        </div>

        <div className="current-flag-display">
          <div
            className={`flag-indicator ${currentFlag.name.toLowerCase()}`}
            style={{
              backgroundColor:
                currentFlag.name !== "Finish" ? currentFlag.color : undefined,
            }}
          >
            {currentFlag.name === "Finish" ? (
              <div className="checkered-pattern"></div>
            ) : (
              <span className="flag-name">{currentFlag.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicFlagDisplay;
