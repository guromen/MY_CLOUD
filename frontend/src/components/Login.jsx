import '../App.css'
import { useState } from 'react'
import { Box } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import Message from './forms/Message'

const Login = () => {
    const {handleSubmit, control} = useForm()
    const navigate = useNavigate()
    const [showMessage, setShowMessage] = useState(false)

    const submission = (data) => {
        AxiosInstance.post(`login/`, {
            email: data.email,
            password: data.password,
        })
        .then((response) => {
                console.log(response)
            localStorage.setItem('Token', response.data.token)
            navigate(`/home`)
        })
        .catch((error)=>{
            setShowMessage(true)
            console.error('Ошибка при логине', error)
        })
    }

    return (
       <div className="backgroundLogin">
        {showMessage ? <Message text={'Пароль или email не совпадают'} /> : null}

        <form onSubmit={handleSubmit(submission)}>
            <Box className='loginBox'>
                <Box className='itemBox'>
                    <Box className='title'>Авторизация</Box>
                </Box>

                <Box className='itemBox'>
                            <MyTextField 
                            label='Email'
                            name={"email"}
                            control={control}
                            />
                        </Box>
                        <Box className='itemBox'>
                            <MyPassField 
                            label='Password'
                            name={"password"}
                            control={control}
                            />
                        </Box>
                        <Box className='itemBox'>
                            <MyButton 
                            label='Login'
                            type={"submit"}
                            />
                        </Box>
                        <Box className='itemBox'>
                            <Link to={'/register'}>Нет аккаунта? Зарегистрируйтесь!</Link>
                </Box>

            </Box>
        </form>
       
       </div> 
    )
}

export default Login