import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import "./FlagBearers.css";

const FlagBearers = () => {
  const navigate = useNavigate();
  return (
    <div className="race-control-container">
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Home
      </button>
      <h2 className="race-control-title">Flag Bearers Interface</h2>
      <p>Manage the race operations here</p>
    </div>
  );
};

export default FlagBearers;
