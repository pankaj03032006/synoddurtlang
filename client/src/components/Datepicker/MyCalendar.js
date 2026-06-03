import { useState,  } from 'react';
import Calendar from 'react-calendar';
import './Calendar.css';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';

function CustomCalendar({ date, setDate, onDateChange, minDate, maxDate, tileClassName, tileContent }) {
  
  // Optional: Add appointment indicators
  const [appointmentDates] = useState([]);
  
  // Format date for comparison
  const formatDate = (date) => {
    return moment(date).format('YYYY-MM-DD');
  };
  
  // Custom tile className function
  const getTileClassName = ({ date, view }) => {
    let classes = [];
    
    // Add custom class for dates with appointments
    if (view === 'month' && appointmentDates.includes(formatDate(date))) {
      classes.push('react-calendar__tile--hasAppointment');
    }
    
    // Add custom class from prop
    if (tileClassName) {
      const customClass = tileClassName({ date, view });
      if (customClass) classes.push(customClass);
    }
    
    return classes.length > 0 ? classes.join(' ') : null;
  };
  
  // Handle date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };
  
  return (
    <div className='calendar-container'>
      <Calendar
        onChange={handleDateChange}
        value={date}
        minDate={minDate || new Date()}
        maxDate={maxDate}
        tileClassName={getTileClassName}
        tileContent={tileContent}
        formatShortWeekday={(locale, date) => {
          return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        }}
        formatMonthYear={(locale, date) => {
          return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        }}
        nextLabel="›"
        next2Label="»"
        prevLabel="‹"
        prev2Label="«"
        navigationLabel={({ date, label, locale, view }) => {
          if (view === 'month') {
            return `${date.toLocaleString(locale, { month: 'long' })} ${date.getFullYear()}`;
          }
          return label;
        }}
      />
    </div>
  );
}

export default CustomCalendar;