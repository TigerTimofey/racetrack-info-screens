import { useState, useEffect } from "react";

export const useRaces = () => {
  const [races, setRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/front-desk/sessions`
        );
        const result = await response.json();

        if (response.ok) {
          setRaces(result);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Failed to fetch races");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaces();
  }, []);

  return { races, isLoading, error };
};
