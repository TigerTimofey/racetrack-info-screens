import "./NextRace.css";
import { useNavigate } from "react-router-dom"; //
const NextRace = () => {
  const navigate = useNavigate();

  return (
    <div className="lap-line-tracker-container">
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Home
      </button>
      <h2 className="front-title">Next Race Interface</h2>
      <p>Record lap crossings here</p>
    </div>
  );
};

export default NextRace;
