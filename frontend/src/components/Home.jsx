import { useEffect, useState } from "react";
import AxiosInstance from "./AxiosInstance";
import UserHome from "./UserHome";

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    AxiosInstance.get("users/me/")
      .then((res) => {
        setCurrentUser(res.data)
        console.log(currentUser)

      })
      .catch(console.error);
      
  }, []);

  if (!currentUser) return <p>Загрузка...</p>;

  // Если пользователь не админ — просто показываем UserHome

    return <UserHome currentUser={currentUser} />;
  }


export default Home;