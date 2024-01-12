import React from 'react';
import '../pages/blank/Blank.css';
//mui
import {
    Button,
} from '@mui/material';

import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from 'chart.js';

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


export default function ProjectsBarChartUser({projectsData, userProps, users}) {

    const user = users && users.map((usItem)=>usItem.FirstName + ' ' + usItem.LastName);
    const userCounts = users && users.map((usItem)=>{
        const assignedUsersArray = projectsData.map((project)=> project.assignedUsers);
        const allAssignedUsers = assignedUsersArray.flat();
        const idsArray = allAssignedUsers.map((user) => user.id)
        const count = idsArray.filter((item)=> item === usItem.id).length;
        return count;
    });

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
        <div className='chart-inner-container'>
            {
                userProps && (
                    <>
                        <h3>პროექტების რაოდენობა მომხმარებლების მიხედვით</h3>
                        <Bar data={usersData} options={options} plugins={[ChartDataLabels]}/>
                        <Button onClick={exportUsersToExcel } className='excel-btn'>Excel</Button>
                    </>
                )
            }
        </div>
    )
}
