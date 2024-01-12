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


export default function ProjectsBarChartClient({projectsData, clientProps, clients}) {

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
                clientProps && (
                    <>
                        <h3>პროექტების რაოდენობა კლიენტების მიხედვით</h3>
                        <Bar data={clientsData} options={options} plugins={[ChartDataLabels]}/>
                        <Button onClick={exportClientsToExcel} className='excel-btn'>Excel</Button>
                    </>
                )
            }
        </div>
    )
}
