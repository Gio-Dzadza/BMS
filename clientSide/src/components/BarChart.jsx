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
import { useFetch } from '../hooks/useFetch';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
)

export default function BarChart({chartData, specialtyProps}) {

    //Specialties bar
    const {data:specialty} = useFetch('http://localhost:3001/api/get/specialty');

    const specialties = specialty && specialty.map((sp)=>sp.Specialty_name);

    const specialtyCounts = specialty && specialty.map((sp)=>{
        const count = chartData.filter((user)=> user.User_Specialty_id === sp.id).length;
        return count;
    });

    const SpecData = {
        labels: specialties,
        datasets: [
            {
                label: 'არქიტექტორი',
                data: specialtyCounts,
                backgroundColor: ['aqua', 'green', 'purple', 'yellow'],
                borderColor: 'black',
                borderWidth: 1,
            }
        ]
    };

    //export to excel specialty bar
    const exportSpecToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['Specialty', 'Number of Users'],
            ...specialty.map((sp, index) => [sp.Specialty_name, specialtyCounts[index]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'SpecialtyStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'specialty_stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    //Active and passive bar
    // Create an object to store the counts of active and passive users for each year
    const userCountsByYear = chartData.reduce((acc, user) => {
        const createdAtYear = new Date(user.Created_at).getFullYear();
        if (!acc[createdAtYear]) {
        acc[createdAtYear] = { active: 0, passive: 0 };
        }
        if (user.User_Status_id === 1) {
        acc[createdAtYear].active += 1;
        } else if (user.User_Status_id === 2) {
        acc[createdAtYear].passive += 1;
        }
        return acc;
    }, {});

    // Extract the years from the userCountsByYear object
    const years = Object.keys(userCountsByYear);
    // Extract the counts of active and passive users for each year
    const activeUsers = years.map((year) => userCountsByYear[year].active);
    const passiveUsers = years.map((year) => userCountsByYear[year].passive);

    //export to excel accand pass bar
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['Year', 'Active Users', 'Passive Users'],
            ...years.map((year, index) => [year, activeUsers[index], passiveUsers[index]])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'UserStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'user_stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    const actAndPassData = {
        labels: years,
        datasets: [
            {
                label: 'მოქმედი',
                data: activeUsers,
                backgroundColor: 'aqua',
                borderColor: 'black',
                borderWidth: 1,
            },
            {
                label: 'გაუქმებული',
                data: passiveUsers,
                backgroundColor: 'green',
                borderColor: 'black',
                borderWidth: 1,
            },
        ]
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
        },
    }
    return (
        <div>
            {
                !specialtyProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h3>აქტიური და გაუქმებული წლების მიხედვით</h3>
                            <Bar data={actAndPassData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
            {
                specialtyProps && (
                    <>
                        <div className='chart-inner-container chart-in-stat'>
                            <h1>სპეციალობის მიხედვით</h1>
                            <Bar data={SpecData} options={options} plugins={[ChartDataLabels]}/>
                            <Button onClick={exportSpecToExcel} className='excel-btn'>Excel</Button>
                        </div>
                    </>
                )
            }
        </div>
    )
}
