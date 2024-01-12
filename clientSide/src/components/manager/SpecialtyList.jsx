import React, { useEffect, useState } from 'react';
import ListsEditForm from './ListsEditForm';
import { useListsDelete } from '../../hooks/useListsDelete';
import ListsRegisterForm from './ListsRegisterForm';
import { DataGrid } from '@mui/x-data-grid';
import '../../pages/manage/ListManager.css';
import {
    Button,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import theme from '../Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function SpecialtyList({ specialtyList, setSpecialtiesUrl }) {
    const [tableName, setTableName] = useState(null);
    const [mainList, setMainList] = useState([]);
    const [showRegForm, setShowRegForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);

    const {data:status, deleteItem} = useListsDelete(mainList, setMainList);

    useEffect(() => {
        if (formSubmitted) {
            setSpecialtiesUrl('http://localhost:3001/api/adminapi/get/specialties?timestamp=' + Date.now());
            setFormSubmitted(false);
        };
    }, [formSubmitted]);

    useEffect(()=>{
        if(specialtyList){
            setTableName('specialties');
            setMainList(specialtyList);
        }
    },[specialtyList])
    
    const handleDelete = async (id) => {
        // Call the delete function from the custom hook
        await deleteItem(id, tableName, mainList, setMainList);
    };

    const handleEdit = (status) => {
        setSelectedItem(status);
    };

    const handleFormSubmit = () => {
        setFormSubmitted(true);
        setShowRegForm(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID', hide: true },
        { field: 'Specialty_name', headerName: 'პროფესია', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEdit(params.row)} color="warning">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

return (
    <div className='table'>
        <h2>პროფესიები</h2>
        {
            selectedItem &&
            <ListsEditForm
            selectedItem = {selectedItem} 
            setMainList={setMainList}
            setSelectedItem = {setSelectedItem}
            tableName = {tableName}
            handleFormSubmit = {handleFormSubmit}
            />
        }
        {
            showRegForm && (
                <ListsRegisterForm handleFormSubmit = {handleFormSubmit} tableName = {tableName} setShowRegForm={setShowRegForm}/>
            )
        }
        <ThemeProvider theme={theme}>
            <Button style={{marginBottom: '10px'}} onClick={() => setShowRegForm(!showRegForm)} variant='contained'>დაამატე</Button>
        </ThemeProvider>
        <DataGrid
            rows={mainList}
            columns={columns}
            pageSize={10}
            autoHeight
            rowHeight={40}
        />
    </div>
)
}
