import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import Axios from 'axios';
import { useNavigate } from "react-router-dom";

export const useLogout = ()=>{
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const context = useAuthContext();
    const navigate = useNavigate();

    const redirectToLogin = ()=>{
        navigate('/');
    }

    Axios.defaults.withCredentials = true;

    const logout = async()=>{
        setError(null);
        setIsPending(true);

        try{
            const response = await Axios.post(
                'http://localhost:3001/api/logout',
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': context.userToken,
                    }
                }
            );

            if (!response.data.logout) {
                throw new Error(response.data.message || 'Logout failed');
            }

            context.dispatch({type:'LOGOUT'});
            console.log('loggedout')

            setIsPending(false);
            setError(null);

            redirectToLogin();
        }
        catch(err){
            console.log(err.message);
            setError(err.message);
            setIsPending(false);
            console.log('error loggedout')
        }
    }


    return{ logout, error, isPending }
}