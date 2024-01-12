import React, { useEffect, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import ProjectsBarChart from '../../components/ProjectsBarChart';
import { useAuthContext } from '../../hooks/useAuthContext';
import {
    Button,
    Typography,
    Container,
} from '@mui/material';
import './Statistics.css'
import theme from '../../components/Theme';
import { ThemeProvider } from '@mui/material/styles';


export default function ProjectStat() {

    const [permission, setPermission] = useState(false);

    const [byStatusChart, setByStatusChart] = useState(false);
    const [byTypeChart, setByTypeChart] = useState(false);
    const [byClientChart, setByClientChart] = useState(false);
    const [byUserChart, setByUserChart] = useState(false);
    const [byUserStatusChart, setByUserStatusChart] = useState(false);
    const [byMonthChart, setByMonthChart] = useState(false);
    const [byMonthStatusChart, setByMonthStatusChart] = useState(false);
    const [byYearChart, setByYearChart] = useState(false);
    const [byServiceStatusChart, setByServiceStatusChart] = useState(false);
    const [byMaoyrServiceStatusChart, setByMayorServiceStatusChart] = useState(false);
    const [byPayStatusChart, setByPayStatusChart] = useState(false);
    const [byCostAndPaidChart, setByCostAndPaidChart] = useState(false);
    
    const [statusProps, setStatusProps] = useState(false);
    const [typeProps, setTypeprops] = useState(false);
    const [clientProps, setClientProps] = useState(false);
    const [userProps, setUserProps] = useState(false);
    const [userStatusProps, setUserStatusProps] = useState(false);
    const [monthProps, setMonthProps] = useState(false);
    const [monthStatProps, setMonthStatProps] = useState(false);
    const [yearProps, setYearProps] = useState(false);
    const [serviceStatusProps, setServiceStatusProps] = useState(false);
    const [serviceMayorStatusProps, setServiceMayorStatusProps] = useState(false);
    const [payStatusProps, setPayStatusProps] = useState(false);
    const [costAndPaidProps, setCostAndPaidProps] = useState(false);
    
    const [projectsData, setProjectsData] = useState([]);
    const [types, setTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);
    const [payStatuses, setPayStatuses] = useState([]);

    const [url, setUrl] = useState('');

    const {data:projects} = useFetch(url);
    const {data:type} = useFetch('http://localhost:3001/api/projapi/get/projectType');
    const {data:status} = useFetch('http://localhost:3001/api/projapi/get/projectStatus');
    const {data:client} = useFetch('http://localhost:3001/api/projapi/get/projectClients');
    const {data:user} = useFetch('http://localhost:3001/api/projapi/get/projectUsers');
    const {data:payStatus} = useFetch('http://localhost:3001/api/projapi/get/payStatus');

    const context = useAuthContext();

    useEffect(()=>{
        const unsub = ()=>{
            if(context.user && context.user.id){
                if(context.user && context.user.User_Type_id === 1){
                    setUrl('http://localhost:3001/api/projapi/get/projects');
                } else if(context.user && context.user.User_Type_id === 4){
                    setUrl('http://localhost:3001/api/projapi/get/projects');
                } else if(context.user && context.user.User_Type_id === 5){
                    setUrl('http://localhost:3001/api/projapi/get/projects');
                } else{
                    setUrl(`http://localhost:3001/api/projapi/get/userProjects/${context.user.id}`);
                }
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
            setTypes(type && type);
            setStatuses(status && status);
            setClients(client && client);
            setUsers(user && user);
            setPayStatuses(payStatus && payStatus);
        }};
        unsub();
        
        return()=>{
            unsub();
        }
    },[projects, type, status, client, user, payStatus]);

    useEffect(()=>{
        if( context.user && context.user.User_Type_id === 1 ){
            setPermission(true);
        } else if(context.user && context.user.User_Type_id === 4){
            setPermission(true);
        } else if(context.user && context.user.User_Type_id === 5){
            setPermission(true);
        } else{
            setPermission(false);
        };
    },[context]);

    const showByStatusChart = ()=>{
        setByStatusChart(true);
        setStatusProps(true);
        setTypeprops(false);
        setClientProps(false);
        setUserProps(false);
        setMonthProps(false);
        setYearProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByTypeChart = ()=>{
        setByTypeChart(true);
        setTypeprops(true);
        setStatusProps(false);
        setClientProps(false);
        setUserProps(false);
        setMonthProps(false);
        setYearProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByClientChart = ()=>{
        setByClientChart(true);
        setClientProps(true);
        setStatusProps(false);
        setTypeprops(false);
        setUserProps(false);
        setMonthProps(false);
        setYearProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByUserChart = ()=>{
        setByUserChart(true);
        setUserProps(true);
        setStatusProps(false);
        setTypeprops(false);
        setClientProps(false);
        setMonthProps(false);
        setYearProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByMonthChart = ()=>{
        setByMonthChart(true);
        setMonthProps(true);
        setStatusProps(false);
        setTypeprops(false);
        setClientProps(false);
        setUserProps(false);
        setYearProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByYearChart = ()=>{
        setByYearChart(true);
        setYearProps(true);
        setStatusProps(false);
        setTypeprops(false);
        setClientProps(false);
        setUserProps(false);
        setMonthProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByUserStatusChart = ()=>{
        setByUserStatusChart(true);
        setUserStatusProps(true);
        setByYearChart(false);
        setYearProps(false);
        setStatusProps(false);
        setTypeprops(false);
        setClientProps(false);
        setUserProps(false);
        setMonthProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByMonthStatusChart = ()=>{
        setByMonthStatusChart(true);
        setMonthStatProps(true);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByYearChart(false);
        setYearProps(false);
        setStatusProps(false);
        setTypeprops(false);
        setClientProps(false);
        setUserProps(false);
        setMonthProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByServiceStatusChart = ()=>{
        setByServiceStatusChart(true);
        setServiceStatusProps(true);
        setServiceMayorStatusProps(false);
        setByMayorServiceStatusChart(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByYearChart(false);
        setYearProps(false);
        setStatusProps(false);
        setTypeprops(false);
        setClientProps(false);
        setUserProps(false);
        setMonthProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByMayorServiceStatusChart = ()=>{
        setByMayorServiceStatusChart(true);
        setServiceMayorStatusProps(true);
        setByServiceStatusChart(false);
        setServiceStatusProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByYearChart(false);
        setYearProps(false);
        setStatusProps(false);
        setTypeprops(false);
        setClientProps(false);
        setUserProps(false);
        setMonthProps(false);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
    };

    const showByPayStatusChart = ()=>{
        setByPayStatusChart(true);
        setPayStatusProps(true);
        setByCostAndPaidChart(false);
        setCostAndPaidProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByYearChart(false);
        setYearProps(false);
        setStatusProps(false);
        setTypeprops(false);
        setClientProps(false);
        setUserProps(false);
        setMonthProps(false);
    };

    const showByCostAndPaidChart = ()=>{
        setByCostAndPaidChart(true);
        setCostAndPaidProps(true);
        setByPayStatusChart(false);
        setPayStatusProps(false);
        setByServiceStatusChart(false);
        setByMayorServiceStatusChart(false);
        setServiceStatusProps(false);
        setServiceMayorStatusProps(false);
        setByMonthStatusChart(false);
        setMonthStatProps(false);
        setByUserStatusChart(false);
        setUserStatusProps(false);
        setByYearChart(false);
        setYearProps(false);
        setStatusProps(false);
        setTypeprops(false);
        setClientProps(false);
        setUserProps(false);
        setMonthProps(false);
    };

    return (
        <div className='proj-stat-main-cont'>
            <div className='mui-cont'>
                <Container maxWidth='false'>
                    <Typography className='form-heading' variant="h5">სტატისტიკა პროექტების შესახებ</Typography>
                    <ThemeProvider theme={theme}>
                        <div className='proj-btns-cont'>
                            <Button className='proj-btn' variant="contained" onClick={showByStatusChart}>სტატუსები</Button>
                            <Button className='proj-btn' variant="contained" onClick={showByTypeChart}>ტიპები</Button>
                            <Button className='proj-btn' variant="contained" onClick={showByClientChart}>კლიენტები</Button>
                            {
                                permission && (
                                    <Button className='proj-btn' variant="contained" onClick={showByUserChart}>მომხმარებლები</Button>
                                )
                            }
                            <Button className='proj-btn' variant="contained" onClick={showByUserStatusChart}>მომხმარებლები და პროექტების სტატუსები</Button>
                            <Button className='proj-btn' variant="contained" onClick={showByMonthChart}>თვეები</Button>
                            <Button className='proj-btn' variant="contained" onClick={showByMonthStatusChart}>თვეები და სტატუსები</Button>
                            <Button className='proj-btn' variant="contained" onClick={showByYearChart}>წლები</Button>
                            <Button className='proj-btn' variant="contained" onClick={showByServiceStatusChart}>დასრულებული და ვადაგადაცილებული სერვისები</Button>
                            <Button className='proj-btn' variant="contained" onClick={showByMayorServiceStatusChart}>მერიის ვადაგადაცილებული სერვისები</Button>
                            {
                                permission && (
                                    <>
                                        <Button className='proj-btn' variant="contained" onClick={showByPayStatusChart}>გადახდის სტატუსები</Button>
                                        <Button className='proj-btn' variant="contained" onClick={showByCostAndPaidChart}>ღირებულება და გადახდილი თანხა</Button>
                                    </>
                                )
                            }
                        </div>
                    </ThemeProvider>
                </Container>
            </div>
            <div className='charts-cont'>
                <div className='charts-inner-cont'>
                    {
                        byStatusChart && <ProjectsBarChart projectsData={projectsData} statuses={statuses} statusProps={statusProps}/>
                    }
                    {
                        byTypeChart && <ProjectsBarChart projectsData={projectsData} types={types} typeProps={typeProps} />
                    }
                    {
                        byClientChart && <ProjectsBarChart projectsData={projectsData} clients={clients} clientProps={clientProps}/>
                    }
                    {
                        byUserChart && <ProjectsBarChart projectsData={projectsData} users={users} userProps={userProps} />
                    }
                    {
                        byUserStatusChart && <ProjectsBarChart projectsData={projectsData} users={users} userStatusProps={userStatusProps} />
                    }
                    {
                        byMonthChart && <ProjectsBarChart projectsData={projectsData} monthProps={monthProps}/>
                    }
                    {
                        byMonthStatusChart && <ProjectsBarChart projectsData={projectsData} monthStatProps={monthStatProps}/>
                    }
                    {
                        byYearChart && <ProjectsBarChart projectsData={projectsData} yearProps={yearProps} />
                    }
                    {
                        byServiceStatusChart && <ProjectsBarChart projectsData={projectsData} serviceStatusProps={serviceStatusProps} users={users} userProps={userProps} />
                    }
                    {
                        byMaoyrServiceStatusChart && <ProjectsBarChart projectsData={projectsData} serviceMayorStatusProps={serviceMayorStatusProps} users={users} userProps={userProps} />
                    }
                    {
                        byPayStatusChart && <ProjectsBarChart projectsData={projectsData} payStatusProps={payStatusProps} payStatuses={payStatuses} />
                    }
                    {
                        byCostAndPaidChart && <ProjectsBarChart projectsData={projectsData} costAndPaidProps={costAndPaidProps} />
                    }
                </div>
            </div>
        </div>
    )
}
