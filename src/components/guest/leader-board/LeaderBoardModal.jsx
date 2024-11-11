import React from "react";
import "./LeaderBoardModal.css";

const LeaderBoardModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Race Leader Board</h2>
        <p>Here are the current standings for the race...</p>
        {/* Placeholder for actual leader board data */}
        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default LeaderBoardModal;
