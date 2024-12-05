import React, { useEffect, useState } from 'react';
import { raceStatusSocket } from '../socket';
import './RaceStatusDisplay.css';

const RaceStatusDisplay = () => {
    const [raceStatus, setRaceStatus] = useState(() => {
        const savedRace = localStorage.getItem('currentRace');
        return savedRace ? JSON.parse(savedRace) : {
            id: "Unknown",
            status: "No data",
            sessionName: "No active race",
            flag: "None"
        };
    });

    useEffect(() => {
        const fetchCurrentRace = async () => {
            try {
                const response = await fetch("http://localhost:3000/race-sessions/current-race");
                const result = await response.json();
                
                if (result.success && result.data.sessionId !== "Unknown") {
                    setRaceStatus(result.data);
                    localStorage.setItem('currentRace', JSON.stringify(result.data));
                }
            } catch (error) {
                console.error("Failed to fetch current race:", error);
            }
        };

        fetchCurrentRace();

        raceStatusSocket.on("raceStatusUpdate", (data) => {
            const updatedStatus = {
                id: data.sessionId || "Unknown",
                status: data.status || "No data",
                sessionName: data.sessionName || "No active race",
                flag: data.flag || raceStatus.flag
            };
            setRaceStatus(updatedStatus);
            localStorage.setItem('currentRace', JSON.stringify(updatedStatus));
        });

        return () => {
            raceStatusSocket.off("raceStatusUpdate");
        };
    }, []);

    const isActive = raceStatus.status === "InProgress";

    return (
        <div className="race-status">
            <div className="status-header">
                <h3 className="status-title">Race Status Monitor</h3>
                <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
                    <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}></span>
                    {isActive ? 'Race Active' : 'Race Inactive'}
                </div>
            </div>
            
            <div className="status-details">
                <div className="detail-item">
                    <div className="detail-label">Session ID</div>
                    <div className="detail-value">{raceStatus.id}</div>
                </div>
                
                <div className="detail-item">
                    <div className="detail-label">Race Name</div>
                    <div className="detail-value">{raceStatus.sessionName}</div>
                </div>
                
                <div className="detail-item">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">{raceStatus.status}</div>
                </div>
                
                <div className="detail-item">
                    <div className="detail-label">Current Flag</div>
                    <div className="detail-value">{raceStatus.flag}</div>
                </div>
            </div>
        </div>
    );
};

export default RaceStatusDisplay;