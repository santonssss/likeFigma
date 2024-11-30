import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

const PresentationsPage = () => {
  const [presentations, setPresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPresentations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("presentations")
        .select("id, name, creator_id, created_at");

      if (error) {
        console.error("Ошибка загрузки презентаций:", error);
      } else {
        setPresentations(data || []);
      }
      setLoading(false);
    };

    fetchPresentations();
  }, []);

  if (loading) {
    return <div>Загрузка презентаций...</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Все презентации</h1>
      <Link to="/createPresentation" className="btn mb-5 btn-primary">
        Создать новую презентацию
      </Link>
      {presentations.length === 0 ? (
        <p>Презентаций пока нет.</p>
      ) : (
        <div className="row">
          {presentations.map((presentation) => (
            <div className="col-md-4 mb-4" key={presentation.id}>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{presentation.name}</h5>
                  <p className="card-text">
                    <strong>Автор:</strong>{" "}
                    {presentation.creator_id || "Неизвестно"} <br />
                    <strong>Дата создания:</strong>{" "}
                    {new Date(presentation.created_at).toLocaleDateString()}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/presentation/${presentation.id}`)}
                  >
                    Просмотр
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PresentationsPage;
