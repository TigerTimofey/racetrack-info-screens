import React, { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket"; // Путь к хуку для сокета
import config from "../config"; // Путь к конфигурации

const FrontDesk = () => {
  const socket = useSocket();
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (socket && !authenticated) {
      console.log("Attempting to authenticate...");
      socket.emit("authenticate", { key: config.keys.receptionist });
      socket.on("authenticated", (status) => {
        console.log("Receptionist in Front Desk");
        console.log("Authentication status:", status);
        if (status) setAuthenticated(true);
        else setError("Invalid access key");
      });
    }
  }, [socket, authenticated]);

  if (!authenticated) return <div>{error || "Authenticating..."}</div>;

  return (
    <div>
      <h2>Front Desk Interface</h2>
      <p>Manage race sessions here</p>
    </div>
  );
};

export default FrontDesk;
