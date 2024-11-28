import React, { useState, useEffect } from "react";

const WelcomPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleSubmit = () => {
    if (username) {
      localStorage.setItem("username", username);
      window.location.href = "/presentations";
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <div className="card p-4 w-50">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">
            Добро пожаловать в совместное приложение для презентаций!
          </h2>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Введите ваше имя
            </label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={handleInputChange}
              placeholder="Ваш ник"
            />
          </div>
          <button
            className="btn btn-primary w-100"
            onClick={handleSubmit}
            disabled={!username}
          >
            Начать
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomPage;
