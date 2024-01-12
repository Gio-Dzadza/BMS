import { createContext, useReducer, useEffect } from 'react';
import Axios from 'axios';

export const AuthContext = createContext();

export const authReducer = (state, action)=>{
    switch (action.type){
        case 'LOGIN':  
            return{ ...state, user: action.payload.user, userToken: action.payload.token, authIsReady: true}
        case 'LOGOUT':
            return{ ...state, user: null, userToken: null, authIsReady: false}
        case 'AUTH_IS_READY':
            return{ ...state, user: action.payload.user, userToken: action.payload.token, authIsReady: true}
        case 'UPDATE_USER':
            return { ...state, user: action.payload.updatedUser }
        default:
            return state
    }
}

export const AuthContextProvider = ({ children }) =>{
    const [state, dispatch] = useReducer(authReducer,{
        user: null,
        userToken: null,
        authIsReady: false
    })

    useEffect(()=>{
        Axios.get('http://localhost:3001/api/login').then((response)=>{
            if(response.data.loggedIn){
                dispatch({
                    type: 'AUTH_IS_READY', 
                    payload: {
                        user: response.data.user[0],
                        token: response.data.token
                    }
                }) 
            } else{
                dispatch({
                    type: 'LOGOUT' 
                });
            };
        });
    }, [])

    return(
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    )
}
