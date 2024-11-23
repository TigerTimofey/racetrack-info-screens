# PLAN

### Front Desk Interface (Receptionist)

<code>`/front-desk`.</code>

- [x] The receptionist can **add new race sessions**.
- [x] The receptionist can **add/edit/remove drivers** from a race.
- [x] The receptionist can **see a list of upcoming races**.
- [x] The receptionist can **delete an upcoming race**.
- [x] The receptionist can **assign drivers to specific cars**. - NB! automaticly because tehre is no info about unique card
- [x] The receptionist can access the interface via `/front-desk`.
- [x] **The receptionist can see an upcoming race** if there is one.
- [ ] The **interface re-prompts the user** to enter a correct access key when an incorrect access key is inserted.
- [ ] **The receptionist cannot edit race drivers** once the race is safe to start.
- [ ] **Race sessions disappear** from the Front Desk interface once it is safe to start.

---

### Race Flags (Race Driver)

<code>/flag-bearers</code>

- [x] The **Flag screen** changes color according to race mode selection:
- - [x] Safe -> Solid Green
- - [x] Hazard -> Solid Yellow
- - [x] Danger -> Solid Red
- - [x] Finish -> Chequered Black/White
- [x] The **Flag** is adding to current race status as currentFlag.
- [x] The flag bearers can access the interface via `/flag-bearers`.

---
