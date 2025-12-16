import '../App.css'
import { useState } from 'react'
import { Box } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useDispatch } from 'react-redux'
import { fetchCurrentUser } from '../slices/userSlice'
import Message from './forms/Message'

const Login = () => {
  const { handleSubmit, control } = useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showMessage, setShowMessage] = useState(false)

  const submission = async (data) => {
    try {
      // Получаем CSRF
      await AxiosInstance.get("/csrf/")

      // Логинимся
      await AxiosInstance.post("/login/", {
        email: data.email,
        password: data.password,
      })

      await dispatch(fetchCurrentUser())

      console.log("Вход успешен, токен хранится в httpOnly cookie")
      navigate("/about")
    } catch (error) {
      console.error("Ошибка при логине", error)
      setShowMessage(true)
    }
  }

  return (
    <div className="backgroundLogin">
      {showMessage && <Message text={'Пароль или email не совпадают'} />}

      <form onSubmit={handleSubmit(submission)}>
        <Box className='loginBox'>
          <Box className='itemBox'>
            <Box className='title'>Авторизация</Box>
          </Box>

          <Box className='itemBox'>
            <MyTextField
              label='Email'
              name='email'
              control={control}
            />
          </Box>

          <Box className='itemBox'>
            <MyPassField
              label='Password'
              name='password'
              control={control}
            />
          </Box>

          <Box className='itemBox'>
            <MyButton
              label='Login'
              type='submit'
            />
          </Box>

          <Box className='itemBox'>
            <Link to='/register'>Нет аккаунта? Зарегистрируйтесь!</Link>
          </Box>
        </Box>
      </form>
    </div>
  )
}

export default Login

