import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';

//datepicker
import 'react-datepicker/dist/react-datepicker.css';

//export
import * as XLSX from 'xlsx';
import ProjectEditForm from './ProjectEditForm';
import ProjectInfo from './ProjectInfo';

//mui
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton } from '@mui/material';
import CustomToolbar from './CustomToolbar';

//style
import './ProjectsList.css'
import '../pages/ListsParentStyles.css';

//img
import Doc from '../assets/icons/doc.png'


export default function ProjectsList({ uid, clientId, updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const {data:type} = useFetch('http://localhost:3001/api/projapi/get/projectType');
    const {data:status} = useFetch('http://localhost:3001/api/projapi/get/projectStatus');
    const {data:payStatus} = useFetch('http://localhost:3001/api/projapi/get/payStatus');
    const {data:currency} = useFetch('http://localhost:3001/api/projapi/get/projectCurrency');
    const {data:clients} = useFetch('http://localhost:3001/api/projapi/get/projectClients');
    const {data:users} = useFetch('http://localhost:3001/api/projapi/get/projectUsers');
    const {data:showHideRecs} = useFetch('http://localhost:3001/api/getShowHideRecs');
    const userIdsArray = showHideRecs?.result.flatMap(item => item.userIds.split(',').map(Number));
    const Ids = userIdsArray || [];
    const [showFinancialColumns, setShowFinancialColumns] = useState(false);

    const [permission, setPermission] = useState(false);

    const [selectedProject, setSelectedProject] = useState(null);
    const [projectsList, setProjectsList] = useState([]);

    const [types, setTypes] = useState([]);
    const [clientState, setClientState] = useState([]);
    const [userState, setUserState] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [payStatuses, setPayStatuses] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    const [authenticated, setAuthenticated] = useState(false);

    const context = useAuthContext();

    const [searchByName, setSearchByName] = useState('');
    const [projectStatusFilter, setProjectStatusFilter] = useState('');
    const [projectTypeFilter, setProjectTypeFilter] = useState('');
    const [payStatusFilter, setPayStatusFilter] = useState('');
    const [currencyFilter, setCurrencyFilter] = useState('');

    const [projectToShow, setProjectToShow] = useState(null);

    const [muiFilteredProjectCount, setMuiFilteredProjectCount] = useState(0);


    useEffect(() => {
        const unsub = () => {
            if (context.user && context.user.id) { 
                if (Ids.includes(context.user.id)) {
                    setShowFinancialColumns(true);
                } else {
                    setShowFinancialColumns(false);
                }
            } else {
                setShowFinancialColumns(false); 
            }
        };
        unsub();
        return () => {
            unsub();
        };
    }, [Ids]);

    const exportToExcel = () => {
        const dataToExport = projectsList.map((project) => [
            project.Project_Name,
            project.Project_Code,
            type.find((typeitem) => typeitem.id === project.Project_Type_ID)?.Project_Type_Name || '',
            status.find((statitem) => statitem.id === project.Project_Status_ID)?.Project_Status_Name || '',
            clients.find((client) => client.id === project.Client_Id)?.Client_FirstName + ' ' 
            + clients.find((client) => client.id === project.Client_Id)?.Client_LastName || '',
            project.assignedUsers.map((user) => `${user.FirstName} ${user.LastName}`).join(', '),
            project.Project_Price ? project.Project_Price : 'არ არის დადგენილი',
            payStatus.find((payitem) => payitem.id === project.Pay_Status_ID)?.pay_status_name || '',
            project.Paid_Amount,
            currency.find((currencyitem) => currencyitem.id === project.Currency_ID)?.Currency_Name || '',
            project.Currency_Rate,
            formatDate(project.Created_At ? project.Created_At : ''),
            project.Specialist_Changed_At ? formatDate(project.Specialist_Changed_At) : 'სპეციალისტი არ შეცვლილა',
            formatDate(project.Specialist_Atached_At ? project.Specialist_Atached_At : ''),
        ]);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['პროექტის სახელი', 'საკადასტრო კოდი', 'პროექტის ტიპი', 'პროექტის სტატუსი', 'კლიენტის სახელი', 'სპეციალისტები', 'პროექტის ფასი', 'გადახდის სტატუსი', 'გადახდილი თანხა', 'ვალუტა', 'ვალუტის კურსი', 'პროექტი შექმნილია', 'სპეციალისტის ცვლილება','სპეციალისტის მიბმა'],
            ...dataToExport,
        ]);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.xlsx';
        a.click();

        URL.revokeObjectURL(url);
        a.remove();
    };
    
    const userExportToExcel = () => {
        const dataToExport = projectsList.map((project) => [
            project.Project_Name,
            project.Project_Code,
            type.find((typeitem) => typeitem.id === project.Project_Type_ID)?.Project_Type_Name || '',
            status.find((statitem) => statitem.id === project.Project_Status_ID)?.Project_Status_Name || '',
            clients.find((client) => client.id === project.Client_Id)?.Client_FirstName + ' ' 
            + clients.find((client) => client.id === project.Client_Id)?.Client_LastName || '',
            project.assignedUsers.map((user) => `${user.FirstName} ${user.LastName}`).join(', '),
            formatDate(project.Created_At ? project.Created_At : ''),
            project.Specialist_Changed_At ? formatDate(project.Specialist_Changed_At) : 'სპეციალისტი არ შეცვლილა',
            formatDate(project.Specialist_Atached_At ? project.Specialist_Atached_At : ''),
        ]);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['პროექტის სახელი', 'საკადასტრო კოდი', 'პროექტის ტიპი', 'პროექტის სტატუსი', 'კლიენტის სახელი', 'სპეციალისტები', 'პროექტი შექმნილია', 'სპეციალისტის ცვლილება','სპეციალისტის მიბმა'],
            ...dataToExport,
        ]);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.xlsx';
        a.click();

        URL.revokeObjectURL(url);
        a.remove();
    };

    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            if(context.user.User_Type_id !==2 && clientId==='noID'){
                const response = await Axios.get('http://localhost:3001/api/projapi/get/projects',
                    {
                        ...signal,
                        headers: {
                            "x-access-token": context.userToken, 
                        },
                    }
                    ).then((response)=>{
                        if(!response.data.auth){
                            setAuthenticated(true);
                        } else{
                            setProjectsList(response.data.result);
                            setAuthenticated(false);
                            setIsPending(false);
                            setError(null);
                        }
                    });
                    return response;
            } else if(uid){
                const response = await Axios.get(`http://localhost:3001/api/projapi/get/userProjects/${uid}`,
                {
                    ...signal,
                    headers: {
                        "x-access-token": context.userToken, 
                    },
                }
                ).then((response)=>{
                    if(!response.data.auth){
                        setAuthenticated(true);
                    } else{
                        setProjectsList(response.data.result);
                        setAuthenticated(false);
                        setIsPending(false);
                        setError(null);
                    }
                });
                return response;
            } else{
                const response = await Axios.get(`http://localhost:3001/api/projapi/get/projects/${clientId}`,
                {
                    ...signal,
                    headers: {
                        "x-access-token": context.userToken, 
                    },
                }
                ).then((response)=>{
                    if(!response.data.auth){
                        setAuthenticated(true);
                    } else{
                        setProjectsList(response.data.result);
                        setAuthenticated(false);
                        setIsPending(false);
                        setError(null);
                    }
                });
                return response;
            }
        } catch (error) {
            console.error('Error fetching list:', error);
            setIsPending(false);
            setError("Couldn't fetch the data from projects");
        }
    };
    
    useEffect(()=>{
        const controller = new AbortController();
        if(updateList){
            const signal = { signal: controller.signal }
            fetchData(signal);
            setUpdateList(false);
        } else {
            fetchData();
        };
        return ()=>{
            controller.abort();
        }
    },[context, updateList, setUpdateList]);

    const handleDelete = async(id)=>{
        try {
            await Axios.delete(`http://localhost:3001/api/projapi/projects/delete/${id}`, {
                headers: {
                    "x-access-token": context.userToken, 
                },
            }).then((response)=>{
                console.log(response);
                if(response.data.auth){
                    console.log(id + ' ' + response.data);
                } else{
                    console.log(id + ' ' + response.data.message);
                    setAuthenticated(true);
                };
                if(response.data.deleted){
                    console.log(id + ' ' + response.data.message);
                    const updatedProjects = projectsList.filter((project)=> project.id !== id);
                    setProjectsList(updatedProjects);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };
    

    const handleEdit = (project) => {
        setSelectedProject(project);
        setTypes(type);
        setClientState(clients);
        setUserState(users);
        setStatuses(status);
        setPayStatuses(payStatus);
        setCurrencies(currency);
    };

    const handleShowInfo = (project) => {
        setProjectToShow(project);
        setTypes(type);
        setClientState(clients);
        setUserState(users);
        setStatuses(status);
        setPayStatuses(payStatus);
        setCurrencies(currency);
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

    function checkExpiration(date) {
        return date < new Date(); 
    };

    function checkMayorExpiration(date) {
        return date < new Date();
    };

    const getRowClassName = (params) => {
        const project = params.row;
        const deadlines = project.servicesToProjects?.map((stp) => stp.deadLine); 
        const mayorDeadlines = project.servicesToProjects?.map((stp) => stp.mayorDeadLine); 
        const projectStatus = project.Project_Status_ID;
    
        if (projectStatus === 1) {
            if (mayorDeadlines?.some((mayorDeadline) => mayorDeadline !== null)) { 
                const modifiedDeadlines = mayorDeadlines.map((item) =>
                    item !== null ? new Date(item) : null
                );
                const hasExpired = modifiedDeadlines.some(checkMayorExpiration);
    
                if (hasExpired) {
                    return 'expired-mayor-row'; 
                } else {
                    const today = new Date();
                    const fiveDaysFromNow = new Date();
                    fiveDaysFromNow.setDate(today.getDate() + 5);
    
                    const isCloseToExpiration = modifiedDeadlines.some((deadline) => {
                        return deadline !== null && deadline <= fiveDaysFromNow;
                    });
    
                    if (isCloseToExpiration) {
                        return 'close-to-expired-mayor-row';
                    }
                }
            }
            if (deadlines?.some((deadline) => deadline !== null)) {
                const modifiedDeadlines = deadlines.map((item) =>
                    item !== null ? new Date(item) : null
                );
                const hasExpired = modifiedDeadlines.some(checkExpiration);
    
                if (hasExpired) {
                    return 'expired-row'; 
                }
            }
        } else if (projectStatus === 2) {
            return 'completed-row';
        }
    
        return '';
    };
    

    useEffect(()=>{
        if( context.user && context.user.User_Type_id === 1 ){
            setPermission(true);
        } else if(context.user && context.user.User_Type_id === 4){
            setPermission(true);
        } else{
            setPermission(false);
        };
    },[context]);

    const columns = [
        {
            field: 'Project_Name',
            headerName: 'პროექტი',
            flex: 1,
            hide:true,
            headerClassName: 'column-headers',
            filterable: false, 
            filterValue: searchByName, 
            renderCell: (params) => {
                const project = params.row;
                return <div 
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }} 
                        onClick={() => handleShowInfo(project)}>
                            {params.value}
                        </div>;
            },
        },
        {
            field: 'Project_Code',
            headerName: 'საკ. კოდი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, 
            filterValue: searchByName, 
            renderCell: (params) => {
                const project = params.row;
                return <div 
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }} 
                        onClick={() => handleShowInfo(project)}>
                            {params.value}
                        </div>;
            },
        },
        {
            field: 'Project_Type_ID',
            headerName: 'ტიპი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: type && type.map((typeitem) => ({
                value: typeitem.id,
                label: typeitem.Project_Type_Name,
            })),
            filterValue: projectTypeFilter, 
            onFilterChange: (event) => setProjectTypeFilter(event.target.value), 
            renderCell: (params) => {
                const typeId = params.row.Project_Type_ID;
                const typeName = type && type.find((typeitem) => typeitem.id === typeId)?.Project_Type_Name;
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {typeName || ''}
                </div>
                );
            },
        },
        {
            field: 'Project_Status_ID',
            headerName: 'სტატუსი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: status && status.map((statitem) => ({
                value: statitem.id,
                label: statitem.Project_Status_Name,
            })),
            filterValue: projectStatusFilter, 
            onFilterChange: (event) => setProjectStatusFilter(event.target.value), 
            renderCell: (params) => {
                const statusId = params.row.Project_Status_ID;
                const statusName = status && status.find((statitem) => statitem.id === statusId)?.Project_Status_Name;
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {statusName || ''}
                </div>
                );
            },
        },
        {
            field: 'Client_Id',
            headerName: 'კლიენტი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            valueGetter: (params) => {
                const clientId = params.row.Client_Id;
                const client = clients && clients.find((client) => client.id === clientId);
                return client ? `${client.Client_FirstName} ${client.Client_LastName}` : '';
            },
            renderCell: (params) => {
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {params.value}
                </div>
                );
            },
        },
        {
            field: 'assignedUsers',
            headerName: 'სპეციალისტი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            valueGetter: (params) => {
                const assignedUsers = params.row.assignedUsers;
                const user = users && users.find((usr) => assignedUsers.some((assignedUser) => usr.id === assignedUser.id));
                return user ? `${user.FirstName} ${user.LastName}` : 'NaN';
            },
            renderCell: (params) => {
                const assignedUsers = params.row.assignedUsers;
                if (assignedUsers.length === 0) {
                    return 'NaN';
                }
                const userNames = [...new Set(assignedUsers.map((user) => `${user.FirstName} ${user.LastName}`))];
                return <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                            {userNames.join(', ')}
                        </div>;
            },
        },
        {
            field: 'priceOfProject',
            headerName: 'ღირებულება',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            valueGetter: (params) => {
                const project = params.row;
                const priceOfProject = project.Project_Price === '' ? 'NaN' : project.Project_Price;
                return priceOfProject;
            },
            renderCell: (params) => {
                return <div>{params.value}</div>;
            },
        },
        {
            field: 'Pay_Status_ID',
            headerName: 'გადახდა',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: payStatus && payStatus.map((payitem) => ({
                value: payitem.id,
                label: payitem.pay_status_name,
            })),
            filterValue: payStatusFilter, 
            onFilterChange: (event) => setPayStatusFilter(event.target.value),
            renderCell: (params) => {
                const payStatusId = params.row.Pay_Status_ID;
                const payStatusName = payStatus && payStatus.find((payitem) => payitem.id === payStatusId)?.pay_status_name;
                return (
                    <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {payStatusName || ''}
                    </div>
                );
            },
        },
        {
            field: 'paidAmount',
            headerName: 'გადახდილია',
            flex: 1,
            headerClassName: 'column-headers',
            valueGetter: (params) => {
                const project = params.row;
                const paidAmount = project.Paid_Amount === '' ? 'NaN' : project.Paid_Amount;
                return paidAmount;
            },
            renderCell: (params) => {
                return (
                    <div style={{ display: 'flex', flexWrap: 'nowrap' }}>{params.value}</div>
                );
            },
        },
        {
            field: 'Currency_ID',
            headerName: 'ვალუტა',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: currency && currency.map((currencyitem) => ({
                value: currencyitem.id,
                label: currencyitem.Currency_Name,
            })),
            filterValue: currencyFilter, 
            onFilterChange: (event) => setCurrencyFilter(event.target.value), 
            renderCell: (params) => {
                const currencyId = params.row.Currency_ID;
                const currencyName = currency && currency.find((currencyitem) => currencyitem.id === currencyId)?.Currency_Name;
                const displayValue = currencyName === undefined ? 'NaN' : currencyName;
                return <div>{displayValue}</div>;
            },
        },
        {
            field: 'currencyRate',
            headerName: 'კურსი',
            flex: 1,
            headerClassName: 'column-headers',
            valueGetter: (params) => {
                const project = params.row;
                const currencyRate = project.Currency_Rate === '' ? 'NaN' : project.Currency_Rate;
                return currencyRate;
            },
            renderCell: (params) => {
                return <div>{params.value}</div>;
            },
        },
        {
            field: 'Project_Docs',
            headerName: 'დოკუმენტები',
            flex: 1,
            headerClassName: 'column-headers',
            cellClassName: 'docs-cell',
            renderCell: (params) => {
                const projectDocs = params.row.Project_Docs || '';
            
                return (
                <div style={{overflowY: 'auto', overflowX:'hidden', display:'block', flexDirection: 'column', alignItems: 'center', paddingLeft: '0px', width:'100%'}}>
                    {projectDocs ? (
                    <div>
                        <a href={`http://localhost:3001/api/projapi/downloads/${params.row.id}`} download>Download Docs</a>
                        <ul style={{ margin: '0', listStyle: 'none',  paddingLeft: '0px' }}>
                        {projectDocs.split(',').map((doc, index) => {
                            const trimmedDoc = doc.trim();
                            return (
                            trimmedDoc !== '' && (
                                <li key={index} style={{display: 'flex', alignContent: 'flex-start'}}>
                                <a href={`http://localhost:3001/api/projapi/downloads/${params.row.id}/${encodeURIComponent(trimmedDoc)}`} download>
                                    {trimmedDoc}
                                </a>
                                </li>
                            )
                            );
                        })}
                        </ul>
                    </div>
                    ) : (
                        <div >
                            <img src={Doc} alt='doc' />
                        </div>
                    )}
                </div>
                );
            },
        },
        {
            field: 'Created_At',
            headerName: 'შექმნილია',
            flex: 1,
            headerClassName: 'column-headers',
            valueGetter: (params) => {
            const createdAt = params.row.Created_At;
            return formatDate(createdAt || '');
            },
        },
        {
            field: 'Specialist_Changed_At',
            headerName: 'სპეციალისტის ცვლილება',
            flex: 1,
            headerClassName: 'column-headers',
            valueGetter: (params) => {
            const specialistChangedAt = params.row.Specialist_Changed_At;
            if(specialistChangedAt){
                return formatDate(specialistChangedAt || '');
            }
            return 'NaN';
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.5,
            headerClassName: 'column-headers',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <div className='actions-container'>
                    <IconButton onClick={() => handleEdit(params.row)} color="warning">
                        <EditIcon />
                    </IconButton>
                    {
                        permission && (
                            <IconButton onClick={() => handleDelete(params.row.id)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        )
                    }
                </div>
            ),
        },
    ];
    

    const filteredProjects = projectsList && projectsList.filter((project) => {
        const projectNameLowerCase = project.Project_Name.toLowerCase();
        const searchByNameLowerCase = searchByName.toLowerCase();
        
        return projectNameLowerCase.includes(searchByNameLowerCase);
    });

    const visibleColumns = columns.filter((column) => {
        if (
            (column.field === 'priceOfProject' && (context.user && context.user.User_Type_id === 2 || showFinancialColumns)) ||
            (column.field === 'Pay_Status_ID' && (context.user && context.user.User_Type_id === 2 || showFinancialColumns)) || 
            (column.field === 'paidAmount' && (context.user && context.user.User_Type_id === 2 || showFinancialColumns)) || 
            (column.field === 'Currency_ID' && (context.user && context.user.User_Type_id === 2 || showFinancialColumns)) || 
            (column.field === 'currencyRate' && (context.user && context.user.User_Type_id === 2 || showFinancialColumns)) ||
            (column.field === 'assignedUsers' && (context.user && context.user.User_Type_id === 5 || showFinancialColumns)) ||
            (column.field === 'Specialist_Changed_At' && (context.user && context.user.User_Type_id === 5 || showFinancialColumns)) 

        ) {
            return false; 
        }
        return true; 
    });

return (
    <div className='list'>
        {isPending && <div>Loading projects...</div>}
        {error && <div>{error}</div>}
        {
            selectedProject && (
                <div className={ selectedProject ? 'modal-window-show' : 'modal-window' }>
                    <ProjectEditForm 
                    project = {selectedProject} 
                    setProjectsList={setProjectsList}
                    setSelectedProject = {setSelectedProject}
                    type = {types}
                    status = {statuses}
                    payStatuses = {payStatuses}
                    currencies = {currencies}
                    userState = {userState}
                    clientState = {clientState}
                    setUpdateList = {setUpdateList}
                    />
                </div>
            )
        }
        {
            projectToShow && (
                <div className={ projectToShow ? 'modal-window-show' : 'modal-window' }>
                    <ProjectInfo 
                    project = {projectToShow} 
                    setProjectsList={setProjectsList}
                    setSelectedProject = {setSelectedProject}
                    type = {types}
                    status = {statuses}
                    payStatuses = {payStatuses}
                    currencies = {currencies}
                    userState = {userState}
                    clientState = {clientState}
                    setProjectToShow = {setProjectToShow}
                    />
                </div>
            )
        }
        {
            authenticated && (
                <div>
                    <h1>You are not permittied You need authentication</h1>
                </div>
            )
        }
        {
            !authenticated &&(
                <>
                        <div style={{ height: '600px', width: '100%' }}>
                        <DataGrid
                            sx={{
                                boxShadow: 2,
                                border: 2,
                                borderColor: '#d5d5d5',
                                '& .MuiDataGrid-cell:hover': {
                                    color: '#d08513',
                                },
                            }}
                            getRowClassName={getRowClassName}
                            initialState={{
                                columns: {
                                    columnVisibilityModel: {
                                        paidAmount: false,                                
                                        currencyRate: false,
                                        Currency_ID: false,
                                        Pay_Status_ID: false,
                                        priceOfProject: false,
                                    },
                                },
                            }}
                            rows={filteredProjects}
                            columns={visibleColumns}
                            pageSize={10}
                            localeText={{
                                toolbarDensity: 'რიგების ზომა',
                                toolbarDensityComfortable: 'კომფორტული',
                                toolbarDensityCompact: 'კომპაქტური',
                                toolbarDensityStandard: 'სტანდარტული',
                                
                                toolbarExport: 'ექსპორტი',
                                toolbarExportPrint: 'ამობეჭდვა',
                                toolbarExportCSV: 'CSV ფორმატი',
        
                                toolbarFilters: 'ფილტრები',
                                filterPanelOperator: 'ფილტრი',
                                filterPanelOperatorAnd: 'And',
                                filterPanelOperatorOr: 'Or',
                                filterPanelColumns: 'სვეტები',
                                filterPanelInputLabel: 'მიშვნელობა',
                                filterPanelInputPlaceholder: 'ჩაწერე',
                                filterOperatorContains: 'შეიცავს',
                                filterOperatorEquals: 'უდრის',
                                filterOperatorStartsWith: 'იწყება',
                                filterOperatorEndsWith: 'მთავრდება',
                                filterOperatorIsEmpty: 'ცარიელია',
                                filterOperatorIsNotEmpty: 'არ არის ცარიელი',
                                filterOperatorIsAnyOf: 'რომელიმეს შეიცავს',
        
                                toolbarColumns: 'სვეტები',
                                columnsPanelTextFieldLabel: 'სვეტის ძიება',
                                columnsPanelShowAllButton: 'აჩვენე ყველა',
                                columnsPanelHideAllButton: 'დამალე ყველა',
                                columnsPanelTextFieldPlaceholder: 'სვეტის სახელი',
        
                                toolbarQuickFilterPlaceholder: 'ძიება',
                                columnMenuLabel: 'Menu',
                                columnMenuShowColumns: 'აჩვენე სვეტი',
                                columnMenuManageColumns: 'სვეტების მართვა',
                                columnMenuFilter: 'ფილტრი',
                                columnMenuHideColumn: 'დამალე სვეტი',
                                columnMenuUnsort: 'Unsort',
                                columnMenuSortAsc: 'დაალაგე ზრდადობის მიხედვით',
                                columnMenuSortDesc: 'დაალაგე კლებადობის მიხედვით',
                            }}   
                            components={{
                                Toolbar:  CustomToolbar, 
                            }}
                            onStateChange={(e) => {
                                setMuiFilteredProjectCount(e.rowsMeta.positions.length)
                            }}
                        />
                        </div>
                    <div className='counter-export'>
                        {filteredProjects && <h5 className='project-counter'>პროექტები: {muiFilteredProjectCount}</h5>}
                        {
                            context.user && context.user.User_Type_id === 2 || showFinancialColumns ? (
                                <Button onClick={userExportToExcel} className='exportXLSX-btn'>Excel</Button>
                            ):(
                                <Button onClick={exportToExcel} className='exportXLSX-btn'>Excel</Button>
                            )
                        }
                    </div>
                </>
            )
        }
    </div>
)
}
