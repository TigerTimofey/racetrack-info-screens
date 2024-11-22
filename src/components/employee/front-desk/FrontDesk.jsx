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
      className="bi bi-x-lg"
      viewBox="0 0 16 16"
    >
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
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
      const sessionId = selectedRaceDetails.id;

      const allCarNumbers = races.flatMap((race) =>
        race.drivers.map((driver) => driver.carNumber)
      );

      let nextCarNumber = 1;
      while (allCarNumbers.includes(nextCarNumber)) {
        nextCarNumber++;
      }

      const newDriver = {
        name: racerName,
        carNumber: nextCarNumber,
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
        {backBtn}
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
          <img
            src={racerImage}
            alt="Racer"
            style={{
              width: "100px",
              height: "auto",
              marginTop: "10px",
              padding: "8px",
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
