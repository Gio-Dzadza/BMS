import React, { useState } from 'react';
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
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
import './UsersList.css';

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function UserRegisterForm({ handleFormSubmit, setShowRegForm }) {

    const {data:specialty} = useFetch('http://localhost:3001/api/get/specialty');
    const {data:status} = useFetch('http://localhost:3001/api/get/status');
    const {data:type} = useFetch('http://localhost:3001/api/get/type');


    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [FirstName, setFirstName] = useState('');
    const [LastName, setLastName] = useState('');

    const [userType, setUserType] = useState('');
    const [userTypeId, setUserTypeId] = useState('');

    const [userSpecialty, setUserSpecialty] = useState('');
    const [userSpecialtyId, setUserSpecialtyId] = useState('');

    const [userStatus, setUserStatus] = useState('');
    const [userStatusId, setUserStatusId] = useState('');

    const [userImage, setUserImage] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        // setUserImage(e.target.files[0]);
        setUserImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedUser = {
            id: Math.random()*10000,
            Email,
            Password,
            FirstName,
            LastName,
            userStatusId,
            userSpecialtyId,
            userTypeId,
            userImage
        };
        handleFormSubmit(updatedUser);

        try{
            const response = await Axios.post('http://localhost:3001/api/insert', updatedUser, {
                headers: {
                    "x-access-token": context.userToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
        if (response.status === 200) {
            // const data = await response.data;
            // console.log(response.data);
            handleFormSubmit(); 
            setEmail('');
            setPassword(''); 
            setFirstName('');
            setLastName('');
            setUserStatusId('');
            setUserSpecialtyId('');
            setUserTypeId('');
            setUserImage(null);
            setSelectedFileName('');
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    }

    const handleTypes = (e)=>{
        setUserType(e.target.value);
        const selectedType = type.find((user_type) => user_type.Type_Name === e.target.value);
        setUserTypeId(selectedType ? selectedType.id : '');
    };

    const handleStatus = (e)=>{
        setUserStatus(e.target.value);
        const selectedStatus = status.find((user_status) => user_status.User_Status_Name === e.target.value);
        setUserStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handleSpecialty = (e)=>{
        setUserSpecialty(e.target.value);
        const selectedSpecialty = specialty.find((user_specialty) => user_specialty.Specialty_name === e.target.value);
        setUserSpecialtyId(selectedSpecialty ? selectedSpecialty.id : '');
    };

    const handleFormClose = ()=>{
        setShowRegForm(false);
    }

    return (
    <Container maxWidth="sm">
        <Typography className='form-heading' variant="h5">ახალი მომხმარებლის რეგისტრაცია</Typography>
        <form className='reg-form' onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}> 
                <TextField
                label="სახელი"
                variant="outlined"
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
                label="გვარი"
                variant="outlined"
                value={LastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputProps={{
                    className: 'input-label', // Add a custom class for input text styling
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                />
                <TextField
                label="მეილი"
                variant="outlined"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputProps={{
                    className: 'input-label', // Add a custom class for input text styling
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                />
                <TextField
                label="პაროლი"
                variant="outlined"
                type="password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputLabelProps={{
                    style: {
                        fontFamily: 'FiraGO, sans-serif',
                    },
                }}
                />
                {/* es imistvis rom adminma ver shedzlos superadminis daregistrireba tu tavad ar aris super admini */}
                {
                    context.user && context.user.User_Type_id === 4 ? (
                        <FormControl
                        className='user-type' 
                        variant="outlined" 
                        fullWidth margin="normal"
                        >
                        <InputLabel
                            className='input-label'
                        >
                            ტიპი
                        </InputLabel>
                        <Select
                            value={userType}
                            onChange={(e) => handleTypes(e)}
                            label="User Type"
                            required
                            className='select-label'
                        >
                            <MenuItem value="">
                            <em>None</em>
                            </MenuItem>
                            {type &&
                            type.map((user_type) => (
                                <MenuItem
                                key={user_type.id}
                                value={user_type.Type_Name}
                                className='select-label'
                                >
                                {user_type.Type_Name}
                                </MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                    ) : (
                        <FormControl
                        className='user-type' 
                        variant="outlined" 
                        fullWidth margin="normal"
                        >
                        <InputLabel
                            className='input-label'
                        >
                            ტიპი
                        </InputLabel>
                        <Select
                            value={userType}
                            onChange={(e) => handleTypes(e)}
                            label="User Type"
                            required
                            className='select-label'
                        >
                            <MenuItem value="">
                            <em>None</em>
                            </MenuItem>
                            {type &&
                                type
                                    .filter(user_type => user_type.id !== 4) // Filter out user_type with id 4
                                    .map((user_type) => (
                                    <MenuItem
                                        key={user_type.id}
                                        value={user_type.Type_Name}
                                        className='select-label'
                                    >
                                        {user_type.Type_Name}
                                    </MenuItem>
                                ))}
                        </Select>
                        </FormControl>
                    )
                }
                <FormControl className='user-specialty' variant="outlined" fullWidth margin="normal">
                <InputLabel 
                    className='input-label'
                >
                    სპეციალობა
                </InputLabel>
                <Select
                    value={userSpecialty}
                    onChange={(e) => handleSpecialty(e)}
                    label="Specialty"
                    required
                    className='select-label'
                >
                    <MenuItem value="">
                    <em>None</em>
                    </MenuItem>
                    {specialty &&
                    specialty.map((user_specialty) => (
                        <MenuItem
                        key={user_specialty.id}
                        value={user_specialty.Specialty_name}
                        className='select-label'
                        >
                        {user_specialty.Specialty_name}
                        </MenuItem>
                    ))}
                </Select>
                </FormControl>
                <FormControl className='user-status' variant="outlined" fullWidth margin="normal">
                <InputLabel
                    className='input-label'
                >
                    სტატუსი
                </InputLabel>
                <Select
                    value={userStatus}
                    onChange={(e) => handleStatus(e)}
                    label="User Status"
                    required
                    className='select-label'
                >
                    <MenuItem value="">
                    <em>None</em>
                    </MenuItem>
                    {status &&
                    status.map((user_stat) => (
                        <MenuItem
                        key={user_stat.id}
                        value={user_stat.User_Status_Name}
                        className='select-label'
                        >
                        {user_stat.User_Status_Name}
                        </MenuItem>
                    ))}
                </Select>
                </FormControl>
                <div className='upreg-btn'>
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
                    <Button type="submit" variant="contained" color="primary">
                        რეგისტრაცია
                    </Button>
                </div>
                <div className='close-btn-container'>
                    <Button className='close-btn' onClick={()=> handleFormClose()} variant="contained" color="primary">
                        ფორმის დახურვა
                    </Button>
                </div>
            </ThemeProvider>
        </form>
    </Container>
)
}
