import { useEffect, useState } from "react";
import AxiosInstance from "./AxiosInstance";
import "./UserHome.css";
import Message from "./forms/Message";

const UserHome = ({currentUser, selectedUserId,selectedUserName}) => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");
  
  const mimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/zip",
    "application/x-zip-compressed",
  ];

  const API = "files/";
  

  useEffect(() => {
    const url = selectedUserId
      ? `files/?user_id=${selectedUserId}`
      : "files/";
    console.log('currentUser',currentUser)
    AxiosInstance.get(url)
      .then((res) => setFiles(res.data))
      .catch(console.error);
  }, [selectedUserId]);


  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("comment", comment);
      // если админ загружает другому пользователю
    if (selectedUserId) {
      formData.append("user_id", selectedUserId);
    }
    setComment("");      
    setFile(null);      
    e.target.reset(); 

    AxiosInstance.post(API, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => setFiles([...files, res.data]))
      .catch((error) => {
          alert(error.response?.data?.file?.[0] || "Ошибка загрузки файла");
      });
  };

  const handleDelete = (id) => {
    const deleteFile= window.confirm('Вы точно хотите удалить файл?')
    if (deleteFile){
    AxiosInstance.delete(`${API}${id}/`)
      .then(() => setFiles(files.filter((f) => f.id !== id)))
      .catch(console.error);}
  };

  const handleRename = (id, newName) => {
    AxiosInstance.patch(`${API}${id}/`, { name: newName })
      .then((res) =>
        setFiles(files.map((f) => (f.id === id ? { ...f, name: res.data.name } : f)))
      )
      .catch(console.error);
  };

    const handleReComment = (id, newComment) => {
    AxiosInstance.patch(`${API}${id}/`, { comment: newComment })
      .then((res) =>
        setFiles(files.map((f) => (f.id === id ? { ...f, comment: res.data.comment } : f)))
      )
      .catch(console.error);
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
    const userName = currentUser.fullname 
    ? currentUser.fullname
    : currentUser.email.split('@')[0]


  return (
    <div className="home">
        <h2>Файлы пользователя {selectedUserName ? selectedUserName: userName} </h2>

      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          // onChange={(e) => setFile(e.target.files[0])}
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
      </table>
    </div>
  );
};

export default UserHome;