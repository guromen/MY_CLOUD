import '../App.css'
import { Box } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import { Link } from 'react-router-dom'

const Login = () => {
    return (
       <div className="backgroundLogin">
        <Box className='loginBox'>
            <Box className='itemBox'>
                <Box className='title'>Авторизация</Box>
            </Box>

            <Box className='itemBox'>
                <MyTextField 
                    label={'email'}
                />
            </Box>

            <Box className='itemBox'>
                <MyPassField 
                    label={'password'}
                />
            </Box>

            <Box className='itemBox'>
                <MyButton  
                    label={'Войти'}
                />
            </Box>

            <Box className='itemBox'>
                <Link to='/register'>Нет аккаунта? Зарегистрируйтесь!</Link>
            </Box>

        </Box>
       
       </div> 
    )
}

export default Login