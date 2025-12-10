import { useEffect, useState } from "react";
import AxiosInstance from "./AxiosInstance";

const AdminHome = ({currentUser, onSelectUser}) => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    AxiosInstance.get("users/")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);

    const handleDeleteUser = (id) => {
      if (window.confirm("Удалить пользователя?")) {
        AxiosInstance.delete(`users/${id}/`)
          .then(() => setUsers(users.filter((u) => u.id !== id)))
          .catch(console.error);
        }
    };

    const filteredUsers = currentUser
    ? users.filter((u) => u.id !== currentUser.id)
    : users;

    const toggleAdmin = (user) => {
      AxiosInstance.patch(`users/${user.id}/`, { is_admin: !user.is_admin })
        .then((res) =>{
          console.log("Ответ от сервера:", res.data)
          setUsers(users.map((u) => 
            u.id === user.id ? { ...u, is_admin: !u.is_admin } : u
          ));
        })
        .catch(console.error);
    };   

  if (!currentUser) return <p>Загрузка...</p>;
  return (
    <div className="home">
      {currentUser.fullname ? <h2>Привет, {currentUser.fullname}!</h2>: <h2>Привет, админ!</h2>}
      <h2 className="home-title">Список пользователей</h2>

      <table className="files-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя пользователя</th>
            <th>Email</th>
            <th>Администратор</th>
            <th>Действия</th>
            <th>Всего файлов</th>
            <th>Размер файлов</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username ? u.username : u.email.split('@')[0]}</td>
              <td>{u.email}</td>
              <td>{u.is_admin ? "🟢 " : "🔴"}</td>
              <td>
                <button onClick={() => toggleAdmin(u)}>
                  {u.is_admin ? ">>>> Снять админа<<<<" : ">>Назначить админом<<"}
                </button>{" "}|{" "}

                <button onClick={() => handleDeleteUser(u.id)}>🗑 Удалить</button>{" "}|{" "}
               
                <button onClick={() => {console.log('Файлы пользователя',u.username); onSelectUser(u)}}>
                  📁 Файлы
                </button>
              </td>
              <td>{u.total_files}</td>
              <td>{u.total_size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminHome;