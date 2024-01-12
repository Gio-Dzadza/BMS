import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import { useFetch } from '../hooks/useFetch';
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

export default function UserEditForm({ user, updateUserInState }) {
    const {data:type} = useFetch('http://localhost:3001/api/get/type');
    const {data:specialty} = useFetch('http://localhost:3001/api/get/specialty');
    const {data:status} = useFetch('http://localhost:3001/api/get/status');

    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [FirstName, setFirstName] = useState('');
    const [LastName, setLastName] = useState('');

    const [userType, setUserType] = useState('');
    const [User_Type_id, setUserTypeId] = useState('');

    const [userSpecialty, setUserSpecialty] = useState('');
    const [User_Specialty_id, setUserSpecialtyId] = useState('');

    const [userStatus, setUserStatus] = useState('');
    const [User_Status_id, setUserStatusId] = useState('');

    const [userImage, setUserImage] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUserImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    useEffect(()=>{
        setEmail(user && user.Email);
        setFirstName(user && user.FirstName);
        setLastName(user && user.LastName);
        setPassword('');
        setUserImage(user && user.User_Image);

        type && type.map((typeofuser)=>{
                if(typeofuser.id === user.User_Type_id){
                    setUserType(typeofuser.Type_Name);
                }
            }
        );
        specialty && specialty.map((specialtyofuser)=>{
                if(specialtyofuser.id === user.User_Specialty_id){
                    setUserSpecialty(specialtyofuser.Specialty_name);
                }
            }
        );
        status && status.map((statusofuser)=>{
                if(statusofuser.id === user.User_Status_id){
                    setUserStatus(statusofuser.User_Status_Name);
                }
            }
        )
    },[user, type, status, specialty]);

    useEffect(()=>{
        if(userType){
            const selectedType = type && type.find((user_type) => user_type.Type_Name === userType);
            setUserTypeId(selectedType ? selectedType.id : '');
        };
    
        if(userStatus){
            const selectedStatus = status && status.find((user_status) => user_status.User_Status_Name === userStatus);
            setUserStatusId(selectedStatus ? selectedStatus.id : '');
        };
    
        if(userSpecialty){
            const selectedSpecialty = specialty && specialty.find((user_specialty) => user_specialty.Specialty_name === userSpecialty);
            setUserSpecialtyId(selectedSpecialty ? selectedSpecialty.id : '');
        };
    },[userType, userStatus, userSpecialty, type, status, specialty]);

    const updateUser= async (id)=>{
        try{
            await Axios.put(`http://localhost:3001/api/updateUser/${id}`,
            {
                id: id, 
                Email,
                Password,
                FirstName,
                LastName,
                User_Status_id,
                User_Specialty_id,
                User_Type_id,
                userImage
            },
            {
                headers: {
                    "x-access-token": context.userToken,
                    'Content-Type': 'multipart/form-data',
                },
            }
            );
            updateUserInState({
                id: id,
                Email,
                Password,
                FirstName,
                LastName,
                User_Status_id,
                User_Specialty_id,
                User_Type_id,
                userImage
            });
        } catch(error){
            console.error('Error updating user:', error);
        }
    };

    const handleTypes = (e)=>{
        setUserType(e.target.value);
        const selectedType = type && type.find((user_type) => user_type.Type_Name === e.target.value);
        setUserTypeId(selectedType ? selectedType.id : '');
    };

    const handleStatus = (e)=>{
        setUserStatus(e.target.value);
        const selectedStatus = status && status.find((user_status) => user_status.User_Status_Name === e.target.value);
        setUserStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handleSpecialty = (e)=>{
        setUserSpecialty(e.target.value);
        const selectedSpecialty = specialty && specialty.find((user_specialty) => user_specialty.Specialty_name === e.target.value);
        setUserSpecialtyId(selectedSpecialty ? selectedSpecialty.id : '');
    };

    return (
        <Container maxWidth="sm">
        <Typography className='form-heading' variant="h5">მომხამრებლის მონაცემების ცვლილება</Typography>
        <form className='reg-form'>
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
                {/* დროებით დამალე ტიპი და პროფესია */}
                {/* es imistvis rom adminma ver shedzlos superadminis cvlileba tu tavad ar aris super admini */}
                {
                context.user && context.user.User_Type_id === 4 ? (
                    // Allow the user with User_Type_id 4 to select any item from the "type" list
                    <FormControl className='user-type' variant="outlined" fullWidth margin="normal">
                        <InputLabel className='input-label'>ტიპი</InputLabel>
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
                ) : context.user && context.user.User_Type_id === 2 ? (
                    // Restrict the user with User_Type_id 2 from making any changes in "type"
                    <FormControl className='user-type' variant="outlined" fullWidth margin="normal">
                        <InputLabel className='input-label'>ტიპი</InputLabel>
                        <Select
                            value={userType}
                            onChange={(e) => handleTypes(e)}
                            label="User Type"
                            disabled
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
                    // For other User_Type_id values, restrict from selecting item with id 4
                    <FormControl className='user-type' variant="outlined" fullWidth margin="normal">
                        <InputLabel className='input-label'>ტიპი</InputLabel>
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
                                type.filter(user_type => user_type.id !== 4).map((user_type) => (
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
                {/* {
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
                                type.filter(user_type => user_type.id !== 4) // Filter out user_type with id 4
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
                } */}
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
                    მომხმარებლის სტატუსი
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
                    <Button type="button" onClick={()=>{updateUser(user.id)}} variant="contained" color="primary">
                        განახლება
                    </Button>
                </div>
            </ThemeProvider>
        </form>
    </Container>
    )
}
