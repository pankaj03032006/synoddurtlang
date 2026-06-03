import * as React from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import Badge from '@mui/material/Badge';

export default function CustomDatePicker({ date, setDate, appointmentDates = [] }) {
  
  // Custom day rendering with appointment indicators
  const CustomDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const formattedDate = dayjs(day).format('YYYY-MM-DD');
    const hasAppointment = appointmentDates.includes(formattedDate);
    
    return (
      <Badge
        overlap="circular"
        badgeContent={hasAppointment ? '●' : undefined}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: 8,
            color: 'rgb(49, 179, 114)',
            top: '85%',
            right: '50%',
            transform: 'translate(50%, -50%)',
          },
        }}
      >
        <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
      </Badge>
    );
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StaticDatePicker
        defaultValue={dayjs(date)}
        value={dayjs(date)}
        onChange={(newDate) => setDate(newDate)}
        sx={{
          width: '100%',
          '& .MuiPickersDay-root': {
            fontSize: '1rem',
            margin: '4px',
          },
          '& .Mui-selected': {
            backgroundColor: 'rgb(49, 179, 114) !important',
            color: 'white !important',
          },
          '& .MuiPickersDay-today': {
            backgroundColor: 'rgba(49, 179, 114, 0.1)',
            border: '1px solid rgb(49, 179, 114)',
          },
          '& .MuiDayCalendar-weekDayLabel': {
            color: '#6c757d',
            fontWeight: 600,
          },
          '& .MuiPickersCalendarHeader-label': {
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#2c3e50',
          },
        }}
        slots={{
          day: CustomDay,
        }}
      />
    </LocalizationProvider>
  );
}