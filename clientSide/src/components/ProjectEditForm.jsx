import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import './ProjectRegisterForm.css';
import { useFetch } from '../hooks/useFetch';
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

export default function ProjectEditForm({ project, setProjectsList, setSelectedProject, type, status, userState, clientState, payStatuses, currencies, setUpdateList }) {

    const {data:stp} = useFetch('http://localhost:3001/api/projapi/get/servicesToProject');
    const {data:service} = useFetch('http://localhost:3001/api/projapi/get/services');
    const {data:serviceStatusList} = useFetch('http://localhost:3001/api/projapi/get/serviceStatus');
    const {data:subservice} = useFetch('http://localhost:3001/api/projapi/get/subservices');
    const {data:subservicestats} = useFetch('http://localhost:3001/api/projapi/get/subservicestat');

    const [permission, setPermission] = useState(false);

    const [initialProjectName, setInitialProjectName] = useState('');
    const [initialProjectCode, setInitialProjectCode] = useState('');
    const [initialProjectPrice, setInitialProjectPrice] = useState('');
    const [initialPaidAmount, setInitialPaidAmount] = useState('');
    const [initialCurrencyRate, setInitialCurrencyRate] = useState('');
    const [initialPayStatus, setInitialPayStatus] = useState('');
    const [initialServices, setInitialServices] = useState([]);
    const [initialUsers, setInitialUsers] = useState([]);
    const [initialProjectType, setInitialProjectType] = useState('');
    const [initialServiceStatuses, setInitialServiceStatuses] = useState('');
    const [initialProjectStatus, setInitialProjectStatus] = useState('');
    const [initialClient, setInitialClient] = useState('');
    const [initialProjectDocs, setInitialProjectDocs] = useState([]);
    const [initialServiceDates, setInitialServiceDates] = useState({});
    const [initialServiceMayorDates, setInitialServiceMayorDates] = useState({});
    const [initialCurrency, setInitialCurrency] = useState('');

    const [initialSubServices, setInitialSubServices] = useState('');
    const [initialSubServUsers, setInitialSubServUsers] = useState([]);
    const [initialSubServiceStatuses, setInitialSubServiceStatuses] = useState([]);
    const [initialSubServiceDates, setInitialSubServiceDates] = useState([]);
    const [initialSubServiceMayorDates, setInitialSubServiceMayorDates] = useState([]);
    const [subServUsersForMessage, setSubServUsersForMessage] = useState([]);
    const [subServiceStatusesForMessage, setSubServiceStatusesForMessage] = useState([]);
    const [subServiceDatesForMessage, setSubServiceDatesForMessage] = useState([]);
    const [subServiceMayorDatesForMessage, setSubServiceMayorDatesForMessage] = useState([]);

    const [message, setMessage] = useState('');

    const [projectName, setProjectName] = useState('');
    const [projectCode, setProjectCode] = useState('');
    const [projectPrice, setProjectPrice] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [currencyRate, setCurrencyRate] = useState('');

    const [payStatus, setPayStatus] = useState('');
    const [payStatusId, setPayStatusId] = useState('');

    const [serviceStatusId, setServiceStatusId] = useState('');

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

    const [userDates, setUserDates] = useState({});
    const [serviceDates, setServiceDates] = useState({});
    const [serviceMayorDates, setServiceMayorDates] = useState({});

    const [serviceStatuses, setServiceStatuses] = useState('');

    const [serviceUsers, setServiceUsers] = useState({});
    const [serviceUserMapping, setServiceUserMapping] = useState({});

    const [currentUserId, setCurrentUserId] = useState(null);

    const [initialDocsToUser, setInitialDocsToUser] = useState([]);
    const [docsToUser, setDocsToUser] = useState({projectId: null, userId: null, fileNames: [] });

    const [bookerEditPermission, setBookerEditPermission] = useState(false);

    const [subServiceStatusId, setSubServiceStatusId] = useState('');
    const [subServices, setSubServices] = useState(['1','2']);
    const [selectedSubServices, setSelectedSubServices] = useState([]);
    const [subServiceStatuses, setSubServiceStatuses] = useState('');


    const context = useAuthContext();

    useEffect(() => {
        if (context.user && currentUserId) {
            setDocsToUser(prevState => ({ ...prevState, userId: currentUserId }));
        }
    }, [context, currentUserId]);

    useEffect(() => {
        if (project && project.id) {
            setDocsToUser(prevState => ({ ...prevState, projectId: project.id }));
        }
    }, [project]);

    useEffect(()=>{
        if(context.user && context.user.id){
            setCurrentUserId(context.user.id);
        };
    },[context]);
    
    const handleFileChange = (e) => {
        const files = e.target.files;
        setProjectDocs((prevDocs) => [...prevDocs, ...Array.from(files)]);
        setSelectedFiles([...selectedFiles, ...Array.from(files)]);

        const fileNames = Array.from(files).map(file => file.name);

        setDocsToUser(prevState => ({ ...prevState, fileNames: [...prevState.fileNames, ...fileNames] }));
    };

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
        setInitialProjectDocs((prevDocs) => [...Array.from(fileObjects)]);
        
        setSelectedFiles((prevSelectedFiles) => [...Array.from(fileNames)]);
        } catch (error) {
        console.error('Error fetching files:', error);
        }
    };

    const formatDate = (deadline) => {
        const originalDate = new Date(deadline);
        const year = originalDate.getFullYear();
        const month = String(originalDate.getMonth() + 1).padStart(2, '0');
        const day = String(originalDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    useEffect(()=>{
        fetchFiles();
        const subServicesArray = subservice && subservice.result;
        if (subServicesArray) {
            const subServsIds = subServicesArray.map(subserv => subserv.id);
            setSubServices(subServsIds);
        }

        setInitialProjectName(project.Project_Name);
        setInitialProjectCode(project.Project_Code);
        setInitialProjectPrice(project.Project_Price);
        setInitialPaidAmount(project.Paid_Amount);
        setInitialCurrencyRate(project.Currency_Rate);

        setProjectName(project.Project_Name);
        setProjectCode(project.Project_Code);
        setProjectPrice(project.Project_Price);
        setPaidAmount(project.Paid_Amount);
        setCurrencyRate(project.Currency_Rate);

        setInitialDocsToUser(project.docsToUser);

        type && type.map((typeofproject)=>{
                if(typeofproject.id === project.Project_Type_ID){
                    setProjectType(typeofproject.Project_Type_Name);
                    setInitialProjectType(typeofproject.Project_Type_Name);
                }
            }
        );

        status && status.map((statusofproject)=>{
                if(statusofproject.id === project.Project_Status_ID){
                    setProjectStatus(statusofproject.Project_Status_Name);
                    setInitialProjectStatus(statusofproject.Project_Status_Name);
                }
            }
        );
        clientState && clientState.map((client)=>{
                if(client.id === project.Client_Id){
                    setClient(client.Client_FirstName + ' ' + client.Client_LastName);
                    setInitialClient(client.Client_FirstName + ' ' + client.Client_LastName);
                }
            }
        );

        payStatuses && payStatuses.map((paystatusofproject)=>{
                if(paystatusofproject.id === project.Pay_Status_ID){
                    setPayStatus(paystatusofproject.pay_status_name);
                    setInitialPayStatus(paystatusofproject.pay_status_name);
                }
            }
        );

        currencies && currencies.map((currencyItem)=>{
                if(currencyItem.id === project.Currency_ID){
                    setCurrency(currencyItem.Currency_Name);
                    setInitialCurrency(currencyItem.Currency_Name);
                }
            }
        );

        const matchingUsers = stp && stp.result.filter(item => project.id === item.projectId).map(item => item.userIds);
        const parsedMatchinUsers = matchingUsers && matchingUsers.map((item)=> item).map((secitem)=>JSON.parse(secitem));
        const matchingSubServiceUsers = stp && stp.result.filter(item => project.id === item.projectId).map(item => JSON.parse(item.subservice_userIds));
        const flattenedArray = parsedMatchinUsers && parsedMatchinUsers
        .flatMap(item => item)
        .filter((value, index, self) => self.indexOf(value) === index);
        //subs
        const flattenedSubArray = matchingSubServiceUsers && matchingSubServiceUsers
        .flatMap(item => item)
        .filter((value, index, self) => self.indexOf(value) === index);
        if(flattenedArray && flattenedSubArray){
            const combinedSet = new Set([...flattenedArray, ...flattenedSubArray]);
            const combinedArray = [...combinedSet];
            if (combinedArray && combinedArray[0] !== '') {
                setUsers(combinedArray);
                setInitialUsers(combinedArray);
            } else {
            };
        }

        const serviceUsersObject = {};
        stp && stp.result.forEach(item => {
            if (project.id === item.projectId) {
                serviceUsersObject[item.serviceId] = JSON.parse(item.userIds);
            }
        });
        setServiceUsers(serviceUsersObject);

        const matchingServices = stp && stp.result.filter(item => project.id === item.projectId).map(item => item.serviceId);
        setServices(matchingServices === null ? [] : matchingServices[0] === null ? [] : matchingServices);
        setInitialServices(matchingServices === null ? [] : matchingServices[0] === null ? [] : matchingServices);

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
                subServDeadLine: formatDate(obj.subservice_deadLine),
                subServMayorDeadLine: formatDate(obj.subservice_mayorDeadLine),
                subServUserIds: obj.subservice_userIds,
                subServUserNames: subServUserNames ? subServUserNames : null,
            };
        });
        setSelectedSubServices(subServs);
        setInitialSubServices(subServs);
        setInitialSubServUsers(subServs && subServs.map(item => item.subServUserIds));
        setInitialSubServiceStatuses(subServs && subServs.map(item => item.subServStatusId));
        setInitialSubServiceDates(subServs && subServs.map(item => item.subServDeadLine));
        setInitialSubServiceMayorDates(subServs && subServs.map(item => item.subServMayorDeadLine));
        setSubServUsersForMessage(subServs && subServs.map(item => item.subServUserIds));
        setSubServiceStatusesForMessage(subServs && subServs.map(item => item.subServStatusId));
        setSubServiceDatesForMessage(subServs && subServs.map(item => item.subServDeadLine));
        setSubServiceMayorDatesForMessage(subServs && subServs.map(item => item.subServMayorDeadLine));

        const servicesToProjs = project && project.servicesToProjects;
        const subServStatus = servicesToProjs.reduce((accumulator, obj) => {
            const matchingSubServStatus = servStatuses && servStatuses.find(statitem => statitem.id === obj.subservice_status_id);
        
            return {
                ...accumulator,
                [obj.serviceId]: [
                    ...(accumulator[obj.serviceId] || []).filter(subStatus => subStatus.subserviceId !== obj.subservice_id),
                    {
                        subserviceId: obj.subservice_id,
                        subServStatusId: obj.subservice_status_id,
                        subServStatusName: matchingSubServStatus ? matchingSubServStatus.status_name : null,
                    },
                ],
            };
        }, {});
        setSubServiceStatuses(subServStatus);

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
        setInitialServiceDates(serviceDatesObject);

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
        setInitialServiceMayorDates(serviceMayorDatesObject);

        const serviceUsersMappingObject = {};
        stp && stp.result.forEach(item => {
            if (project.id === item.projectId) {
                serviceUsersMappingObject[item.serviceId] = JSON.parse(item.userIds);
            }
        });
        
        if (!('null' in serviceUsersMappingObject)) {
            setServiceUserMapping(serviceUsersMappingObject);
        };

        const serviceStatusesObject = {};
        stp && stp.result.forEach(item => {
            if (project.id === item.projectId && item.serviceId !== null) { 
                const selectedServiceItem = serviceStatusList && serviceStatusList.find(serviceitem => serviceitem.id === item.Service_Status_Id);
                serviceStatusesObject[item.serviceId] = { id: item.Service_Status_Id, status: selectedServiceItem && selectedServiceItem.Service_Status_Name };
            }
        });
        setServiceStatuses(serviceStatusesObject);
        setInitialServiceStatuses(serviceStatusesObject);

    },[project, stp, subservicestats, subservice]);

    useEffect(()=>{
        let newMessage = '';

        if (initialPayStatus !== payStatus) {
            newMessage += 'Project status has been changed ';
        }

        if (initialServices.length > services.length) {
            newMessage += 'Project services has been deleted ';
        }
        if (initialServices.length < services.length) {
            newMessage += 'Project services has been added ';
        }

        if (initialSubServices.length > selectedSubServices.length) {
            newMessage += 'Project sub-service has been deleted ';
        }
        if (initialSubServices.length < selectedSubServices.length) {
            newMessage += 'Project sub-service has been added ';
        }

        if (initialUsers.length > users.length) {
            newMessage += 'Users has been deleted ';
        }

        if (initialUsers.length < users.length) {
            newMessage += 'Users has been added ';
        }
        
        if (initialSubServUsers.length > subServUsersForMessage.length) {
            newMessage += 'Sub-service users has been deleted ';
        }

        if (initialSubServUsers.length < subServUsersForMessage.length) {
            newMessage += 'Sub-service users has been added ';
        }

        if (initialProjectType !== projectType) {
            newMessage += 'Project type has been changed ';
        }

        if (initialServiceStatuses !== serviceStatuses) {
            newMessage += 'Service statuses has been changed ';
        }
        if (initialSubServiceStatuses.length !== subServiceStatusesForMessage.length) {
            newMessage += 'Sub-service statuses has been changed ';
        }

        if (initialProjectStatus !== projectStatus) {
            newMessage += 'Project status has been changed ';
        }

        if (initialClient !== client) {
            newMessage += 'Project client has been changed ';
        }

        if (initialProjectDocs.length > projectDocs.length) {
            newMessage += 'Docs has been deleted ';
        }

        if (initialProjectDocs.length < projectDocs.length) {
            newMessage += 'Docs has been added ';
        }

        if (initialServiceDates !== serviceDates) {
            newMessage += 'Project service dates has been changed ';
        }
        if (initialSubServiceDates.length !== subServiceDatesForMessage.length) {
            newMessage += 'Project sub-service dates has been changed ';
        }

        if (initialServiceMayorDates !== serviceMayorDates) {
            newMessage += 'Project service mayor dates has been changed ';
        }
        if (initialSubServiceMayorDates.length !== subServiceMayorDatesForMessage.length) {
            newMessage += 'Project sub-service mayor dates has been changed ';
        }

        if (initialCurrency !== currency) {
            newMessage += 'Project currency dates has been changed ';
        }

        if (initialProjectName !== projectName) {
            newMessage += 'Project name has been changed ';
        }

        if (initialProjectCode !== projectCode) {
            newMessage += 'Project code has been changed ';
        }

        if (initialProjectPrice !== projectPrice) {
            newMessage += 'Project price has been changed ';
        }

        if (initialPaidAmount !== paidAmount) {
            newMessage += 'Paid amount has been changed ';
        }

        if (initialCurrencyRate !== currencyRate) {
            newMessage += 'Currency rate has been changed ';
        }

        setMessage(newMessage.trim());
    },[projectName, projectCode, projectPrice, paidAmount, currencyRate,
        payStatus, projectType, serviceStatuses, projectStatus, 
        client, projectDocs, serviceDates, serviceMayorDates, currency, users, services, selectedSubServices,
        subServiceMayorDatesForMessage, subServiceDatesForMessage, subServiceStatusesForMessage, subServUsersForMessage
    ]);

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

    const collectSubServiceUserIds = () => {
        const subServiceUserIds = {};
    
        for (const selectedService of selectedSubServices) {
            const serviceId = selectedService.serviceId;
            const selectedSubServs = selectedSubServices;
    
            if (!subServiceUserIds[serviceId]) {
                subServiceUserIds[serviceId] = [];
            }
    
            for (const subService of selectedSubServs) {
                if (subService.serviceId === serviceId) {
                    const subServiceId = subService.subserviceId;
                    const selectedUsers = JSON.parse(subService.subServUserIds);
    
                    const existingSubService = subServiceUserIds[serviceId].find(
                        (item) => item.subServiceId === subServiceId
                    );
    
                    if (!existingSubService) {
                        subServiceUserIds[serviceId].push({
                            subServiceId: subServiceId,
                            selectedUsers: selectedUsers,
                        });
                    }
                }
            }
        }
    
        return subServiceUserIds;
    };

    
    const collectSubServiceDates = () => {
        const subServiceDates = {};
    
        for (const selectedService of selectedSubServices) {
            const serviceId = selectedService.serviceId;
            const selectedSubServs = selectedSubServices;
    
            if (!subServiceDates[serviceId]) {
                subServiceDates[serviceId] = [];
            }
    
            for (const subService of selectedSubServs) {
                if (subService.serviceId === serviceId) {
                    const subServiceId = subService.subserviceId;
                    const mainDate = subService.subServDeadLine;
                    const mayorDate = subService.subServMayorDeadLine;
    
                    const existingSubService = subServiceDates[serviceId].find(
                        (item) => item.subServiceId === subServiceId
                    );
    
                    if (!existingSubService) {
                        subServiceDates[serviceId].push({
                            subServiceId: subServiceId,
                            mainDate: [mainDate],
                            mayorDate: [mayorDate]
                        });
                    }
                }
            }
        }
    
        return subServiceDates;
    };

    const updateProject = async (id, e)=>{
        e.preventDefault();
        var formData = new FormData();
        if(projectPrice === ''){
            setProjectPrice('არ არის განსაზღვრული');
        }
        formData.append('id', Math.random()*10000);
        formData.append('clientId', clientId);
        formData.append('projectTypeId', projectTypeId);
        formData.append('projectName', projectName);
        formData.append('projectCode', projectCode);
        formData.append('projectStatusId', projectStatusId);
        formData.append('projectPrice', projectPrice);
        formData.append('payStatusId', payStatusId);
        formData.append('paidAmount', paidAmount);
        formData.append('currencyId', currencyId);
        formData.append('currencyRate', currencyRate);
        formData.append('docsToUser', JSON.stringify(docsToUser));
        formData.append('currentUserId', currentUserId);
        formData.append('userDates', JSON.stringify(userDates));
        formData.append('serviceDates', JSON.stringify(serviceDates));
        formData.append('serviceMayorDates', JSON.stringify(serviceMayorDates));
        const collectedServiceStatusIds = collectServiceStatusIds();
        formData.append('collectedServiceStatusIds', JSON.stringify(collectedServiceStatusIds));
        const collectedSubServiceStatusIds = collectSubServiceStatusIds();
        formData.append('collectedSubServiceStatusIds', JSON.stringify(collectedSubServiceStatusIds));
        const collectedSubServiceUserIds = collectSubServiceUserIds();
        formData.append('collectedSubServiceUserIds', JSON.stringify(collectedSubServiceUserIds)); 
        const collectedSubServiceDates = collectSubServiceDates();
        formData.append('collectedSubServiceDates', JSON.stringify(collectedSubServiceDates));  
        for(var index = 0; index < projectDocs.length; index++){
            const file = projectDocs[index];
            formData.append('uploads', file);
        }
        for(var index = 0; index < users.length; index++){
            const uid = users[index];
            formData.append('userIds', uid);
        }
        for(var index = 0; index < services.length; index++){
            const sid = services[index];
            formData.append('serviceIds', sid);
        }
        for (var index = 0; index < selectedServices.length; index++) {
            const serviceItem = selectedServices[index];
            const serviceId = serviceItem.id;
            const userIds = serviceUserMapping[serviceId] || [];
            formData.append(`userIds-${serviceId}`, JSON.stringify(userIds));
        }
        const requestBody = {
            userIds: users,
            projectId: id,
            message: message,
            projectName: projectName,
            projectCode: projectCode,
        }
        formData.append('messageBody', JSON.stringify(requestBody));

        try{
            const response = await Axios.put(`http://localhost:3001/api/projapi/projects/update/${id}`, formData,
            {
                headers: {
                    "x-access-token": context.userToken, 
                    'Content-Type': 'multipart/form-data',
                },
            }
            );
            if(response.status === 200) {
                setProjectsList(prevList =>
                    prevList.map(project => {
                        if (project.id === id) {
                        return {...project, 
                            clientId,
                            projectTypeId,
                            projectName,
                            projectCode,
                            projectStatusId,
                            projectPrice,
                            paidAmount,
                            currencyId,
                            currencyRate,
                            payStatusId,
                            userIds:users,
                            projectDocs,
                            services
                        };}
                        return project;
                    })
                );
                setUpdateList(true);
            } else{
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            };
            setSelectedProject(null);
        } catch(error){
            console.error('Error updating project:', error);
        }
    };

    const handleTypes = (e)=>{
        setProjectType(e.target.value);
        const selectedType = type.find((project_type) => project_type.Project_Type_Name === e.target.value);
        setProjectTypeId(selectedType ? selectedType.id : '');
    };

    const handleStatus = (e)=>{
        setProjectStatus(e.target.value);
        const selectedStatus = status.find((project_status) => project_status.Project_Status_Name === e.target.value);
        setProjectStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handlePayStatus = (e)=>{
        setPayStatus(e.target.value);
        const selectedPayStatus = payStatuses.find((pay_status) => pay_status.pay_status_name === e.target.value);
        setPayStatusId(selectedPayStatus ? selectedPayStatus.id : '');
    };

    const handleCurrency = (e)=>{
        setCurrency(e.target.value);
        const selectedCurrency = currencies.find((currencyItem) => currencyItem.Currency_Name === e.target.value);
        setCurrencyId(selectedCurrency ? selectedCurrency.id : '');
    };

    const handleUser = (e, serviceId) => {
        const selectedUser = userState.find(user => `${user.FirstName} ${user.LastName}` === e.target.value);
    
        if (selectedUser) {
            setServiceUserMapping(prevMapping => ({
                ...prevMapping,
                [serviceId]: [...(prevMapping[serviceId] || []), selectedUser.id]
            }));
            if (!serviceUsers[serviceId]?.includes(selectedUser.id)) {
                setServiceUsers(prevServiceUsers => ({
                    ...prevServiceUsers,
                    [serviceId]: [...(prevServiceUsers[serviceId] || []), selectedUser.id]
                }));
                setUsers([...users, selectedUser.id]);
            };
        }
    };

    const handleSubServiceUser = (e, subServiceId, serviceId) => {
        const selectedUser = userState.find(user => `${user.FirstName} ${user.LastName}` === e.target.value);
        if (selectedUser) {
            setUsers([...users, selectedUser.id]);
            const updatedSubServiceUsers = selectedSubServices.map(subServItem => {
                if (subServItem.serviceId === serviceId) {
                    if(subServItem.subserviceId === subServiceId){
                        let userIdsArray = [];
                        if (subServItem.subServUserIds && subServItem.subServUserIds.length > 0) {
                            userIdsArray = JSON.parse(subServItem.subServUserIds);
                        }
                        if (!userIdsArray.some(userid => userid === selectedUser.id)) {
                            const updatedUserIds = [...userIdsArray, selectedUser.id];
                            const stringifiedUserIds = JSON.stringify(updatedUserIds);
                            const userName = `${selectedUser.FirstName} ${selectedUser.LastName}`
                            return {
                                ...subServItem,
                                subServUserIds: stringifiedUserIds,
                                subServUserNames: [...subServItem.subServUserNames, userName],
                            };
                        }
                    }
                }
                return subServItem;
            });
            setSelectedSubServices(updatedSubServiceUsers);

            setSubServUsersForMessage(prevState => {
                return [...prevState, selectedUser.id];
            });
        };
    };

    const removeUser = (userId, serviceId) => {    
        setServiceUserMapping(prevMapping => ({
            ...prevMapping,
            [serviceId]: prevMapping[serviceId].filter(userIditem => userIditem !== userId)
        }));
        setServiceUsers(prevServiceUsers => ({
            ...prevServiceUsers,
            [serviceId]: prevServiceUsers[serviceId].filter(id => id !== userId)
        }));
        setUsers(users.filter((userIditem) => userIditem !== userId));
    };

    const removeSubServiceUser = (user, subServiceId, serviceItemId) => {
        const selectedUser = userState.find(useritem => `${useritem.FirstName} ${useritem.LastName}` === user);

        if (selectedUser){
            const updatedSubServices = selectedSubServices.map(subServiceItem => {
                if (subServiceItem.subserviceId === subServiceId && subServiceItem.serviceId === serviceItemId) {
                    const userIdsArray = JSON.parse(subServiceItem.subServUserIds);
                    const updatedSelectedUsers = userIdsArray.filter(userId => userId !== selectedUser.id);
                    const stringifiedUserIds = JSON.stringify(updatedSelectedUsers);
                    const userName = `${selectedUser.FirstName} ${selectedUser.LastName}`
                    const updatedUserNames = subServiceItem.subServUserNames.filter(name => name !== userName)
                    return {
                        ...subServiceItem,
                        subServUserIds: stringifiedUserIds,
                        subServUserNames: updatedUserNames,
                    };
                }
                return subServiceItem;
            });
            setSelectedSubServices(updatedSubServices);
        }
        setUsers(users.filter((userId) => userId !== selectedUser.id));

        setSubServUsersForMessage(prevState => {
            const newArray = [...prevState];
            newArray.shift(); 
            return newArray;
        });
    };

    const handleDateChange = (serviceId, date) => {
        setServiceDates(prevServiceDates => ({
            ...prevServiceDates,
            [serviceId]: date
        }));
    };

    const handleSubServiceDateChange = (subServiceId, date, serviceId) => {
        const updatedSubServices = selectedSubServices.map(subServItem => {
            if (subServItem.serviceId === serviceId) {
                if(subServItem.subserviceId === subServiceId){
                    return {
                        ...subServItem,
                        subServDeadLine: date,
                    };
                }
            }
            return subServItem;
        });
    
        setSelectedSubServices(updatedSubServices);

        setSubServiceDatesForMessage(prevState => {
            return [...prevState, date];
        });
    };

    const handleMayorDateChange = (serviceId, date) => {
        setServiceMayorDates(prevServiceMayorDates => ({
            ...prevServiceMayorDates,
            [serviceId]: date
        }));
    };

    const handleSubServiceMayorDateChange = (subServiceId, date, serviceId) => {
        const updatedSubServices = selectedSubServices.map(subServItem => {
            if (subServItem.serviceId === serviceId) {
                if(subServItem.subserviceId === subServiceId){
                    return {
                        ...subServItem,
                        subServMayorDeadLine: date,
                    };
                }
            }
            return subServItem;
        });
    
        setSelectedSubServices(updatedSubServices);

        setSubServiceMayorDatesForMessage(prevState => {
            return [...prevState, date];
        });
    };

    const handleClient = (e)=>{
        setClient(e.target.value);
        const selectedClient = clientState.find((client) => client.Client_FirstName + ' ' + client.Client_LastName === e.target.value);
        setClientId(selectedClient ? selectedClient.id : '');
    };

    const removeSelectedFile = (index, event, file) => {
        event.preventDefault();

        if(context.user && context.user.User_Type_id === 2 || context.user.User_Type_id === 5){
            if (typeof file === 'string') {
                const fileIndexToDelete = projectDocs.findIndex((doc) => doc.name === file);
    
                if (fileIndexToDelete !== -1) {
                    const docToDelete = projectDocs[fileIndexToDelete];
                    const docUserId = initialDocsToUser.find(
                        (docToUser) => docToUser.fileNames.includes(docToDelete.name)
                    )?.userId;
        
                    if (docUserId === context.user.id) {
                        deleteFile(file);
                    } else {
                        console.log('Cannot delete file. It does not belong to the current user.');
                        return;
                    }
                }
            } else {
                console.log('Not a string');
            }
        } else{
            if(typeof(file) === 'string'){
                deleteFile(file);
            } else{
                console.log('not string');
            };
        }

        const newFiles = [...projectDocs];
        newFiles.splice(index, 1);
        setProjectDocs(newFiles);
    
        const newSelectedFiles = [...selectedFiles];
        newSelectedFiles.splice(index, 1);
        setSelectedFiles(newSelectedFiles);
    
        const updatedDocsToUser = { ...docsToUser };
        updatedDocsToUser.fileNames.splice(index, 1);
        const updatedState = { ...docsToUser, fileNames: updatedDocsToUser.fileNames };
        setDocsToUser(updatedState);
    };

    const deleteFile = async (file)=>{
        const encodedFilename = encodeURIComponent(file.trim());
        try{
            (await Axios.delete(`http://localhost:3001/api/projapi/delete/${project.id}/${encodedFilename}`))
        } catch(error){
            console.error('Error fetching files:', error);
        }
    };

    const handleService = (e) => {
        const selectedService = service.find((servitem) => servitem.Service_Name === e.target.value);
    
        if (selectedService && !services.includes(selectedService.id)) {
            const updatedSubService = subservice && subservice.result
            .filter(sub => sub.service_id === selectedService.id)
            .map(sub => ({
                serviceId: selectedService.id,
                subserviceId: sub.id, 
                subServName: sub.name, 
                subServStatusId: null,
                subServStatusName: "",
                subServDeadLine: "",
                subServMayorDeadLine: "",
                subServUserIds: "",
                subServUserNames: [],
            }));
            setSelectedSubServices(prevState => [
                ...prevState,
                ...updatedSubService
            ]);
            const updatedService = { ...selectedService, selectedUsers: []};
            setSelectedServices([...selectedServices, updatedService]);
            setServices([...services, selectedService.id]);
        }
    };

    const handleSubService = (e, serviceId) => {
        const selectedSubService = subservice.result.find((servitem) => servitem.name === e.target.value);
        
        if (selectedSubService && !selectedSubServices.includes(selectedSubService.id)) {
            const updatedSubService = { 
                serviceId, 
                subserviceId: selectedSubService.id, 
                subServName: selectedSubService.name, 
                subServStatusId: null,
                subServStatusName: "",
                subServDeadLine: "",
                subServMayorDeadLine: "",
                subServUserIds: "",
                subServUserNames: [],
            };
            setSelectedSubServices([...selectedSubServices, updatedSubService]);
        };
    };

    const removeService = (service) => {
        setSelectedServices(selectedServices.filter((selectedServiceItem) => selectedServiceItem.id !== service.id));
        setSelectedSubServices(selectedSubServices.filter((selectedSubServiceItem) => selectedSubServiceItem.serviceId !== service.id));
        setServices(services.filter((serviceId) => serviceId !== service.id));
        const updatedServiceDates = { ...serviceDates };
        delete updatedServiceDates[service.id];
        setServiceDates(updatedServiceDates);
        const updatedServiceMayorDates = { ...serviceMayorDates };
        delete updatedServiceMayorDates[service.id];
        setServiceMayorDates(updatedServiceMayorDates);
        const updatedServiceStatuses = { ...serviceStatuses };
        delete updatedServiceStatuses[service.id];
        setServiceStatuses(updatedServiceStatuses);

        const updatedServiceUsers = { ...serviceUsers };
        delete updatedServiceUsers[service.id];
        setServiceUsers(updatedServiceUsers);

        const updatedServiceUserMapping = { ...serviceUserMapping };
        delete updatedServiceUserMapping[service.id];
        setServiceUserMapping(updatedServiceUserMapping);
    };

    const removeSubService = (subService, serviceId) => {
        setSelectedSubServices(selectedSubServices.filter(selectedServiceItem => !(selectedServiceItem.serviceId === serviceId && selectedServiceItem.subserviceId === subService.subserviceId)));
    };

    const collectServiceStatusIds = () => {
        const serviceStatusIds = {};
        for (const serviceId in serviceStatuses) {
            if (serviceStatuses.hasOwnProperty(serviceId)) {
                serviceStatusIds[serviceId] = serviceStatuses[serviceId].id;
            }
        }
        return serviceStatusIds;
    };

    const handleServiceStatusChange = (serviceId, date, e) => {
        const selectedServiceStatusId = serviceStatusList.find(status => status.Service_Status_Name === e.target.value)?.id;
        setServiceStatuses(prevServiceStatuses => ({
            ...prevServiceStatuses,
            [serviceId]: { id: selectedServiceStatusId, status: e.target.value }
        }));
        setServiceStatusId(selectedServiceStatusId);
    };

    const handleSubServiceStatusChange = (subServiceId, date, e, serviceId) => {
        const selectedSubServiceStatus = subservicestats.result.find(status => status.status_name === e.target.value);
        if (selectedSubServiceStatus) {
            const updatedSubServiceStatus = selectedSubServices.map(subServItem => {
                if (subServItem.serviceId === serviceId) {
                    if(subServItem.subserviceId === subServiceId){
                        return {
                            ...subServItem,
                            subServStatusId: selectedSubServiceStatus.id,
                            subServStatusName: selectedSubServiceStatus.status_name,
                        };
                    }
                }
                return subServItem;
            });
            setSelectedSubServices(updatedSubServiceStatus);
        };
        setSubServiceStatuses(prevServiceStatuses => {
            if (Object.keys(prevServiceStatuses).length === 0) {
                return {
                    [serviceId]: [
                        { subserviceId: subServiceId, subServStatusId: selectedSubServiceStatus.id, subServStatusName: e.target.value }
                    ]
                };
            } else {
                const serviceStatuses = prevServiceStatuses[serviceId] || [];
    
                const existingSubStatus = serviceStatuses.find(subStatus => subStatus.subserviceId === subServiceId);
    
                if (existingSubStatus) {
                    existingSubStatus.subServStatusId = selectedSubServiceStatus.id;
                    existingSubStatus.subServStatusName = e.target.value;
                } else {
                    prevServiceStatuses[serviceId] = [
                        ...serviceStatuses,
                        { subserviceId: subServiceId, subServStatusId: selectedSubServiceStatus.id, subServStatusName: e.target.value }
                    ];
                }
    
                return { ...prevServiceStatuses };
            }
        });
        setSubServiceStatusId(selectedSubServiceStatus.id); 

        setSubServiceStatusesForMessage(prevState => {
            return [...prevState, selectedSubServiceStatus.id];
        });
    };

    const collectSubServiceStatusIds = () => {
        const subServiceStatusIds = {};
    
        for (const serviceId in subServiceStatuses) {
            if (subServiceStatuses.hasOwnProperty(serviceId)) {
                subServiceStatusIds[serviceId] = subServiceStatuses[serviceId].map(subServiceStatus => ({
                    subServiceId: subServiceStatus.subserviceId,
                    subServiceStatusId: subServiceStatus.subServStatusId
                }));
            }
        }
    
        return subServiceStatusIds;
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedProject(null);
    };

    useEffect(()=>{
        if( context.user && context.user.User_Type_id === 1 ){
            setPermission(true);
            setBookerEditPermission(true);
        } else if(context.user && context.user.User_Type_id === 4){
            setPermission(true);
            setBookerEditPermission(true);
        } else if(context.user && context.user.User_Type_id === 5){
            setPermission(true);
            setBookerEditPermission(false);
        } else{
            setPermission(false);
            setBookerEditPermission(false);
        };
    },[context]);

    return (
        <Container className='project-reg-form-container' maxWidth="md">
        <Typography className='form-heading' variant="h5">პროექტის მონაცემების ცვლილება</Typography>
        <form className='project-reg-form'>
            <ThemeProvider theme={theme}> 
                <TextField
                label="პროექტის სახელი"
                variant="outlined"
                value={projectName}
                onChange={(e) => {if(permission && bookerEditPermission){setProjectName(e.target.value)}}}
                fullWidth
                margin="normal"
                className='proj-name'
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
                onChange={(e) => {if(permission && bookerEditPermission){setProjectCode(e.target.value)}}}
                fullWidth
                margin="normal"
                className='proj-name'
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
                            onChange={(e)=> {if(permission && bookerEditPermission){handleTypes(e)}}}
                            label="type"
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
                            onChange={(e)=> {if(permission && bookerEditPermission){handleClient(e)}}}
                            label="client"
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
                        onChange={(e)=>{if(!permission || bookerEditPermission){handleStatus(e)}}}
                        label="client"
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
                                {selectedServices.map((serviceItem) => (
                                    <div className="proj-multi-select-dropdown" key={serviceItem.id}>
                                        <span className='service-name' onClick={() => {if(permission && bookerEditPermission){removeService(serviceItem)}} }>
                                            {`${serviceItem.Service_Name}`} &#10005;
                                        </span>
                                        <label className='inner-deadline-cont'>
                                            <span>შიდა deadline: </span>
                                            <input
                                            type='date'
                                            value={serviceDates[serviceItem.id] || ''}
                                            onChange={(e) => {if(permission && bookerEditPermission){handleDateChange(serviceItem.id, e.target.value)}}}
                                            />
                                        </label>
                                        <label className='service-status-cont'>
                                            <span>სერვისის სტატუსი: </span>
                                            <select
                                                onChange={(e) => {if(!permission || bookerEditPermission){handleServiceStatusChange(serviceItem.id, e.target.value, e)}} }
                                                value={serviceStatuses[serviceItem.id] ? serviceStatuses[serviceItem.id].status : ''}
                                            >
                                                <option></option>
                                                {serviceStatusList && serviceStatusList.map(serst => (
                                                    <option value={serst.Service_Status_Name} key={serst.id}>
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
                                                onChange={(e) => {if(permission && bookerEditPermission){handleMayorDateChange(serviceItem.id, e.target.value)}}}
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
                                                                <span key={userId} onClick={()=>{if(permission && bookerEditPermission){removeUser(userId, serviceItem.id)}}}>
                                                                    {`${selectedUser.FirstName} ${selectedUser.LastName}`} &#10005;
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                            </div>
                                            <select
                                                name={`users-${serviceItem.id}`} 
                                                onChange={(e) => {if(permission  && bookerEditPermission){handleUser(e, serviceItem.id)}}} 
                                                value={users}
                                                multiple
                                                className='spec-select-cont'
                                            >
                                                <option disabled>აირჩიეთ სპეციალისტები</option>
                                                {userState && userState.map(user => (
                                                    <option value={`${user.FirstName} ${user.LastName}`} key={user.id}>
                                                        {`${user.FirstName} ${user.LastName}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <div className='services-cont'>
                                            <label className='services-label'>ქვე-სერვისები</label>
                                            <label>
                                                <div className="proj-multi-select-dropdown-cont">
                                                    <div>
                                                        {selectedSubServices && selectedSubServices.filter(subServiceItem => subServiceItem.serviceId === serviceItem.id).map((subServiceItem, index) => (
                                                            <div className="proj-multi-select-dropdown" key={index}>
                                                                <span className='service-name' onClick={() => {if(permission && bookerEditPermission){removeSubService(subServiceItem, serviceItem.id)}} }>
                                                                    {`${subServiceItem.subServName}`} &#10005;
                                                                </span>
                                                                <label className='inner-deadline-cont'>
                                                                    <span>შიდა deadline: </span>
                                                                    <input
                                                                    type='date'
                                                                    value={subServiceItem.subServDeadLine}
                                                                    onChange={(e) => {if(permission && bookerEditPermission){handleSubServiceDateChange(subServiceItem.subserviceId, e.target.value, serviceItem.id,)}}}
                                                                    />
                                                                </label>
                                                                <label className='service-status-cont'>
                                                                    <span>ქვე-სერვისის სტატუსი: </span>
                                                                    <select
                                                                        required
                                                                        onChange={(e) => {if(!permission || bookerEditPermission){handleSubServiceStatusChange(subServiceItem.subserviceId, e.target.value, e, serviceItem.id)}} }
                                                                        value={subServiceItem.subServStatusName || ''}
                                                                    >
                                                                        <option></option>
                                                                        {subservicestats && subservicestats.result.map(serst => (
                                                                            <option value={serst.status_name} key={serst.id}>
                                                                                {serst.status_name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </label>
                                                                <label className='mayor-deadline-cont'>
                                                                    <span>მერიის deadline: </span>
                                                                    <input
                                                                        type='date'
                                                                        value={subServiceItem.subServMayorDeadLine}
                                                                        onChange={(e) => {if(permission && bookerEditPermission){handleSubServiceMayorDateChange(subServiceItem.subserviceId, e.target.value, serviceItem.id)}}}
                                                                    />
                                                                </label>
                                                                <label className='spec-cont'>
                                                                    <span className='spec-span'>სპეციალისტები: </span>
                                                                    <div className="proj-spec-select-dropdown">
                                                                        <div className="proj-selected-users">
                                                                        {
                                                                            subServiceItem.subServUserNames.map((user, index)=>(
                                                                                <span key={index} onClick={()=>{if(permission && bookerEditPermission){removeSubServiceUser(user, subServiceItem.subserviceId, serviceItem.id)}}}>
                                                                                    {
                                                                                        user
                                                                                    } &#10005;
                                                                                </span>
                                                                            ))
                                                                        }
                                                                        </div>
                                                                    </div>
                                                                    <select
                                                                        name={`users-${subServiceItem.subserviceId}`} 
                                                                        onChange={(e) => {if(permission  && bookerEditPermission){handleSubServiceUser(e, subServiceItem.subserviceId, serviceItem.id)}}}
                                                                        value={users}
                                                                        multiple
                                                                        className='spec-select-cont'
                                                                    >
                                                                        <option disabled>აირჩიეთ სპეციალისტები</option>
                                                                        {userState && userState.map(user => (
                                                                            <option value={`${user.FirstName} ${user.LastName}`} key={user.id}>
                                                                                {`${user.FirstName} ${user.LastName}`}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <select name={`subservices-${serviceItem.id}`} className='service-select' onChange={(e)=> {if(permission && bookerEditPermission){handleSubService(e, serviceItem.id)}}} value={subServices} multiple>
                                                    <option disabled>აირჩიეთ ქვე სერვისები</option>
                                                    { subservice && subservice.result.map(subServItem =>(
                                                        <option value={subServItem.name} key={subServItem.id}>{`${subServItem.name}`}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <select className='service-select' name='services' onChange={(e)=> {if(permission && bookerEditPermission){handleService(e)}}} value={services} multiple>
                            <option disabled>აირჩიეთ სერვისები</option>
                            { service && service.map(servItem =>(
                                <option value={servItem.Service_Name} key={servItem.id}>{`${servItem.Service_Name}`}</option>
                            ))}
                        </select>
                    </label>
                </div>
                {
                    permission && (
                        <div className='financial-info-cont'>
                            <label className='finance-label'>ფინანსური ინფორმაცია</label>
                            <TextField
                            label="პროექტის ღირებულება"
                            variant="outlined"
                            value={projectPrice}
                            onChange={(e) => setProjectPrice(e.target.value)}
                            fullWidth
                            margin="normal"
                            className='proj-cost'
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
                                        onChange={(e) => handlePayStatus(e)}
                                        label="client"
                                        className='select-label'
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
                                onChange={(e) => setPaidAmount(e.target.value)}
                                fullWidth
                                margin="normal"
                                className='paid-amount'
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
                                        onChange={(e) => handleCurrency(e)}
                                        label="client"
                                        className='select-label'
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
                                onChange={(e) => setCurrencyRate(e.target.value)}
                                fullWidth
                                margin="normal"
                                className='currency-rate'
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
                    <div className="proj-spec-select-dropdown">
                        <div className="proj-selected-users">
                            {selectedFiles.map((file, index) => (
                                <span key={index} onClick={(event) => {removeSelectedFile(index, event, file)}}>
                                    {typeof(file) === 'string' ? file : file.name} &#10005;
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className='doc-add-btn-cont'>
                        <span >დოკუმენტის დამატება: </span>
                        <input type="file" id="uploads" name="uploads" multiple onChange={handleFileChange}/>
                    </div>
                </label>
                <div className='reg-close-btns-cont'>
                    <div className='project-reg-btn-cont'>
                        <Button className='project-reg-btn' type="submit" onClick={(e)=>{updateProject(project.id, e)}} variant="contained" color="primary">
                            განახლება
                        </Button>
                    </div>
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
