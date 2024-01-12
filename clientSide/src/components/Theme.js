import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#73a8bd', // Global border color
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: '#73a8bd', // Global focused label color
                },
            },
        },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    '&.Mui-focused': {
                        // Styles for focused border color
                        color: '#73a8bd', // Change to your desired focused border color
                    },
                },
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#73a8bd', // Change this to your desired focused border color
                        },
                    },
                },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    backgroundColor: '#73a8bd',
                    borderColor: '#73a8bd', // Border color
                    fontFamily: 'FiraGO, sans-serif', // Font family
                    color: '#ffff',
                    '&:hover': {
                        backgroundColor: '#73a8bd', // Hover background color
                        borderColor: '#73a8bd',
                    },
                }
            }
        },
    },
});

export default theme;