import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import {
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import theme from '../Theme';
import { ThemeProvider } from '@mui/material/styles';
import { useFetch } from '../../hooks/useFetch';

export default function ListsEditForm({ subServiceForm, selectedItem, setMainList, tableName, setSelectedItem, handleFormSubmit }) {
    const {data:services} = useFetch('http://localhost:3001/api/adminapi/get/services');
    const [itemName, setItemName] = useState('');
    const [secondKeyItem, setSecondKeyItem] = useState('');

    const [serviceName, setServiceName] = useState('');
    const [serviceId, setServiceId] = useState('');

    const context = useAuthContext();

    useEffect(() => {
        const keys = Object.keys(selectedItem);
        if (keys.length >= 2) {
            const secondKey = keys[1];
            const secondKeyValue = selectedItem[secondKey]; // Get the value using the key
            setItemName(secondKeyValue); // Set the value into the state
            setSecondKeyItem(secondKey);
        };
        if(subServiceForm){
            setServiceId(selectedItem.service_id)
            const selecteditemServiceName = services && services.find(item => item.id === selectedItem.service_id);
            setServiceName(selecteditemServiceName ? selecteditemServiceName.Service_Name : '');
        };
    }, [selectedItem, subServiceForm, services]);

    const updateItem= async (id, e)=>{
        e.preventDefault();
        try{
            await Axios.put(`http://localhost:3001/api/adminapi/lists/update/${id}`,
            {
                name: itemName,
                tableName
            },
            {
                headers: {
                    "x-access-token": context.userToken, // Include the token in the headers
                },
            }
            );
            setMainList(prevList =>
                prevList.map(item => {
                    if (item.id === id) {
                    return {...item, 
                        secondKeyItem
                    };}
                    return item;
                })
            );
            setSelectedItem(null);
            handleFormSubmit();
        } catch(error){
            console.error('Error updating item:', error);
        }
    };

    const updateSubServiceItem= async (id, e)=>{
        e.preventDefault();
        try{
            await Axios.put(`http://localhost:3001/api/adminapi/subservices/update/${id}`,
            {
                name: itemName,
                serviceId: serviceId,
            },
            {
                headers: {
                    "x-access-token": context.userToken, // Include the token in the headers
                },
            }
            );
            setMainList(prevList =>
                prevList.map(item => {
                    if (item.id === id) {
                    return {...item, 
                        secondKeyItem
                    };}
                    return item;
                })
            );
            setSelectedItem(null);
            handleFormSubmit();
        } catch(error){
            console.error('Error updating item:', error);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedItem(null);
    };

    const handleService = (e) => {
        setServiceName(e.target.value);
        const selectedService = services && services.find((service) => service.Service_Name === e.target.value);
        setServiceId(selectedService ? selectedService.id : '');
    };

    return (
        <div style={{
            marginBottom: '10px'
        }}>
            <form>
                <Typography className='form-heading' variant='h6'>ჩანაწერის ცვლილება</Typography>
                <ThemeProvider theme={theme}>
                    <TextField
                        label="სახელი"
                        variant="outlined"
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                        fullWidth
                        margin="normal"
                        InputProps={{
                            className: 'input-label',
                        }}
                        InputLabelProps={{
                            className:'input-label',
                        }}
                    />
                </ThemeProvider>
                {
                    subServiceForm && (
                        <FormControl
                        variant="outlined" 
                        fullWidth margin="normal"
                        required
                        >
                            <InputLabel
                                className='input-label'
                            >
                                სერვისი
                            </InputLabel>
                            <Select
                                value={serviceName}
                                onChange={(e) => handleService(e)}
                                label="Service"
                                required
                                className='select-label'
                            >
                                <MenuItem value="">
                                <em>''</em>
                                </MenuItem>
                                {services &&
                                services.map((service) => (
                                    <MenuItem
                                    key={service.id}
                                    value={service.Service_Name}
                                    className='select-label'
                                    >
                                    {service.Service_Name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )
                }
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                }}>
                    <Button className='close-btn' type='submit' onClick={subServiceForm ? (e)=>{updateSubServiceItem(selectedItem.id, e)} : (e)=>{updateItem(selectedItem.id, e)}} variant="contained">განაახლე</Button>
                    <Button className='close-btn' onClick={(e)=> handleClose(e)} variant="contained" color="primary">
                        დახურვა
                    </Button>
                </div>
            </form>
        </div>
    )
}
