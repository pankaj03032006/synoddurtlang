import { Outlet } from "react-router-dom";
import Box from '@mui/material/Box';

export default function User() {
    return (
        <Box component="main" sx={{ flexGrow: 1 }}>
            <Outlet />
        </Box>
    );
}