import './App.css'
import Home from './components/Home'
import Navbar from './components/Navbar'
import Register from './components/Register'
import Login from './components/Login'
import About from './components/About'
import { Routes, Route, useLocation} from 'react-router-dom'

function App() {
  const location = useLocation()
  const noNavbar = location.pathname === '/' || location.pathname === '/register'
  console.log(location)
  return (
    <>
      {
        noNavbar ?
          <Routes>
            <Route path='/' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
          </Routes>
        :
          <Navbar 
            content={
              <Routes>
                <Route>      
                  <Route path='/home' element={<Home/>}/>
                  <Route path='/about' element={<About/>}/> 
                </Route>
              </Routes> 
              //при переходе на home/about -> ProtectedRoute смотрит есть ли Токен, если есть- отрисовываются дочерние элементы Outlet'a: <Home>&<About>    
            }
          />
      }
      
    </>
  )
}

export default App
