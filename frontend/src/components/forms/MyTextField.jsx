import TextField from '@mui/material/TextField';
import '../../App.css'
import {Controller} from 'react-hook-form'

export default function MyTextField(props) {
    const {label, name, control} = props
  return (
    <Controller
      name={name}
      control={control}
      render={({
          field:{onChange, value},
          fieldState: {error},
          formState,
        }) => (
          <TextField 
            className='myForm'
            onChange={onChange}
            value= {value}
            id="outlined-basic"
            label= {label}
            variant="outlined"
            error= {!!error}
            helperText= {error?.message}
          />
      )} 
    />
  );
}