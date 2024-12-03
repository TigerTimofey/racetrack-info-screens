import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import loadingAnimation from "../../../assets/lottie-animations/flag.json";
import { raceStatusSocket } from "../../../socket";
import "./FlagBearers.css";

const FlagFetcher = () => {
    const [currentRace, setCurrentRace] = useState({
        id: "Unknown",
        sessionName: "No data",
        status: "No data",
    });

    const [currentFlag, setCurrentFlag] = useState("Safe");
    const [updateMessage, setUpdateMessage] = useState(""); // For flag update notifications
    const [nextRace, setNextRace] = useState(null); // Prepare for the next race

    // Flag options
    const flagOptions = [
        { name: "Safe", color: "#2ecc71" },
        { name: "Hazard", color: "#f1c40f" },
        { name: "Danger", color: "#e74c3c" },
        { name: "Finish", isChequered: true },
    ];

    useEffect(() => {
        // Listen for race status updates via WebSocket
        raceStatusSocket.on("raceStatusUpdate", (data) => {
            console.log("Received race status update in FlagFetcher:", data);
            setCurrentRace({
                id: data.sessionId || "Unknown",
                sessionName: data.sessionName || "No data",
                status: data.status || "No data",
            });
            setCurrentFlag(data.status || "Safe");
        });

        raceStatusSocket.on("nextRace", (data) => {
            console.log("Next race prepared:", data);
            setNextRace(data);
        });

        // Clean up WebSocket events on component unmount
        return () => {
            raceStatusSocket.off("raceStatusUpdate");
            raceStatusSocket.off("nextRace");
        };
    }, []);

    const handleFlagChange = (newFlag) => {
        if (currentRace.id === "Unknown") {
            alert("No race selected.");
            return;
        }

        // Send flag update via WebSocket
        raceStatusSocket.emit("updateFlag", {
            sessionId: currentRace.id,
            flag: newFlag,
        });

        setCurrentFlag(newFlag);
        setUpdateMessage(`Flag successfully updated to: ${newFlag}`);
        setTimeout(() => setUpdateMessage(""), 5000); // Clear the message after 5 seconds

        if (newFlag === "Finish") {
            // Notify the server to stop the timer and prepare a new race
            raceStatusSocket.emit("finishRace", { sessionId: currentRace.id });
        }
    };

    const startNextRace = () => {
        if (nextRace) {
            raceStatusSocket.emit("startRace", { sessionId: nextRace.id });
            console.log("Starting next race:", nextRace);
            setNextRace(null); // Clear next race after starting
        }
    };

    const lottieOptions = {
        loop: true,
        autoplay: true,
        animationData: loadingAnimation,
    };

    return (
        <div className="flag-bearers-container">
            <h2>Flag Management</h2>
            <p>Current Race: <strong>{currentRace.sessionName}</strong></p>
            <p>Current Race Status: <strong>{currentRace.status}</strong></p>

            {/* Flag update notification */}
            {updateMessage && (
                <div className="update-message">
                    <p>{updateMessage}</p>
                </div>
            )}

            {/* Loading animation */}
            {currentRace.id === "Unknown" && (
                <div className="loading-animation">
                    <Lottie options={lottieOptions} width={150} />
                </div>
            )}

            {/* Flag options */}
            {currentRace.id !== "Unknown" && (
                <div className="flag-circles-container">
                    {flagOptions.map((flag) => (
                        <div
                            key={flag.name}
                            className={`flag-circle ${
                                currentFlag === flag.name ? "active-flag" : ""
                            } ${flag.isChequered ? "chequered-flag" : ""}`}
                            style={{
                                backgroundColor: flag.isChequered ? "transparent" : flag.color,
                            }}
                            onClick={() => handleFlagChange(flag.name)}
                            title={flag.name}
                        >
                            {flag.isChequered ? (
                                <div className="chequered-pattern"></div>
                            ) : (
                                <span className="flag-name">{flag.name}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}


        </div>
    );
};

export default FlagFetcher;
