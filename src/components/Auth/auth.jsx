import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AuthComponent.css"; // Импортируем файл стилей

// Маппинг ролей на ожидаемые сервером типы (вне компонента)
const roleTypeMapping = {
    Receptionist: "receptionist",
    SafetyOfficial: "security_officer",
    LapLineObserver: "race_observer",
};

const AuthComponent = ({ apiUrl, role, onAuthenticated }) => {
    const [accessKey, setAccessKey] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        // Проверяем сохраненные токены при монтировании компонента
        const storedToken = localStorage.getItem("userToken");
        const storedUserType = localStorage.getItem("userType");

        if (
            storedToken &&
            storedUserType === roleTypeMapping[role] // Используем маппинг
        ) {
            setAccessKey(storedToken);
            setIsAuthenticated(true);
            onAuthenticated && onAuthenticated(true);
        }
    }, [onAuthenticated, role]);

    const authenticate = async () => {
        try {
            await axios.post(`${apiUrl}/auth/login`, {
                token: accessKey,
                type: roleTypeMapping[role], // Используем маппинг
            });
            setIsAuthenticated(true);
            setErrorMessage("");

            // Сохраняем токен и тип пользователя в localStorage
            localStorage.setItem("userToken", accessKey);
            localStorage.setItem("userType", roleTypeMapping[role]); // Используем маппинг

            onAuthenticated && onAuthenticated(true);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Authentication Error"
            );
        }
    };

    const logout = () => {
        // Очищаем токены из localStorage
        localStorage.removeItem("userToken");
        localStorage.removeItem("userType");

        // Сбрасываем состояние аутентификации
        setIsAuthenticated(false);
        setAccessKey("");

        // Перенаправляем пользователя на главную страницу
        navigate("/");
    };

    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <p>You are successfully authenticated as {role}!</p>
                    <button onClick={logout} className="submit-button">
                        Logout
                    </button>
                </div>
            ) : (
                <div>
                    <h2 className="auth-title">Authentication for {role}</h2>
                    <div className="password-container">
                        <input
                            type="text"
                            placeholder="Input access key"
                            value={accessKey}
                            onChange={(e) => setAccessKey(e.target.value)}
                            className="password-input"
                        />
                        <button
                            onClick={authenticate}
                            className={`submit-button ${!accessKey ? "disabled" : ""}`}
                            disabled={!accessKey}
                        >
                            Login
                        </button>
                    </div>
                    {errorMessage && (
                        <p className="error-message-show">{errorMessage}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AuthComponent;
