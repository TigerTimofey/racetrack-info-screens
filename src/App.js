import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FrontDesk from "./components/employee/front-desk/FrontDesk";
import WelcomePage from "./components/welcome-page/WelcomePage";
import RaceControl from "./components/employee/race-control/RaceControl";
import LapLineTracker from "./components/employee/lap-line-tracker/LapLineTracker";
import LeaderBoard from "./components/guest/leader-board/LeaderBoard";
import NextRace from "./components/guest/next-race/NextRace";
import RaceCountdown from "./components/guest/race-countdown/RaceCountdown";
import RaceFlag from "./components/guest/race-flag/RaceFlag";
import FlagFetcher from "./components/employee/flag-bearers/FlagFetcher";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/front-desk" element={<FrontDesk />} />
      <Route path="/race-control" element={<RaceControl />} />
      <Route path="/lap-line-tracker" element={<LapLineTracker />} />
      <Route path="/leader-board" element={<LeaderBoard />} />
      <Route path="/next-race" element={<NextRace />} />
      <Route path="/race-countdown" element={<RaceCountdown />} />
      <Route path="/race-flags" element={<FlagFetcher />} />
    </Routes>
  </Router>
);

export default App;
