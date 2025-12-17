// import { createContext, useState, useEffect } from "react";
// import AxiosInstance from "./AxiosInstance";

// export const UserContext = createContext(null); 
// export const UserProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     AxiosInstance.get("/users/me/")
//       .then((res) => {
//         setCurrentUser(res.data);
//       })
//       .catch(() => {
//         setCurrentUser(null);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const logout = () => {
//     AxiosInstance.post("/logout/", {})
//       .then(() => {
//         setCurrentUser(null);
//       })
//       .catch(err => console.log(err));
//   };

//   return (
//     <UserContext.Provider value={{ currentUser, setCurrentUser, logout, loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };