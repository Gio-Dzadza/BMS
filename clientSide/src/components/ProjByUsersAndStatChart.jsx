import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
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

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
)


export default function ProjByUsersAndStatChart({projectsData, users}) {
    const [permission, setPermission] = useState(false);

    const context = useAuthContext();

    useEffect(()=>{
        if( context.user && context.user.User_Type_id === 1 ){
            setPermission(true);
        } else if(context.user && context.user.User_Type_id === 4){
            setPermission(true);
        } else if(context.user && context.user.User_Type_id === 5){
            setPermission(true);
        } else{
            setPermission(false);
        };
    },[context]);

    //By Users by status bar
    //logic
    const userCountsByStatus = users.map((usItem) => {
        const assignedUsersArray = projectsData.map((project) => project.assignedUsers);
        const allAssignedUsers = assignedUsersArray.flatMap((users) => users || []); 

        let idsArray;
        if(permission){
            idsArray = allAssignedUsers.map((user) => user.id);
        } else{
            idsArray = allAssignedUsers
            .filter((user) => context.user && user.id === context.user.id)
            .map((user) => user.id);
        }
    
        const countByStatus = projectsData ? projectsData.reduce((acc, project) => {
        if (idsArray.includes(usItem.id) && project.assignedUsers.some((user) => user.id === usItem.id)) {
            if (!acc[project.Project_Status_ID]) {
            acc[project.Project_Status_ID] = 1;
            } else {
            acc[project.Project_Status_ID]++;
            }
        }
        return acc;
        }, {}) : {};
    
        return {
        user: usItem.FirstName + ' ' + usItem.LastName,
        countsByStatus: countByStatus,
        };
    });

    //export to excel accand pass bar
    const exportUsersAndStatusesToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['თანამშრომლის სახელი და გვარი', 'მიმდინარე', 'დახურული'],
            ...users.map((usItem, index) => [usItem.FirstName + ' ' + usItem.LastName, userCountsByStatus[index].countsByStatus[1] || 0, userCountsByStatus[index].countsByStatus[2] || 0])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'ProjectUsersStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'Project_By_Users_Stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    // data
    const userStatusData = {
        labels: userCountsByStatus.map((item) => item.user),
        datasets: [
        {
            label: 'მიმდინარე',
            data: userCountsByStatus.map((item) => item.countsByStatus[1] || 0),
            backgroundColor: 'aqua',
            borderColor: 'black',
            borderWidth: 1,
        },
        {
            label: 'დახურული',
            data: userCountsByStatus.map((item) => item.countsByStatus[2] || 0),
            backgroundColor: 'green',
            borderColor: 'black',
            borderWidth: 1,
        },
        ],
    };
    

    const options = {
    plugins: {
        datalabels: {
            anchor: 'end', // Show data labels at the end of the bars
            align: 'end', // Align data labels to the end of the bars
            formatter: (value) => value, // Customize the formatting of the data labels if needed, for instance (value) => value + ' თანამშრომელი'
            offset: -5, //dashorebaa boZis Tavidan valuemde
            font: {
                size: 9, // You can adjust the font size of the data labels here
            },
            color: 'black', // You can set the color of the data labels here
        },
    },
    legend: {
        display: true,
    },
    scales: {
        y: {
            beginAtZero: true, // Start y-axis from 0
            stepSize: 1, // Set the step size to 1 for whole number ticks
        },
    }
    }

    return (
        <div className='chart-inner-container chart-in-stat'>
            <h3>მომხმარებლების და პროექტების სტატუსების მიხედვით</h3>
            <Bar data={userStatusData} options={options} plugins={[ChartDataLabels]}/>
            <Button onClick={exportUsersAndStatusesToExcel} className='excel-btn'>Excel</Button>
        </div>
    )
}
