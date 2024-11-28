import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import WelcomPage from "./pages/WelcomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomPage />} />
    </Routes>
  );
}

export default App;
