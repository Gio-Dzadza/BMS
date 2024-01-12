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
import { useFetch } from '../hooks/useFetch';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
)


export default function BarChartSpecialty({chartData, specialtyProps}) {

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
                specialtyProps && (
                    <>
                        <h3>სპეციალობის მიხედვით</h3>
                        <Bar data={SpecData} options={options} plugins={[ChartDataLabels]}/>
                        <Button onClick={exportSpecToExcel } className='excel-btn'>Excel</Button>
                    </>
                )
            }
        </div>
    )
}
