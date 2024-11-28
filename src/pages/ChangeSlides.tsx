import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ChangeSlides = () => {
  const { id } = useParams<{ id: string }>();
  const [slide, setSlide] = useState<any>(null);
  const [elements, setElements] = useState<any[]>([]); // Локальное состояние элементов
  const navigate = useNavigate();

  // Загружаем слайд из Supabase по id
  useEffect(() => {
    const fetchSlide = async () => {
      const { data, error } = await supabase
        .from("slides")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setSlide(data);
        // Если в базе данных нет элементов, создаем начальные элементы
        if (
          !data.content ||
          data.content === '{"elements":[]}' ||
          JSON.parse(data.content).elements.length === 0
        ) {
          setElements([
            {
              id: "square",
              type: "RECTANGLE",
              x: 100,
              y: 100,
              color: "black",
              size: 100,
            }, // Начальный квадрат
            {
              id: "text",
              type: "TEXT",
              x: 150,
              y: 150,
              color: "black",
              size: 20,
              content: "Добавьте текст",
            }, // Начальный текст
          ]);
        } else {
          setElements(JSON.parse(data.content).elements);
        }
      }
    };

    fetchSlide();
  }, [id]);
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    // Отключаем стандартное поведение браузера
    return false; // Убираем клон
  };
  // Функция для добавления нового элемента
  const addElement = (type: string) => {
    const newElement = {
      id: `${Date.now()}`, // Уникальный id на основе времени
      type,
      x: 100,
      y: 100,
      color: "black", // Цвет по умолчанию
      size: 30, // Размер для фигуры или текста
      content: type === "TEXT" ? "Новый текст" : "", // Для текста начальный контент
    };

    setElements((prev) => [...prev, newElement]);
  };

  // Функция для сохранения элементов в Supabase
  const saveElements = async () => {
    const { error } = await supabase
      .from("slides")
      .update({
        content: JSON.stringify({ elements }),
        updated_at: new Date(),
      })
      .eq("id", id);

    if (error) {
      console.error("Ошибка сохранения элементов:", error);
    } else {
      console.log("Элементы успешно сохранены!");
      navigate(`/presentation/${slide?.presentation_id}`); // Перенаправляем после сохранения
    }
  };

  // Обработчик для перемещения элементов
  const handleDrag = (e: React.DragEvent, element: any) => {
    e.preventDefault();
    const newElements = [...elements];
    const index = newElements.findIndex((el) => el.id === element.id);

    if (index !== -1) {
      const workArea = e.target.closest(".work-area");
      const workAreaRect = workArea?.getBoundingClientRect();

      const newX = Math.min(
        Math.max(e.clientX - 50, workAreaRect?.left || 0),
        (workAreaRect?.right || 0) - element.size
      );
      const newY = Math.min(
        Math.max(e.clientY - 50, workAreaRect?.top || 0),
        (workAreaRect?.bottom || 0) - element.size
      );

      const updatedElement = { ...newElements[index], x: newX, y: newY };
      newElements[index] = updatedElement;
      setElements(newElements);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!slide) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Редактирование слайда {id}</h1>

      {/* Кнопки для добавления элементов */}
      <div className="mb-4">
        <button
          className="btn btn-primary mr-2"
          onClick={() => addElement("TEXT")}
        >
          Добавить текст
        </button>
        <button
          className="btn btn-secondary mr-2"
          onClick={() => addElement("RECTANGLE")}
        >
          Добавить прямоугольник
        </button>
        <button
          className="btn btn-danger mr-2"
          onClick={() => addElement("CIRCLE")}
        >
          Добавить круг
        </button>
        <button
          className="btn btn-warning mr-2"
          onClick={() => addElement("TRIANGLE")}
        >
          Добавить треугольник
        </button>
      </div>

      {/* Рабочая область (холст) для перетаскивания элементов */}
      <div
        className="work-area"
        style={{
          width: "100%",
          height: "500px",
          position: "relative",
          border: "2px solid #000",
          backgroundColor: "#f5f5f5",
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {elements.map((element, index) => (
          <div
            key={element.id}
            draggable
            onDrag={(e) => handleDrag(e, element)}
            onDragStart={(e) => handleDragStart(e)}
            style={{
              position: "absolute",
              left: `${element.x}px`,
              top: `${element.y}px`,
              cursor: "move",
            }}
          >
            {element.type === "TEXT" && (
              <input
                type="text"
                value={element.content}
                onChange={(e) => {
                  const updatedElements = [...elements];
                  updatedElements[index].content = e.target.value;
                  setElements(updatedElements);
                }}
              />
            )}
            {element.type === "RECTANGLE" && (
              <div
                style={{
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  backgroundColor: element.color,
                }}
              ></div>
            )}
            {element.type === "CIRCLE" && (
              <div
                style={{
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  borderRadius: "50%",
                  backgroundColor: element.color,
                }}
              ></div>
            )}
            {element.type === "TRIANGLE" && (
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${element.size}px solid transparent`,
                  borderRight: `${element.size}px solid transparent`,
                  borderBottom: `${element.size * 2}px solid ${element.color}`,
                }}
              ></div>
            )}
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={saveElements}>
        Сохранить изменения
      </button>
    </div>
  );
};

export default ChangeSlides;
