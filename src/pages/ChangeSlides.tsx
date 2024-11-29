import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AccessSettings from "../components/AccessSetting";

const ChangeSlides = () => {
  const { id } = useParams<{ id: string }>();
  const [slide, setSlide] = useState<any>(null);
  const [elements, setElements] = useState<any[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [hasAccess, setHasAccess] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [accessToPage, setAccessToPage] = useState<boolean>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlideAndPresentation = async () => {
      const { data: slideData, error: slideError } = await supabase
        .from("slides")
        .select("*")
        .eq("id", id)
        .single();

      if (slideError) {
        console.error(slideError);
        return;
      }

      setSlide(slideData);
      const { data: presentationData, error: presentationError } =
        await supabase
          .from("presentations")
          .select("creator_id, allowed_users, access_type")
          .eq("id", slideData.presentation_id)
          .single();

      if (presentationError) {
        console.error(presentationError);
        return;
      }

      const username = localStorage.getItem("username");

      if (username) {
        if (presentationData.access_type === "public") {
          if (presentationData.creator_id === username) {
            setHasAccess(true);
            setCanEdit(true);
          } else {
            setHasAccess(false);
          }
        } else if (presentationData.access_type === "private") {
          const userInAllowed = presentationData.allowed_users.find(
            (user: { username: string }) => user.username === username
          );

          if (userInAllowed) {
            if (userInAllowed.canEdit) {
              setCanEdit(true);
            } else {
              setCanEdit(false);
              alert("У вас нет прав на редактирование данного слайда.");
            }
          } else {
            setAccessToPage(true);
            setHasAccess(false);
          }
        }
      }

      if (
        !slideData.content ||
        slideData.content === '{"elements":[]}' ||
        JSON.parse(slideData.content).elements.length === 0
      ) {
        setElements([
          {
            id: "square",
            type: "RECTANGLE",
            x: 100,
            y: 100,
            color: "black",
            size: 100,
          },
          {
            id: "text",
            type: "TEXT",
            x: 150,
            y: 150,
            color: "black",
            size: 20,
            content: "Добавьте текст",
          },
        ]);
      } else {
        setElements(JSON.parse(slideData.content).elements);
      }
    };

    fetchSlideAndPresentation();
  }, [id]);

  const addElement = (type: string) => {
    if (!canEdit) return;

    const newElement = {
      id: `${Date.now()}`,
      type,
      x: 100,
      y: 100,
      color: "black",
      size: 30,
      content: type === "TEXT" ? "Новый текст" : "",
    };
    setElements((prev) => [...prev, newElement]);
  };

  const saveElements = async () => {
    if (!canEdit) return;

    const { error } = await supabase
      .from("slides")
      .update({ content: JSON.stringify({ elements }), updated_at: new Date() })
      .eq("id", id);

    if (error) {
      console.error("Ошибка сохранения элементов:", error);
    } else {
      navigate(`/presentation/${slide?.presentation_id}`);
    }
  };

  const handleMouseDown = (elementId: string) => {
    if (!canEdit) return;

    setSelectedElementId(elementId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canEdit || !selectedElementId) return;

    const newElements = [...elements];
    const index = newElements.findIndex((el) => el.id === selectedElementId);

    if (index !== -1) {
      const workArea = e.currentTarget as HTMLDivElement;
      const workAreaRect = workArea.getBoundingClientRect();

      const newX = Math.min(
        Math.max(e.clientX - workAreaRect.left, 0),
        workAreaRect.width - newElements[index].size
      );
      const newY = Math.min(
        Math.max(e.clientY - workAreaRect.top, 0),
        workAreaRect.height - newElements[index].size
      );

      newElements[index] = { ...newElements[index], x: newX, y: newY };
      setElements(newElements);
    }
  };

  const handleMouseUp = () => {
    setSelectedElementId(null);
  };

  const handleChangeColor = (color: string) => {
    if (!canEdit || !selectedElementId) return;

    const newElements = [...elements];
    const index = newElements.findIndex((el) => el.id === selectedElementId);

    if (index !== -1) {
      newElements[index] = { ...newElements[index], color };
      setElements(newElements);
    }
  };

  const handleChangeSize = (size: number) => {
    if (!canEdit || !selectedElementId) return;

    const newElements = [...elements];
    const index = newElements.findIndex((el) => el.id === selectedElementId);

    if (index !== -1) {
      newElements[index] = { ...newElements[index], size };
      setElements(newElements);
    }
  };

  if (!slide) {
    return <div>Загрузка...</div>;
  }
  if (accessToPage) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center text-danger">
          Это приватный слайд и у вас нету прав для редактирования!
        </div>
      </div>
    );
  }

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div className="container mt-5">
      {hasAccess && <AccessSettings slideId={id} />}{" "}
      <h1 className="mb-4">Редактирование слайда</h1>
      <p className="text-muted">
        Настройте элементы слайда и сохраните изменения.
      </p>
      <div className="mb-4">
        <button
          className="btn btn-primary mr-2"
          onClick={() => addElement("TEXT")}
          disabled={!canEdit}
        >
          Добавить текст
        </button>
        <button
          className="btn btn-secondary mr-2"
          onClick={() => addElement("RECTANGLE")}
          disabled={!canEdit}
        >
          Добавить прямоугольник
        </button>
        <button
          className="btn btn-danger mr-2"
          onClick={() => addElement("CIRCLE")}
          disabled={!canEdit}
        >
          Добавить круг
        </button>
        <button
          className="btn btn-warning mr-2"
          onClick={() => addElement("TRIANGLE")}
          disabled={!canEdit}
        >
          Добавить треугольник
        </button>
      </div>
      {selectedElement && (
        <div className="mb-4">
          <h4>Настройки элемента</h4>
          <div className="form-group">
            <label>Цвет</label>
            <input
              type="color"
              className="form-control"
              value={selectedElement.color}
              onChange={(e) => handleChangeColor(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="form-group">
            <label>Размер</label>
            <input
              type="number"
              className="form-control"
              value={selectedElement.size}
              onChange={(e) => handleChangeSize(Number(e.target.value))}
              disabled={!canEdit}
            />
          </div>
        </div>
      )}
      <div
        className="work-area"
        style={{
          width: "100%",
          height: "500px",
          position: "relative",
          border: "2px solid #000",
          backgroundColor: "#f5f5f5",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {elements.map((element) => (
          <div
            key={element.id}
            onMouseDown={() => handleMouseDown(element.id)}
            style={{
              position: "absolute",
              left: `${element.x}px`,
              top: `${element.y}px`,
              cursor: canEdit ? "move" : "not-allowed",
              border:
                selectedElementId === element.id ? "2px solid blue" : "none",
            }}
          >
            {element.type === "TEXT" && (
              <input
                type="text"
                value={element.content}
                onChange={(e) => {
                  const newElements = [...elements];
                  const index = newElements.findIndex(
                    (el) => el.id === element.id
                  );
                  newElements[index].content = e.target.value;
                  setElements(newElements);
                }}
                style={{
                  color: element.color,
                  fontSize: `${element.size}px`,
                  background: "none",
                  border: "none",
                }}
                disabled={!canEdit}
              />
            )}
            {element.type === "RECTANGLE" && (
              <div
                style={{
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  backgroundColor: element.color,
                }}
              />
            )}
            {element.type === "CIRCLE" && (
              <div
                style={{
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  borderRadius: "50%",
                  backgroundColor: element.color,
                }}
              />
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
              />
            )}
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary mt-4"
        onClick={saveElements}
        disabled={!canEdit}
      >
        Сохранить изменения
      </button>
    </div>
  );
};

export default ChangeSlides;
