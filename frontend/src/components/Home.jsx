import {  useState} from "react";
import { useSelector } from "react-redux";
import AdminHome from "./AdminHome";
import UserHome from "./UserHome";
import { selectCurrentUser } from "../slices/userSlice";

const Home = () => {
  const currentUser = useSelector(selectCurrentUser);
  const authChecked = useSelector((state) => state.user.authChecked);
  const [showAdmin, setShowAdmin] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  if (!authChecked) return <p>Проверка авторизации...</p>;
  if (!currentUser) return <p>Пожалуйста, войдите в систему</p>;

  if (!currentUser.is_admin) {
    return (
      <UserHome
        selectedUser={{
          id: currentUser.id,
          name: currentUser.fullname || currentUser.email.split("@")[0],
        }}
      />
    );
  }

  return (
    <div>
      <button
        className="showAdmin"
        onClick={() => {
          if (showAdmin) {
            // админ → мои файлы
            setSelectedUser({
              id: currentUser.id,
              name: currentUser.fullname || currentUser.email.split("@")[0],
            });
            setShowAdmin(false);
          } else {
            // мои файлы → админка
            setShowAdmin(true);
          }
        }}
      >
        {showAdmin ? "⬅ К моим файлам" : "⚙️ Админка"}
      </button>

      {showAdmin ? (
        <AdminHome
          currentUser={currentUser}
          onSelectUser={(user) => {
            setSelectedUser({
              id: user.id,
              name: user.fullname || user.email.split("@")[0],
            });
            setShowAdmin(false);
          }}
        />
      ) : (
        selectedUser && <UserHome selectedUser={selectedUser} />
      )}
    </div>
  );
};
export default Home;