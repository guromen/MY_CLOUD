import '../App.css'
import { Box } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import { Link } from 'react-router-dom'
import {useForm} from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import {yupResolver} from '@hookform/resolvers/yup'
import * as yup from 'yup'

const Register = () => {
    const navigate = useNavigate()

    const checkRegister = yup
    .object({
        email: yup.string().email('Поле ожидает адрес электронной почты')
                    .required('Введите email'),
        password: yup.string()
                    .required('Введите пароль')
                    .min(6,'Пароль должен содержать минимум 6 символов')
                    .matches(/[A-Z]/,'Пароль должен содержать хотя бы одну заглавную букву')
                    .matches(/[0-9]/,'Пароль должен содержать хотя бы одну цифру')
                    .matches(/[!@#$%^&*(),.?":;{}|<>+]/, 'Пароль должен содержать хотя бы один спецсимвол'),
        username: yup.string().matches(/^[A-Za-z][A-Za-z0-9]{3,19}$/,"Username должен начинаться с буквы и содержать только латинские буквы и цифры (4–20 символов)")
                    .required("Введите логин"),

    })  
    const {handleSubmit, control} = useForm({resolver:yupResolver(checkRegister)})

    const submission = (data) => {
        AxiosInstance.post(`register/`, {
            email: data.email,
            password: data.password,
            fullname: data.fullname,
            username: data.username
        })
        .then(() => {
            navigate(`/`) //перенаправляет на страницу login page
        }) 
    }
    return (
       <div className="backgroundLogin">

        <form onSubmit={handleSubmit(submission)}>
                
               
                <Box className={"loginBox"}>

                    <Box className={"itemBox"}>
                        <Box className={"title"}> Зарегистрируйтесь </Box>
                    </Box>

                    <Box className={"itemBox"}>
                        <MyTextField
                        label={"Username"}
                        name={"username"}
                        control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyTextField
                        label={"Fullname"}
                        name={"fullname"}
                        control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyTextField
                        label={"Email"}
                        name ={"email"}
                        control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyPassField
                        label={"Password"}
                        name={"password"}
                        control={control}
                        />
                    </Box>

                    
                    <Box className={"itemBox"}>
                        <MyButton 
                            type={"submit"}
                            label={"Register"}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <Link to="/"> Уже зарегистрированы? Войдите! </Link>
                    </Box>


                </Box>

            </form>
       
       </div> 
    )
}

export default Register