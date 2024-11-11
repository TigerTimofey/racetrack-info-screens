import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FrontDesk from "./components/employee/front-desk/FrontDesk";
import WelcomePage from "./components/welcome-page/WelcomePage";
import RaceControl from "./components/employee/race-control/RaceControl";
import LapLineTracker from "./components/employee/lap-line-tracker/LapLineTracker";

import LeaderBoardModal from "./components/guest/leader-board/LeaderBoardModal";
// import NextRace from "./components/NextRace";
// import RaceFlags from "./components/RaceFlags";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/front-desk" element={<FrontDesk />} />
      <Route path="/race-control" element={<RaceControl />} />
      <Route path="/lap-line-tracker" element={<LapLineTracker />} />
      <Route path="/leader-board" element={<LeaderBoardModal />} />
      {/* <Route path="/next-race" element={<NextRace />} /> */}
      {/* <Route path="/race-flags" element={<RaceFlags />} /> */}
    </Routes>
  </Router>
);

export default App;
