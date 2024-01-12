import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import {
    Button,
} from '@mui/material';

import './NotificationsList.css'

export default function NotificationsList({ userId, adminId }) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const [notifications, setNotifications] = useState([]);
    const [read, setRead] = useState(false);

    const [uid, setUid] = useState(null);

    const context =useAuthContext();

    useEffect(()=>{
        if(context.user && context.user.id){
            setUid(context.user.id);
        }
    },[context]);

    const fetchNotifications = async (...signal) => {
        setIsPending(true);
        try {
            if(userId){
                const response = await Axios.get(
                    `http://localhost:3001/api/projapi/get/notifications/${userId}`,
                    {
                        ...signal
                    }
                    ).then((response)=>{
                        if(response.data){
                            setNotifications(response.data);
                            setIsPending(false);
                            setError(null);
                            const data = response.data;
                            const unreads = data.map((msg)=> {
                                if(msg.read === '1'){
                                    setRead(true);
                                }})
                        };
                    });
                    return response;
            }else {
                const response = await Axios.get(
                    `http://localhost:3001/api/projapi/get/adminNotifications/${adminId}`,
                    {
                        ...signal
                    }
                    );
                    if (response.data) {
                        setIsPending(false);
                        setError(null);
                        const originalNotifications = response.data;
                    
                        const uniqueIdentifiers = new Set();
                    
                        const uniqueNotifications = originalNotifications.filter((notification) => {
                        const identifier = `${notification.created_at}-${notification.message}-${notification.project_id}`;
                    
                        if (!uniqueIdentifiers.has(identifier)) {
                            uniqueIdentifiers.add(identifier);
                    
                            return true;
                        }
                    
                        return false;
                        });
                    
                        setNotifications(uniqueNotifications);
                    }
            }
        } catch (error) {
            console.error('Error fetching list:', error);
            setIsPending(false);
            setError("Couldn't fetch the data from users");
        }
    };

    useEffect(()=>{
        const controller = new AbortController();
        if(notifications){
            const signal = { signal: controller.signal }
            fetchNotifications(signal);
        } else {
            fetchNotifications();
        };
        return ()=>{
            controller.abort();
        }
    },[context, userId]);

    const handleRead = async (notification)=>{
        try{
            if(userId){
                const id = notification.id;
                const response = await Axios.put(
                    `http://localhost:3001/api/projapi/notifications/update/${id}`
                    );
                if (response.status === 200) {
                    const updatedNotifications = notifications.map((n) =>
                        n.id === notification.id ? { ...n, read: '1' } : n
                    );
                    setNotifications(updatedNotifications);
                }
                return response;
            }else{
                const id = notification.id;
                const response = await Axios.put(
                    `http://localhost:3001/api/projapi/adminNotifications/update/${id}`
                    );
                if (response.status === 200) {
                    const updatedNotifications = notifications.map((n) =>
                        n.id === notification.id ? { ...n, read: '1' } : n
                    );
                    setNotifications(updatedNotifications);
                }
                return response;
            }
        } catch (error) {
            console.error('Error updating read list:', error);
        }
    };

    const handleAllRead = async ()=>{
        try{
            if(userId){
                const response = await Axios.put(
                    `http://localhost:3001/api/projapi/notifications/user/update/${userId}`
                    );
                if (response.status === 200) {
                    const updatedNotifications = notifications.map((n) =>
                        n.id ? { ...n, read: '1' } : n
                    );
                    setNotifications(updatedNotifications);
                }
                return response;
            }else{
                const response = await Axios.put(
                    `http://localhost:3001/api/projapi/adminNotifications/admin/update/${uid}`
                    );
                if (response.status === 200) {
                    const updatedNotifications = notifications.map((n) =>
                        n.id ? { ...n, read: '1' } : n
                    );
                    setNotifications(updatedNotifications);
                }
                return response;
            }
        } catch (error) {
            console.error('Error updating read list:', error);
        }
    };

    const formatDate = (dateString) => {
        const options = { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        const formattedDate = new Date(dateString).toLocaleString('en-GB', options);
        return formattedDate;
    };

    return (
        <>
            <Button className='read-all-btn' onClick={()=> handleAllRead()} variant="contained" >წაიკითხე ყველა</Button>
            <div>
            {isPending && <div>Loading users...</div>}
            {error && <div>{error}</div>}
            <ul className='notific-list-ul'>
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div key={notification.id} className='li-cont'>
                            <li
                                onClick={() => handleRead(notification)}
                                className={`notification ${notification.read === "1" ? "read" : "unread"}`}
                                key={notification.id}
                            >
                                <p>{notification.message}</p><p>{formatDate(notification.created_at)}</p>
                            </li>
                        </div>
                    ))
                ) : (
                    <p>თქვენ არ გაქვთ შეტყობინებები</p>
                )}
            </ul>
        </div>
        </>
    )
}
