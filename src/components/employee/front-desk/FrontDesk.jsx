import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import loadingAnimation from "../../../assets/lottie-animations/reception.json";
import racerImage from "../../../assets/images/race.png";
import raceImage from "../../../assets/images/flags.png";

import "./FrontDesk.css";

const FrontDesk = () => {
  const navigate = useNavigate();

  const [sessionName, setSessionName] = useState("");
  const [racerName, setRacerName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [races, setRaces] = useState([]);
  const [editingRace, setEditingRace] = useState(null);
  const [selectedRace, setSelectedRace] = useState("");
  const [isLottieVisible, setIsLottieVisible] = useState(true);
  const [carNumber, setCarNumber] = useState("");

  const editBtn = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-pencil"
      viewBox="0 0 16 16"
    >
      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
    </svg>
  );
  const deleteBtn = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-trash3"
      viewBox="0 0 16 16"
    >
      <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-2.34l.854-10.66H14.5a.5.5 0 0 0 0-1H11zM5 3h6l.35 4.308a1.5.5 0 0 1-1.493 1.692H6.145A1.5.5 0 0 1 4.65 7.308L5 3z" />
    </svg>
  );
  const backBtn = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      fill="#ffd814"
      className="bi bi-arrow-left-circle-fill"
      viewBox="0 0 16 16"
    >
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
    </svg>
  );

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
        alert("Failed to fetch races");
      }
    };

    fetchRaces();
  }, []);
  // Handle add form submission
  const handleAddRaceSession = async (e) => {
    e.preventDefault();

    const raceData = {
      sessionName,
      startTime,
    };

    // Optimistic UI update: add the new race immediately to the state
    const newRace = {
      ...raceData,
      id: Date.now(), // Temporary ID to reflect the added race in the UI (you can replace this with the actual ID after the API call)
      drivers: [], // Initially empty drivers
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
        // Replace the temporary ID with the actual ID from the server
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

  // Handle deleting a race
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
      const sessionId = selectedRaceDetails.id;
      const nextCarNumber = selectedRaceDetails.drivers.length
        ? Math.max(
            ...selectedRaceDetails.drivers.map((driver) => driver.carNumber)
          ) + 1
        : 1;

      const newDriver = {
        name: racerName,
        carNumber: nextCarNumber,
      };

      // Optimistic UI update: add the new driver to the selected race
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
          setCarNumber("");
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

  //TO-DO
  //edit racer
  const handleEditRacer = async (raceId, racer) => {};

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
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backBtn}
      </div>
      <h2 className="front-title">Front Desk Interface</h2>

      <p>Manage race sessions here</p>

      <div className="forms-container">
        {/* Race Form */}

        <form onSubmit={handleAddRaceSession} className="form">
          <div>
            <label>Race Name:</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Start Time:</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)} // Ensure the start time is after the current time
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

        {/* TO-DO */}
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
            />
          </div>
          <div>
            <label>Car Number:</label>
            <input
              type="number"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Choose Race:</label>
            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              required
            >
              <option>Choose race</option>
              {races.map((race) => (
                <option key={race.id} value={race.sessionName}>
                  {race.sessionName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Add Racer</button>
        </form>
      </div>

      {/* Displaying the list of races */}
      <div className="race-list">
        <h3>Current Races</h3>
        {races.length > 0 ? (
          <ul>
            {races.map((race) => (
              <li key={race.id || race.sessionName}>
                <div className="race-details">
                  <span className="race-name">{race.sessionName}</span>
                  <span className="race-time">
                    {new Date(race.startTime).toLocaleString()}
                  </span>
                  <span className="racers">
                    Racers:{" "}
                    {Array.isArray(race.drivers) && race.drivers.length > 0 ? (
                      race.drivers.map((driver, index) => (
                        <span key={index} className="racer-name">
                          {driver.name}
                          <button
                            className="edit-racer-btn"
                            onClick={() => handleEditRacer(race.id, driver)}
                          >
                            {editBtn}
                          </button>
                          <button
                            className="remove-racer-btn"
                            onClick={() =>
                              handleRemoveRacer(driver.id, race.id)
                            }
                          >
                            {deleteBtn}
                          </button>
                        </span>
                      ))
                    ) : (
                      <span>No racers</span>
                    )}
                  </span>
                </div>
                <div className="race-buttons">
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(race.id)}
                  >
                    {deleteBtn}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No races scheduled yet</p>
        )}
      </div>
    </div>
  );
};

export default FrontDesk;
