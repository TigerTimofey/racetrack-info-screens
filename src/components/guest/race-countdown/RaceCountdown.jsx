import "./RaceCountdown.css";
import { useNavigate } from "react-router-dom";
const RaceCountdown = () => {
  const navigate = useNavigate();

  return (
    <div className="lap-line-tracker-container">
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Home
      </button>
      <h2 className="front-title">Race Countdown Interface</h2>
      <p>Record lap crossings here</p>
    </div>
  );
};

export default RaceCountdown;
