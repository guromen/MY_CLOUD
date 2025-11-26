import { useEffect, useState } from "react";
import AxiosInstance from "./AxiosInstance";
// import { useNavigate } from "react-router-dom";

// import "./Home.css";

const AdminHome = ({currentUser, onSelectUser}) => {
  // const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  
  

  useEffect(() => {
    AxiosInstance.get("users/")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);


  if (!currentUser) return <p>Загрузка...</p>;
  return (
    <div className="home">
      {/* <h2>Привет, админ {currentUser.fullname}!</h2> */}
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
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.is_admin ? "V " : "X"}</td>
              <td>
                <button >
                  {u.is_admin ? "Снять админа" : "Назначить админом"}
                </button>{" "}|{" "}

                <button >🗑 Удалить</button>{" "}|{" "}
               
                <button onClick={() => {console.log('Файлы пользователя',u.username); onSelectUser(u.id)}}>
                  📁 Файлы
                </button>



              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminHome;