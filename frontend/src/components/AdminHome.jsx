import { useSelector, useDispatch } from "react-redux";
import {  deleteUser, toggleAdmin } from "../slices/userSlice";

const AdminHome = ({ currentUser, users, onSelectUser }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.user.loading);

  if (!currentUser || loading === "loading") return <p>Загрузка...</p>;

  const handleDeleteUser = (id) => {
    if (window.confirm("Удалить пользователя?")) {
      dispatch(deleteUser(id));
    }
  };

  const handleToggleAdmin = (user) => {
    dispatch(toggleAdmin(user));
  };

  const filteredUsers = currentUser
    ? users.filter((u) => u.id !== currentUser.id)
    : users;

  return (
    <div className="home">
      {currentUser.fullname ? (
        <h2>Привет, {currentUser.fullname}!</h2>
      ) : (
        <h2>Привет, админ!</h2>
      )}
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
              <td>{u.username ? u.username : u.email.split("@")[0]}</td>
              <td>{u.email}</td>
              <td>{u.is_admin ? "🟢" : "🔴"}</td>
              <td>
                <button onClick={() => handleToggleAdmin(u)}>
                  {u.is_admin ? ">>>> Снять админа<<<<" : ">>Назначить админом<<"}
                </button>{" "}
                |{" "}
                <button onClick={() => handleDeleteUser(u.id)}>🗑 Удалить</button>{" "}
                |{" "}
                <button
                  onClick={() => {
                    console.log("Файлы пользователя", u.email);
                    onSelectUser(u);
                  }}
                >
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

