import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import NotificationsList from '../../components/NotificationsList';
import '../../components/NotificationsList.css';
import {
    Typography,
    Container,
} from '@mui/material';
import theme from '../../components/Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function Notifications() {
    const [userId, setUserId] = useState('');
    const [adminId, setAdminId] = useState('');
    const [showPage, setShowPage] = useState(false);
    const context = useAuthContext();

    useEffect(()=>{
        const unsub = ()=>{
            if(context.authIsReady){
                setShowPage(true);
                if(context.user && context.user.User_Type_id !== 1 && context.user.User_Type_id !== 4){
                    if(context.user && context.user.id){
                        setUserId(context.user.id);
                        setAdminId(null);
                    }
                } else{
                    if(context.user && context.user.id){
                        setUserId(null);
                        setAdminId(context.user.id);
                    }
                }
            };
        }
        unsub();
        return ()=>{
            unsub();
        }
    },[context])

    return (
        <>
            <Typography className='form-heading notific-list-heading' variant='h5'>შეტყობინებები</Typography>
            <div className='notific'>
                <Container maxWidth='false' className='notific-main-list-cont-mui'>
                    <ThemeProvider theme={theme}>
                        {
                            showPage && (
                                <NotificationsList userId={userId} adminId={adminId} />
                            )
                        }
                    </ThemeProvider>
                </Container>
            </div>
        </>
    )
}
