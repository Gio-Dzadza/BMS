import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import './ProjectRegisterForm.css';
import { useFetch } from '../hooks/useFetch';
import * as XLSX from 'xlsx';
import './ProjectRegisterForm.css';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Container,
} from '@mui/material';

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';
import { useAuthContext } from '../hooks/useAuthContext';


export default function ProjectInfo({ project, type, status, userState, clientState, payStatuses, currencies, setProjectToShow }) {
    
    const {data:stp} = useFetch('http://localhost:3001/api/projapi/get/servicesToProject');
    const {data:serviceStatusList} = useFetch('http://localhost:3001/api/projapi/get/serviceStatus');
    const {data:showHideRecs} = useFetch('http://localhost:3001/api/getShowHideRecs');
    const {data:subservice} = useFetch('http://localhost:3001/api/projapi/get/subservices');
    const {data:subservicestats} = useFetch('http://localhost:3001/api/projapi/get/subservicestat');

    const [permission, setPermission] = useState(false);

    const [projectName, setProjectName] = useState('');
    const [projectCode, setProjectCode] = useState('');
    const [projectPrice, setProjectPrice] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [currencyRate, setCurrencyRate] = useState('');

    const [payStatus, setPayStatus] = useState('');
    const [payStatusId, setPayStatusId] = useState('');

    const [currency, setCurrency] = useState('');
    const [currencyId, setCurrencyId] = useState('');

    const [projectType, setProjectType] = useState('');
    const [projectTypeId, setProjectTypeId] = useState('');

    const [users, setUsers] = useState([]);

    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    const [projectStatus, setProjectStatus] = useState('');
    const [projectStatusId, setProjectStatusId] = useState('');

    const [client, setClient] = useState('');
    const [clientId, setClientId] = useState('');

    const [projectDocs, setProjectDocs] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [serviceDates, setServiceDates] = useState({});
    const [serviceMayorDates, setServiceMayorDates] = useState({});

    const [serviceStatuses, setServiceStatuses] = useState('');

    const [serviceUsers, setServiceUsers] = useState({});
    const [serviceUserMapping, setServiceUserMapping] = useState({});

    const userIdsArray = showHideRecs?.result.flatMap(item => item.userIds.split(',').map(Number));
    const Ids = userIdsArray || [];
    const [showFinancialColumns, setShowFinancialColumns] = useState(false);

    const [selectedSubServices, setSelectedSubServices] = useState([]);

    const context = useAuthContext();

    const fetchFiles = async () => {
        try {
        const response = await Axios.get(`http://localhost:3001/api/projapi/${project.id}/files`);
        const fileNames = response.data.files;
    
        const filePromises = fileNames.map((fileName) =>
            Axios.get(`http://localhost:3001/api/projapi/${project.id}/files/${fileName}`, {
            responseType: 'blob', 
            })
        );
        const fileResponses = await Promise.all(filePromises);
        const fileObjects = fileResponses.map((fileResponse, index) => {
            const file = new File([fileResponse.data], fileNames[index]);
            return file;
        });
        setProjectDocs((prevDocs) => [...Array.from(fileObjects)]);
        
        setSelectedFiles((prevSelectedFiles) => [...Array.from(fileNames)]);
        } catch (error) {
        console.error('Error fetching files:', error);
        }
    };

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

    const formatSubDate = (deadline) => {
        const originalDate = new Date(deadline);
        const year = originalDate.getFullYear();
        const month = String(originalDate.getMonth() + 1).padStart(2, '0');
        const day = String(originalDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    useEffect(()=>{
        fetchFiles();
        setProjectName(project.Project_Name);
        setProjectCode(project.Project_Code);
        setProjectPrice(project.Project_Price);
        setPaidAmount(project.Paid_Amount);
        setCurrencyRate(project.Currency_Rate);

        type && type.map((typeofproject)=>{
                if(typeofproject.id === project.Project_Type_ID){
                    setProjectType(typeofproject.Project_Type_Name);
                }
            }
        );

        status && status.map((statusofproject)=>{
                if(statusofproject.id === project.Project_Status_ID){
                    setProjectStatus(statusofproject.Project_Status_Name);
                }
            }
        );
        clientState && clientState.map((client)=>{
                if(client.id === project.Client_Id){
                    setClient(client.Client_FirstName + ' ' + client.Client_LastName);
                }
            }
        );

        payStatuses && payStatuses.map((paystatusofproject)=>{
                if(paystatusofproject.id === project.Pay_Status_ID){
                    setPayStatus(paystatusofproject.pay_status_name);
                }
            }
        );

        currencies && currencies.map((currencyItem)=>{
                if(currencyItem.id === project.Currency_ID){
                    setCurrency(currencyItem.Currency_Name);
                }
            }
        );

        const matchingUsers = stp && stp.result.filter(item => project.id === item.projectId).map(item => item.userIds);
        const parsedMatchinUsers = matchingUsers && matchingUsers.map((item)=> item).map((secitem)=>JSON.parse(secitem));
        const flattenedArray = parsedMatchinUsers && parsedMatchinUsers
        .flatMap(item => item)
        .filter((value, index, self) => self.indexOf(value) === index);
        if (flattenedArray && flattenedArray[0] !== '') {
            setUsers(flattenedArray);
        } else {
        };

        const serviceUsersObject = {};
        stp && stp.result.forEach(item => {
            if (project.id === item.projectId) {
                serviceUsersObject[item.serviceId] = JSON.parse(item.userIds);
            }
        });
        setServiceUsers(serviceUsersObject);

        const matchingServices = stp && stp.result.filter(item => project.id === item.projectId).map(item => item.serviceId);
        setServices(matchingServices === null ? [] : matchingServices[0] === null ? [] : matchingServices);

        const uniqueServices = [];
        const uniqueIds = new Set();

        project.assignedServices.forEach(service => {
        if (!uniqueIds.has(service.id)) {
            uniqueIds.add(service.id);
            uniqueServices.push(service);
        }
        });

        setSelectedServices(uniqueServices);

        const userNames = userState;
        const servStatuses = subservicestats && subservicestats.result;
        const subservs = subservice && subservice.result;
        const servsToProjs = project && project.servicesToProjects;
        const today = formatSubDate(new Date());
        const subServs = servsToProjs.map(obj => {
            const userIdsArray = JSON.parse(obj.subservice_userIds);
            const matchingSubserv = subservs && subservs.find(item => item.id === obj.subservice_id);
            const matchingSubServStatus = servStatuses && servStatuses.find(statitem => statitem.id === obj.subservice_status_id);
            const matchingSubServUsers = userNames && userNames.filter(userItem => userIdsArray.includes(userItem.id));
            const subServUserNames = matchingSubServUsers && matchingSubServUsers.map(user => `${user.FirstName} ${user.LastName}`);
            return {
                serviceId: obj.serviceId,
                subserviceId: obj.subservice_id,
                subServName: matchingSubserv ? matchingSubserv.name : null,
                subServStatusId: obj.subservice_status_id,
                subServStatusName: matchingSubServStatus ? matchingSubServStatus.status_name : null,
                subServDeadLine: formatSubDate(obj.subservice_deadLine),
                subServMayorDeadLine: formatSubDate(obj.subservice_mayorDeadLine),
                expireStatus: (formatSubDate(obj.subservice_mayorDeadLine) < today || formatSubDate(obj.subservice_deadLine) < today) ? 1 : 0,
                subServUserIds: obj.subservice_userIds,
                subServUserNames: subServUserNames ? subServUserNames : null,
            };
        });
        setSelectedSubServices(subServs);

        const serviceDatesObject = {};
        stp && stp.result.forEach(item => {
        if (project.id === item.projectId) {
            const originalDate = new Date(item.deadLine);
            const year = originalDate.getFullYear();
            const month = String(originalDate.getMonth() + 1).padStart(2, '0');
            const day = String(originalDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            serviceDatesObject[item.serviceId] = formattedDate;
        }
        });
        setServiceDates(serviceDatesObject);

        const serviceMayorDatesObject = {};
        stp && stp.result.forEach(item => {
        if (project.id === item.projectId) {
            const originalDate = new Date(item.mayorDeadLine);
            const year = originalDate.getFullYear();
            const month = String(originalDate.getMonth() + 1).padStart(2, '0');
            const day = String(originalDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            serviceMayorDatesObject[item.serviceId] = formattedDate;
        }
        });
        setServiceMayorDates(serviceMayorDatesObject);

        const serviceUsersMappingObject = {};
        stp && stp.result.forEach(item => {
            if (project.id === item.projectId) {
                serviceUsersMappingObject[item.serviceId] = JSON.parse(item.userIds);
            }
        });
        
        if (!('null' in serviceUsersMappingObject)) {
            setServiceUserMapping(serviceUsersMappingObject);
        };

        if(selectedServices.length > 0){
            const serviceStatusesObject = {};
            stp && stp.result.forEach(item => {
                if (project.id === item.projectId) { 
                    const selectedServiceItem = serviceStatusList && serviceStatusList.find(serviceitem => serviceitem.id === item.Service_Status_Id);
                    serviceStatusesObject[item.serviceId] = { id: item.Service_Status_Id, status: selectedServiceItem.Service_Status_Name };
                }
            });
            setServiceStatuses(serviceStatusesObject);
        }
    },[project, stp, subservicestats, subservice]);

    useEffect(()=>{
        if(projectType){
            const selectedType = type.find((type) => type.Project_Type_Name === projectType);
            setProjectTypeId(selectedType ? selectedType.id : '');
        };

        if(payStatus){
            const selectedPayStatus = payStatuses.find((payitem) => payitem.pay_status_name === payStatus);
            setPayStatusId(selectedPayStatus ? selectedPayStatus.id : '');
        };

        if(currency){
            const selectedCurrency = currencies.find((currencyItem) => currencyItem.Currency_Name === currency);
            setCurrencyId(selectedCurrency ? selectedCurrency.id : '');
        };

        if(projectStatus){
            const selectedStatus = status.find((status) => status.Project_Status_Name === projectStatus);
            setProjectStatusId(selectedStatus ? selectedStatus.id : '');
        };

        if(client){
            const selectedClient = clientState.find((clientitem) => clientitem.Client_FirstName + ' ' + clientitem.Client_LastName === client);
            setClientId(selectedClient ? selectedClient.id : '');
        };
    },[projectType, projectStatus, client, payStatus, currency]);

    const exportToExcel = () => {
        const dataToExport = [[
            project.Project_Name,
            project.Project_Code,
            type.find((typeitem) => typeitem.id === project.Project_Type_ID)?.Project_Type_Name || '',
            status.find((statitem) => statitem.id === project.Project_Status_ID)?.Project_Status_Name || '',
            clientState && clientState.find((client) => client.id === project.Client_Id)?.Client_FirstName + ' ' 
            + clientState.find((client) => client.id === project.Client_Id)?.Client_LastName || '',
            project.assignedUsers.map((user) => `${user.FirstName} ${user.LastName}`).join(', '),
            project.Project_Price ? project.Project_Price : 'არ არის დადგენილი',
            payStatuses && payStatuses.find((payitem) => payitem.id === project.Pay_Status_ID)?.pay_status_name || '',
            project.Paid_Amount,
            currencies && currencies.find((currencyitem) => currencyitem.id === project.Currency_ID)?.Currency_Name || '',
            project.Currency_Rate,
            formatDate(project.Created_At ? project.Created_At : ''),
            project.Specialist_Changed_At ? formatDate(project.Specialist_Changed_At) : 'სპეციალისტი არ შეცვლილა',
            formatDate(project.Specialist_Atached_At ? project.Specialist_Atached_At : ''),
        ]];

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
        a.download = 'project-info.xlsx';
        a.click();

        URL.revokeObjectURL(url);
        a.remove();
    };

    const userExportToExcel = () => {
        const dataToExport = [[
            project.Project_Name,
            project.Project_Code,
            type.find((typeitem) => typeitem.id === project.Project_Type_ID)?.Project_Type_Name || '',
            status.find((statitem) => statitem.id === project.Project_Status_ID)?.Project_Status_Name || '',
            clientState && clientState.find((client) => client.id === project.Client_Id)?.Client_FirstName + ' ' 
            + clientState.find((client) => client.id === project.Client_Id)?.Client_LastName || '',
            project.assignedUsers.map((user) => `${user.FirstName} ${user.LastName}`).join(', '),
            formatDate(project.Created_At ? project.Created_At : ''),
            project.Specialist_Changed_At ? formatDate(project.Specialist_Changed_At) : 'სპეციალისტი არ შეცვლილა',
            formatDate(project.Specialist_Atached_At ? project.Specialist_Atached_At : ''),
        ]];

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
        a.download = 'project-info.xlsx';
        a.click();

        URL.revokeObjectURL(url);
        a.remove();
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

    const handleClose = (e)=>{
        e.preventDefault();
        setProjectToShow(null);
    };

    useEffect(() => {
        const unsub = () => {
            if( context.user && context.user.User_Type_id === 1 ){
                setPermission(true);
            } else if(context.user && context.user.User_Type_id === 4){
                setPermission(true);;
            } else if(context.user && context.user.User_Type_id === 5){
                setPermission(true);
            } else{
                setPermission(false);
            };
        };
        unsub();
        return () => {
            unsub();
        };
    }, [context]);

    return (
        <Container className='project-reg-form-container' maxWidth="md">
        <Typography className='form-heading' variant="h5">პროექტის მონაცემები</Typography>
        <form className='project-reg-form'>
            <ThemeProvider theme={theme}> 
                <TextField
                label="პროექტის სახელი"
                variant="outlined"
                value={projectName}
                fullWidth
                margin="normal"
                className='proj-name'
                readOnly
                InputProps={{
                    className: 'input-label',
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                />
                <TextField
                label="საკადასტრო კოდი"
                variant="outlined"
                value={projectCode}
                fullWidth
                margin="normal"
                className='proj-name'
                readOnly
                InputProps={{
                    className: 'input-label',
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                />
                <div className='type-client-cont'>
                    <FormControl
                        className='proj-type' 
                        variant="outlined" 
                        fullWidth margin="normal"
                    >
                        <InputLabel
                            className='input-label'
                        >
                            პროექტის ტიპი
                        </InputLabel>
                        <Select
                            value={projectType}
                            label="type"
                            readOnly
                            className='select-label'
                        >
                            <MenuItem value="">
                            <em>None</em>
                            </MenuItem>
                            {type &&
                            type.map((type) => (
                                <MenuItem
                                key={type.id}
                                value={type.Project_Type_Name}
                                className='select-label'
                                readOnly
                                >
                                    {type.Project_Type_Name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl
                        className='proj-client' 
                        variant="outlined" 
                        fullWidth margin="normal"
                    >
                        <InputLabel
                            className='input-label'
                        >
                            კლიენტი
                        </InputLabel>
                        <Select
                            value={client}
                            label="client"
                            readOnly
                            className='select-label'
                        >
                            <MenuItem value="">
                            <em>None</em>
                            </MenuItem>
                            {clientState &&
                            clientState.map((client) => (
                                <MenuItem
                                key={client.id}
                                value={client.Client_FirstName + ' ' + client.Client_LastName}
                                className='select-label'
                                readOnly
                                >
                                    {client.Client_FirstName + ' ' + client.Client_LastName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <FormControl
                    className='proj-stat' 
                    variant="outlined" 
                    fullWidth margin="normal"
                >
                    <InputLabel
                        className='input-label'
                    >
                        პროექტის სტატუსი
                    </InputLabel>
                    <Select
                        value={projectStatus}
                        label="client"
                        readOnly
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {status &&
                        status.map((stat) => (
                            <MenuItem
                            key={stat.id}
                            value={stat.Project_Status_Name}
                            className='select-label'
                            readOnly
                            >
                                {stat.Project_Status_Name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <div className='services-cont'>
                    <label className='services-label'>სერვისები</label>
                    <label>
                        <div className="proj-multi-select-dropdown-cont">
                            <div>
                                {selectedServices.length >0 ? (
                                    selectedServices.map((serviceItem) => (
                                        <div className={`proj-multi-select-dropdown ${serviceStatuses[serviceItem.id] ? (serviceStatuses[serviceItem.id].id === 3 ? 'green-service' : (serviceStatuses[serviceItem.id].id === 1 ? 'white-service' : 'yellow-service')) : ''}`} key={serviceItem.id}>
                                            <span className={`service-name ${serviceStatuses[serviceItem.id] ? (serviceStatuses[serviceItem.id].id === 3 ? 'green-service' : (serviceStatuses[serviceItem.id].id === 1 ? 'white-service' : 'yellow-service')) : ''}`}>
                                                {`${serviceItem.Service_Name}`}
                                            </span>
                                            <label className='inner-deadline-cont'>
                                                <span>შიდა deadline: </span>
                                                <input
                                                    type='date'
                                                    value={serviceDates[serviceItem.id] || ''}
                                                    readOnly
                                                />
                                            </label>
                                            <label className='service-status-cont'>
                                                <span>სერვისის სტატუსი: </span>
                                                <select
                                                    value={serviceStatuses[serviceItem.id] ? serviceStatuses[serviceItem.id].status : ''}
                                                    readOnly
                                                >
                                                    <option></option>
                                                    {serviceStatusList && serviceStatusList.map(serst => (
                                                        <option value={serst.Service_Status_Name} key={serst.id} readOnly>
                                                            {serst.Service_Status_Name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className='mayor-deadline-cont'>
                                                <span>მერიის deadline: </span>
                                                <input
                                                    type='date'
                                                    value={serviceMayorDates[serviceItem.id] || ''}
                                                    readOnly
                                                />
                                            </label>
                                            <label className='spec-cont'>
                                                <span className='spec-span'>სპეციალისტები: </span>
                                                <div className="proj-spec-select-dropdown">
                                                    <div className="proj-selected-users">
                                                        {serviceUsers[serviceItem.id] && serviceUsers[serviceItem.id].map((userId) => {
                                                            const selectedUser = userState.find(user => user.id === userId);
                                                            if (selectedUser) {
                                                                return (
                                                                    <span key={userId}>
                                                                        {`${selectedUser.FirstName} ${selectedUser.LastName}`}
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>
                                            </label>
                                            <div className='services-cont'>
                                            <label className='services-label'>ქვე-სერვისები</label>
                                                <label>
                                                    <div className="proj-multi-select-dropdown-cont">
                                                        <div>
                                                            {selectedSubServices && selectedSubServices.filter(subServiceItem => subServiceItem.serviceId === serviceItem.id).map((subServiceItem, index) => (
                                                                <div className={`proj-multi-select-dropdown ${
                                                                    subServiceItem.subServStatusId === 1
                                                                        ? 'green-service'
                                                                        : subServiceItem.expireStatus === 1
                                                                        ? 'red-service'
                                                                        : subServiceItem.subServStatusId === 2
                                                                        ? 'yellow-service'
                                                                        : subServiceItem.subServStatusId === 3
                                                                        ? 'white-service'
                                                                        : ''
                                                                    }`} key={index}>
                                                                    <span className={`service-name ${
                                                                    subServiceItem.subServStatusId === 1
                                                                        ? 'green-service'
                                                                        : subServiceItem.expireStatus === 1
                                                                        ? 'red-service'
                                                                        : subServiceItem.subServStatusId === 2
                                                                        ? 'yellow-service'
                                                                        : subServiceItem.subServStatusId === 3
                                                                        ? 'white-service'
                                                                        : ''
                                                                    }`}>
                                                                        {`${subServiceItem.subServName}`}
                                                                    </span>
                                                                    <label className='inner-deadline-cont'>
                                                                        <span>შიდა deadline: </span>
                                                                        <input
                                                                        type='date'
                                                                        value={subServiceItem.subServDeadLine}
                                                                        readOnly
                                                                        />
                                                                    </label>
                                                                    <label className='service-status-cont'>
                                                                        <span>ქვე-სერვისის სტატუსი: </span>
                                                                        <input
                                                                            value={subServiceItem.subServStatusName || ''}
                                                                            readOnly
                                                                        />
                                                                    </label>
                                                                    <label className='mayor-deadline-cont'>
                                                                        <span>მერიის deadline: </span>
                                                                        <input
                                                                            type='date'
                                                                            value={subServiceItem.subServMayorDeadLine}
                                                                            readOnly
                                                                        />
                                                                    </label>
                                                                    <label className='spec-cont'>
                                                                        <span className='spec-span'>სპეციალისტები: </span>
                                                                        <div className="proj-spec-select-dropdown">
                                                                            <div className="proj-selected-users">
                                                                            {
                                                                                subServiceItem.subServUserNames.map((user, index)=>(
                                                                                    <span key={index}>
                                                                                        {
                                                                                            user
                                                                                        }
                                                                                    </span>
                                                                                ))
                                                                            }
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    ))
                                ) : ''}
                            </div>
                        </div>
                    </label>
                </div>
                {
                    permission && !showFinancialColumns && (
                        <div className='financial-info-cont'>
                            <label className='finance-label'>ფინანსური ინფორმაცია</label>
                            <TextField
                            label="პროექტის ღირებულება"
                            variant="outlined"
                            value={projectPrice}
                            fullWidth
                            margin="normal"
                            className='proj-cost'
                            readOnly
                            InputProps={{
                                className: 'input-label',
                            }}
                            InputLabelProps={{
                                className:'input-label',
                            }}
                            />
                            <div className='payStat-paidAm-cont'>
                                <FormControl
                                    className='pay-status' 
                                    variant="outlined" 
                                    fullWidth margin="normal"
                                >
                                    <InputLabel
                                        className='input-label'
                                    >
                                        გადახდის სტატუსი
                                    </InputLabel>
                                    <Select
                                        value={payStatus}
                                        label="client"
                                        className='select-label'
                                        readOnly
                                    >
                                        <MenuItem value="">
                                        <em>None</em>
                                        </MenuItem>
                                        {payStatuses &&
                                        payStatuses.map((payst) => (
                                            <MenuItem
                                            key={payst.id}
                                            value={payst.pay_status_name}
                                            className='select-label'
                                            readOnly
                                            >
                                                {payst.pay_status_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                label="გადახდილი თანხა"
                                variant="outlined"
                                value={paidAmount}
                                fullWidth
                                margin="normal"
                                className='paid-amount'
                                readOnly
                                InputProps={{
                                    className: 'input-label',
                                }}
                                InputLabelProps={{
                                    className:'input-label',
                                }}
                                />
                            </div>
                            <div className='currency-currencyRate-cont'>
                                <FormControl
                                    className='currency' 
                                    variant="outlined" 
                                    fullWidth margin="normal"
                                >
                                    <InputLabel
                                        className='input-label'
                                    >
                                        ვალუტა
                                    </InputLabel>
                                    <Select
                                        value={currency}
                                        label="client"
                                        className='select-label'
                                        readOnly
                                    >
                                        <MenuItem value="">
                                        <em>None</em>
                                        </MenuItem>
                                        {currencies &&
                                        currencies.map((currencyItem) => (
                                            <MenuItem
                                            key={currencyItem.id}
                                            value={currencyItem.Currency_Name}
                                            className='select-label'
                                            readOnly
                                            >
                                                {currencyItem.Currency_Name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                label="ვალუტის კურსი"
                                variant="outlined"
                                value={currencyRate}
                                fullWidth
                                margin="normal"
                                className='currency-rate'
                                readOnly
                                InputProps={{
                                    className: 'input-label',
                                }}
                                InputLabelProps={{
                                    className:'input-label',
                                }}
                                />
                            </div>
                        </div>
                    )
                }
                <label className='project-docs-cont'>
                    <label className='docs-label'>დოკუმენტები</label>
                    {
                        selectedFiles.length > 0 ? (
                            <>
                                <div className="proj-spec-select-dropdown">
                                    <div className="proj-selected-users">
                                        {selectedFiles.map((file, index) => (
                                            <span key={index}>
                                                {typeof(file) === 'string' ? file : file.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : ''
                    }
                </label>
                <div className='reg-close-btns-cont'>
                    {
                        !permission || showFinancialColumns ? (
                            <div className='project-reg-btn-cont'>
                                <Button className='project-reg-btn' onClick={userExportToExcel} variant="contained" color="primary">
                                    Excel
                                </Button>
                            </div>
                        ) : (
                            <div className='project-reg-btn-cont'>
                                <Button className='project-reg-btn' onClick={exportToExcel} variant="contained" color="primary">
                                    Excel
                                </Button>
                            </div>
                        )
                    }
                    <div className='proj-close-btn-cont' >
                        <Button className='proj-close-btn' onClick={(e)=> handleClose(e)} variant="contained" color="primary">
                            ფორმის დახურვა
                        </Button>
                    </div>
                </div>
            </ThemeProvider>
        </form>
    </Container>
    )
}
