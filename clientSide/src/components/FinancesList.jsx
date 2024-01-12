import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';

//datepicker
import 'react-datepicker/dist/react-datepicker.css';

//export
import * as XLSX from 'xlsx';
import ProjectInfo from './ProjectInfo';

//mui
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import CustomToolbar from './CustomToolbar';

//style
import './ProjectsList.css'
import '../pages/ListsParentStyles.css';


export default function FinancesList({ updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const {data:type} = useFetch('http://localhost:3001/api/projapi/get/projectType');
    const {data:status} = useFetch('http://localhost:3001/api/projapi/get/projectStatus');
    const {data:payStatus} = useFetch('http://localhost:3001/api/projapi/get/payStatus');
    const {data:currency} = useFetch('http://localhost:3001/api/projapi/get/projectCurrency');
    const {data:clients} = useFetch('http://localhost:3001/api/projapi/get/projectClients');
    const {data:users} = useFetch('http://localhost:3001/api/projapi/get/projectUsers');

    //for project's data
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectsList, setProjectsList] = useState([]);

    //states for props
    const [types, setTypes] = useState([]);
    const [clientState, setClientState] = useState([]);
    const [userState, setUserState] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [payStatuses, setPayStatuses] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();

    //for search
    const [searchByName, setSearchByName] = useState('');
    const [projectStatusFilter, setProjectStatusFilter] = useState('');
    const [payStatusFilter, setPayStatusFilter] = useState('');
    const [currencyFilter, setCurrencyFilter] = useState('');

    //project info page
    const [projectToShow, setProjectToShow] = useState(null);

    //mui
    const [muiFilteredProjectCount, setMuiFilteredProjectCount] = useState(0);



    // Function to export data to Excel
    const exportToExcel = () => {
    // Convert the project data into an array of arrays
        const dataToExport = projectsList.map((project) => [
            project.Project_Name,
            project.Project_Code,
            status.find((statitem) => statitem.id === project.Project_Status_ID)?.Project_Status_Name || '',
            clients.find((client) => client.id === project.Client_Id)?.Client_FirstName + ' ' 
            + clients.find((client) => client.id === project.Client_Id)?.Client_LastName || '',
            project.Project_Price ? project.Project_Price : 'არ არის დადგენილი',
            payStatus.find((payitem) => payitem.id === project.Pay_Status_ID)?.pay_status_name || '',
            project.Paid_Amount,
            currency.find((currencyitem) => currencyitem.id === project.Currency_ID)?.Currency_Name || '',
            project.Currency_Rate,
            formatDate(project.Created_At ? project.Created_At : '')
        ]);

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['პროექტის სახელი', 'საკადასტრო კოდი', 'პროექტის სტატუსი', 'კლიენტის სახელი', 'პროექტის ფასი', 'გადახდის სტატუსი', 'გადახდილი თანხა', 'ვალუტა', 'ვალუტის კურსი', 'პროექტი შექმნილია'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Finances');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'finances.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };

    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get('http://localhost:3001/api/projapi/get/projects',
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
                        setProjectsList(response.data.result);
                        setAuthenticated(false);
                        setIsPending(false);
                        setError(null);
                    }
                });
                return response;
        } catch (error) {
            console.error('Error fetching list:', error);
            setIsPending(false);
            setError("Couldn't fetch the data from projects");
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

    const handleShowInfo = (project) => {
        setProjectToShow(project);
        setTypes(type);
        setClientState(clients);
        setUserState(users);
        setStatuses(status);
        setPayStatuses(payStatus);
        setCurrencies(currency);
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

    function checkExpiration(date) {
        return date < new Date(); // Compare Date objects directly
    };

    function checkMayorExpiration(date) {
        return date < new Date(); // Compare Date objects directly
    };

    const getRowClassName = (params) => {
        const project = params.row;
        const deadlines = project.servicesToProjects?.map((stp) => stp.deadLine); // Add a null check using the ?. operator
        const mayorDeadlines = project.servicesToProjects?.map((stp) => stp.mayorDeadLine); // Add a null check using the ?. operator
        const projectStatus = project.Project_Status_ID;
    
        if (projectStatus === 1) {
            if (mayorDeadlines?.some((mayorDeadline) => mayorDeadline !== null)) { // Add a null check using the ?. operator
                const modifiedDeadlines = mayorDeadlines.map((item) =>
                    item !== null ? new Date(item) : null
                );
                const hasExpired = modifiedDeadlines.some(checkMayorExpiration);
    
                if (hasExpired) {
                    return 'expired-mayor-row'; // Apply a CSS class for expired projects
                } else {
                    // Check for deadlines that are 5 days close to expiration
                    const today = new Date();
                    const fiveDaysFromNow = new Date();
                    fiveDaysFromNow.setDate(today.getDate() + 5);
    
                    const isCloseToExpiration = modifiedDeadlines.some((deadline) => {
                        return deadline !== null && deadline <= fiveDaysFromNow;
                    });
    
                    if (isCloseToExpiration) {
                        return 'close-to-expired-mayor-row';
                    }
                }
            }
            if (deadlines?.some((deadline) => deadline !== null)) { // Add a null check using the ?. operator
                const modifiedDeadlines = deadlines.map((item) =>
                    item !== null ? new Date(item) : null
                );
                const hasExpired = modifiedDeadlines.some(checkExpiration);
    
                if (hasExpired) {
                    return 'expired-row'; // Apply a CSS class for expired projects
                }
            }
        } else if (projectStatus === 2) {
            return 'completed-row';
        }
    
        return '';
    };
    

    const columns = [
        {
            field: 'Project_Name',
            headerName: 'პროექტი',
            flex: 1,
            hide:true,
            headerClassName: 'column-headers',
            filterable: false, // Enable filtering for this column
            filterValue: searchByName, // Use the filter state for this column,
            renderCell: (params) => {
                const project = params.row;
                return <div 
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }} 
                        onClick={() => handleShowInfo(project)}>
                            {params.value}
                        </div>;
            },
        },
        {
            field: 'Project_Code',
            headerName: 'საკ. კოდი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, // Enable filtering for this column
            filterValue: searchByName, // Use the filter state for this column,
            renderCell: (params) => {
                const project = params.row;
                return <div 
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }} 
                        onDoubleClick={() => handleShowInfo(project)}>
                            {params.value}
                        </div>;
            },
        },
        {
            field: 'Project_Status_ID',
            headerName: 'სტატუსი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: status && status.map((statitem) => ({
                value: statitem.id,
                label: statitem.Project_Status_Name,
            })),
            filterValue: projectStatusFilter, // Use a state variable to manage the filter value
            onFilterChange: (event) => setProjectStatusFilter(event.target.value), // Update the filter value
            renderCell: (params) => {
                const statusId = params.row.Project_Status_ID;
                const statusName = status && status.find((statitem) => statitem.id === statusId)?.Project_Status_Name;
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {statusName || ''}
                </div>
                );
            },
        },
        {
            field: 'Client_Id',
            headerName: 'კლიენტი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            valueGetter: (params) => {
                const clientId = params.row.Client_Id;
                const client = clients && clients.find((client) => client.id === clientId);
                return client ? `${client.Client_FirstName} ${client.Client_LastName}` : '';
            },
            renderCell: (params) => {
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {params.value}
                </div>
                );
            },
        },
        {
            field: 'priceOfProject', // Use a unique field name 
            headerName: 'ღირებულება',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            valueGetter: (params) => {
                const project = params.row;
                const priceOfProject = project.Project_Price === '' ? 'NaN' : project.Project_Price;
                return priceOfProject;
            },
            renderCell: (params) => {
                return <div>{params.value}</div>;
            },
        },
        {
            field: 'Pay_Status_ID',
            headerName: 'გადახდა',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: payStatus && payStatus.map((payitem) => ({
                value: payitem.id,
                label: payitem.pay_status_name,
            })),
            filterValue: payStatusFilter, // Use a state variable to manage the filter value
            onFilterChange: (event) => setPayStatusFilter(event.target.value), // Update the filter value
            renderCell: (params) => {
                const payStatusId = params.row.Pay_Status_ID;
                const payStatusName = payStatus && payStatus.find((payitem) => payitem.id === payStatusId)?.pay_status_name;
                return (
                    <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {payStatusName || ''}
                    </div>
                );
            },
        },
        {
            field: 'paidAmount',
            headerName: 'გადახდილია',
            flex: 1,
            headerClassName: 'column-headers',
            valueGetter: (params) => {
                const project = params.row;
                const paidAmount = project.Paid_Amount === '' ? 'NaN' : project.Paid_Amount;
                return paidAmount;
            },
            renderCell: (params) => {
                return (
                    <div style={{ display: 'flex', flexWrap: 'nowrap' }}>{params.value}</div>
                );
            },
        },
        {
            field: 'Currency_ID',
            headerName: 'ვალუტა',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: currency && currency.map((currencyitem) => ({
                value: currencyitem.id,
                label: currencyitem.Currency_Name,
            })),
            filterValue: currencyFilter, // Use a state variable to manage the filter value
            onFilterChange: (event) => setCurrencyFilter(event.target.value), // Update the filter value
            renderCell: (params) => {
                const currencyId = params.row.Currency_ID;
                const currencyName = currency && currency.find((currencyitem) => currencyitem.id === currencyId)?.Currency_Name;
                const displayValue = currencyName === undefined ? 'NaN' : currencyName;
                return <div>{displayValue}</div>;
            },
        },
        {
            field: 'currencyRate',
            headerName: 'კურსი',
            flex: 1,
            headerClassName: 'column-headers',
            valueGetter: (params) => {
                const project = params.row;
                const currencyRate = project.Currency_Rate === '' ? 'NaN' : project.Currency_Rate;
                return currencyRate;
            },
            renderCell: (params) => {
                return <div>{params.value}</div>;
            },
        },
        {
            field: 'Created_At',
            headerName: 'შექმნილია',
            flex: 1,
            headerClassName: 'column-headers',
            // You can add a valueGetter function to format the date
            valueGetter: (params) => {
            const createdAt = params.row.Created_At;
            return formatDate(createdAt || '');
            },
        },
    ];
    

    const filteredProjects = projectsList && projectsList.filter((project) => {
        const projectNameLowerCase = project.Project_Name.toLowerCase();
        const searchByNameLowerCase = searchByName.toLowerCase();
        
        return projectNameLowerCase.includes(searchByNameLowerCase);
    });

return (
    <div className='list'>
        {isPending && <div>Loading projects...</div>}
        {error && <div>{error}</div>}
        {
            projectToShow && (
                <div className={ projectToShow ? 'modal-window-show' : 'modal-window' }>
                    <ProjectInfo 
                    project = {projectToShow} 
                    setProjectsList={setProjectsList}
                    setSelectedProject = {setSelectedProject}
                    type = {types}
                    status = {statuses}
                    payStatuses = {payStatuses}
                    currencies = {currencies}
                    userState = {userState}
                    clientState = {clientState}
                    setProjectToShow = {setProjectToShow}
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
            !authenticated &&(
                <>
                        <div style={{ height: '600px', width: '100%' }}>
                        <DataGrid
                            sx={{
                                boxShadow: 2,
                                border: 2,
                                borderColor: '#d5d5d5',
                                '& .MuiDataGrid-cell:hover': {
                                    color: '#d08513',
                                },
                            }}
                            getRowClassName={getRowClassName}
                            rows={filteredProjects}
                            columns={columns}
                            pageSize={10}
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
                                setMuiFilteredProjectCount(e.rowsMeta.positions.length)
                            }}
                            // Add sorting and pagination props as needed
                        />
                        </div>
                    <div className='counter-export'>
                        {filteredProjects && <h5 className='project-counter'>პროექტები: {muiFilteredProjectCount}</h5>}
                        <Button onClick={exportToExcel} className='exportXLSX-btn'>Excel</Button>
                    </div>
                </>
            )
        }
    </div>
)
}
