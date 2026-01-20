import "./PublicLink.css";
import { useDispatch, useSelector } from "react-redux";
import { enablePublicLink, disablePublicLink  } from "../slices/userSlice";

const PublicLink = ({ fileId, userId, onClose }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user.currentUser);
  const users = useSelector(state => state.user.users);
  const API_URL = import.meta.env.VITE_API_URL;

    let file = null;

    if (currentUser?.id === userId) {
    file = currentUser.files?.find(f => f.id === fileId);
    } else {
    const user = users.find(u => u.id === userId);
    file = user?.files?.find(f => f.id === fileId);
    }

    if (!file) return null;

  const publicUrl = `${API_URL}/api/share/${file.public_uid}/`;

  const toggleAccess = () => {
    if (file.public_access_enabled) {
      dispatch(disablePublicLink(file.id));
    } else {
      dispatch(enablePublicLink({
        fileId: file.id,
        expires: file.public_access_expires,
      }));
    }
  };

   const updateExpires = (value) => {
      dispatch(
        enablePublicLink({
          fileId: file.id,
          expires: value || null,
        })
      );
    };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    alert("Ссылка скопирована");
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">

        <h3>Публичная ссылка</h3>

        <label>
          <input
            type="checkbox"
            checked={file.public_access_enabled}
            onChange={toggleAccess}
          />
          Разрешить публичный доступ
        </label>

        <div>
          <label>Срок действия:</label>
          <input
            type="datetime-local"
            value={file.public_access_expires || ""}
            onChange={(e) => updateExpires(e.target.value)}
            disabled={!file.public_access_enabled}
          />
        </div>

        {file.public_access_enabled && (
          <div>
            <input readOnly value={publicUrl} />
            <button className="copy-btn"onClick={copyLink}>🔗Скопировать</button>
          </div>
        )}

        <button className="modal-close" onClick={onClose} >
        ✕
        </button>
      </div>
    </div>
  );
};

export default PublicLink;
