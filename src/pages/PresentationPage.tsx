import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, Link } from "react-router-dom";

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
        console.error(error);
      } else {
        setSlides(data);
      }
    };

    fetchSlides();
  }, [id]);

  const handleCreateSlide = async () => {
    const { data, error } = await supabase.from("slides").insert([
      {
        presentation_id: id,
        index: slides.length + 1,
        content: JSON.stringify({ elements: [] }), // создаем пустой слайд
        updated_at: new Date(),
      },
    ]);

    if (error) {
      console.error(error);
    } else {
      if (data && Array(data).length > 0) {
        setSlides((prev) => [...prev, data[0]]);
      } else {
        console.error("Не удалось создать слайд");
      }
    }
  };

  return (
    <div className="container">
      <h2 className="text-center mb-4">Презентация</h2>
      <div className="form-group mb-4">
        <button className="btn btn-success" onClick={handleCreateSlide}>
          Добавить слайд
        </button>
      </div>
      <div className="row mb-4">
        {/* Отображаем все слайды */}
        {slides.map((slide: any, index) => (
          <div key={slide.id} className="col-md-4 mb-4">
            <Link to={`/slides/${slide.id}`} className="text-decoration-none">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Слайд {index + 1}</h5>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresentationPage;
