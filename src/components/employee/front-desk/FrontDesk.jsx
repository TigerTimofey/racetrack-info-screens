import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FrontDesk.css";

const FrontDesk = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [raceSessions, setRaceSessions] = useState([]);

  useEffect(() => {
    // Закомментирована аутентификация
    /*
    if (socket && !authenticated) {
      console.log("Attempting to authenticate...");
      setLoading(true);

      const loadingTimeout = setTimeout(() => {
        socket.emit("authenticate", { key: config.keys.receptionist });

        socket.on("authenticated", (status) => {
          setLoading(false);
          if (status) {
            setAuthenticated(true);
            fetchRaceSessions(); // Запрос после аутентификации
          } else {
            setError("Invalid access key");
          }
        });
      }, 2000);

      return () => clearTimeout(loadingTimeout);
    }
    */

    // Запрашиваем данные о гонках сразу при загрузке компонента
    fetchRaceSessions();
  }, []);

  const fetchRaceSessions = async () => {
    try {
      const response = await fetch("http://localhost:3000/race-sessions/");
      if (!response.ok) {
        throw new Error("Failed to fetch race sessions");
      }
      const data = await response.json();
      setRaceSessions(data);
    } catch (err) {
      console.error("Failed to fetch race sessions:", err);
      setError("Failed to load race sessions");
    }
  };

  // Закомментирован спиннер
  /*
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Authenticating Receptionist</p>
      </div>
    );
  }
  */

  // Закомментирована проверка аутентификации
  /*
  if (!authenticated) {
    return (
      <div className="error-container">
        <h2 className="error-message">{error || "Authenticating..."}</h2>
        <button className="back-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }
  */

  return (
    <div className="front-desk-container">
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Home
      </button>
      <h2 className="front-title">Front Desk Interface</h2>
      <p>Manage race sessions here</p>

      {/* Отображаем таблицу сессий гонок */}
      {raceSessions.length > 0 ? (
        <table className="race-sessions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {raceSessions.map((session) => (
              <tr key={session.id}>
                <td>{session.id}</td>
                <td>{session.name}</td>
                <td>{session.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No race sessions found.</p>
      )}

      {/* Отображаем сообщение об ошибке, если есть */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FrontDesk;