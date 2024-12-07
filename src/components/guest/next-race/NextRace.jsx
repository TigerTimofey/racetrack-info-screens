import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backButton, carPersona } from "../../../assets/button/buttons";
import { raceStatusSocket, timerSocket } from "../../../socket";

import "./NextRace.css";

const NextRace = () => {
  const navigate = useNavigate();

  const [races, setRaces] = useState([]);
  const [proceedToPaddrock, setProceedToPaddrock] = useState(false);
  const [raceStatus, setRaceStatus] = useState({
    id: "no id",
    status: "no data",
    sessionName: "",
  });
  const [nextRaceIndex, setNextRaceIndex] = useState(-1);
  const [raceHasStarted, setRaceHasStarted] = useState(false);
  const fetchRaces = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/front-desk/sessions`
      );
      const result = await response.json();

      if (response.ok) {
        const sortedRaces = result.sort((a, b) => {
          const dateA = new Date(a.startTime);
          const dateB = new Date(b.startTime);
          return dateA - dateB;
        });
        setRaces(sortedRaces);
        setNextRaceIndex(1);
      } else {
        alert("Error fetching races: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    fetchRaces();
  }, []);

  useEffect(() => {
    const handleRaceStatusUpdate = (data) => {
      setRaceStatus({
        id: data.sessionId || "no id",
        status: data.status || "no status",
        sessionName: data.sessionName || "",
      });

      // Progress to the next race only if it's safe
      // if (raceHasStarted && nextRaceIndex + 1 < races.length) {
      //   setNextRaceIndex(nextRaceIndex + 1);
      // }
    };

    raceStatusSocket.on("raceStatusUpdate", handleRaceStatusUpdate);

    raceStatusSocket.on("flagUpdate", (data) => {
      console.log("Received flagUpdate data:", JSON.stringify(data));

      if (data.flag === "Safe") {
        setRaceHasStarted(true);
        setProceedToPaddrock(false);
        if (raceHasStarted && nextRaceIndex + 1 < races.length) {
          setNextRaceIndex(nextRaceIndex + 1);
        }
      }
    });

    return () => {
      raceStatusSocket.off("raceStatusUpdate", handleRaceStatusUpdate);
    };
  }, [races, nextRaceIndex, raceHasStarted]);

  useEffect(() => {
    const handleTimerMessage = (msg) => {
      if (msg === "Timer finished") {
        setProceedToPaddrock(true);
        fetchRaces();
      }
    };

    timerSocket.on("message", handleTimerMessage);

    return () => {
      timerSocket.off("message", handleTimerMessage);
    };
  }, []);

  const currentRace = races[nextRaceIndex];

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Next Race Interface</h2>

      {races.length > 0 && raceHasStarted ? (
        currentRace && (
          <>
            <h3 className="next-race-title">Next Race</h3>
            <div className="next-race">
              <p className="race-name">Race name: {currentRace.sessionName}</p>

              {/* Displaying Drivers and their Car Numbers */}
              {currentRace.drivers && currentRace.drivers.length > 0 && (
                <div className="drivers-list">
                  <h4 className="drivers-title">Drivers</h4>
                  <ul className="drivers-info">
                    {currentRace.drivers.map((driver) => (
                      <li key={driver.id}>
                        <span className="driver-name">{driver.name}</span> -{" "}
                        <span className="car-number">
                          {carPersona} № {driver.carNumber}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )
      ) : (
        <div className="waiting-for-safe-flag">
          Waiting for the previous race to become safe to start...
        </div>
      )}

      {proceedToPaddrock && races.length > 0 && (
        <div className="proceed-to-paddrock">
          <p>Proceed to paddock for your race</p>
        </div>
      )}
    </div>
  );
};

export default NextRace;
