import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/**
 * BootstrapDialog - A styled Dialog component using Material-UI styles
 * 
 * This component provides a customized dialog with consistent styling
 * for all modal dialogs across the application.
 *
 * @param {object} theme - The theme object from Material-UI
 * @param {number|string} width - Custom width for the dialog content (optional)
 *
 * @returns {object} - A styled Dialog component with custom padding for the content and actions
 * 
 * @example
 * <BootstrapDialog 
 *   open={open} 
 *   onClose={handleClose}
 *   width={500}
 * >
 *   <BootstrapDialogTitle onClose={handleClose}>
 *     Dialog Title
 *   </BootstrapDialogTitle>
 *   <DialogContent>
 *     Dialog content goes here
 *   </DialogContent>
 *   <DialogActions>
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button onClick={handleSubmit}>Confirm</Button>
 *   </DialogActions>
 * </BootstrapDialog>
 */
export const BootstrapDialog = styled(Dialog)(({ theme, width }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(3),
        width: width ? parseInt(width, 10) : 400,
        minWidth: 300,
        maxWidth: '90vw',
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(2, 3),
        gap: theme.spacing(1),
    },
    '& .MuiDialog-paper': {
        borderRadius: theme.spacing(1.5),
        boxShadow: theme.shadows[10],
        margin: theme.spacing(2),
    },
    '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(2px)',
    },
}));

/**
 * BootstrapDialogTitle - A custom DialogTitle component with a close button
 * 
 * This component extends Material-UI's DialogTitle to include a close button
 * in the top-right corner of the dialog.
 *
 * @param {object} props - The component props
 * @param {React.ReactNode} props.children - The content to be displayed in the title
 * @param {function} props.onClose - Callback function called when the close button is clicked
 * @param {object} props.rest - Any additional props to pass to DialogTitle
 *
 * @returns {JSX.Element} - A DialogTitle component with a close button
 * 
 * @example
 * <BootstrapDialogTitle onClose={handleClose}>
 *   My Dialog Title
 * </BootstrapDialogTitle>
 */
export const BootstrapDialogTitle = (props) => {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle 
            sx={{ 
                m: 0, 
                p: 2.5,
                pr: onClose ? 6 : 2.5,
                fontSize: '1.25rem',
                fontWeight: 600,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) => theme.palette.background.paper,
            }} 
            {...other}
        >
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        color: (theme) => theme.palette.grey[500],
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.action.hover,
                            color: (theme) => theme.palette.error.main,
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
};

// PropTypes for BootstrapDialogTitle component
BootstrapDialogTitle.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
};

// Add display names for better debugging
BootstrapDialog.displayName = 'BootstrapDialog';
BootstrapDialogTitle.displayName = 'BootstrapDialogTitle';

// Default props for BootstrapDialog
BootstrapDialog.defaultProps = {
    width: 400,
};

// Default props for BootstrapDialogTitle
BootstrapDialogTitle.defaultProps = {
    children: null,
};