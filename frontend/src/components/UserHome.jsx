import { useEffect, useState } from "react";
import AxiosInstance from "./AxiosInstance";
import { useDispatch, useSelector } from "react-redux";
import {fetchUserFiles, uploadFile, deleteFile, selectUserFiles, renameFile, updateFileComment} from "../slices/userSlice";
import "./UserHome.css";

const UserHome = ({selectedUser}) => {
  const dispatch = useDispatch();
  const error = useSelector(state => state.user.error);
  const userId = selectedUser?.id || null;
  const files = useSelector((state) => selectUserFiles(state, selectedUser?.id));
  const currentUser = useSelector((state) => state.user.currentUser);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");
  const isImage = (filename) =>/\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const [page, setPage] = useState(1);
  const pagination = useSelector(state => state.user.filesPagination);
  const filesLoading = useSelector(state => state.user.filesLoading);
  
  const mimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/zip",
    "application/x-zip-compressed",
    "text/html", 
  ];

  const API = "files/";

  useEffect(() => {
    if (userId && !filesLoading) {
      dispatch(fetchUserFiles({ userId, page }));
    }
  }, [userId, page]);

  useEffect(() => {
    if (error) alert(error);
  }, [error]);

  const handleUpload = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("comment", comment);

    dispatch(uploadFile({ userId, formData }));

    setComment("");
    setFile(null);
    e.target.reset();
  };

  const handleDelete = (id) => {
    if (!window.confirm("Удалить файл?")) return;
    dispatch(deleteFile({ userId, fileId: id }));
  };

  const handleRename = (id, name) => {
    dispatch(renameFile({ fileId: id, newName: name }));
  };

  const handleReComment = (id, comment) => {
    dispatch(updateFileComment({ fileId: id, comment }));
  };

  const copyLink = (fileUrl) => {
    navigator.clipboard.writeText(fileUrl);
    alert("Ссылка скопирована!");
  };
  //скачивание
  const handleView = (id, filename) => {
  AxiosInstance.get(`files/${id}/download/`, { responseType: 'blob' })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    
      console.log('res.data =',res.data)

    })
    .catch(console.error);
};

  const userName = selectedUser?.name || currentUser.fullname || currentUser.email.split("@")[0];


  return (
    <div className="home">
        <h2>Файлы пользователя {userName} </h2>

      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          onChange={(e) => {
            const selected = e.target.files[0];
            if (!selected) return;

            if (!mimeTypes.includes(selected.type)) {
              alert("Недопустимый тип файла!");
              e.target.value = "";
              return;
            }

            setFile(selected);
          }}
          required
          className="file-input"
        />
        <input
          type="text"
          placeholder="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="comment-input"
        />
        <button type="submit" className="upload-btn">
          Загрузить
        </button>
      </form>
      
      <table className="files-table">
        <thead>
          <tr>
            <th>Файл</th>
            <th>Имя</th>
            <th>Комментарий</th>
            <th>Размер</th>
            <th>Дата загрузки</th>
            <th>Последнее скачивание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f.id}>
              <td className="file-preview-cell">
                {isImage(f.file) ? (
                  <img
                    src={f.file}
                    alt={f.name}
                    className="file-preview"
                    onClick={() => handleView(f.id, f.name)}
                  />
                ) : (
                  <div className="file-icon">📄</div>
                )}
              </td>
              <td>{f.name}</td>
              <td>{f.comment}</td>
              <td>{(f.size / 1024).toFixed(1)} КБ</td>
              <td>{new Date(f.uploaded_at).toLocaleString()}</td>
              <td>{f.last_downloaded ? new Date(f.last_downloaded).toLocaleString() : "-"}</td>
              <td>
     
                <button 
                  title="Скачать" 
                  onClick={() => handleView(f.id, f.name)}>
                  ⬇️
                </button>{" "}|{" "}
  
                <a
                  title="Просмотр"
                  href={`http://localhost:8000/files/${f.id}/preview/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  👁️ 
                </a>{" "}|{" "}

                <button 
                  title="Копировать ссылку" 
                  onClick={() => copyLink(`http://localhost:8000/api/share/${f.public_uid}/`)}
                  >
                  🔗
                </button>{" "}|{" "}

                <button
                  title="Переименовать"
                  onClick={() => {
                    const newName = prompt("Новое имя:", f.name);
                    if (newName) handleRename(f.id, newName);
                  }}>
                  ✏️ 
                </button>{" "}|{" "}

                <button
                  title="Редактировать комментарий"
                  onClick={() => {
                    const newComment = prompt("Новый комментарий:", f.comment);
                    if (newComment) handleReComment(f.id, newComment);
                  }}>
                  📝
                </button>{" "}|{" "}

                <button 
                  title="Удалить"
                  onClick={() => handleDelete(f.id)}>
                  🗑
                </button>
                
                

              </td>
            </tr>
          ))}
          
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={7} className="table-footer-right">
              Всего файлов: {files.length} / {(totalSize / (1024*1024)).toFixed(2)} Мб
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="pagination">
          <button
            disabled={!pagination.previous}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ← Назад
          </button>

          <span>
            Страница {pagination.page}
          </span>

          <button
            disabled={!pagination.next}
            onClick={() => setPage(p => p + 1)}
          >
            Вперёд →
          </button>
       </div>
    </div>   
    
  );
};

export default UserHome;