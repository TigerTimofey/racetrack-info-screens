import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FrontDesk.css";

const FrontDesk = () => {
  const navigate = useNavigate();
  const [raceName, setRaceName] = useState("");
  const [races, setRaces] = useState([]);
  const [editingRace, setEditingRace] = useState(null); // State for editing race
  console.log("re", races);

  // Fetch the list of races when the component mounts
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/races`
        );
        const result = await response.json();

        if (response.ok) {
          setRaces(result);
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

  // Handle form submission to add or update a race
  const handleSubmit = async (e) => {
    e.preventDefault();

    const raceData = { raceName };

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
              race._id === editingRace._id ? { ...race, raceName } : race
            )
          );
          setEditingRace(null);
          setRaceName("");
        } else {
          alert("Error updating race: " + result.message);
        }
      } else {
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

  // Handle editing a race
  const handleEdit = (race) => {
    setEditingRace(race);
    setRaceName(race.raceName);
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

      {/* Race form */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Race Name:</label>
          <input
            type="text"
            value={raceName}
            onChange={(e) => setRaceName(e.target.value)}
            required
          />
        </div>

        <button type="submit">
          {editingRace ? "Update Race" : "Add Race"}
        </button>
      </form>

      {/* Displaying the list of races */}
      <div className="race-list">
        <h3>Current Races</h3>
        {races.length > 0 ? (
          <ul>
            {races.map((race) => (
              <li key={race._id}>
                {race.raceName}
                <button onClick={() => handleEdit(race)}>Edit</button>
                <button onClick={() => handleDelete(race._id)}>Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No races available.</p>
        )}
      </div>
    </div>
  );
};

export default FrontDesk;
