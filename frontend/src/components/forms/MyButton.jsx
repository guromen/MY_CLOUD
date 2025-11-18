import Button from '@mui/material/Button';

export default function MyButton(props) {
    const {label} = props
  return (


      <Button className='myForm' variant="contained">
        {label}
      </Button>


  );
}