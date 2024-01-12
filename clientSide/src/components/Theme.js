import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#73a8bd', 
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: '#73a8bd', 
                },
            },
        },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    '&.Mui-focused': {
                        
                        color: '#73a8bd', 
                    },
                },
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#73a8bd', 
                        },
                    },
                },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    backgroundColor: '#73a8bd',
                    borderColor: '#73a8bd', 
                    fontFamily: 'FiraGO, sans-serif', 
                    color: '#ffff',
                    '&:hover': {
                        backgroundColor: '#73a8bd', 
                        borderColor: '#73a8bd',
                    },
                }
            }
        },
    },
});

export default theme;