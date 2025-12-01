import { useEffect, useState } from "react";
import AxiosInstance from "./AxiosInstance";
import AdminHome from "./AdminHome";
import UserHome from "./UserHome";
import '../App.css'

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAdmin, setShowAdmin] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null);

  useEffect(() => {
    AxiosInstance.get("users/me/")
      .then((res) => {
        setCurrentUser(res.data)
        setSelectedUserId(res.data.id); //сразу ставим свои файлы!
        console.log(currentUser)

      })
      .catch(console.error);
      
  }, []);

  if (!currentUser) return <p>Загрузка...</p>;

  // Если пользователь не админ — просто показываем UserHome
  if (!currentUser.is_admin) {
    return <UserHome currentUser={currentUser} />;
  }

  // Если пользователь админ — даем возможность переключать экран
  return (
    <div>
      <div>
 
          <button className="showAdmin"
            onClick={() => {
              console.log(currentUser['email'], '; Admin?=',!showAdmin)
              if (showAdmin) {
                // выходим ИЗ админки - показываем свои файлы
                setSelectedUserId(currentUser.id);
                
              } else {
                // заходим в админку - сбрасываем выбор юзера
                setSelectedUserId(null);
                setSelectedUserName(null)
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
          onSelectUser={(userId) => {
            setSelectedUserId(userId.id);
            setSelectedUserName(userId.fullname?
              userId.fullname
              :userId.email.split('@')[0]);
            setShowAdmin(false); // Нажимаем на файлы и  переходим в UserHome
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