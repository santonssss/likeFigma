import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

interface User {
  canEdit: boolean;
  username: string;
}

const SlideAccess = ({ slideId }: { slideId: any }) => {
  const [allowedUsers, setAllowedUsers] = useState<User[]>([]);
  const [accessType, setAccessType] = useState<string>("private");
  const [newUsername, setNewUsername] = useState<string>("");

  useEffect(() => {
    const fetchPresentationData = async () => {
      try {
        const { data: slideData, error: slideError } = await supabase
          .from("slides")
          .select("presentation_id")
          .eq("id", slideId)
          .single();

        if (slideError || !slideData) {
          throw new Error("Не удалось найти слайд.");
        }

        const presentationId = slideData.presentation_id;

        const { data: presentationData, error: presentationError } =
          await supabase
            .from("presentations")
            .select("access_type, allowed_users")
            .eq("id", presentationId)
            .single();

        if (presentationError || !presentationData) {
          throw new Error("Не удалось найти презентацию.");
        }

        setAllowedUsers(presentationData.allowed_users || []);
        setAccessType(presentationData.access_type || "private");
      } catch (error) {
        console.error(error);
      }
    };

    fetchPresentationData();
  }, [slideId]);

  const updatePresentation = async (
    updates: Partial<{ allowed_users: User[]; access_type: string }>
  ) => {
    try {
      const { data: slideData } = await supabase
        .from("slides")
        .select("presentation_id")
        .eq("id", slideId)
        .single();

      if (!slideData) throw new Error("Не удалось найти слайд.");

      const presentationId = slideData.presentation_id;

      const { error } = await supabase
        .from("presentations")
        .update(updates)
        .eq("id", presentationId);

      if (error) throw new Error("Ошибка обновления презентации.");
    } catch (error) {
      console.error(error);
    }
  };

  const addUser = () => {
    if (newUsername.trim()) {
      const updatedUsers = [
        ...allowedUsers,
        { username: newUsername.trim(), canEdit: false },
      ];
      setAllowedUsers(updatedUsers);
      updatePresentation({ allowed_users: updatedUsers });
      setNewUsername("");
    }
  };

  const removeUser = (index: number) => {
    const updatedUsers = allowedUsers.filter((_, i) => i !== index);
    setAllowedUsers(updatedUsers);
    updatePresentation({ allowed_users: updatedUsers });
  };

  const toggleEdit = (index: number) => {
    const updatedUsers = [...allowedUsers];
    updatedUsers[index].canEdit = !updatedUsers[index].canEdit;
    setAllowedUsers(updatedUsers);
    updatePresentation({ allowed_users: updatedUsers });
  };

  const toggleAccessType = () => {
    const newAccessType = accessType === "private" ? "public" : "private";
    setAccessType(newAccessType);
    updatePresentation({ access_type: newAccessType });
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          Доступ:{" "}
          <span
            className={`${
              accessType === "private" ? "text-danger" : "text-success"
            }`}
          >
            {accessType === "private" ? "Приватный" : "Публичный"}
          </span>
        </h5>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={toggleAccessType}
        >
          Сделать {accessType === "private" ? "публичным" : "приватным"}
        </button>
      </div>

      {accessType === "private" && (
        <div className="card-body">
          <ul className="list-group mb-3">
            {allowedUsers.length > 0 ? (
              allowedUsers.map((user, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    <i className="fas fa-user mr-2 text-secondary"></i>
                    {user.username}
                  </span>
                  <div>
                    <button
                      onClick={() => toggleEdit(index)}
                      className={`btn btn-sm ${
                        user.canEdit ? "btn-warning" : "btn-success"
                      } mr-2`}
                    >
                      {user.canEdit
                        ? "Запретить редактирование"
                        : "Разрешить редактирование"}
                    </button>
                    <button
                      onClick={() => removeUser(index)}
                      className="btn btn-sm btn-danger"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="list-group-item text-muted">
                Нет пользователей с доступом.
              </li>
            )}
          </ul>

          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Имя пользователя"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <div className="input-group-append">
              <button className="btn btn-outline-success" onClick={addUser}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideAccess;
