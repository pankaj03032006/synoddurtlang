import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Slide from '@mui/material/Slide';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

// Transition element for the Dialogue Box
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Styled components for better visual hierarchy
const StyledDialogTitle = styled(DialogTitle)(({ theme, severity }) => {
    const colors = {
        error: {
            bg: theme.palette.error.light,
            color: theme.palette.error.contrastText,
            icon: <ErrorIcon />
        },
        warning: {
            bg: theme.palette.warning.light,
            color: theme.palette.warning.contrastText,
            icon: <WarningIcon />
        },
        info: {
            bg: theme.palette.info.light,
            color: theme.palette.info.contrastText,
            icon: <InfoIcon />
        }
    };
    
    const selectedColor = colors[severity] || colors.error;
    
    return {
        backgroundColor: selectedColor.bg,
        color: selectedColor.color,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        '& .MuiTypography-root': {
            fontWeight: 600,
        },
    };
});

const ErrorListContainer = styled('div')(({ theme }) => ({
    '& .error-item': {
        margin: theme.spacing(1, 0),
        padding: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    '& .error-item:last-child': {
        marginBottom: 0,
    },
}));

/**
 * ErrorDialogueBox - A styled Dialog component for displaying error messages
 *
 * @param {object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {function} props.handleToClose - Function to call when dialog closes
 * @param {string} props.ErrorTitle - Title of the error dialog
 * @param {Array<string>} props.ErrorList - Array of error messages to display
 * @param {string} props.severity - Severity level: 'error', 'warning', or 'info'
 * @param {string} props.closeButtonText - Text for the close button
 * @param {boolean} props.showIcon - Whether to show the severity icon
 * @param {number} props.maxWidth - Maximum width of the dialog
 * @param {boolean} props.fullWidth - Whether the dialog should take full width
 *
 * @returns {JSX.Element} - A Dialog component displaying error messages
 * 
 * @example
 * <ErrorDialogueBox
 *   open={errorOpen}
 *   handleToClose={() => setErrorOpen(false)}
 *   ErrorTitle="Validation Error"
 *   ErrorList={['Name is required', 'Email is invalid']}
 *   severity="error"
 * />
 */
function ErrorDialogueBox(props) {
    const {
        open,
        handleToClose,
        ErrorTitle = "Error",
        ErrorList = [],
        severity = "error",
        closeButtonText = "Close",
        showIcon = true,
        maxWidth = "sm",
        fullWidth = true,
    } = props;

    // Render error list items
    const renderErrorList = () => {
        if (!ErrorList || ErrorList.length === 0) {
            return (
                <DialogContentText>
                    An unknown error occurred. Please try again.
                </DialogContentText>
            );
        }

        return (
            <ErrorListContainer>
                {ErrorList.map((err, index) => (
                    <div key={index} className="error-item">
                        <span style={{ fontSize: '1.2rem' }}>•</span>
                        <span>{err}</span>
                    </div>
                ))}
            </ErrorListContainer>
        );
    };

    // Get icon based on severity
    const getIcon = () => {
        if (!showIcon) return null;
        
        switch (severity) {
            case 'warning':
                return <WarningIcon />;
            case 'info':
                return <InfoIcon />;
            default:
                return <ErrorIcon />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleToClose}
            TransitionComponent={Transition}
            keepMounted
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: 'hidden',
                    minWidth: { xs: '90%', sm: '400px' },
                }
            }}
        >
            <StyledDialogTitle severity={severity}>
                {getIcon()}
                {ErrorTitle}
            </StyledDialogTitle>
            
            <DialogContent sx={{ mt: 2, mb: 1 }}>
                {renderErrorList()}
            </DialogContent>
            
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button 
                    onClick={handleToClose}
                    variant="contained"
                    color={severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'primary'}
                    startIcon={<CloseIcon />}
                    sx={{ minWidth: 100 }}
                >
                    {closeButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// PropTypes for better documentation and type checking
ErrorDialogueBox.propTypes = {
    open: PropTypes.bool.isRequired,
    handleToClose: PropTypes.func.isRequired,
    ErrorTitle: PropTypes.string,
    ErrorList: PropTypes.arrayOf(PropTypes.string),
    severity: PropTypes.oneOf(['error', 'warning', 'info']),
    closeButtonText: PropTypes.string,
    showIcon: PropTypes.bool,
    maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
    fullWidth: PropTypes.bool,
};

// Default props
ErrorDialogueBox.defaultProps = {
    ErrorTitle: "Error",
    ErrorList: [],
    severity: "error",
    closeButtonText: "Close",
    showIcon: true,
    maxWidth: "sm",
    fullWidth: true,
};

// Add display name for better debugging
ErrorDialogueBox.displayName = 'ErrorDialogueBox';

export default ErrorDialogueBox;