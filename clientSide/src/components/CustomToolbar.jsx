import React from 'react';
import { GridToolbar, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';

import './UsersList.css' 

const CustomToolbar = () => {
    return (
        <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
            <GridToolbar />
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    );
};

export default CustomToolbar;




