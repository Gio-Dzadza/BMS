import React, { useEffect, useState } from 'react'
import Axios from 'axios';
import EditForm from './EditForm';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import { Link } from 'react-router-dom';

//mui
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomToolbar from './CustomToolbar';

//datepicker
import 'react-datepicker/dist/react-datepicker.css';

//export
import * as XLSX from 'xlsx';

//image
import UserImg from '../assets/icons/user.png';

//style
import './UsersList.css'
import '../pages/ListsParentStyles.css';


export default function UsersList({ updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const {data:type} = useFetch('http://localhost:3001/api/get/type');
    const {data:specialty} = useFetch('http://localhost:3001/api/get/specialty');
    const {data:status} = useFetch('http://localhost:3001/api/get/status');

    //for user's data
    const [selectedUser, setSelectedUser] = useState(null);
    const [usersList, setUsersList] = useState([]);

    //states for props
    const [types, setTypes] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [statuses, setStatuses] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();
    
    //mui
    const [fullNameFilter, setFullNameFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [specialtyNames, setSpecialtyNames] = useState([]);
    const [typesNames, setTypesNames] = useState([]);
    const [statusNames, setStatusNames] = useState([]);
    const [muiFilteredUserCount, setMuiFilteredUserCount] = useState(0);
    const [pgSize, setPgSize] = useState(5);

    
    // Function to export data to Excel
    const exportToExcel = () => {
    // Convert the user data into an array of arrays
        const dataToExport = usersList.map((user) => [
            user.FirstName + ' ' + user.LastName,
            user.Email,
            specialty.find((specitem) => specitem.id === user.User_Specialty_id)?.Specialty_name || '',
            type.find((typeitem) => typeitem.id === user.User_Type_id)?.Type_Name || '',
            status.find((statitem) => statitem.id === user.User_Status_id)?.User_Status_Name || '',
            formatDate(user.Created_at ? user.Created_at : ''),
            user.Status_Changed_at ? formatDate(user.Status_Changed_at) : 'სტატუსი არ შეცვლილა',
        ]);

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['სრული სახელი', 'Email', 'სპეციალობა', 'მომხმარებლის ტიპი', 'მომხმარებლის სტატუსი', 'შექმნილია', 'სტატუსი ცვლილება'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };


    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get(
                'http://localhost:3001/api/get',
                {
                    ...signal,
                    headers: {
                        "x-access-token": context.userToken, // Include the token in the headers
                    },
                }
                ).then((response)=>{
                    if(!response.data.auth){
                        setAuthenticated(true);
                    } else{
                        setUsersList(response.data.result);
                        setAuthenticated(false);
                        setIsPending(false);
                        setError(null);
                    }
                });
                return response;
        } catch (error) {
            console.error('Error fetching list:', error);
            setIsPending(false);
            setError("Couldn't fetch the data from users");
        }
    };

    useEffect(()=>{
        const controller = new AbortController();
        if(updateList){
            const signal = { signal: controller.signal }
            fetchData(signal);
            setUpdateList(false);
        } else {
            fetchData();
        };
        return ()=>{
            controller.abort();
        }
    },[context, updateList, setUpdateList]);

    const handleDelete = async(id)=>{
        try {
            // Delete user from the API
            const response = await Axios.delete(`http://localhost:3001/api/delete/${id}`, {
                headers: {
                    "x-access-token": context.userToken, // Include the token in the headers
                },
            }).then((response)=>{
                console.log(response);
                if(response.data.auth){
                    console.log(id + ' ' + response.data);
                } else{
                    console.log(id + ' ' + response.data.message);
                    setAuthenticated(true);
                };
                if(response.data.deleted){
                    console.log(id + ' ' + response.data.message);
                    // Update the UI
                    const updatedUsers = usersList.filter((user)=> user.id !== id);
                    setUsersList(updatedUsers);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setTypes(type);
        setSpecialties(specialty);
        setStatuses(status);
    };

    const formatDate = (dateString) => {
        const options = { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        const formattedDate = new Date(dateString).toLocaleString('en-GB', options);
        return formattedDate;
    };

    useEffect(()=>{
        const specialtyName = specialty && specialty.map((specitem) => specitem.Specialty_name);
        setSpecialtyNames(specialtyName);
        const statusName = status && status.map((statitem) => statitem.User_Status_Name);
        setStatusNames(statusName);
        const typeName = type && type.map((typeitem) => typeitem.Type_Name);
        setTypesNames(typeName);
    },[specialty, status, type]);

    
    const columns = [
        {
            field: 'Image',
            headerName: 'ფოტო',
            flex: 1,
            headerClassName: 'column-headers',
            renderCell: (params) => (
                params.row.User_Image ? (
                    <div className='user-image-container'>
                    <img
                        src={`http://localhost:3001/uploads/users/${params.row.id}/${encodeURIComponent(params.row.User_Image.trim())}`}
                        alt="User Image"
                        className='user-image'
                    />
                    </div>
                ) : 
                <div className='user-image-container'>
                    <img
                        src={UserImg}
                        alt="User Image"
                        className='user-image'
                    />
                </div>
            ),
        }, 
        {
            field: 'LastName',
            headerName: 'სახელი გვარი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            renderCell: (params) => {
                const user = params.row;
                return (
                    <Link to={`/userProjects/${user.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                        {params.row.FirstName + ' ' + params.row.LastName}
                    </Link>
                );
            },
        },
        {
            field: 'Email',
            headerName: 'Email',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, // Enable filtering for this column
            filterValue: emailFilter, // Use the filter state for this column
        },
        {
            field: 'Specialty',
            headerName: 'სპეციალობა',
            flex: 1,
            headerClassName: 'column-headers',
            visible: true,
            type: 'singleSelect',
            valueOptions: specialtyNames,
            filterValue: specialtyNames,
            filterable: true,
            valueGetter: (params) => {
            const specialtyName = specialty && specialty.find(
                (specitem) => specitem.id === params.row.User_Specialty_id
            );
            return specialtyName ? specialtyName.Specialty_name : '';
            },
        },
        {
            field: 'Type',
            headerName: 'ტიპი',
            flex: 1,
            headerClassName: 'column-headers',
            type: 'singleSelect',
            valueOptions: typesNames,
            valueGetter: (params) => {
            const typeName = type && type.find(
                (typeitem) => typeitem.id === params.row.User_Type_id
            );
            return typeName ? typeName.Type_Name : '';
            },
            visible: false,
        },
        {
            field: 'Status',
            headerName: 'სტატუსი',
            flex: 1,
            headerClassName: 'column-headers',
            type: 'singleSelect',
            valueOptions: statusNames,
            valueGetter: (params) => {
            const statusName = status && status.find(
                (statitem) => statitem.id === params.row.User_Status_id
            );
            return statusName ? statusName.User_Status_Name : '';
            },
            visible: false,
        },
        {
            field: 'Created_at',
            headerName: 'შექმნილია',
            flex: 1,
            headerClassName: 'column-headers',
            type: 'date',
            valueGetter: (params) => {
                return params.row.Created_at ? new Date(params.row.Created_at) : null;
            },
            valueFormatter: (params) => {
                const dateValue = params.value; // The value returned by the valueGetter
                if (dateValue) {
                    const day = dateValue.getDate().toString().padStart(2, '0');
                    const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
                    const year = dateValue.getFullYear();
                    return `${day}/${month}/${year}`;
                }
                return '';
            },
        },
        {
            field: 'Status_Changed_at',
            headerName: 'სტატუსის ცვლილება',
            flex: 1,
            headerClassName: 'column-headers',
            visible: false,
            type: 'date',
            valueGetter: (params) => {
                return params.row.Status_Changed_at !== 'სტატუსი არ შეცვლილა' && params.row.Status_Changed_at
                ? new Date(params.row.Status_Changed_at)
                : null;
            },
            valueFormatter: (params) => {
              const dateValue = params.value; // The value returned by the valueGetter
                if (dateValue instanceof Date) {
                    const day = dateValue.getDate().toString().padStart(2, '0');
                    const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
                    const year = dateValue.getFullYear();
                    return `${day}/${month}/${year}`;
                }
                return dateValue || 'სტატუსი არ შეცვლილა';
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.5,
            headerClassName: 'column-headers',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <div className='actions-container'>
                    <IconButton onClick={() => handleEdit(params.row)} color='blue' >
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color='blue' style={{ opacity: 0.3 }}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];
    

    const filteredRows = usersList && usersList.filter((user) => {
        const specialtyName = specialty && specialty.find((specitem) => specitem.id === user.User_Specialty_id)?.Specialty_name;
        const typeName = type && type.find((typeitem) => typeitem.id === user.User_Type_id)?.Type_Name;
        const statusName = status && status.find((statitem) => statitem.id === user.User_Status_id)?.User_Status_Name;
        return (
            user.FirstName.toLowerCase().includes(fullNameFilter.toLowerCase()) ||
            user.LastName.toLowerCase().includes(fullNameFilter.toLowerCase()) &&
            user.Email.toLowerCase().includes(emailFilter.toLowerCase()) &&
            (specialtyName && specialtyName.toLowerCase().includes(specialtyNames.toLowerCase())) &&    
            (typeName && typeName.toLowerCase().includes(typesNames.toLowerCase())) &&
            (statusName && statusName.toLowerCase().includes(statusNames.toLowerCase()))
        );
    });


return (
    <div className='list'>
        {isPending && <div>Loading users...</div>}
        {error && <div>{error}</div>}
        {
            selectedUser && (
                <div className={ selectedUser ? 'modal-window-show' : 'modal-window' }>
                    <EditForm 
                    user = {selectedUser} 
                    setUsersList={setUsersList}
                    setSelectedUser = {setSelectedUser}
                    type = {types}
                    status = {statuses}
                    specialty = {specialties}
                    setUpdateList = {setUpdateList}
                    />
                </div>
            )
        }
        {
            authenticated && (
                <div>
                    <h1>You are not permittied You need authentication</h1>
                </div>
            )
        }
        {!authenticated && (
            <>
                <DataGrid
                    sx={{
                        boxShadow: 2,
                        border: 2,
                        borderColor: '#d5d5d5',
                        '& .MuiDataGrid-cell:hover': {
                            color: '#fda41c',
                        },
                    }}
                    rows={filteredRows}
                    columns={columns}
                    autoHeight
                    rowsPerPageOptions = {[5,10,20]}
                    pageSize={pgSize}
                    onPageSizeChange={(newPageSize)=> setPgSize(newPageSize)}
                    pagination
                    localeText={{
                        toolbarDensity: 'რიგების ზომა',
                        toolbarDensityComfortable: 'კომფორტული',
                        toolbarDensityCompact: 'კომპაქტური',
                        toolbarDensityStandard: 'სტანდარტული',
                        
                        toolbarExport: 'ექსპორტი',
                        toolbarExportPrint: 'ამობეჭდვა',
                        toolbarExportCSV: 'CSV ფორმატი',

                        toolbarFilters: 'ფილტრები',
                        filterPanelOperator: 'ფილტრი',
                        filterPanelOperatorAnd: 'And',
                        filterPanelOperatorOr: 'Or',
                        filterPanelColumns: 'სვეტები',
                        filterPanelInputLabel: 'მიშვნელობა',
                        filterPanelInputPlaceholder: 'ჩაწერე',
                        filterOperatorContains: 'შეიცავს',
                        filterOperatorEquals: 'უდრის',
                        filterOperatorStartsWith: 'იწყება',
                        filterOperatorEndsWith: 'მთავრდება',
                        filterOperatorIsEmpty: 'ცარიელია',
                        filterOperatorIsNotEmpty: 'არ არის ცარიელი',
                        filterOperatorIsAnyOf: 'რომელიმეს შეიცავს',

                        toolbarColumns: 'სვეტები',
                        columnsPanelTextFieldLabel: 'სვეტის ძიება',
                        columnsPanelShowAllButton: 'აჩვენე ყველა',
                        columnsPanelHideAllButton: 'დამალე ყველა',
                        columnsPanelTextFieldPlaceholder: 'სვეტის სახელი',

                        toolbarQuickFilterPlaceholder: 'ძიება',

                        columnMenuLabel: 'Menu',
                        columnMenuShowColumns: 'აჩვენე სვეტი',
                        columnMenuManageColumns: 'სვეტების მართვა',
                        columnMenuFilter: 'ფილტრი',
                        columnMenuHideColumn: 'დამალე სვეტი',
                        columnMenuUnsort: 'Unsort',
                        columnMenuSortAsc: 'დაალაგე ზრდადობის მიხედვით',
                        columnMenuSortDesc: 'დაალაგე კლებადობის მიხედვით',
                    }}   
                    components={{
                        Toolbar:  CustomToolbar,
                    }}
                    onStateChange={(e) => {
                        setMuiFilteredUserCount(e.rowsMeta.positions.length)
                    }}
                    />
                <div className='counter-export'>
                    {filteredRows && <h5 className='user-counter'>მომხმარებლები: {muiFilteredUserCount}</h5>}
                    <Button onClick={exportToExcel} className='exportXLSX-btn'>
                        Excel
                    </Button>
                </div>
            </>
        )}
    </div>
)
}
