import React, { useEffect, useState } from 'react';
import './Statistics.css';
import {Link} from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';

export default function Statistics() {
    const [showUserStat, setShowUserStat] = useState(false);

    const context = useAuthContext();


    useEffect(()=>{
        if(context.user && context.user.User_Type_id === 1){
            setShowUserStat(true);
        } else if(context.user && context.user.User_Type_id === 4){
            setShowUserStat(true);
        } else{
            setShowUserStat(false);
        }
    },[context]);

    return (
        <div className='statContainer'>
            {
                showUserStat && (
                    <div className='users-stat-box'>
                        <Link to='/usersStat' className='link'>
                            <label className='label'><h3>მომხმარებლები</h3></label>
                            <div className='inner-box-user-stat'>
                            </div>
                        </Link>
                    </div>
                )
            }
            <div className='projects-stat-box'> 
                <Link to='/projectsStat' className='link'>
                    <label className='label'><h3>პროექტები</h3></label>
                    <div className='inner-box-project-stat'>
                    </div>
                </Link>
            </div>
        </div>
    )
}
