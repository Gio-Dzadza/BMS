import React, { useEffect, useState } from 'react';
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

export default function ClientEditForm({ client, setClientsList, setSelectedClient, setUpdateList }) {

    const [Email, setEmail] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [FirstName, setFirstName] = useState('');
    // const [LastName, setLastName] = useState('');

    const [clientImage, setClientImage] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setClientImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    useEffect(()=>{
        setEmail(client.Email);
        setFirstName(client.Client_FirstName);
        // setLastName(client.Client_LastName);
        setClientImage(client.Client_Image);
        setIdNumber(client.ID_Number);
        setPhoneNumber(client.Phone_Number);
    },[client]);

    const updateClient= async (id, e)=>{
        e.preventDefault();
        try{
            await Axios.put(`http://localhost:3001/api/clapi/clients/update/${id}`,
            {
                id: id, 
                Email,
                FirstName,
                // LastName,
                idNumber,
                phoneNumber,
                clientImage
            },
            {
                headers: {
                    "x-access-token": context.userToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            }
            );
            setClientsList(prevList =>
                prevList.map(client => {
                    if (client.id === id) {
                    return {...client, 
                        Email,
                        FirstName,
                        // LastName,
                        idNumber,
                        phoneNumber,
                        clientImage
                    };}
                    return client;
                })
            );
            setUpdateList(true);
            setSelectedClient(null);
        } catch(error){
            console.error('Error updating client:', error);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedClient(null);
    };

    return (
        <Container maxWidth="sm">
        <Typography className='form-heading' variant="h5">კლიენტის მონაცემების ცვლილება</Typography>
        <form className='client-reg-form'>
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
                {/* <TextField
                label="გვარი"
                variant="outlined"
                type="text"
                value={LastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputProps={{
                    className: 'input-label',
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                /> */}
                <TextField
                label="პირადი N"
                variant="outlined"
                type="text"
                // type="number"
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
                // type="email"
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
                        style={{ display: 'none' }} // Hide the input element
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
                    <Button type="submit" onClick={(e)=>{updateClient(client.id, e)}} variant="contained" color="primary">
                        განახლება
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
