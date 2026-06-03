import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

// Transition element for the Dialogue Box
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Styled Warning Icon
const WarningIconStyled = styled(WarningIcon)(({ theme }) => ({
    fontSize: '2rem',
    color: theme.palette.warning.main,
    marginBottom: theme.spacing(1),
}));

/**
 * ConfirmDeleteDialogue - A styled Dialog component using Material-UI styles to confirm the delete action of the user
 *
 * @param {object} props - props of the component
 * @param {boolean} props.open - status of the dialogue box
 * @param {function} props.handleClose - handler function when cancel is clicked
 * @param {function} props.handleDelete - handler function when delete is clicked
 * @param {string} props.title - title of the dialogue box
 * @param {string} props.message - message to be displayed on the dialogue box
 * @param {string} props.itemName - name of the item being deleted (optional)
 * @param {boolean} props.loading - loading state for delete operation
 * @param {string} props.deleteButtonText - custom text for delete button
 * @param {string} props.cancelButtonText - custom text for cancel button
 *
 * @returns {JSX.Element} - A Dialog component which confirms the delete action of the user
 * 
 * @example
 * <ConfirmDeleteDialogue
 *   open={open}
 *   handleClose={handleClose}
 *   handleDelete={handleDelete}
 *   title="Delete Medicine"
 *   message="Are you sure you want to delete this medicine?"
 *   itemName="Paracetamol"
 *   loading={isDeleting}
 * />
 */
const ConfirmDeleteDialogue = (props) => {
    const {
        open,
        handleClose,
        handleDelete,
        title = "Confirm Delete",
        message = "Are you sure you want to delete this item?",
        itemName,
        loading = false,
        deleteButtonText = "Delete",
        cancelButtonText = "Cancel",
    } = props;

    const handleDeleteClick = () => {
        if (handleDelete) {
            handleDelete();
        }
    };

    const handleCancelClick = () => {
        if (handleClose) {
            handleClose();
        }
    };

    // Custom message with item name if provided
    const displayMessage = itemName 
        ? `${message} "${itemName}"?` 
        : message;

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleCancelClick}
            aria-describedby="alert-dialog-slide-description"
            maxWidth="xs"
            fullWidth
            PaperProps={{
                elevation: 24,
                sx: {
                    borderRadius: 2,
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                <WarningIconStyled />
                <div style={{ fontWeight: 600, fontSize: '1.25rem', marginTop: '8px' }}>
                    {title}
                </div>
            </DialogTitle>
            
            <DialogContent sx={{ textAlign: 'center' }}>
                <DialogContentText 
                    id="alert-dialog-slide-description"
                    sx={{
                        fontSize: '1rem',
                        color: 'text.primary',
                    }}
                >
                    {displayMessage}
                </DialogContentText>
                
                {itemName && (
                    <DialogContentText 
                        sx={{ 
                            mt: 2, 
                            color: 'error.main',
                            fontWeight: 'medium',
                            fontSize: '0.875rem'
                        }}
                    >
                        ⚠️ This action cannot be undone.
                    </DialogContentText>
                )}
            </DialogContent>
            
            <DialogActions sx={{ p: 2, pt: 0, justifyContent: 'center', gap: 2 }}>
                <Button 
                    onClick={handleCancelClick}
                    disabled={loading}
                    variant="outlined"
                    startIcon={<CancelIcon />}
                >
                    {cancelButtonText}
                </Button>
                <Button 
                    onClick={handleDeleteClick}
                    disabled={loading}
                    variant="contained"
                    color="error"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                >
                    {loading ? 'Deleting...' : deleteButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// PropTypes for better documentation and type checking
ConfirmDeleteDialogue.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    itemName: PropTypes.string,
    loading: PropTypes.bool,
    deleteButtonText: PropTypes.string,
    cancelButtonText: PropTypes.string,
};

// Default props
ConfirmDeleteDialogue.defaultProps = {
    title: "Confirm Delete",
    message: "Are you sure you want to delete this item?",
    itemName: null,
    loading: false,
    deleteButtonText: "Delete",
    cancelButtonText: "Cancel",
};

// Add display name for better debugging
ConfirmDeleteDialogue.displayName = 'ConfirmDeleteDialogue';

export default ConfirmDeleteDialogue;