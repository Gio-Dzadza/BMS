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
import { useFetch } from '../../hooks/useFetch';


export default function SubServiceList({ subServicesList, setSubServicesUrl }) {
    const {data:services} = useFetch('http://localhost:3001/api/adminapi/get/services');
    const [tableName, setTableName] = useState(null);
    const [mainList, setMainList] = useState([]);
    const [showRegForm, setShowRegForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [subServiceForm, setSubServiceForm] = useState(true);

    const [selectedItem, setSelectedItem] = useState(null);

    const {data:status, deleteItem} = useListsDelete(mainList, setMainList);

    useEffect(() => {
        if (formSubmitted) {
            setSubServicesUrl('http://localhost:3001/api/adminapi/get/subservices?timestamp=' + Date.now());
            setFormSubmitted(false);
        };
    }, [formSubmitted]);

    useEffect(()=>{
        if(subServicesList){
            setTableName('subservices');
            setMainList(subServicesList);
        }
    },[subServicesList])
    
    const handleDelete = async (id) => {
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
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'name',
            headerName: 'ქვე-სერვისი',
            width: 200,
            sortable: false,
        },
        {
            field: 'service_id',
            headerName: 'სერვისი',
            renderCell: (params) => {
                const serviceId = params.row.service_id;
                const serviceName = services && services.find((typeitem) => typeitem.id === serviceId)?.Service_Name;
                return (
                <div>
                    {serviceName || ''}
                </div>
                );
            },
            sortable: false,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
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
        <h2>ქვე-სერვისები</h2>
        {selectedItem && (
            <ListsEditForm
            selectedItem={selectedItem}
            setMainList={setMainList}
            setSelectedItem={setSelectedItem}
            tableName={tableName}
            subServiceForm={subServiceForm}
            handleFormSubmit = {handleFormSubmit}
            />
        )}
        {showRegForm && (
            <ListsRegisterForm subServiceForm={subServiceForm} handleFormSubmit={handleFormSubmit} tableName={tableName} setShowRegForm={setShowRegForm}/>
        )}
        <ThemeProvider theme={theme}>
            <Button style={{marginBottom: '10px'}} onClick={() => setShowRegForm(!showRegForm)} variant='contained'>დაამატე</Button>
        </ThemeProvider>
        <DataGrid
        rows={mainList}
        columns={columns}
        pageSize={10}
        checkboxSelection={false}
        disableSelectionOnClick={true}
        />
    </div>
)
}
