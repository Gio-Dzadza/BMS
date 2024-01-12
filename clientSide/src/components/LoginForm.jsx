import { useEffect, useRef, useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import '../pages/login/Login.css';
//mui
import {
    TextField,
    Button,
    Stack,
    Typography,
} from '@mui/material';


export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const emailInputRef = useRef(null);

    const [loggedUserName, setLoggedUserName]=useState('');

    const context = useAuthContext();


    Axios.defaults.withCredentials = true;

    const login = ()=>{
        setEmail('');
        setPassword('');
        Axios.post('http://localhost:3001/api/login', {
            email,
            password
        }).then((response)=>{
            // console.log(response);
            if(response.data.auth){
                setLoggedUserName(response.data.result[0].FirstName);
                // Save the token in a global variable
                //useAuthContext-s gadaveci
                context.dispatch({
                    type: 'LOGIN', 
                    payload: {
                        user: response.data.result[0],
                        token: response.data.token
                    }
                });
                setEmail('');
                setPassword('');
            } else{
                setLoggedUserName(response.data.message);
            };
        }).catch((error) => {
            // Handle API request errors here
            setLoggedUserName('An error occurred. Please try again later.');
            console.error('Login error:', error);
        });
    };


    useEffect(()=>{
        Axios.defaults.withCredentials = true;
        Axios.get('http://localhost:3001/api/login').then((response)=>{
            if(response.data.loggedIn){
                setLoggedUserName('');
            } else{
                setLoggedUserName('გთხოვთ შეიყვანეთ თქვენი მონაცემები');
                emailInputRef.current.focus();
            }
        });
    },[context]);

return (
    <div className='login'>
        <Typography variant='h6' marginBottom='20px' display='flex' justifyContent='center' color='#505050'>{loggedUserName}</Typography>
        <form noValidate>
            <Stack spacing={2} width={350}>
                <TextField 
                    inputRef={emailInputRef}
                    sx={{ 
                        input: { color: 'black' },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#73a8bd', // Change this to your desired border color
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#73a8bd', // Change this to your desired focused label color
                        },
                    }}
                    label='Email'
                    type='text'
                    value={email}
                    onChange={(e)=>{setEmail(e.target.value)}}
                />
                <TextField 
                    sx={{ 
                        input: { color: 'black' },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#73a8bd', // Change this to your desired border color
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#73a8bd', // Change this to your desired focused label color
                        },
                    }}
                    label='პაროლი'
                    type='password'
                    value={password}
                    onChange={(e)=>{setPassword(e.target.value)}}
                    //login on enter
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            login();
                        }
                    }}
                />
                <button 
                    onClick={login}
                    variant='contained' 
                    className='login-btn'
                >
                    შესვლა
                </button>
            </Stack>
        </form>
    </div>
)
}
