import { useEffect, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../slices/userSlice";
import AdminHome from "./AdminHome";
import UserHome from "./UserHome";
// import { fetchUsers } from "../slices/userSlice";
import { selectCurrentUser } from "../slices/userSlice";

const Home = () => {
  const dispatch = useDispatch();
  // const loading = useSelector((state) => state.user.loading);
  const currentUser = useSelector(selectCurrentUser);
  const [showAdmin, setShowAdmin] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const authChecked = useSelector((state) => state.user.authChecked);
  // const users = useSelector((state) => state.user.users);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setSelectedUser({ 
        id: currentUser.id, 
        name: currentUser.fullname || currentUser.email.split("@")[0] 
      });
    }
  }, [currentUser]);


  if (!authChecked) return <p>Проверка авторизации...</p>;

  if (!currentUser) return <p>Пожалуйста, войдите в систему</p>;


  if (!currentUser.is_admin) {

    return <UserHome selectedUser={selectedUser} />;
  }

  // пользователь админ
  return (
    <div>
      
      <div>
        <button
          className="showAdmin"
          onClick={() => setShowAdmin(prev => !prev)}
        >
          {showAdmin ? "⬅ К моим файлам" : "⚙️ Админка"}
        </button>
      </div>

      {showAdmin ? (
        <div style={{ display: showAdmin ? "block" : "none" }}>
        <AdminHome
          currentUser={currentUser}
          
          onSelectUser={(user) => {
            setSelectedUser({ id: user.id, name: user.fullname || user.email.split("@")[0] });
            setShowAdmin(false);
          }}
        />
        </div>
      ) : (
        <UserHome
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
};

export default Home;
