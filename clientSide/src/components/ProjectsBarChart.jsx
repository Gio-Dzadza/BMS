import React from 'react';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from 'chart.js';
import {
    Button,
} from '@mui/material';

import '../pages/blank/Blank.css';

import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ProjByUsersAndStatChart from './ProjByUsersAndStatChart';
import ProjByUsersAndServStatChart from './ProjByUsersAndServStatChart';
import ProjByUsersAndMayorServStatChart from './ProjByUsersAndMayorServStatChart';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
)


export default function ProjectsBarChart({projectsData, statusProps, 
    typeProps, clientProps, userProps, userStatusProps, monthProps, 
    monthStatProps, yearProps, serviceStatusProps, payStatusProps, costAndPaidProps, serviceMayorStatusProps, statuses, types, 
    clients, users, payStatuses}) {

    //By cost and paid bar
    //logic
    const projectNames = projectsData.map((project)=> project.Project_Name);
    const projectPrices = projectsData.map((project)=> project.Project_Price);
    const paidAmounts = projectsData.map((project)=> project.Paid_Amount);

    //export to excel status bar
    const exportCostAndPaidToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['პროექტი', 'პროექტის ღირებულება', 'გადახდილი თანხა'],
            ...projectNames.map((name, index) => [name, projectPrices[index], paidAmounts[index]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'CostAndPaidStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'Project_By_Cost_And_Paid_Stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    //data
    const costAndPaidData = {
        labels: projectNames,
        datasets: [
            {
                label: 'ღირებულება',
                data: projectPrices,
                backgroundColor: ['aqua', 'green', 'yellow'],
                borderColor: 'black',
                borderWidth: 1,
            },
            {
                label: 'გადახდილი',
                data: paidAmounts,
                backgroundColor: 'red', // You can customize the colors
                borderColor: 'black',
                borderWidth: 1,
            },
        ]
    };

    //By pay Status bar
    //logic
    const payStatus = payStatuses && payStatuses.map((st)=>st.pay_status_name);
    const payStatusCounts = payStatuses && payStatuses.map((st)=>{
        const count = projectsData.filter((project)=> project.Pay_Status_ID === st.id).length;
        return count;
    });

    //export to excel status bar
    const exportPayStatusesToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['სტატუსი', 'პროექტების რაოდენობა'],
            ...payStatuses.map((st, index) => [st.pay_status_name, payStatusCounts[index]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'PayStatusStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'Project_By_Pay_Status_Stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    //data
    const payStatusesData = {
        labels: payStatus,
        datasets: [
            {
                label: 'აქტიური',
                data: payStatusCounts,
                backgroundColor: ['aqua', 'green', 'yellow'],
                borderColor: 'black',
                borderWidth: 1,
            }
        ]
    };

    //By Status bar
    //logic
    const status = statuses && statuses.map((st)=>st.Project_Status_Name);
    const statusCounts = statuses && statuses.map((st)=>{
        const count = projectsData.filter((project)=> project.Project_Status_ID === st.id).length;
        return count;
    });

    //export to excel status bar
    const exportStatusesToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['სტატუსი', 'პროექტების რაოდენობა'],
            ...statuses.map((st, index) => [st.Project_Status_Name, statusCounts[index]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'ProjectStatusStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'Project_By_Status_Stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    //data
    const statusesData = {
        labels: status,
        datasets: [
            {
                label: 'აქტიური',
                data: statusCounts,
                backgroundColor: ['aqua', 'green'],
                borderColor: 'black',
                borderWidth: 1,
            }
        ]
    };

    //By Type bar
    //logic
    const type = types && types.map((tpItem)=>tpItem.Project_Type_Name);
    const typeCounts = types && types.map((tpItem)=>{
        const count = projectsData.filter((project)=> project.Project_Type_ID === tpItem.id).length;
        return count;
    });

    //export to excel types bar
    const exportTypesToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['ტიპი', 'პროექტების რაოდენობა'],
            ...types.map((tpItem, index) => [tpItem.Project_Type_Name, typeCounts[index]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'ProjectTypeStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'Project_By_Type_Stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    //data
    const typesData = {
        labels: type,
        datasets: [
            {
                label: 'რაოდენობა',
                data: typeCounts,
                backgroundColor: ['aqua', 'green', 'purple', 'yellow'],
                borderColor: 'black',
                borderWidth: 1,
            }
        ]
    };

    //By Clients bar
    //logic
    const client = clients && clients.map((clItem)=>clItem.Client_FirstName + ' ' + clItem.Client_LastName);
    const clientCounts = clients && clients.map((clItem)=>{
        const count = projectsData.filter((project)=> project.Client_Id === clItem.id).length;
        return count;
    });

    //export to excel clients bar
    const exportClientsToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['კლიენტის სახელი და გვარი', 'პროექტების რაოდენობა'],
            ...clients.map((clItem, index) => [clItem.Client_FirstName + ' ' + clItem.Client_LastName, clientCounts[index]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'ProjectClientsStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'Project_By_Clients_Stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    //data
    const clientsData = {
        labels: client,
        datasets: [
                {
                    label: 'რაოდენობა',
                    data: clientCounts,
                    backgroundColor: ['aqua', 'green'],
                    borderColor: 'black',
                    borderWidth: 1,
                }
        ]
    };

    //By Users bar
    //logic
    const user = users && users.map((usItem)=>usItem.FirstName + ' ' + usItem.LastName);
    const userCounts = users && users.map((usItem)=>{
        const assignedUsersArray = projectsData.map((project)=> project.assignedUsers);
        const allAssignedUsers = assignedUsersArray.flat();
        const idsArray = allAssignedUsers.map((user) => user.id)
        const count = idsArray.filter((item)=> item === usItem.id).length;
        return count;
    });

    //export to excel accand pass bar
    const exportUsersToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['თანამშრომლის სახელი და გვარი', 'პროექტების რაოდენობა'],
            ...users.map((usItem, index) => [usItem.FirstName + ' ' + usItem.LastName, userCounts[index]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'ProjectUsersStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'Project_By_Users_Stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    //data
    const usersData = {
        labels: user,
        datasets: [
                {
                    label: 'რაოდენობა',
                    data: userCounts,
                    backgroundColor: ['aqua', 'green'],
                    borderColor: 'black',
                    borderWidth: 1,
                }
        ]
    };

    //Month bar
    //logic
    // Logic to get project counts by month of the current year
    const currentYear = new Date().getFullYear();
    const projectMonthCounts = projectsData.reduce((counts, project) => {
    const projectYear = new Date(project.Created_At).getFullYear();
    const projectMonth = new Date(project.Created_At).getMonth();
    
    if (projectYear === currentYear) {
        counts[projectMonth] = (counts[projectMonth] || 0) + 1;
    }
    return counts;
    }, {});

    // Convert the object into an array of counts for each month
    const projectMonthCountsArray = Array.from({ length: 12 }, (_, i) => projectMonthCounts[i] || 0);

    // Generate labels for the months of the current year
    const monthLabels = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentMonth = new Date().getMonth();
    const currentYearMonths = Array.from({ length: currentMonth + 1 }, (_, i) => monthLabels[i]);
    
    // Export to Excel
    const exportMonthToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
        ['თვე', 'პროექტების რაოდენობა'],
        ...currentYearMonths.map((month, index) => [month, projectMonthCountsArray[index]])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'ProjectByMonthStats');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileName = 'Projects_By_Month_Stats.xlsx';
    saveAs(new Blob([wbout]), fileName);
    };

    // Data for the chart
    const monthData = {
    labels: currentYearMonths,
    datasets: [
        {
        label: 'რაოდენობა თვეების მიხედვით',
        data: projectMonthCountsArray,
        backgroundColor: ['aqua', 'green', 'purple', 'yellow'],
        borderColor: 'black',
        borderWidth: 1,
        },
    ]
    };

    //Month By Statuses bar
    //logic
    const currentStatYear = new Date().getFullYear();
    const currentStatMonth = new Date().getMonth();

    // Initialize counts for active and passive projects for each month
    const activeProjectCounts = Array.from({ length: 12 }, () => 0);
    const passiveProjectCounts = Array.from({ length: 12 }, () => 0);

    // Loop through projects to count active and passive projects for each month
    projectsData.forEach((project) => {
    const projectStatYear = new Date(project.Created_At).getFullYear();
    const projectStatMonth = new Date(project.Created_At).getMonth();
    
    if (projectStatYear === currentStatYear && projectStatMonth <= currentStatMonth) {
        const statusID = project.Project_Status_ID;
        if (statusID === 1) {
        activeProjectCounts[projectStatMonth]++;
        } else if (statusID === 2) {
        passiveProjectCounts[projectStatMonth]++;
        }
    }
    });

    // Generate labels for the months of the current year up to the current month
    const currentStatYearMonths = Array.from({ length: currentStatMonth + 1 }, (_, i) => monthLabels[i]);

    // Export to Excel
    const exportMonthStatToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
        ['თვე', 'მიმდინარე პროექტები', 'დახურული პროექტები'],
        ...currentStatYearMonths.map((month, index) => [month, activeProjectCounts[index], passiveProjectCounts[index]])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'ProjectByMonthAndStatusStats');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileName = 'Projects_By_Month_And_Status_Stats.xlsx';
    saveAs(new Blob([wbout]), fileName);
    };

    // Data for the chart
    const monthStatData = {
    labels: currentStatYearMonths,
    datasets: [
        {
        label: 'მიმდინარე პროექტები',
        data: activeProjectCounts,
        backgroundColor: 'aqua',
        borderColor: 'black',
        borderWidth: 1,
        },
        {
        label: 'დახურული პროექტები',
        data: passiveProjectCounts,
        backgroundColor: 'purple',
        borderColor: 'black',
        borderWidth: 1,
        },
    ],
    };

    //Year bar
    //logic
    const projectYearCounts = projectsData.reduce((counts, project) => {
        const year = new Date(project.Created_At).getFullYear();
        counts[year] = (counts[year] || 0) + 1;
        return counts;
    }, {});
    // Convert the object into an array of counts for each year
    const projectYearCountsArray = Object.values(projectYearCounts);
    const uniqueYears = [...new Set(projectsData.map((project) => new Date(project.Created_At).getFullYear()))];

    //export to excel accand pass bar
    const exportYearToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['წელი', 'პროექტების რაოდენობა'],
            ...Object.keys(projectYearCounts).map((year) => [year, projectYearCounts[year]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'ProjectByYearStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'Projects_By_Year_Stats.xlsx'; 
        saveAs(new Blob([wbout]), fileName);
    };

    //data
    const yearData = {
        labels: uniqueYears,
        datasets: [
            {
                label: 'რაოდენობა წლების მიხედვით',
                data: projectYearCountsArray,
                backgroundColor: ['aqua', 'green', 'purple', 'yellow'],
                borderColor: 'black',
                borderWidth: 1,
            },
        ]
    };

    const options = {
        plugins: {
            datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: (value) => value,
                offset: -5,
                font: {
                    size: 9,
                },
                color: 'black',
            },
        },
        legend: {
            display: true,
        },
        scales: {
            y: {
                beginAtZero: true, 
                stepSize: 1,
            },
        }
    }
    return (
        <div>
            {
                statusProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>სტატუსის მიხედვით</h3>
                            <Bar data={statusesData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportStatusesToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
            {
                typeProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>ტიპის მიხედვით</h3>
                            <Bar data={typesData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportTypesToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
            {
                clientProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>კლიენტების მიხედვით</h3>
                            <Bar data={clientsData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportClientsToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
            {
                userProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>მომხმარებლების მიხედვით</h3>
                            <Bar data={usersData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportUsersToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
            {
                userStatusProps && <ProjByUsersAndStatChart users={users} projectsData={projectsData}/>
            }
            {
                monthProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>თვეების მიხედვით</h3>
                            <Bar data={monthData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportMonthToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
            {
                monthStatProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>თვეების და სტატუსების მიხედვით</h3>
                            <Bar data={monthStatData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportMonthStatToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
            {
                yearProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>წლების მიხედვით</h3>
                            <Bar data={yearData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportYearToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
            {
                serviceStatusProps && <ProjByUsersAndServStatChart users={users} projectsData={projectsData} />
            }
            {
                serviceMayorStatusProps && <ProjByUsersAndMayorServStatChart users={users} projectsData={projectsData} />
            }
            {
                payStatusProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>გადახდის სტატუსები</h3>
                            <Bar data={payStatusesData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportPayStatusesToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
            {
                costAndPaidProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>ღირებულება და გადახდილი თანხა</h3>
                            <Bar data={costAndPaidData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportCostAndPaidToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
        </div>
    )
}
