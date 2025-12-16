import { useEffect, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../slices/userSlice";
import AdminHome from "./AdminHome";
import UserHome from "./UserHome";
import { fetchUsers } from "../slices/userSlice";
import { selectCurrentUser } from "../slices/userSlice";

const Home = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.user.loading);
  const currentUser = useSelector(selectCurrentUser);
  const [showAdmin, setShowAdmin] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const users = useSelector((state) => state.user.users);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <p>Загрузка...</p>;
  if (!currentUser) return <p>Пожалуйста, войдите в систему</p>;

  // если пользователь не админ — сразу UserHome
  if (!currentUser.is_admin) {
    return <UserHome selectedUser={{ id: currentUser.id, name: currentUser.fullname || currentUser.email.split('@')[0] }} />;
  }

  // пользователь админ
  return (
    <div>
      <div>
        <button className="showAdmin"
          onClick={() => {
            if (showAdmin) {
              setSelectedUser({ id: currentUser.id, name: currentUser.fullname || currentUser.email.split('@')[0] }); // показываем свои файлы
            } else {
              setSelectedUser(null);
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
          users={users}
          onSelectUser={(user) => {
            setSelectedUser({ id: user.id, name: user.fullname || user.email.split("@")[0] });
            setShowAdmin(false);
          }}

        />
      ) : (
        <UserHome
          selectedUser={selectedUser}

        />
      )}
    </div>
  );
};

export default Home;
