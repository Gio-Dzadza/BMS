import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
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

export default function ProjectRegisterForm({ handleFormSubmit, setShowRegForm }) {

    const {data:type} = useFetch('http://localhost:3001/api/projapi/get/projectType');
    const {data:status} = useFetch('http://localhost:3001/api/projapi/get/projectStatus');
    const {data:payStatuses} = useFetch('http://localhost:3001/api/projapi/get/payStatus');
    const {data:currencies} = useFetch('http://localhost:3001/api/projapi/get/projectCurrency');
    const {data:clients} = useFetch('http://localhost:3001/api/projapi/get/projectClients');
    const {data:usersList} = useFetch('http://localhost:3001/api/projapi/get/projectUsers');
    const {data:service} = useFetch('http://localhost:3001/api/projapi/get/services');
    const {data:serviceStatusList} = useFetch('http://localhost:3001/api/projapi/get/serviceStatus');
    const {data:projectsNames} = useFetch('http://localhost:3001/api/projapi/get/projectsNames');
    const {data:projectsCodes} = useFetch('http://localhost:3001/api/projapi/get/projectsCodes');
    const {data:subservice} = useFetch('http://localhost:3001/api/projapi/get/subservices');
    const {data:subservicestats} = useFetch('http://localhost:3001/api/projapi/get/subservicestat');


    const [projectName, setProjectName] = useState('');
    const [projectCode, setProjectCode] = useState('');
    const [projectPrice, setProjectPrice] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [currencyRate, setCurrencyRate] = useState('');
    const [projectNameArr, setProjectNameArr] = useState('');
    const [projectCodeArr, setProjectCodeArr] = useState('');

    const [payStatus, setPayStatus] = useState('');
    const [payStatusId, setPayStatusId] = useState('');

    const [serviceStatusId, setServiceStatusId] = useState('');
    const [subServiceStatusId, setSubServiceStatusId] = useState('');

    const [currency, setCurrency] = useState('');
    const [currencyId, setCurrencyId] = useState('');

    const [projectType, setProjectType] = useState('');
    const [projectTypeId, setProjectTypeId] = useState('');

    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    const [subServices, setSubServices] = useState([]);
    const [selectedSubServices, setSelectedSubServices] = useState([]);

    const [serviceSubServicesMap, setServiceSubServicesMap] = useState({});

    const [projectStatus, setProjectStatus] = useState('');
    const [projectStatusId, setProjectStatusId] = useState('');

    const [client, setClient] = useState('');
    const [clientId, setClientId] = useState('');

    const [projectDocs, setProjectDocs] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [userDates, setUserDates] = useState({});
    const [serviceDates, setServiceDates] = useState({});
    const [serviceMayorDates, setServiceMayorDates] = useState({});

    const [subServiceDates, setSubServiceDates] = useState([]);
    const [subServiceMayorDates, setSubServiceMayorDates] = useState([]);

    const [serviceStatuses, setServiceStatuses] = useState('');

    const [subServiceStatuses, setSubServiceStatuses] = useState('');

    const [serviceUserMapping, setServiceUserMapping] = useState({});
    const [subServiceUserMapping, setSubServiceUserMapping] = useState({});

    const [docsToUser, setDocsToUser] = useState({ userId: null, fileNames: [] });
    const [currentUserId, setCurrentUserId] = useState(null);

    const context = useAuthContext();

    useEffect(() => {
        if (context.user && currentUserId) {
            setDocsToUser(prevState => ({ ...prevState, userId: currentUserId }));
        }
    }, [context, currentUserId]);

    useEffect(()=>{
        if(context.user && context.user.id){
            setCurrentUserId(context.user.id);
        };
    },[context]);

    useEffect(()=>{
        if(projectsNames && projectsNames.result){
            const projectNamesFromDb = projectsNames.result.map((item)=>item.Project_Name);
            setProjectNameArr(projectNamesFromDb);
        }
    },[projectsNames]);

    useEffect(()=>{
        if(projectsCodes && projectsCodes.result){
            const projectCodesFromDb = projectsCodes.result.map((item)=>item.Project_Code);
            setProjectCodeArr(projectCodesFromDb);
        }
    },[projectsCodes]);

    //fileupload
    const handleFileChange = (e) => {
        const files = e.target.files;
        setProjectDocs([...projectDocs, ...Array.from(files)]);
        setSelectedFiles([...selectedFiles, ...Array.from(files)]);

        // Extract an array of file names from the uploaded files
        const fileNames = Array.from(files).map(file => file.name);

        // Update the state to include the userId and the fileNames array
        setDocsToUser(prevState => ({ ...prevState, fileNames: [...prevState.fileNames, ...fileNames] }));
    };

    const collectSubServiceUserIds = () => {
        const subServiceUserIds = {};
    
        for (const selectedService of selectedServices) {
            const serviceId = selectedService.id;
            const selectedSubServs = selectedService.selectedSubServs;
    
            if (!subServiceUserIds[serviceId]) {
                subServiceUserIds[serviceId] = [];
            }
    
            for (const subService of selectedSubServs) {
                const subServiceId = subService.id;
                const selectedUsers = subService.selectedUsers;
    
                subServiceUserIds[serviceId].push({
                    subServiceId: subServiceId,
                    selectedUsers: selectedUsers
                });
            }
        }
    
        return subServiceUserIds;
    };

    const collectSubServiceDates = () => {
        const subServiceDates = {};
    
        for (const selectedService of selectedServices) {
            const serviceId = selectedService.id;
            const selectedSubServs = selectedService.selectedSubServs;
    
            if (!subServiceDates[serviceId]) {
                subServiceDates[serviceId] = [];
            }
    
            for (const subService of selectedSubServs) {
                const subServiceId = subService.id;
                const mainDate = subService.mainDate;
                const mayorDate = subService.mayorDate;
    
                subServiceDates[serviceId].push({
                    subServiceId: subServiceId,
                    mainDate: mainDate,
                    mayorDate: mayorDate
                });
            }
        }
    
        return subServiceDates;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        var formData = new FormData();
        formData.append('id', Math.random()*10000);
        formData.append('clientId', clientId);
        formData.append('projectTypeId', projectTypeId);
        if (projectNameArr.includes(projectName)) {
            alert('Project name already exists. Please choose a different name.');
            return; // Stop the submission process
        }
        formData.append('projectName', projectName);
        formData.append('projectCode', projectCode);
        formData.append('projectStatusId', projectStatusId);
        formData.append('projectPrice', projectPrice);
        formData.append('payStatusId', payStatusId);
        formData.append('paidAmount', paidAmount);
        formData.append('currencyId', currencyId);
        formData.append('currencyRate', currencyRate);
        formData.append('userDates', JSON.stringify(userDates));
        formData.append('serviceDates', JSON.stringify(serviceDates));
        formData.append('serviceMayorDates', JSON.stringify(serviceMayorDates));
        formData.append('subServiceDates', JSON.stringify(subServiceDates));
        formData.append('subServiceMayorDates', JSON.stringify(subServiceMayorDates));
        const collectedServiceStatusIds = collectServiceStatusIds();
        const collectedSubServiceStatusIds = collectSubServiceStatusIds();
        const collectedSubServiceUserIds = collectSubServiceUserIds();
        const collectedSubServiceDates = collectSubServiceDates();
        formData.append('collectedServiceStatusIds', JSON.stringify(collectedServiceStatusIds)); 
        formData.append('collectedSubServiceStatusIds', JSON.stringify(collectedSubServiceStatusIds)); 
        formData.append('collectedSubServiceUserIds', JSON.stringify(collectedSubServiceUserIds)); 
        formData.append('collectedSubServiceDates', JSON.stringify(collectedSubServiceDates)); 
        formData.append('docsToUser', JSON.stringify(docsToUser));
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
        for(var index = 0; index < subServices.length; index++){
            const subIds = subServices[index];
            formData.append('subServices',JSON.stringify(subIds));
        }
        for (var index = 0; index < selectedServices.length; index++) {
            const serviceItem = selectedServices[index];
            const serviceId = serviceItem.id;
            const userIds = serviceUserMapping[serviceId] || [];
            formData.append(`userIds-${serviceId}`, JSON.stringify(userIds));
        }
        for (var index = 0; index < selectedSubServices.length; index++) {
            const subServiceItem = selectedSubServices[index];
            const subServiceId = subServiceItem.id;
            const userIds = subServiceUserMapping[subServiceId] || [];
            formData.append(`subServiceUserIds-${subServiceId}`, JSON.stringify(userIds));
        }
        for (var index = 0; index < selectedServices.length; index++) {
            const serviceItem = selectedSubServices[index];
            const serviceId = serviceItem.id;
            const subServiceIds = serviceSubServicesMap[serviceId] || [];
            formData.append(`subServiceIds-${subServiceIds}`, JSON.stringify(subServiceIds));
        }
        for (var index = 0; index < selectedServices.length; index++) {
            const serviceItem = selectedServices[index];
            formData.append('Services', JSON.stringify(serviceItem));
        }

        handleFormSubmit(formData);

        try{
            const response = await Axios.post('http://localhost:3001/api/projapi/projects/insert', formData, {
                headers: {
                    "x-access-token": context.userToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
        if (response.status === 200) {
            const data = await response.data;
            console.log(data);
            handleFormSubmit(); 
            setClientId('');
            setProjectTypeId('');
            setProjectName('');
            setProjectCode('');
            setProjectStatusId('');
            // setProjectDoc(null);
            setProjectPrice('');
            setPayStatusId('');
            setServiceStatusId('');
            setSubServiceStatusId('');
            setPaidAmount('');
            setCurrencyId('');
            setCurrencyRate('');
            setProjectDocs([]);
            setSelectedUsers([]);
            setUsers([]);
            setSelectedServices([]);
            setSelectedSubServices([]);
            setServices([]);
            setSubServices([]);
            setUserDates({});
            setServiceDates({});
            setServiceMayorDates({});
            setSubServiceDates({});
            setSubServiceMayorDates({});
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering project:', error);
        }
    }

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
        const selectedUser = usersList.find(user => `${user.FirstName} ${user.LastName}` === e.target.value);
    
        if (selectedUser) {
            setServiceUserMapping(prevMapping => ({
                ...prevMapping,
                [serviceId]: [...(prevMapping[serviceId] || []), selectedUser.id]
            }));

            const updatedServices = selectedServices.map(serviceItem => {
                if (serviceItem.id === serviceId) {
                    return {
                        ...serviceItem,
                        selectedUsers: [...serviceItem.selectedUsers, selectedUser]
                    };
                }
                return serviceItem;
            });
    
            setSelectedServices(updatedServices);
            handleDateChange(serviceId, userDates[serviceId] || ''); // Associate date with service
            setUsers([...users, selectedUser.id]);
        }
    };

    const handleSubServiceUser = (e, subServiceId, serviceId) => {
        const selectedUser = usersList.find(user => `${user.FirstName} ${user.LastName}` === e.target.value);
        if (selectedUser) {
            setSubServiceUserMapping(prevMapping => {
                const existingSubServiceUserArray = prevMapping[serviceId] || [];
    
                const isUserAlreadySelected = existingSubServiceUserArray.some(item => item.subServiceId === subServiceId && item.selectedUserIds.includes(selectedUser.id));
    
                if (!isUserAlreadySelected) {
                    const updatedSubServiceUserArray = [...existingSubServiceUserArray, { subServiceId, selectedUserIds: [selectedUser.id] }];
    
                    return {
                        ...prevMapping,
                        [serviceId]: updatedSubServiceUserArray,
                    };
                }
    
                return prevMapping;
            });

            const updatedSubServices = selectedSubServices.map(subServiceItem => {
                if (subServiceItem.id === subServiceId) {
                    return {
                        ...subServiceItem,
                        selectedUsers: [...subServiceItem.selectedUsers, selectedUser]
                    };
                }
                return subServiceItem;
            });

            // setSelectedSubServices(updatedSubServices);
            handleSubServiceDateChange(serviceId, userDates[subServiceId] || '', subServiceId); // Associate date with service
            setUsers([...users, selectedUser.id]);

            //update selected services, subservices and selectedSubServices
            const selectedService = selectedServices.find(serviceItem => serviceItem.id === serviceId);
        
            if (selectedService) {
                const selectedSubService = selectedService.selectedSubServs.find(subServ => subServ.id === subServiceId);
        
                if (selectedSubService) {
                    // const updatedSubServiceUsers = { ...selectedSubService, selectedUsers: [selectedUser] };
        
                    const updatedSubServices = selectedServices.map(serviceItem => {
                        if (serviceItem.id === serviceId) {
                            return {
                                ...serviceItem,
                                selectedSubServs: serviceItem.selectedSubServs.map(subServ => {
                                    if (subServ.id === subServiceId) {
                                        if (!subServ.selectedUsers.some(user => user.id === selectedUser.id)) {
                                            return {
                                                ...subServ,
                                                selectedUsers: [...subServ.selectedUsers, selectedUser.id]
                                            };
                                        }
                                    }
                                    return subServ;
                                })
                            };
                        }
                        return serviceItem;
                    });
        
                    setSelectedServices(updatedSubServices);
                }
            }

            const updatedSubServiceUsers = selectedSubServices.map(subServItem => {
                if (subServItem.serviceId === serviceId) {
                    if(subServItem.id === subServiceId){
                        if (!subServItem.selectedUsers.some(user => user.id === selectedUser.id)) {
                            return {
                                ...subServItem,
                                selectedUsers: [...subServItem.selectedUsers, selectedUser],
                            };
                        }
                    }
                }
                return subServItem;
            });
        
            setSelectedSubServices(updatedSubServiceUsers);
            setSubServices(updatedSubServiceUsers);
        };
    };

    const removeUser = (user, serviceId) => {
        setServiceUserMapping(prevMapping => ({
            ...prevMapping,
            [serviceId]: prevMapping[serviceId].filter(userId => userId !== user.id)
        }));
        
        const updatedServices = selectedServices.map(serviceItem => {
            if (serviceItem.id === serviceId) {
                const updatedSelectedUsers = serviceItem.selectedUsers.filter(selectedUser => selectedUser.id !== user.id);
                return {
                    ...serviceItem,
                    selectedUsers: updatedSelectedUsers
                };
            }
            return serviceItem;
        });
    
        setSelectedServices(updatedServices);
        setSelectedUsers(selectedUsers.filter((selectedUser) => selectedUser.id !== user.id));
        setUsers(users.filter((userId) => userId !== user.id));
    };

    const removeSubServiceUser = (user, subServiceId, serviceId) => {
        setSubServiceUserMapping(prevMapping => {
            const updatedServiceArray = (prevMapping[serviceId] || []).map(subService => {
                if (subService.subServiceId === subServiceId) {
                    const updatedUserIds = subService.selectedUserIds.filter(userId => userId !== user.id);
                    return { ...subService, selectedUserIds: updatedUserIds };
                }
                return subService;
            });
    
            return {
                ...prevMapping,
                [serviceId]: updatedServiceArray,
            };
        });
        
        const updatedSubServices = selectedSubServices.map(subServiceItem => {
            if (subServiceItem.id === subServiceId && subServiceItem.serviceId === serviceId) {
                const updatedSelectedUsers = subServiceItem.selectedUsers.filter(selectedUser => selectedUser.id !== user.id);
                return {
                    ...subServiceItem,
                    selectedUsers: updatedSelectedUsers
                };
            }
            return subServiceItem;
        });

        const updatedServices = selectedServices.map(serviceItem => {
            if (serviceItem.id === serviceId) {
                return {
                    ...serviceItem,
                    selectedSubServs: serviceItem.selectedSubServs.map(subServ => {
                        if (subServ.id === subServiceId) {
                            // Remove the user from selectedUsers array
                            const updatedUsers = subServ.selectedUsers.filter(selectedUser => selectedUser !== user);
                            return {
                                ...subServ,
                                selectedUsers: updatedUsers,
                            };
                        }
                        return subServ;
                    })
                };
            }
            return serviceItem;
        });
    
        setSelectedServices(updatedServices);
    
        setSelectedSubServices(updatedSubServices);
        setSubServices(updatedSubServices);
        setSelectedUsers(selectedUsers.filter((selectedUser) => selectedUser.id !== user.id));
        setUsers(users.filter((userId) => userId !== user.id));
    };

    const handleDateChange = (serviceId, date) => {
        setServiceDates(prevServiceDates => ({
            ...prevServiceDates,
            [serviceId]: date
        }));
    };

    const handleSubServiceDateChange = (subServiceId, date, serviceId) => {
        const selectedSubServiceDate = subServiceDates && subServiceDates.find(
            subServDate =>
                subServDate.subServiceId === subServiceId && subServDate.serviceId === serviceId
        );
    
        if (selectedSubServiceDate) {
            const updatedSubServiceDates = Object.values(subServiceDates).map(subServDate =>
                subServDate.subServiceId === subServiceId && subServDate.serviceId === serviceId
                    ? { ...subServDate, mainDate: [date] }
                    : subServDate
            );
    
            setSubServiceDates(updatedSubServiceDates);
        } else {
            // If there is no existing record, add a new one
            setSubServiceDates(prevSubServiceDates => [
                ...prevSubServiceDates,
                { subServiceId, mainDate: [date], serviceId },
            ]);
        }
    
        const selectedService = selectedServices.find(serviceItem => serviceItem.id === serviceId);
    
        if (selectedService) {
            const selectedSubService = selectedService.selectedSubServs.find(subServ => subServ.id === subServiceId);
    
            if (selectedSubService) {
                const updatedSubService = { ...selectedSubService, mainDate: [date] };
    
                const updatedSubServices = selectedServices.map(serviceItem => {
                    if (serviceItem.id === serviceId) {
                        return {
                            ...serviceItem,
                            selectedSubServs: serviceItem.selectedSubServs.map(subServ => {
                                if (subServ.id === subServiceId) {
                                    return updatedSubService;
                                }
                                return subServ;
                            })
                        };
                    }
                    return serviceItem;
                });
    
                setSelectedServices(updatedSubServices);
            }
        }

        const updatedSubServices = selectedSubServices.map(subServItem => {
            if (subServItem.serviceId === serviceId) {
                if(subServItem.id === subServiceId){
                    return {
                        ...subServItem,
                        mainDate: [date],
                    };
                }
            }
            return subServItem;
        });
    
        setSelectedSubServices(updatedSubServices);
        setSubServices(updatedSubServices);
    };

    const handleMayorDateChange = (serviceId, date) => {
        setServiceMayorDates(prevServiceMayorDates => ({
            ...prevServiceMayorDates,
            [serviceId]: date
        }));
    };

    const handleSubServiceMayorDateChange = (subServiceId, date, serviceId) => {
        const selectedSubServiceDate = subServiceMayorDates.find(
            subServDate =>
                subServDate.subServiceId === subServiceId && subServDate.serviceId === serviceId
        );
    
        if (selectedSubServiceDate) {
            // Update the existing record if both subServiceId and serviceId match
            const updatedSubServiceDates = subServiceMayorDates.map(subServDate =>
                subServDate.subServiceId === subServiceId && subServDate.serviceId === serviceId
                    ? { ...subServDate, mayorDate: [date] }
                    : subServDate
            );
    
            setSubServiceMayorDates(updatedSubServiceDates);
        } else {
            // If there is no existing record, add a new one
            setSubServiceMayorDates(prevSubServiceDates => [
                ...prevSubServiceDates,
                { subServiceId, mayorDate: [date], serviceId },
            ]);
        }

        const selectedService = selectedServices.find(serviceItem => serviceItem.id === serviceId);
    
        if (selectedService) {
            const selectedSubService = selectedService.selectedSubServs.find(subServ => subServ.id === subServiceId);
    
            if (selectedSubService) {
                const updatedSubService = { ...selectedSubService, mayorDate:[date] };
    
                const updatedSubServices = selectedServices.map(serviceItem => {
                    if (serviceItem.id === serviceId) {
                        return {
                            ...serviceItem,
                            selectedSubServs: serviceItem.selectedSubServs.map(subServ => {
                                if (subServ.id === subServiceId) {
                                    return updatedSubService;
                                }
                                return subServ;
                            })
                        };
                    }
                    return serviceItem;
                });
    
                setSelectedServices(updatedSubServices);
            }
        }
        const updatedSubServices = selectedSubServices.map(subServItem => {
            if (subServItem.serviceId === serviceId) {
                if(subServItem.id === subServiceId){
                    return {
                        ...subServItem,
                        mayorDate: [date],
                    };
                }
            }
            return subServItem;
        });
    
        setSelectedSubServices(updatedSubServices);
        setSubServices(updatedSubServices);
    };

    const handleServiceStatusChange = (serviceId, date, e) => {
        const selectedServiceStatusId = serviceStatusList.find(status => status.Service_Status_Name === e.target.value)?.id;
        setServiceStatuses(prevServiceStatuses => ({
            ...prevServiceStatuses,
            [serviceId]: { id: selectedServiceStatusId, status: e.target.value }
        }));
        setServiceStatusId(selectedServiceStatusId); // Update serviceStatusId for the current service status
    };

    const handleSubServiceStatusChange = (subServiceId, date, e, serviceId) => {
        const selectedSubServiceStatusId = subservicestats.result.find(status => status.status_name === e.target.value)?.id;
        setSubServiceStatuses(prevServiceStatuses => {
            const updatedServiceStatuses = {
                ...prevServiceStatuses,
                [serviceId]: [
                    ...(prevServiceStatuses[serviceId] || []).filter(subStatus => subStatus.subServiceId !== subServiceId), // exclude existing record with the same subServiceId
                    { subServiceId, id: selectedSubServiceStatusId, status: e.target.value }
                ]
            };
            return updatedServiceStatuses;
        });
        setSubServiceStatusId(selectedSubServiceStatusId); // Update serviceStatusId for the current service status
    };

    const handleClient = (e)=>{
        setClient(e.target.value);
        const selectedClient = clients.find((client) => client.Client_FirstName + ' ' + client.Client_LastName === e.target.value);
        setClientId(selectedClient ? selectedClient.id : '');
    };

    const removeSelectedFile = (index, event) => {
        event.preventDefault();
        const newFiles = [...projectDocs];
        newFiles.splice(index, 1);
        setProjectDocs(newFiles);

        const newSelectedFiles = [...selectedFiles];
        newSelectedFiles.splice(index, 1);
        setSelectedFiles(newSelectedFiles);

        // Create a copy of the current state
        const updatedDocsToUser = { ...docsToUser };

        // Remove the file name at the specified index
        updatedDocsToUser.fileNames.splice(index, 1);

        // Create a new object with the updated fileNames array
        const updatedState = { ...docsToUser, fileNames: updatedDocsToUser.fileNames };

        // Update the state with the modified object
        setDocsToUser(updatedState);
    };

    const handleService = (e) => {
        const selectedService = service.find((servitem) => servitem.Service_Name === e.target.value);
    
        if (selectedService && !services.includes(selectedService.id)) {
            const updatedSubService = subservice && subservice.result
            .filter(sub => sub.service_id === selectedService.id)
            .map(sub => ({
                ...sub,
                selectedUsers: [],
                serviceId: selectedService.id,
                mainDate: [],
                mayorDate: [],
            }));
            // Spread the previous state and add the new items
            setServiceSubServicesMap(prevMap => ({
                ...prevMap,
                [selectedService.id]: updatedSubService.length > 1 ? updatedSubService.map(updatedServ => updatedServ.id) : updatedSubService[0].id 
            }));
            setSelectedSubServices(prevState => [
                ...prevState,
                ...updatedSubService
            ]);
            setSubServices(prevState => [
                ...prevState,
                ...updatedSubService
            ]);
            
            const updatedService = { ...selectedService, selectedUsers: [], selectedSubServs: updatedSubService };
    
            // Set selected services
            setSelectedServices([...selectedServices, updatedService]);
            setServices([...services, selectedService.id]);
        }
    };
    
    const handleSubService = (e, serviceId) => {
        const selectedSubService = subservice.result.find((servitem) => servitem.name === e.target.value);
        
        if (selectedSubService && !subServices.includes(selectedSubService.id)) {
            const updatedSubService = { ...selectedSubService, selectedUsers: [], serviceId, mainDate:[], mayorDate:[] };
            setSelectedSubServices([...selectedSubServices, updatedSubService]);
            setSubServices([...selectedSubServices, updatedSubService]);
            setServiceSubServicesMap(prevMap => ({
                ...prevMap,
                [serviceId]: [...(prevMap[serviceId] || []), selectedSubService.id]
            }));
            const updatedSubServices = selectedServices.map(serviceItem => {
                if (serviceItem.id === serviceId) {
                    return {
                        ...serviceItem,
                        selectedSubServs: [...serviceItem.selectedSubServs, updatedSubService]
                    };
                }
                return serviceItem;
            });
            setSelectedServices(updatedSubServices);
        }
    };

    const removeService = (service) => {
        setSelectedServices(selectedServices.filter((selectedServiceItem) => selectedServiceItem.id !== service.id));
        setServices(services.filter((serviceId) => serviceId !== service.id));
        setSelectedSubServices(selectedSubServices.filter((subService) => subService.serviceId !== service.id));
        setSubServices(subServices.filter((subService) => subService.serviceId !== service.id));
        setSubServiceDates(subServiceDates.filter((subService) => subService.serviceId !== service.id));
        setSubServiceMayorDates(subServiceMayorDates.filter((subService) => subService.serviceId !== service.id));
        // Remove the associated date for the removed service from the state
        const updatedServiceDates = { ...serviceDates };
        delete updatedServiceDates[service.id];
        setServiceDates(updatedServiceDates);
        // Remove the associated mayor date for the removed service from the state
        const updatedServiceMayorDates = { ...serviceMayorDates };
        delete updatedServiceMayorDates[service.id];
        setServiceMayorDates(updatedServiceMayorDates);
        // Remove the associated service status for the removed service from the state
        const updatedServiceStatuses = { ...serviceStatuses };
        delete updatedServiceStatuses[service.id];
        setServiceStatuses(updatedServiceStatuses);
        // Remove the associated service user mapping item for the removed service from the state
        const updatedServiceUserMapping = { ...serviceUserMapping };
        delete updatedServiceUserMapping[service.id];
        setServiceUserMapping(updatedServiceUserMapping);
        // Remove the associated subService user mapping item for the removed service from the state
        const updatedSubServiceUserMapping = { ...subServiceUserMapping };
        delete updatedSubServiceUserMapping[service.id];
        setSubServiceUserMapping(updatedSubServiceUserMapping);
        // Remove the associated service subService mapping item for the removed service from the state
        const updatedServiceSubServiceUserMapping = { ...serviceSubServicesMap };
        delete updatedServiceSubServiceUserMapping[service.id];
        setServiceSubServicesMap(updatedServiceSubServiceUserMapping);

        setSubServiceStatuses(prevServiceStatuses => {
            const updatedServiceStatuses = { ...prevServiceStatuses };
            delete updatedServiceStatuses[service.id];
            return updatedServiceStatuses;
        });
    };

    const removeSubService = (subService, serviceId) => {
        setServiceSubServicesMap(prevMap => ({
            ...prevMap,
            [serviceId]: prevMap[serviceId].filter(subservId => subservId !== subService.id )
        }));

        const updatedServices = selectedServices.map(serviceItem => {
            if(serviceItem.id === serviceId){
                const updatedSelectedSubServices = serviceItem.selectedSubServs.filter(selectedSubService => selectedSubService.id !== subService.id);
                return{
                    ...serviceItem,
                    selectedSubServs: updatedSelectedSubServices
                };
            }
            return serviceItem;
        });
        setSelectedServices(updatedServices);
        setSelectedSubServices(selectedSubServices.filter(selectedServiceItem => !(selectedServiceItem.serviceId === serviceId && selectedServiceItem.id === subService.id)));
        setSubServices(subServices.filter(subServiceItem => !(subServiceItem.serviceId === serviceId && subServiceItem.id === subService.id)));
        setSubServiceDates(subServiceDates.filter((subServiceId) => subServiceId.subServiceId !== subService.id));
        setSubServiceMayorDates(subServiceMayorDates.filter((subServiceId) => subServiceId.subServiceId !== subService.id));
        setSubServiceStatuses(prevServiceStatuses => {
            const updatedServiceStatuses = { ...prevServiceStatuses };
            const existingSubServiceStatuses = updatedServiceStatuses[serviceId] || [];
            
            const filteredSubServiceStatuses = existingSubServiceStatuses.filter(status => status.subServiceId !== subService.id);
            updatedServiceStatuses[serviceId] = filteredSubServiceStatuses;
            return updatedServiceStatuses;
        });
        // Remove the associated subService user mapping item for the removed subService from the state
        setSubServiceUserMapping(prevMapping => {
            const updatedServiceArray = (prevMapping[serviceId] || []).filter(subServ => subServ.subServiceId !== subService.id);
    
            return {
                ...prevMapping,
                [serviceId]: updatedServiceArray,
            };
        });
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

    const collectSubServiceStatusIds = () => {
        const subServiceStatusIds = {};
    
        for (const serviceId in subServiceStatuses) {
            if (subServiceStatuses.hasOwnProperty(serviceId)) {
                subServiceStatusIds[serviceId] = subServiceStatuses[serviceId].map(subServiceStatus => ({
                    subServiceId: subServiceStatus.subServiceId,
                    subServiceStatusId: subServiceStatus.id
                }));
            }
        }
    
        return subServiceStatusIds;
    };

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
    };

    return (
        <Container className='project-reg-form-container' maxWidth="md">
        <Typography className='form-heading' variant="h5">ახალი პროექტის რეგისტრაცია</Typography>
        <form className='project-reg-form' onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}> 
                <TextField
                label="პროექტის სახელი"
                variant="outlined"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
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
                onChange={(e) => setProjectCode(e.target.value)}
                required
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
                            onChange={(e) => handleTypes(e)}
                            label="type"
                            required
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
                            onChange={(e) => handleClient(e)}
                            label="client"
                            required
                            className='select-label'
                        >
                            <MenuItem value="">
                            <em>None</em>
                            </MenuItem>
                            {clients &&
                            clients.map((client) => (
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
                        onChange={(e) => handleStatus(e)}
                        label="client"
                        required
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
                                        <span className='service-name' onClick={() => removeService(serviceItem)}>
                                            {`${serviceItem.Service_Name}`} &#10005;
                                        </span>
                                        <label className='inner-deadline-cont'>
                                            <span>შიდა deadline: </span>
                                            <input
                                            type='date'
                                            value={serviceDates[serviceItem.id] || ''}
                                            onChange={(e) => handleDateChange(serviceItem.id, e.target.value)}
                                            />
                                        </label>
                                        <label className='service-status-cont'>
                                            <span>სერვისის სტატუსი: </span>
                                            <select
                                                required
                                                onChange={(e) => handleServiceStatusChange(serviceItem.id, e.target.value, e)}
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
                                                onChange={(e) => handleMayorDateChange(serviceItem.id, e.target.value)}
                                            />
                                        </label>
                                        <label className='spec-cont'>
                                            <span className='spec-span'>სპეციალისტები: </span>
                                            <div className="proj-spec-select-dropdown">
                                                <div className="proj-selected-users">
                                                {
                                                    serviceItem.selectedUsers.map((user)=>(
                                                        <span key={user.id} onClick={() => removeUser(user, serviceItem.id)}>
                                                            {
                                                                `${user.FirstName} ${user.LastName}`
                                                            } &#10005;
                                                        </span>
                                                    ))
                                                }
                                                </div>
                                            </div>
                                            <select
                                                name={`users-${serviceItem.id}`} // Give each select a unique name
                                                onChange={(e) => { handleUser(e, serviceItem.id) }} // Pass the service ID
                                                value={users}
                                                multiple
                                                className='spec-select-cont'
                                            >
                                                <option disabled>აირჩიეთ სპეციალისტები</option>
                                                {usersList && usersList.map(user => (
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
                                                        {selectedSubServices && selectedSubServices.filter(subServiceItem => subServiceItem.serviceId === serviceItem.id).map((subServiceItem) => (
                                                            <div className="proj-multi-select-dropdown" key={subServiceItem.id}>
                                                                <span className='service-name' onClick={() => removeSubService(subServiceItem, serviceItem.id)}>
                                                                    {`${subServiceItem.name}`} &#10005;
                                                                </span>
                                                                <label className='inner-deadline-cont'>
                                                                    <span>შიდა deadline: </span>
                                                                    <input
                                                                    type='date'
                                                                    // value={subServiceDates[subServiceItem.id] || ''}
                                                                    value={
                                                                        (subServiceDates && subServiceDates.find(
                                                                            (subServiceDate) =>
                                                                                subServiceDate.subServiceId === subServiceItem.id &&
                                                                                subServiceDate.serviceId === serviceItem.id
                                                                        )?.mainDate[0]) || ''
                                                                    }
                                                                    onChange={(e) => handleSubServiceDateChange(subServiceItem.id, e.target.value, serviceItem.id,)}
                                                                    />
                                                                </label>
                                                                <label className='service-status-cont'>
                                                                    <span>ქვე-სერვისის სტატუსი: </span>
                                                                    <select
                                                                        required
                                                                        onChange={(e) => handleSubServiceStatusChange(subServiceItem.id, e.target.value, e, serviceItem.id)}
                                                                        value={subServiceStatuses[serviceItem.id] ? subServiceStatuses[serviceItem.id].name : ''}
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
                                                                        value={
                                                                            (subServiceMayorDates && subServiceMayorDates.find(
                                                                                (subServiceDate) =>
                                                                                    subServiceDate.subServiceId === subServiceItem.id &&
                                                                                    subServiceDate.serviceId === serviceItem.id
                                                                            )?.mayorDate[0]) || ''
                                                                        }
                                                                        onChange={(e) => handleSubServiceMayorDateChange(subServiceItem.id, e.target.value, serviceItem.id)}
                                                                    />
                                                                </label>
                                                                <label className='spec-cont'>
                                                                    <span className='spec-span'>სპეციალისტები: </span>
                                                                    <div className="proj-spec-select-dropdown">
                                                                        <div className="proj-selected-users">
                                                                        {
                                                                            subServiceItem.selectedUsers.map((user)=>(
                                                                                <span key={user.id} onClick={() => removeSubServiceUser(user, subServiceItem.id, serviceItem.id)}>
                                                                                    {
                                                                                        `${user.FirstName} ${user.LastName}`
                                                                                    } &#10005;
                                                                                </span>
                                                                            ))
                                                                        }
                                                                        </div>
                                                                    </div>
                                                                    <select
                                                                        name={`users-${subServiceItem.id}`} // Give each select a unique name
                                                                        onChange={(e) => { handleSubServiceUser(e, subServiceItem.id, serviceItem.id) }} // Pass the service ID
                                                                        value={users}
                                                                        multiple
                                                                        className='spec-select-cont'
                                                                    >
                                                                        <option disabled>აირჩიეთ სპეციალისტები</option>
                                                                        {usersList && usersList.map(user => (
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
                                                <select name={`subservices-${serviceItem.id}`} className='service-select' onChange={(e)=> {handleSubService(e, serviceItem.id)}} value={subServices} multiple>
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
                        <select className='service-select' name='services' onChange={(e)=> {handleService(e)}} value={services} multiple>
                            <option disabled>აირჩიეთ სერვისები</option>
                            { service && service.map(servItem =>(
                                <option value={servItem.Service_Name} key={servItem.id}>{`${servItem.Service_Name}`}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className='financial-info-cont'>
                    <label className='finance-label'>ფინანსური ინფორმაცია</label>
                    <TextField
                    label="პროექტის ღირებულება"
                    variant="outlined"
                    value={projectPrice}
                    onChange={(e) => setProjectPrice(e.target.value)}
                    required
                    fullWidth
                    margin="normal"
                    className='proj-cost'
                    InputProps={{
                        className: 'input-label', // Add a custom class for input text styling
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
                                required
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
                        required
                        fullWidth
                        margin="normal"
                        className='paid-amount'
                        InputProps={{
                            className: 'input-label', // Add a custom class for input text styling
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
                                required
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
                        required
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
                <label className='project-docs-cont'>
                    <label className='docs-label'>დოკუმენტები</label>
                    <div className="proj-spec-select-dropdown">
                        <div className="proj-selected-users">
                            {selectedFiles.map((file, index) => (
                                <span key={index} onClick={(event) => removeSelectedFile(index, event)}>
                                    {file.name} &#10005;
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
                        <Button className='project-reg-btn' type="submit" variant="contained" color="primary">
                            რეგისტრაცია
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
