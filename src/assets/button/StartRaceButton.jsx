import React, { useEffect, useState } from "react";
import { raceStatusSocket } from "../../socket"; // Используем именованный экспорт raceStatusSocket
import "./StartRaceButton.css"; // Подключение CSS для стилей

const StartRaceButton = () => {
    const [upcomingRace, setUpcomingRace] = useState(null);
    const [raceStarted, setRaceStarted] = useState(false);

    useEffect(() => {
        // Загружаем все сессии гонок и определяем ближайшую
        const fetchUpcomingRace = async () => {
            try {
                const response = await fetch('http://localhost:3000/race-sessions');
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке сессий гонок');
                }

                const raceSessions = await response.json();

                // Находим ближайшую гонку, которая еще не началась
                const pendingRaces = raceSessions.filter((race) => race.status === 'Pending');
                if (pendingRaces.length > 0) {
                    const sortedRaces = pendingRaces.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                    setUpcomingRace(sortedRaces[0]);
                }
            } catch (error) {
                console.error("Ошибка при загрузке сессий гонок:", error);
            }
        };

        fetchUpcomingRace();
    }, []);

    const handleStartRace = async () => {
        if (upcomingRace) {
            try {
                // Обновляем статус гонки на сервере
                const statusResponse = await fetch(
                    `http://localhost:3000/race-sessions/${upcomingRace.id}/status`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ status: 'InProgress' }),
                    }
                );

                if (!statusResponse.ok) {
                    throw new Error('Ошибка при обновлении статуса гонки');
                }

                // Запускаем таймер на сервере
                const timerResponse = await fetch(
                    `http://localhost:3000/race-sessions/${upcomingRace.id}/start-timer`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ duration: 10 }), // Продолжительность таймера в минутах
                    }
                );

                if (!timerResponse.ok) {
                    throw new Error('Ошибка при запуске таймера');
                }

                // Уведомляем всех клиентов через WebSocket
                raceStatusSocket.emit('raceStatusUpdate', {
                    sessionId: upcomingRace.id,
                    status: 'InProgress',
                });

                console.log(`Гонка "${upcomingRace.sessionName}" началась, таймер запущен!`);
                setRaceStarted(true); // Обновляем состояние после успешного запуска
            } catch (error) {
                console.error("Ошибка при запуске гонки:", error);
            }
        }
    };

    return (
        <div>
            {upcomingRace ? (
                <button
                    onClick={handleStartRace}
                    className={`start-race-button ${raceStarted ? 'started' : ''}`}
                    disabled={raceStarted} // Отключаем кнопку после запуска
                >
                    {raceStarted ? `Гонка началась: ${upcomingRace.sessionName}` : `Начать гонку: ${upcomingRace.sessionName}`}
                </button>
            ) : (
                <p>Нет предстоящих гонок для запуска</p>
            )}
        </div>
    );
};

export default StartRaceButton;
