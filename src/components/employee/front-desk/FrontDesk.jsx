import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import loadingAnimation from "../../../assets/lottie-animations/reception.json";
import racerImage from "../../../assets/images/race.png";
import raceImage from "../../../assets/images/flags.png";
import "./FrontDesk.css";

const FrontDesk = () => {
  const navigate = useNavigate();

  const [raceName, setRaceName] = useState("");
  const [racerName, setRacerName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [races, setRaces] = useState([]);
  const [editingRace, setEditingRace] = useState(null);
  const [isLottieVisible, setIsLottieVisible] = useState(true);
  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
  };

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

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/races`
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

  // Handle form submission for adding or updating a race
  const handleSubmit = async (e) => {
    e.preventDefault();

    const raceData = {
      raceName,
      startTime,
    };

    try {
      let response;
      let result;

      if (editingRace) {
        response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/races/${editingRace._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(raceData),
          }
        );
        result = await response.json();

        if (response.ok) {
          setRaces((prevRaces) =>
            prevRaces.map((race) =>
              race._id === editingRace._id ? { ...race, ...raceData } : race
            )
          );
          setEditingRace(null);
          setRaceName("");
          setStartTime("");
        } else {
          alert("Error updating race: " + result.message);
        }
      } else {
        // Add new race
        response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/races`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(raceData),
          }
        );
        result = await response.json();

        if (response.ok) {
          console.log("Race added successfully!");
          setRaceName("");
          setStartTime("");
          setRaces((prevRaces) => [
            ...prevRaces,
            { ...result, _id: result.raceId },
          ]);
        } else {
          alert("Error adding race: " + result.message);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save race");
    }
  };

  // Add racer to a specific race
  const handleAddRacer = async (e) => {
    e.preventDefault();

    if (!racerName || !editingRace) {
      alert("Please provide a racer name and select a race.");
      return;
    }

    try {
      // Making a PATCH request to add the racer to the selected race
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/races/${editingRace._id}/add-racer`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            racerName,
          }),
        }
      );

      const result = await response.json();
      console.log("res", result);

      if (response.ok) {
        setRacerName("");
        setEditingRace(null);
      } else {
        alert("Error adding racer: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add racer");
    }
  };

  // Handle editing a race
  const handleEdit = (race) => {
    setEditingRace(race);
    setRaceName(race.raceName);
    setStartTime(race.startTime);
  };

  // Handle deleting a race
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/races/${id}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();

      if (response.ok) {
        setRaces((prevRaces) => prevRaces.filter((race) => race._id !== id));
      } else {
        alert("Error deleting race: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete race");
    }
  };

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
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
      </div>
      <h2 className="front-title">Front Desk Interface</h2>
      <p>Manage race sessions here</p>

      <div className="forms-container">
        {/* Race Form */}

        <form onSubmit={handleSubmit} className="form">
          <div>
            <label>Race Name:</label>
            <input
              type="text"
              value={raceName}
              onChange={(e) => setRaceName(e.target.value)}
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
            />
          </div>
          <button type="submit">
            {editingRace ? "Update Race" : "Add Race"}
          </button>
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
        <form onSubmit={handleAddRacer} className="form">
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
            <label>Choose Race:</label>
            <select
              onChange={(e) =>
                setEditingRace(
                  races.find((race) => race._id === e.target.value)
                )
              }
              value={editingRace ? editingRace._id : ""}
              required
            >
              <option value="">Select Race</option>
              {races.map((race) => (
                <option key={race._id} value={race._id}>
                  {race.raceName}
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
        {races.length > 0 ? (
          <ul>
            {races.map((race) => (
              <li key={race._id}>
                <div className="race-details">
                  <span className="race-name">{race.raceName}</span>
                  <span className="race-time">
                    {new Date(race.startTime).toLocaleString()}
                  </span>
                  <span className="racers">
                    Racers:{" "}
                    {Array.isArray(race.racers) && race.racers.length > 0
                      ? race.racers.map((racer, index) => (
                          <span key={index} className="racer-name">
                            {racer.name}
                          </span>
                        ))
                      : "No racers"}
                  </span>
                </div>
                <div className="race-buttons">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(race)}
                  >
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
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(race._id)}
                  >
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
