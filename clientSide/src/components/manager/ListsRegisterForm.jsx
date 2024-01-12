import React, { useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import Axios from 'axios';
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

export default function ListsRegisterForm({ subServiceForm, handleFormSubmit, tableName, setShowRegForm }) {
    const {data:services} = useFetch('http://localhost:3001/api/adminapi/get/services');
    const [itemName, setItemName] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [serviceId, setServiceId] = useState('');
    const context = useAuthContext();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedItem = {
            name: itemName,
            tableName
        };
        handleFormSubmit(updatedItem);

        try{
            const response = await Axios.post('http://localhost:3001/api/adminapi/lists/insert', updatedItem, {
                headers: {
                    "x-access-token": context.userToken, 
                },
            });
        if (response.status === 200) {
            const data = await response.data;
            console.log(response.data);
            handleFormSubmit(); 
            setItemName('');
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

    const handleSubServiceSubmit = async (event) => {
        event.preventDefault();

        const updatedItem = {
            name: itemName,
            serviceId: serviceId,
        };
        handleFormSubmit(updatedItem);

        try{
            const response = await Axios.post('http://localhost:3001/api/adminapi/subservices/insert', updatedItem, {
                headers: {
                    "x-access-token": context.userToken,
                },
            });
        if (response.status === 200) {
            const data = await response.data;
            console.log(response.data);
            handleFormSubmit(); 
            setItemName('');
            setServiceId('');
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    }

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
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
            <form onSubmit={subServiceForm ? handleSubServiceSubmit : handleSubmit}>
                <Typography variant='h6' className='form-heading'>ჩანაწერის დამატება</Typography>
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
                    <Button className='close-btn' type='submit' variant="contained">დაარეგისტრირე</Button>
                    <Button className='close-btn' onClick={(e)=> handleClose(e)} variant="contained" color="primary">
                        დახურვა
                    </Button>
                </div>
            </form>
        </div>
    )
}
