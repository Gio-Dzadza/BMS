import React, { useEffect, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import BarChart from '../../components/BarChart';
import {
    Button,
    Typography,
    Container,
} from '@mui/material';
import './Statistics.css'
import theme from '../../components/Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function UserStat() {

    const [actAndPassChart, setActAndPassChart] = useState(false);
    const [specialtyChart, setSpecialtyChart] = useState(false);
    const [specialtyProps, setSpecialtyProps] = useState(false);

    const [usersData, setUsersData] = useState([]);

    const { data } = useFetch('http://localhost:3001/api/get');

    useEffect(()=>{
        const unsub = ()=>{if(data && data.result){
            setUsersData(data && data.result);
        }}

        unsub();
        
        return()=>{
            unsub();
        }
    },[data]);

    const showActAndPassBar = ()=>{
        setActAndPassChart(true);
        setSpecialtyChart(false);
        setSpecialtyProps(false);
    }

    const showSpecialtyBar = ()=>{
        setSpecialtyChart(true);
        setSpecialtyProps(true);
        setActAndPassChart(false);
    }

    return (
        <div style={{width: 700, margin:50}}>
            <Container>
                <Typography className='form-heading' variant="h5">სტატისტიკა მომხმარებლების შესახებ</Typography>
                <ThemeProvider theme={theme}>
                    <div className='btns-cont'>
                        <Button className='btn' onClick={showActAndPassBar} variant="contained">სტატუსების მიხედვით</Button>
                        <Button className='btn' onClick={showSpecialtyBar} variant="contained">სპეციალობის მიხედვით</Button>
                    </div>
                </ThemeProvider>
            </Container>
            {
                actAndPassChart && <BarChart chartData={usersData}/>
            }
            {
                specialtyChart && <BarChart chartData={usersData} specialtyProps={specialtyProps} />
            }
        </div>
    )
}
