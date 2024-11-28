import React, { useState } from "react";

interface SlideElement {
  id: string;
  type: "TEXT" | "SHAPE";
  content?: string;
  color?: string;
  x: number;
  y: number;
}

interface SlideEditorProps {
  elements: SlideElement[];
  setElements: React.Dispatch<React.SetStateAction<SlideElement[]>>;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ elements, setElements }) => {
  const moveElement = (id: string, x: number, y: number) => {
    setElements((prevElements) =>
      prevElements.map((elem) => (elem.id === id ? { ...elem, x, y } : elem))
    );
  };

  const changeElement = (id: string, key: string, value: any) => {
    setElements((prevElements) =>
      prevElements.map((elem) =>
        elem.id === id ? { ...elem, [key]: value } : elem
      )
    );
  };
  if (!elements || elements.length === 0) {
    return <div>Нет элементов для редактирования</div>;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "500px",
        border: "1px solid #ccc",
      }}
    >
      {elements.map((element) =>
        element.type === "TEXT" ? (
          <div
            key={element.id}
            style={{
              position: "absolute",
              top: `${element.y}px`,
              left: `${element.x}px`,
              border: "1px solid #ccc",
              padding: "10px",
              backgroundColor: "#fff",
              cursor: "move",
            }}
            contentEditable
            onInput={(e) =>
              changeElement(element.id, "content", e.currentTarget.textContent)
            }
          >
            {element.content}
          </div>
        ) : (
          <div
            key={element.id}
            style={{
              position: "absolute",
              top: `${element.y}px`,
              left: `${element.x}px`,
              width: "100px",
              height: "100px",
              backgroundColor: element.color || "gray",
              cursor: "move",
            }}
            onClick={() =>
              changeElement(
                element.id,
                "color",
                prompt("Enter color", element.color)
              )
            }
          />
        )
      )}
    </div>
  );
};

export default SlideEditor;
