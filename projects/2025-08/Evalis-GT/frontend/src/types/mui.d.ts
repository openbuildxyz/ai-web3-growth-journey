import '@mui/material';

declare module '@mui/material/TextField' {
  interface TextFieldProps {
    margin?: 'none' | 'dense' | 'normal';
  }
}

declare module '@mui/material/Alert' {
  interface AlertProps {
    children?: React.ReactNode;
  }
} 