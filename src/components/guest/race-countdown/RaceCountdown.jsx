import { useNavigate } from "react-router-dom";
import { backButton } from "../../../assets/button/buttons";
import Timer from "../../timer/Timer";
const RaceCountdown = () => {
  const navigate = useNavigate();

  const handleTimerFinish = () => {
    console.log("Timer has finished in Race Countdown!");
  };

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Race Countdown Interface</h2>
      <div className="timer-section">
        <Timer onTimerFinish={handleTimerFinish} />
      </div>
    </div>
  );
};

export default RaceCountdown;
