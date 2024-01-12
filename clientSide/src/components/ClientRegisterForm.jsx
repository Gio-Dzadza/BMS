import React, { useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import {
    TextField,
    Button,
    Typography,
    Container,
} from '@mui/material';
import './ClientsList.css'

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function ClientRegisterForm({ handleFormSubmit, setShowRegForm }) {

    const [Email, setEmail] = useState('');
    const [FirstName, setFirstName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [clientImage, setClientImage] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setClientImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedClient = {
            id: Math.random()*10000,
            Email,
            FirstName,
            idNumber,
            phoneNumber,
            clientImage
        };
        handleFormSubmit(updatedClient);

        try{
            const response = await Axios.post('http://localhost:3001/api/clapi/clients/insert', updatedClient, {
                headers: {
                    "x-access-token": context.userToken, 
                    'Content-Type': 'multipart/form-data', 
                },
            });
        if (response.status === 200) {
            const data = await response.data;
            console.log(response.data);
            handleFormSubmit(); 
            setEmail(''); 
            setFirstName('');
            // setLastName('');
            setIdNumber('');
            setPhoneNumber('');
            setClientImage(null);
            setSelectedFileName('');
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering client:', error);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
    };


    return (
        <Container maxWidth="sm">
        <Typography className='form-heading' variant="h5">ახალი კლიენტის რეგისტრაცია</Typography>
        <form className='client-reg-form' onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}> 
                <TextField
                label="სახელი"
                variant="outlined"
                type="text"
                value={FirstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                <TextField
                label="პირადი N"
                variant="outlined"
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
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
                <TextField
                label="მეილი"
                variant="outlined"
                type="text"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputLabelProps={{
                    style: {
                        fontFamily: 'FiraGO, sans-serif',
                    },
                }}
                InputProps={{
                    className: 'input-label',
                }}
                />
                <TextField
                label="ნომერი"
                variant="outlined"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputLabelProps={{
                    style: {
                        fontFamily: 'FiraGO, sans-serif',
                    },
                }}
                InputProps={{
                    className: 'input-label',
                }}
                />
                <div className='client-upreg-btn'>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="fileInput"
                    />
                    <label htmlFor="fileInput">
                        <Button
                            className="upload-btn"
                            variant="outlined"
                            component="span"
                        >
                            სურათის ატვირთვა
                        </Button>
                    </label>
                    {selectedFileName && (
                        <div>{selectedFileName}</div>
                    )}
                    <Button type="submit" variant="contained" color="primary">
                        რეგისტრაცია
                    </Button>
                </div>
                <div className='client-close-btn-container'>
                    <Button className='close-btn' onClick={(e)=> handleClose(e)} variant="contained" color="primary">
                        ფორმის დახურვა
                    </Button>
                </div>
            </ThemeProvider>
        </form>
    </Container>
)
}
