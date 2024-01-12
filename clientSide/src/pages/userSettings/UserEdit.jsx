import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext'
import UserEditForm from '../../components/UserEditForm';
import { useFetch } from '../../hooks/useFetch';

export default function UserEdit() {
    const {data: users} = useFetch('http://localhost:3001/api/getUser');
    const [user, setUser] = useState('');
    const context = useAuthContext();

    const updateUserInState = (updatedUser) => {
        setUser(updatedUser);
        context.dispatch({
            type: 'UPDATE_USER',
            payload: { updatedUser }
        });
    };

    useEffect(()=>{
        const unsub = ()=>{
            if(users && users.result && context.user){
                const currentUser = users && users.result.find((userItem) => userItem.id === context.user.id);
                setUser(currentUser ? currentUser : '');
            };
        };
        unsub();
        return()=>{
            unsub()
        }
    },[context, users]);


    return (
        <div>
            <h1 style={{color:'#404040'}}>მომხმარებლის მონაცემები</h1>
            <UserEditForm user={user} updateUserInState={updateUserInState}/>
        </div>
    )
}
