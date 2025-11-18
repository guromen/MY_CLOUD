import '../App.css'
import { Box } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import { Link } from 'react-router-dom'

const Register = () => {
    return (
       <div className="backgroundLogin">
        <Box className='loginBox'>

            <Box className='itemBox'>
                <Box className='title'>Регистрация</Box>
            </Box>

            <Box className={"itemBox"}>
                    <MyTextField
                        label={"Username"}                        
                    />
            </Box>

            <Box className={"itemBox"}>
                <MyTextField
                label={"Fullname"}
                
                />
            </Box>

            <Box className={"itemBox"}>
                <MyTextField
                    label={"Email"}                        
                />
            </Box>

            <Box className={"itemBox"}>
                <MyPassField
                    label={"Password"}
                />
            </Box>

            
            <Box className={"itemBox"}>
                <MyButton                          
                    label={"Register"}
                />
            </Box>

            <Box className={"itemBox"}>
                <Link to="/"> Уже зарегистрированы? Войдите! </Link>
            </Box>

        </Box>
       
       </div> 
    )
}

export default Register