import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import loadingAnimation from "../../../assets/lottie-animations/reception.json";
import racerImage from "../../../assets/images/race.png";
import raceImage from "../../../assets/images/flags.png";
import { editBtn, deleteBtn, backButton } from "../../../assets/button/buttons";
import { raceStatusSocket } from "../../../socket";

import "./FrontDesk.css";

const FrontDesk = () => {
  const navigate = useNavigate();

  const [sessionName, setSessionName] = useState("");
  const [racerName, setRacerName] = useState("");
  const [racerCarId, setRacerCarId] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState("");
  const [isLottieVisible, setIsLottieVisible] = useState(true);

  // ********************************* ACCEPT SOCKET AND REMOVE SESSION *********************************
  const [raceStatus, setRaceStatus] = useState({
    id: "no id",
    status: "no data",
    sessionName: "",
    //ADD FLAG
  });
  const [raceHasStarted, setRaceHasStarted] = useState(false);
  const [startedRaceId, setStartedRaceId] = useState(null);
  const fetchRaces = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/front-desk/sessions`
      );
      const result = await response.json();

      if (response.ok) {
        setRaces(result);
        console.log(result);
      } else {
        alert("Error fetching races: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  raceStatusSocket.on(
    "raceStatusUpdate",
    (data) => {
      setRaceStatus({
        id: data.sessionId || "no id",
        status: data.status || "no status",
        sessionName: data.sessionName || "no name",
        //ADD FLAG
      });

      raceStatusSocket.on("flagUpdate", (data) => {
        console.log("Received flagUpdate data:", JSON.stringify(data));

        if (data.flag) {
          console.log("Flag is:", data.flag);
          // The race drivers cannot be edited after the race is safe to start.
          if (data.flag === "Safe") {
            setRaceHasStarted(true);
            setStartedRaceId(data.sessionId);

            // Race sessions disappear from the Front Desk interface once it is safe to start.
            setTimeout(() => {
              handleDelete(data.sessionId);
            }, 6000);

            fetchRaces();
          }
        } else {
          console.log("Flag property is missing in the data");
        }
      });

      // Clean up WebSocket events on component unmount
      return () => {
        raceStatusSocket.off("raceStatusUpdate");
        raceStatusSocket.off("nextRace");
      };
    },
    []
  );

  // *****************************************************************************************************

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
  };
  // Hide Lottie when changing size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 850) {
        setIsLottieVisible(false);
      } else {
        setIsLottieVisible(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  //Fetch All races front-desk/sessions
  useEffect(() => {
    fetchRaces();
  }, []);
  // Add race
  const handleAddRaceSession = async (e) => {
    e.preventDefault();

    const raceData = {
      sessionName,
      startTime,
    };

    const newRace = {
      ...raceData,
      id: Date.now(),
      drivers: [],
    };
    setRaces((prevRaces) => [...prevRaces, newRace]);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/front-desk/sessions/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(raceData),
        }
      );
      const result = await response.json();

      if (response.ok) {
        setRaces((prevRaces) =>
          prevRaces.map((race) =>
            race.id === newRace.id ? { ...race, id: result.id } : race
          )
        );
        setSessionName("");
        setStartTime("");
      } else {
        alert("Error adding race: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // Delete race
  const handleDelete = async (id) => {
    try {
      // Optimistic UI update: remove the race from the state immediately
      setRaces((prevRaces) => prevRaces.filter((race) => race.id !== id));

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/front-desk/sessions/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        alert("Failed to delete race session.");
      }
    } catch (error) {
      console.error("Error deleting race:", error);
    }
  };
  // Add racer to a specific race
  const handleAddRacer = async (e) => {
    e.preventDefault();

    const selectedRaceDetails = races.find(
      (race) => race.sessionName === selectedRace
    );

    if (selectedRaceDetails) {
      // Check if the racer name already exists
      const isRacerExists = selectedRaceDetails.drivers.some(
        (driver) => driver.name.toLowerCase() === racerName.toLowerCase()
      );

      if (isRacerExists) {
        alert(
          "Racer name already exists in this race. Please choose a unique name."
        );
        return;
      }

      const sessionId = selectedRaceDetails.id;

      const allCarNumbers = races.flatMap((race) =>
        race.drivers.map((driver) => driver.carNumber)
      );

      let carNumberToSend = racerCarId; // Default to the car number entered by the user

      if (!carNumberToSend) {
        // If the car number is null, use the logic to generate a new car number
        let nextCarNumber = 1;
        while (allCarNumbers.includes(nextCarNumber)) {
          nextCarNumber++;
        }
        carNumberToSend = nextCarNumber; // Use the generated car number if input is null
      }

      const newDriver = {
        name: racerName,
        carNumber: carNumberToSend,
      };

      setRaces((prevRaces) =>
        prevRaces.map((race) =>
          race.id === sessionId
            ? {
                ...race,
                drivers: [...race.drivers, newDriver],
              }
            : race
        )
      );

      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/front-desk/sessions/${sessionId}/drivers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newDriver),
          }
        );
        const result = await response.json();

        if (response.ok) {
          setRacerName("");
          setRacerCarId(""); // Reset the car number input field after submission
          setSelectedRace("");
        } else {
          console.error("Error adding driver:", result);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.error("Selected race not found.");
    }
  };

  //edit racer
  const handleEditRacer = async (raceId, racer) => {
    const newName = prompt("Enter new name for the racer:", racer.name);
    if (newName && newName !== racer.name) {
      const updatedRacer = { ...racer, name: newName };

      setRaces((prevRaces) =>
        prevRaces.map((race) =>
          race.id === raceId
            ? {
                ...race,
                drivers: race.drivers.map((driver) =>
                  driver.id === racer.id ? updatedRacer : driver
                ),
              }
            : race
        )
      );

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

        const result = await response.json();
        if (!response.ok) {
          console.error("Failed to update racer:", result.message);
        }
      } catch (error) {
        console.error("Error editing racer:", error);
      }
    }
  };
  //remove racer
  const handleRemoveRacer = async (driverId, raceId) => {
    try {
      setRaces((prevRaces) =>
        prevRaces.map((race) =>
          race.id === raceId
            ? {
                ...race,
                drivers: race.drivers.filter(
                  (driver) => driver.id !== driverId
                ),
              }
            : race
        )
      );

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/race-drivers/${driverId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ driverId }),
        }
      );

      if (!response.ok) {
        console.error("Failed to remove racer.");
      }
    } catch (error) {
      console.error("Error removing racer:", error);
    }
  };

  return (
    <div className="race-control">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Front Desk Interface</h2>

      <div className="forms-container">
        <form onSubmit={handleAddRaceSession} className="form">
          <div>
            <label>Race Name:</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
              maxLength={15}
            />
          </div>
          <div>
            <label>Start Time:</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <button type="submit">Add Race</button>
          <img
            src={raceImage}
            alt="Racer"
            style={{
              width: "100px",
              height: "auto",
              marginTop: "10px",
              padding: "10px",
            }}
          />
        </form>

        <div className="loading-animation">
          {isLottieVisible && <Lottie options={lottieOptions} width={350} />}
        </div>

        {/* Racer Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddRacer(e);
          }}
        >
          <div>
            <label>Racer Name:</label>
            <input
              type="text"
              value={racerName}
              onChange={(e) => setRacerName(e.target.value)}
              required
              maxLength={15}
              disabled={races.length <= 0}
            />
          </div>

          <div>
            <label>Choose Race:</label>
            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              required
              disabled={races.length <= 0}
            >
              <option>Choose race</option>
              {races.map((race) => (
                <option key={race.id} value={race.sessionName}>
                  {race.sessionName}
                </option>
              ))}
            </select>
          </div>
          <label>Specific car number</label>
          <div>
            <input
              type="text"
              value={racerCarId}
              onChange={(e) => setRacerCarId(e.target.value)}
              // required
              maxLength={3}
              disabled={races.length <= 0}
            />
          </div>
          <button type="submit" disabled={races.length <= 0}>
            Add Racer
          </button>
          <img
            src={racerImage}
            alt="Racer"
            style={{
              width: "100px",
              height: "auto",
              marginTop: "10px",
              padding: "10px",
            }}
          />
        </form>
      </div>

      {/* Displaying the list of races */}
      <div className="race-list">
        <h3>Current Races</h3>
        <div className="race-cards-container">
          {races.length > 0 ? (
            races.map((race) => (
              <div className="race-card" key={race.id || race.sessionName}>
                <div className="race-buttons">
                  {" "}
                  <span className="race-name">{race.sessionName}</span>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(race.id)}
                  >
                    {deleteBtn}
                  </button>
                </div>
                <div className="race-header">
                  <span className="race-time">
                    {new Date(race.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="race-body">
                  <div className="racers">
                    <p>Racers</p>{" "}
                    {Array.isArray(race.drivers) && race.drivers.length > 0 ? (
                      race.drivers.map((driver, index) => (
                        <span key={index} className="racer-name">
                          {driver.name}
                          <button
                            className="edit-racer-btn"
                            onClick={() => handleEditRacer(race.id, driver)}
                            disabled={startedRaceId === race.id}
                          >
                            {editBtn}
                          </button>
                          <button
                            className="remove-racer-btn"
                            onClick={() =>
                              handleRemoveRacer(driver.id, race.id)
                            }
                            disabled={startedRaceId === race.id}
                          >
                            {deleteBtn}
                          </button>
                        </span>
                      ))
                    ) : (
                      <span>No racers yet</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No races available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FrontDesk;
