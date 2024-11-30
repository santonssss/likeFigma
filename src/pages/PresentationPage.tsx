import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";

const PresentationPage: React.FC = () => {
  const { id } = useParams();
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from("slides")
        .select("*")
        .eq("presentation_id", id)
        .order("index", { ascending: true });

      if (error) {
        console.error("Ошибка загрузки слайдов:", error);
      } else {
        setSlides(data || []);
      }
    };

    fetchSlides();
  }, [id]);

  const handleExportToPDF = async () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [210, 297],
    });

    for (const slide of slides) {
      const parsedContent = JSON.parse(slide.content || "{}");

      const container = document.createElement("div");
      container.style.width = "1296px";
      container.style.height = "500px";
      container.style.position = "relative";
      container.style.border = "2px solid #000";
      container.style.backgroundColor = "#f5f5f5";

      parsedContent.elements?.forEach((element: any) => {
        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.left = `${element.x}px`;
        el.style.top = `${element.y}px`;
        el.style.transform = `rotate(${element.rotation || 0}deg)`;

        if (element.type === "TEXT") {
          el.textContent = element.content;
          el.style.color = element.color;
          el.style.fontSize = `${element.size}px`;
        } else if (element.type === "RECTANGLE") {
          el.style.width = `${element.size}px`;
          el.style.height = `${element.size}px`;
          el.style.backgroundColor = element.color;
        } else if (element.type === "CIRCLE") {
          el.style.width = `${element.size}px`;
          el.style.height = `${element.size}px`;
          el.style.borderRadius = "50%";
          el.style.backgroundColor = element.color;
        } else if (element.type === "TRIANGLE") {
          el.style.width = "0";
          el.style.height = "0";
          el.style.borderLeft = `${element.size}px solid transparent`;
          el.style.borderRight = `${element.size}px solid transparent`;
          el.style.borderBottom = `${element.size * 2}px solid ${
            element.color
          }`;
        }

        container.appendChild(el);
      });

      document.body.appendChild(container);

      try {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");

        if (pdf.getNumberOfPages() > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      } catch (err) {
        console.error("Ошибка рендеринга слайда:", err);
      }

      document.body.removeChild(container);
    }

    pdf.save(`presentation-${id}.pdf`);
  };
  return (
    <div className="container">
      <h2 className="text-center mb-4">Презентация</h2>
      <div className="form-group mb-4 d-flex justify-content-between">
        <button className="btn btn-primary" onClick={handleExportToPDF}>
          Экспортировать все слайды в PDF
        </button>
      </div>
      <div className="row">
        {slides.map((slide: any) => (
          <div key={slide.id} className="col-12 mb-4">
            <Link to={`/slides/${slide.id}`} className="text-decoration-none">
              <div
                className="work-area"
                style={{
                  width: "100%",
                  height: "500px",
                  position: "relative",
                  border: "2px solid #000",
                  backgroundColor: "#f5f5f5",
                }}
              >
                {JSON.parse(slide.content || "{}").elements?.map(
                  (element: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        position: "absolute",
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        transform: `rotate(${element.rotation || 0}deg)`,
                      }}
                    >
                      {element.type === "TEXT" && (
                        <div
                          style={{
                            color: element.color,
                            fontSize: `${element.size}px`,
                          }}
                        >
                          {element.content}
                        </div>
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
                            borderBottom: `${element.size * 2}px solid ${
                              element.color
                            }`,
                          }}
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresentationPage;
