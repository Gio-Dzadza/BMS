import React, { useEffect, useState } from 'react'
import Axios from 'axios';
import ClientEditForm from './ClientEditForm';
import { useAuthContext } from '../hooks/useAuthContext';
import { Link } from 'react-router-dom';

//datepicker
import 'react-datepicker/dist/react-datepicker.css';

//export
import * as XLSX from 'xlsx';

//mui
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomToolbar from './CustomToolbar';

//styles
import './ClientsList.css'
import ClientImg from '../assets/icons/client.png';
import '../pages/ListsParentStyles.css';


export default function ClientsList({ updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const [selectedClient, setSelectedClient] = useState(null);
    const [clientsList, setClientsList] = useState([]);

    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();

    //for search
    const [searchTerm, setSearchTerm] = useState('');
    const [searchByName, setSearchByName] = useState('');
    const [searchByEmail, setSearchByEmail] = useState('');
    const [searchByIdNumber, setSearchByIdNumber] = useState('');
    const [searchByPhoneNumber, setSearchByPhoneNumber] = useState('');

    //date pick
    const [createDateFilter, setCreateDateFilter] = useState({ start: null, end: null });

    //for counts
    const [filteredClientCount, setFilteredClientCount] = useState(0);

    //mui
    const [muiFilteredUserCount, setMuiFilteredUserCount] = useState(0);


    const exportToExcel = () => {
        const dataToExport = clientsList.map((client) => [
            client.Client_FirstName + ' ' + client.Client_LastName,
            client.Email, client.ID_Number, client.Phone_Number,
            formatDate(client.Created_At ? client.Created_At : ''),
        ]);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['სრული სახელი', 'Email', 'პირადი ნომერი', 'ტელეფონის ნომერი', 'შექმნილია'],
            ...dataToExport,
        ]);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clients.xlsx';
        a.click();

        URL.revokeObjectURL(url);
        a.remove();
    };


    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get(
                'http://localhost:3001/api/clapi/get/clients',
                {
                    ...signal,
                    headers: {
                        "x-access-token": context.userToken,
                    },
                }
                ).then((response)=>{
                    if(!response.data.auth){
                        setAuthenticated(true);
                    } else{
                        setClientsList(response.data.result);
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
            await Axios.delete(`http://localhost:3001/api/clapi/clients/delete/${id}`, {
                headers: {
                    "x-access-token": context.userToken,
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
                    const updatedClients = clientsList.filter((client)=> client.id !== id);
                    setClientsList(updatedClients);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };
    

    const handleEdit = (client) => {
        setSelectedClient(client);
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


    useEffect(() => {
        if (clientsList) {
        const filteredClients = clientsList.filter((client) => {
            const clientIdString = client.ID_Number.toString();
    
            const mainSearchFilter =
            searchTerm === "" ||
            client.Client_FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clientIdString.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.Phone_Number.toLowerCase().includes(searchTerm.toLowerCase());
    
            const fullNameFilterMatch = client.Client_FirstName.toLowerCase().includes(searchByName.toLowerCase());
            const emailFilterMatch = client.Email.toLowerCase().includes(searchByEmail.toLowerCase());
            const idFilterMatch = clientIdString.toLowerCase().includes(searchByIdNumber.toLowerCase());
            const phoneFilterMatch = client.Phone_Number.toLowerCase().includes(searchByPhoneNumber.toLowerCase());
            const createDateFilterMatch =
            (createDateFilter.start === null || new Date(client.Created_At) >= createDateFilter.start) &&
            (createDateFilter.end === null || new Date(client.Created_At) <= createDateFilter.end);
    
            return (
                mainSearchFilter &&
                fullNameFilterMatch &&
                emailFilterMatch &&
                idFilterMatch &&
                phoneFilterMatch &&
                createDateFilterMatch
            );
        });
    
        setFilteredClientCount(filteredClients.length);
        }
    }, [clientsList, 
        searchTerm, 
        searchByName, 
        searchByEmail, 
        createDateFilter, 
    ]);
    

    const columns = [
        {
            field: 'Client_Image',
            headerName: 'ფოტო',
            headerClassName: 'column-headers', 
            flex: 1,
            renderCell: (params) => (
                params.row.Client_Image ? (
                    <div className='client-image-container'>
                        <img
                            src={`http://localhost:3001/uploads/clients/${params.row.id}/${encodeURIComponent(params.row.Client_Image.trim())}`}
                            alt="Client Image"
                            className='client-image'
                        />
                    </div>
                ) : 
                <div className='client-image-container'>
                <img
                    src={ClientImg}
                    alt="User Image"
                    className='client-image'
                />
                </div>
            ),
        },
        { 
            field: 'Client_FirstName', 
            headerName: 'სახელი', 
            headerClassName: 'column-headers',
            flex: 1, 
            filterable: true, 
            filterValue: searchByName, 
            renderCell: (params) => {
                const client = params.row
                return <Link to={`/projects/${client.id}`} style={{textDecoration: 'none', color: 'black'}}>
                    {params.row.Client_FirstName} {params.row.Client_LastName}
                </Link>
            },
        },
        { field: 'Email', headerName: 'Email', headerClassName: 'column-headers', flex: 1,},
        { field: 'ID_Number', headerName: 'პირადი ნომერი', headerClassName: 'column-headers', flex: 1, },
        { field: 'Phone_Number', headerName: 'ტელეფონის ნომერი', headerClassName: 'column-headers', flex: 1, },
        { field: 'Created_At', headerName: 'შექმნილია', headerClassName: 'column-headers', flex: 1, valueGetter: (params) => formatDate(params.row.Created_At ? params.row.Created_At : '') },
        {
            field: 'actions',
            headerName: 'Actions',
            headerClassName: 'column-headers', 
            flex: 1,
            renderCell: (params) => (
                <div className='actions-container'>
                    <IconButton className='client-action-btns' onClick={() => handleEdit(params.row)} color="warning">
                        <EditIcon />
                    </IconButton>
                    <IconButton className='client-action-btns' onClick={() => handleDelete(params.row.id)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    const filteredRows = clientsList && clientsList.filter((client) => {
        const clientNameLowerCase = client.Client_FirstName.toLowerCase();
        const searchByNameLowerCase = searchByName.toLowerCase();
        
        return clientNameLowerCase.includes(searchByNameLowerCase);
    });

return (
    <div className='list'>
        {isPending && <div>Loading clients...</div>}
        {error && <div>{error}</div>}
        {
            selectedClient && (
                <div className={ selectedClient ? 'modal-window-show' : 'modal-window' }>
                    <ClientEditForm
                    client = {selectedClient} 
                    setClientsList={setClientsList}
                    setSelectedClient = {setSelectedClient}
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
        {
            !authenticated && (
                <>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        pageSize={10}
                        autoHeight
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
                        sx={{
                            boxShadow: 2,
                            border: 2,
                            borderColor: '#d5d5d5',
                            '& .MuiDataGrid-cell:hover': {
                                color: '#fda41c',
                            },
                        }}
                    />
                    <div className='counter-export'>
                        {filteredRows && <h5 className='client-counter'>კლიენტები: {muiFilteredUserCount}</h5>}
                        <Button onClick={exportToExcel} className='exportXLSX-btn'>Excel</Button>
                    </div>
                </>
            )
        }
    </div>
)
}
