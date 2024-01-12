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

export default function ProjByUsersAndServStatChart({ projectsData, users }) {
    const [userCounts, setUserCounts] = useState({});
    const [userLabels, setUserLabels] = useState([]);
    const [userIds, setUserIds] = useState([]);

    const [permission, setPermission] = useState(false);
    const context = useAuthContext();

    useEffect(() => {
        if (context.user && (context.user.User_Type_id === 1 || context.user.User_Type_id === 4 || context.user.User_Type_id === 5)) {
            setPermission(false);
        } else {
            setPermission(true);
        }
    }, [context]);

    useEffect(() => {
        const counts = {};
        projectsData && projectsData.forEach((project) => {
            project.servicesToProjects.forEach((service) => {
                const userIdsArray = JSON.parse(service.userIds);
                userIdsArray.forEach((userId) => {
                    if (!counts[userId]) {
                        counts[userId] = {
                            completed: 0,
                            expired: 0,
                        };
                    }
                    if (service.Service_Status_Id === 3) {
                        counts[userId].completed++;
                    } else if (new Date(service.deadLine) < new Date()) {
                        counts[userId].expired++;
                    }
                });
            });
        });

        const labels = Object.keys(counts).map((userId) => {
            const numericUserId = parseInt(userId, 10); 
            let user;
            if(permission){
                user = users.find((usItem) => usItem.id === context.user?.id);
            }else{
                user = users.find((usItem) => usItem.id === numericUserId);
            }

            if (user) {
                return `${user.FirstName} ${user.LastName}`;
            } else {
                console.warn(`User with id ${userId} not found in users array.`);
                return '';
            }
        });

        const ids = labels.map((userLabel) => {
            const user = users.find((usItem) => {
                const fullName = `${usItem.FirstName} ${usItem.LastName}`;
                return fullName === userLabel;
            });
            return user ? user.id : null;
        });

        setUserCounts(counts);
        setUserLabels(labels);

        if (permission) {
            const contextUserId = context.user ? context.user.id : null;
            setUserIds([contextUserId]);
        } else {
            setUserIds(ids);
        }
    }, [projectsData, users, permission, context]);

    const exportUsersAndServStatusesToExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [['სახელი და გვარი', 'დასრულებული სერვისები', 'ვადაგადაცილებული']];
        
        userIds.forEach((userId) => {
            const user = users.find((usItem) => usItem.id === userId);
            if (user) {
                const userName = `${user.FirstName} ${user.LastName}`;
                const completed = userCounts[userId] ? userCounts[userId].completed : 0;
                const expired = userCounts[userId] ? userCounts[userId].expired : 0;
                wsData.push([userName, completed, expired]);
            } else {
                console.warn(`User with id ${userId} not found in users array.`);
            }
        });
    
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'CompletedAndExpiredServStats');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = 'Completed_And_Expired_Services_Stats.xlsx';
        saveAs(new Blob([wbout]), fileName);
    };

    const completedServiceData = userIds.map((userId) =>
        userId !== null && userCounts[userId] ? userCounts[userId].completed : 0
    );
    const expiredServiceData = userIds.map((userId) =>
        userId !== null && userCounts[userId] ? userCounts[userId].expired : 0
    );

    const filteredUserLabels = userLabels.filter((userLabel, index) => {
        return userIds[index] === context.user?.id;
    });

    const userSerStData = {
        labels: permission ? filteredUserLabels :  userLabels, 
        datasets: [
            {
                label: 'შესრულებული სერვისები',
                data: completedServiceData,
                backgroundColor: 'aqua',
                borderColor: 'black',
                borderWidth: 1,
            },
            {
                label: 'ვადაგადაცილებული სერვისები',
                data: expiredServiceData,
                backgroundColor: 'red', 
                borderColor: 'black',
                borderWidth: 1,
            },
        ],
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
        },
    };

    return (
        <div className='chart-inner-container chart-in-stat'>
            <h3>დასრულებული და ვადაგადაცილებული სერვისები</h3>
            <Bar data={userSerStData} options={options} plugins={[ChartDataLabels]} />
            <Button onClick={exportUsersAndServStatusesToExcel} className='excel-btn'>Excel</Button>
        </div>
    );
}

