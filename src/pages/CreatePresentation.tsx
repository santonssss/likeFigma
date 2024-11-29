import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const CreatePresentation: React.FC = () => {
  const [presentationName, setPresentationName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreatePresentation = async () => {
    if (!presentationName) {
      setError("Введите название презентации");
      return;
    }

    const { data, error } = await supabase
      .from("presentations")
      .insert([
        {
          name: presentationName,
          creator_id: localStorage.getItem("username") || "",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .select();

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      if (data && data.length > 0) {
        window.location.href = `/presentation/${data[0].id}`;
      } else {
        setError("Ошибка при создании презентации");
      }
    }
  };

  return (
    <div className="container">
      <h2 className="text-center mb-4">Создание новой презентации</h2>
      <div className="form-group">
        <label htmlFor="presentationName">Название презентации</label>
        <input
          type="text"
          id="presentationName"
          className="form-control"
          value={presentationName}
          onChange={(e) => setPresentationName(e.target.value)}
          placeholder="Введите название"
        />
      </div>
      {error && <div className="alert alert-danger mt-2">{error}</div>}
      <button
        className="btn btn-primary w-100 mt-3"
        onClick={handleCreatePresentation}
      >
        Создать презентацию
      </button>
    </div>
  );
};

export default CreatePresentation;
