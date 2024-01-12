import Axios from 'axios';
//logo
import Bell from '../assets/icons/bellnew.svg';
import Power from '../assets/icons/power.svg';

//style
import './Nav.css'

//router
import { Link } from 'react-router-dom';

//hooks
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext'; 
import { useEffect, useState } from 'react';
import { useFetch } from '../hooks/useFetch';

//mui
//import LogoutIcon from '@mui/icons-material/Logout';

export default function Nav() {
    const [unreadMsgs, setUnreadMsgs] = useState([]);
    const [userId, setUserId] = useState('');
    const [adminId, setAdminId] = useState('');
    const [bookerPermission, setBookerPermission] = useState(false);

    const { logout } = useLogout();
    const {data: user} = useFetch('http://localhost:3001/api/getUser');
    
    const context = useAuthContext();
    const [userName, setUserName] = useState('');

    const [imgSrc, setImgSrc] = useState(null);

    useEffect(() => {
        if(user && user.result && context.user){
            const currentUser = user && user.result.find((userItem) => userItem.id === context.user.id);
            setUserName(currentUser ? currentUser.FirstName : '');
            if(currentUser && currentUser.User_Image){
                setImgSrc(`http://localhost:3001/uploads/users/${currentUser.id}/${currentUser.User_Image}`);
            } else {
                setImgSrc(null);
            };
        };
    }, [context, user]);

    useEffect(()=>{
        const unsub = ()=>{
            if(context.authIsReady){
                if(context.user && context.user.User_Type_id !== 1 && context.user.User_Type_id !== 4){
                    if(context.user && context.user.id){
                        setUserId(context.user.id);
                        setAdminId(null);
                    };
                } else{
                    setAdminId(context.user && context.user.id)
                    setUserId(null);
                }
            };
        }
        unsub();
        return ()=>{
            unsub();
        }
    },[context]);

    useEffect(()=>{
        const unsub = ()=>{
            if(context.authIsReady){
                if(context.user && context.user.User_Type_id === 1 && context.user.User_Type_id === 4){
                    setBookerPermission(true);
                } else if(context.user && context.user.User_Type_id === 5){
                    setBookerPermission(false);
                } else{
                    setBookerPermission(true);
                }
            };
        }
        unsub();
        return ()=>{
            unsub();
        }
    },[context]);
    
    const fetchNotifications = async (...signal) => {
        try {
            if(userId){
                const response = await Axios.get(
                    `http://localhost:3001/api/projapi/get/notifications/${userId}`,
                    {
                        ...signal
                    }
                    ).then((response)=>{
                        if(response.data){
                            const data = response.data;
                            const unreads = data.filter((msg)=> msg.read === '0').length;
                            if (unreads !== unreadMsgs) { // Check if unreads value has changed
                                setUnreadMsgs(unreads); // Update the unreadMsgs state
                            }
                        };
                    });
                    return response;
            }else{
                const response = await Axios.get(
                    `http://localhost:3001/api/projapi/get/adminNotifications/${context.user && context.user.id}`,
                    {
                        ...signal
                    }
                    ).then((response)=>{
                        if(response.data){
                            const data = response.data;
                    
                            // Create a set to store unique identifiers
                            const uniqueIdentifiers = new Set();
                        
                            // Use filter to get unique records based on specified properties
                            const uniqueNotifications = data.filter((notification) => {
                            // Create a unique identifier using the specified properties
                            const identifier = `${notification.created_at}-${notification.message}-${notification.project_id}`;
                        
                            // Check if the identifier is not in the set (not encountered before)
                            if (!uniqueIdentifiers.has(identifier)) {
                                // Add the identifier to the set
                                uniqueIdentifiers.add(identifier);
                        
                                // Return true to include this notification in the result
                                return true;
                            }
                        
                            // Return false to exclude duplicates
                            return false;
                            });
                        
                            const unreads = uniqueNotifications.filter((msg)=> msg.read === '0').length;
                            // console.log(unreads)
                            if (unreads !== unreadMsgs) { // Check if unreads value has changed
                                setUnreadMsgs(unreads); // Update the unreadMsgs state
                            }
                        };
                    });
                    return response;
            }
        } catch (error) {
            console.error('Error fetching list:', error);
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        if (context.authIsReady) {
            // Fetch notifications immediately when auth is ready
            fetchNotifications({ signal: controller.signal });

            // Set up interval to fetch notifications
            const interval = setInterval(() => {
                fetchNotifications({ signal: controller.signal });
            }, 2000); // Fetch every 2 seconds

            return () => {
                controller.abort();
                clearInterval(interval); // Clear the interval when the component unmounts
            };
        }
    }, [context.authIsReady, userId, unreadMsgs]);

return (
    <nav className='nav-container custom-bg-color'>
        <ul className='nav custom-font'>
            {
                context.user && (
                    <>
                        <div className='list-items'>
                            <Link to={'/userEdit'} className='list-item'>მომხმარებლის მონაცემები</Link>
                        </div>
                        <div className='icons'>
                            {
                                bookerPermission && (
                                    <>
                                        <div className='icon'>
                                            <img src={Bell} className='iconImg' alt='bellImg' />
                                            <div className='counter'>{unreadMsgs}</div>
                                        </div>
                                    </>
                                )
                            }
                            <img src={Power} className='logout-btn' onClick={logout} />
                        </div>
                    </>
                )
            }
        </ul>
    </nav>
)
}
