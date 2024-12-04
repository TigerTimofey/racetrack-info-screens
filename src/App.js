import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import FrontDesk from "./components/employee/front-desk/FrontDesk";
import LapLineTracker from "./components/employee/lap-line-tracker/LapLineTracker";
import RaceControl from "./components/employee/race-control/RaceControl";
import LeaderBoard from "./components/guest/leader-board/LeaderBoard";
import NextRace from "./components/guest/next-race/NextRace";
import RaceCountdown from "./components/guest/race-countdown/RaceCountdown";
import PublicFlagDisplay from "./components/guest/race-flag/PublicFlagDisplay";
import WelcomePage from "./components/welcome-page/WelcomePage";

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
      <Route path="/race-flags" element={<PublicFlagDisplay />} />
    </Routes>
  </Router>
);

export default App;
