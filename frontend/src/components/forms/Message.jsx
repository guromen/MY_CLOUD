import { Box } from "@mui/material"


const Message = ({text}) =>{
    return(
        <Box sx={{
            backgroundColor: '#ff0000ff', 
            color:'#FFFFFF', 
            width: '90%', 
            height: '40px',
            position:'absolute', 
            bottom:'20px', 
            display:'flex', 
            justifyContent:'center', 
            alignItems:'center'
            }}>
            {text}
        </Box>
    )
}

export default Message