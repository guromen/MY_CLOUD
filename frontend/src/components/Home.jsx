import { useState, useContext } from "react";
import AdminHome from "./AdminHome";
import UserHome from "./UserHome";
import '../App.css';
import { UserContext } from './UserContext';

const Home = () => {
  const { currentUser, loading } = useContext(UserContext);
  const [showAdmin, setShowAdmin] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null);

  if (loading) return <p>Загрузка...</p>;

  if (!currentUser) return <p>Пожалуйста, войдите в систему</p>;

  // если пользователь не админ — сразу UserHome
  if (!currentUser.is_admin) {
    return <UserHome currentUser={currentUser} />;
  }

  // пользователь админ
  return (
    <div>
      <div>
        <button className="showAdmin"
          onClick={() => {
            if (showAdmin) {
              setSelectedUserId(currentUser.id); // показываем свои файлы
            } else {
              setSelectedUserId(null);
              setSelectedUserName(null);
            }
            setShowAdmin(!showAdmin);
          }}
        >
          {showAdmin ? "⬅ К моим файлам" : "⚙️ Админка"}
        </button>
      </div>

      {showAdmin ? (
        <AdminHome
          currentUser={currentUser}
          onSelectUser={(user) => {
            setSelectedUserId(user.id);
            setSelectedUserName(user.fullname ? user.fullname : user.email.split('@')[0]);
            setShowAdmin(false); // переходим к UserHome
          }}
        />
      ) : (
        <UserHome
          currentUser={currentUser}
          selectedUserId={selectedUserId}
          selectedUserName={selectedUserName}
        />
      )}
    </div>
  );
};

export default Home;
