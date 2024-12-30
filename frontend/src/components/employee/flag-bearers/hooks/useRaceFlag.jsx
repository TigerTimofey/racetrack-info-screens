import { useState, useEffect } from "react";

export const useRaceFlag = (raceId) => {
  const [currentFlag, setCurrentFlag] = useState("Safe");
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!raceId) return;

    const fetchFlagData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/race-sessions/${raceId}`
        );
        const result = await response.json();

        if (response.ok) {
          setCurrentFlag(result.currentFlag);
          setSessionName(result.sessionName);
        } else {
          setError("Error fetching flag data for selected race");
        }
      } catch (err) {
        setError("Failed to fetch flag data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlagData();
  }, [raceId]);

  return { currentFlag, sessionName, setCurrentFlag, isLoading, error };
};
