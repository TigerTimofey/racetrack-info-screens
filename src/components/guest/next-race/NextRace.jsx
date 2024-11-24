import { useNavigate } from "react-router-dom"; //
import { backButton } from "../../../assets/button/buttons";
const NextRace = () => {
  const navigate = useNavigate();

  return (
    <div className="race-control-container">
      <div className="back-to-main" onClick={() => navigate("/")}>
        {backButton}
      </div>
      <h2 className="front-title">Next Race Interface</h2>
      <p>Record lap crossings here</p>
    </div>
  );
};

export default NextRace;
