import React, { useEffect, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import ProjectsBarChartClient from '../../components/ProjectsBarChartClient';
import ProjectsBarChartUser from '../../components/ProjectsBarChartUser';
import { useAuthContext } from '../../hooks/useAuthContext';
import './Blank.css';
import BarChartSpecialty from '../../components/BarChartSpecialty';
import ProjectsBarChart from '../../components/ProjectsBarChart';
import ProjByUsersAndServStatChart from '../../components/ProjByUsersAndServStatChart';
import ProjByUsersAndMayorServStatChart from '../../components/ProjByUsersAndMayorServStatChart';


export default function ProjectStat() {
    const [bookerPermission, setBookerPermission] = useState(false);

    const [byUserChart, setByUserChart] = useState(false);// eslint-disable-line no-unused-vars

    const [clientProps, setClientProps] = useState(false);
    const [userProps, setUserProps] = useState(false);
    const [specialtyChart, setSpecialtyChart] = useState(false);// eslint-disable-line no-unused-vars
    const [specialtyProps, setSpecialtyProps] = useState(false);
    const [payStatusProps, setPayStatusProps] = useState(false);
    const [costAndPaidProps, setCostAndPaidProps] = useState(false);
    const [serviceStatusProps, setServiceStatusProps] = useState(false);

    const [projectsData, setProjectsData] = useState([]);
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);
    const [payStatuses, setPayStatuses] = useState([]);

    const [usersData, setUsersData] = useState([]);

    const [url, setUrl] = useState('');

    const {data:projects} = useFetch(url);
    const {data:client} = useFetch('http://localhost:3001/api/projapi/get/projectClients');
    const {data:user} = useFetch('http://localhost:3001/api/projapi/get/projectUsers');
    const { data } = useFetch('http://localhost:3001/api/get');
    const {data:payStatus} = useFetch('http://localhost:3001/api/projapi/get/payStatus');
    

    const context = useAuthContext();

    useEffect(()=>{
        const unsub = ()=>{
            if(context.user && context.user.User_Type_id === 1){
                setUrl('http://localhost:3001/api/projapi/get/projects');
            } else if(context.user && context.user.User_Type_id === 4){
                setUrl('http://localhost:3001/api/projapi/get/projects');
            } else if(context.user && context.user.User_Type_id === 5){
                setUrl('http://localhost:3001/api/projapi/get/projects');
            } else{
                setUrl(`http://localhost:3001/api/projapi/get/userProjects/${context.user.id}`);
            }
        };
        unsub();
        
        return()=>{
            unsub();
        }
    },[url, context]);

    useEffect(()=>{
        const unsub = ()=>{if(projects && projects.result){
            setProjectsData(projects && projects.result);
            setClients(client && client);
            setUsers(user && user);
            setPayStatuses(payStatus && payStatus);
            setByUserChart(true);
            setUserProps(true);
            setClientProps(true);
            setSpecialtyChart(true);
            setSpecialtyProps(true);
            setPayStatusProps(true);
            setCostAndPaidProps(true);
            setServiceStatusProps(true);
        }};
        unsub();
        
        return()=>{
            unsub();
        }
    },[projects, client, user, payStatus]);

    useEffect(()=>{
        const unsub = ()=>{if(data && data.result){
            setUsersData(data && data.result);
        }}

        unsub();
        
        return()=>{
            unsub();
        }
    },[data]);

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


    return (
        <div className='dashboard'>
            <div className='chart'>
                <ProjectsBarChartClient projectsData={projectsData} clients={clients} clientProps={clientProps}/>
            </div>
            {
                context.user && context.user.User_Type_id ===2 && (
                    <>
                        <div className='chart'>
                            <ProjByUsersAndServStatChart projectsData={projectsData} serviceStatusProps={serviceStatusProps} users={users} userProps={userProps} />
                        </div>
                        <div className='chart'>
                            <ProjByUsersAndMayorServStatChart projectsData={projectsData} serviceStatusProps={serviceStatusProps} users={users} userProps={userProps} />
                        </div>
                    </>
                )
            }
            {
                context.user && context.user.User_Type_id !==2 && bookerPermission ? (
                    <>
                        <div className='chart'>
                            <ProjectsBarChartUser projectsData={projectsData} users={users} userProps={userProps} />
                        </div>
                        <div className='chart'>
                            <BarChartSpecialty chartData={usersData} specialtyProps={specialtyProps} />
                        </div>
                        <div className='chart'>
                            <ProjByUsersAndServStatChart projectsData={projectsData} serviceStatusProps={serviceStatusProps} users={users} userProps={userProps} />
                        </div>
                        <div className='chart'>
                            <ProjByUsersAndMayorServStatChart projectsData={projectsData} serviceStatusProps={serviceStatusProps} users={users} userProps={userProps} />
                        </div>
                    </>
                ) : ''
            }
            {
                !bookerPermission && (
                    <>
                        <div className='chart'>
                            <ProjectsBarChart projectsData={projectsData} payStatusProps={payStatusProps} payStatuses={payStatuses} />
                        </div>
                        <div className='chart'>
                            <ProjectsBarChart projectsData={projectsData} costAndPaidProps={costAndPaidProps} />
                        </div>
                    </>
                )
            }
        </div>
    )
}

