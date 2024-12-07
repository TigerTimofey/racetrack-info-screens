# Racetrack Info-Screens

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-blue)](https://vimeo.com/1035353693/6b7174d499?share=copy)

## Table of Contents

🚀 [About project](#about-project)<br/>
⚙️ [Core functionality](#core-functionality)<br/>
💡 [How to start using the app](#how-to-start-using-the-app)<br/>
⚙️ [App functionality](#app-functionality)<br/>
🔒 [Security features](#security-features)<br/>
☕ [Version](#version)<br/>
🤝 [Contributors](#contributors)

## About project

The **Racetrack Info-Screens** system provides real-time updates and interfaces for managing races and informing guests at the Beachside Racetrack. The system automates tasks like race setup, lap tracking, and displaying race updates for spectators, reducing the reliance on staff.

## Core functionality

- **Real-time communication**: Powered by Socket.IO for instant updates.<br/><br/>
- **Role-specific interfaces**: Tailored for employees (e.g., Safety Officials) and guests (e.g., Race Drivers).<br/><br/>
- **Public displays**: Show race progress, lap times, and safety statuses.<br/><br/>
- **Simplified race management**: Configure and control races with intuitive tools.<br/><br/>
- **Receptionist functionalities**: Add and remove races, add drivers, assign drivers to cars, and edit driver names.<br/><br/>
- **Safety Official functionalities**: Assign races and set statuses and flags for races.<br/><br/>
- **Lap-Line Observer functionalities**: Track when each racer completes a lap.<br/><br/>
- **Leaderboard functionalities**: Record lap times and display standings based on the fastest lap.<br/><br/>
- **Driver results**: At the end of the timer, drivers see their results for each lap.<br/><br/>
- **Employee access**: Safety Officials, Receptionists, and Lap-Line Observers are employees and have their own passwords to access the interface.<br/><br/>
- **Next Race display: Highlights the next race, showing drivers' names, their assigned cars, and instructions to proceed to the paddock.**

---

## How to start using the app

To set up and run the Racetrack Info-Screens project:

1. Clone the repository:

   ```bash
   git clone https://gitea.kood.tech/denislomakin/racetrack
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set the required environment variables for access keys (replace with your values):

   ```bash
   export receptionist_key=8ded6076
   export observer_key=662e0f6c
   export safety_key=a2d393bc
   ```

4. Start the server:

   - Development mode (1-minute timer for testing):

     ```bash
     npm run dev
     ```

   - Production mode (10-minute timer for races):

     ```bash
     npm start
     ```

---

### Interfaces:

| Interface        | Role              | Route               |
| ---------------- | ----------------- | ------------------- |
| Front Desk       | Receptionist      | `/front-desk`       |
| Race Control     | Safety Official   | `/race-control`     |
| Lap-Line Tracker | Lap-Line Observer | `/lap-line-tracker` |
| Leader Board     | Guest             | `/leader-board`     |
| Next Race        | Race Driver       | `/next-race`        |
| Race Countdown   | Race Driver       | `/race-countdown`   |
| Race Flags       | Race Driver       | `/race-flags`       |

---

## Security Features

- **Role-Based Access**:

  - Admin access keys protect sensitive interfaces.
  - Each interface requires its specific access key to unlock.

- **Environment Variables**:

  - Access keys must be set as environment variables before starting the server.

- **Incorrect Key Handling**:
  - Invalid key attempts are delayed by 500ms and prompt an error message.

---

## Version

- Node.js: "^16.0.0" or higher
- Express: "^4.21.1"
- Socket.IO: "^4.8.1"
- dotenv: "^16.0.3"
- React: "^18.3.1"
- React-Scripts: "^5.0.1"
- MongoDB: "^6.10.0"
- Mongoose: "^8.8.1"
- Bootstrap: "^5.3.3"

---

## Contributors

[Timofey Babisashvili](https://github.com/TigerTimofey) <br/><br/>
[Denis Lomakin](https://github.com/Dkartik123) <br/>
