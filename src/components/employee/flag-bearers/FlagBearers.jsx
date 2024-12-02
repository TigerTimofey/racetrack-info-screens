import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import loadingAnimation from "../../../assets/lottie-animations/flag.json";
import { raceStatusSocket } from "../../../socket";
import "./FlagBearers.css";

const FlagBearers = () => {
    const [currentRace, setCurrentRace] = useState({
        id: "Unknown",
        sessionName: "No data",
        status: "No data",
    });

    const [currentFlag, setCurrentFlag] = useState("Safe");
    const [updateMessage, setUpdateMessage] = useState(""); // For flag update notifications

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
            console.log("Received race status update in FlagBearers:", data);
            setCurrentRace({
                id: data.sessionId || "Unknown",
                sessionName: data.sessionName || "No data",
                status: data.status || "No data",
            });
            setCurrentFlag(data.status || "Safe");
        });

        // Clean up WebSocket events on component unmount
        return () => {
            raceStatusSocket.off("raceStatusUpdate");
        };
    }, []);

    const handleFlagChange = async (newFlag) => {
        if (currentRace.id === "Unknown") {
            alert("No race selected.");
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/race-sessions/${currentRace.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentFlag: newFlag }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setCurrentFlag(newFlag);
                setUpdateMessage(`Flag successfully updated to: ${newFlag}`); // Set notification message
                console.log(`Flag successfully updated: ${newFlag}`);
                setTimeout(() => setUpdateMessage(""), 5000); // Clear the message after 5 seconds
            } else {
                console.error(data.message || "Failed to update the flag.");
                setUpdateMessage("Error updating the flag.");
                setTimeout(() => setUpdateMessage(""), 5000);
            }
        } catch (error) {
            console.error("Error updating the flag:", error);
            setUpdateMessage("An error occurred while updating the flag.");
            setTimeout(() => setUpdateMessage(""), 5000);
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

export default FlagBearers;