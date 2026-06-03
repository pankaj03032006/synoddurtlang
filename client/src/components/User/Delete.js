import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';

function Delete({ 
  open, 
  onClose, 
  itemId, 
  itemName, 
  deleteEndpoint, 
  onSuccess, 
  redirectPath,
  itemType = "item"
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const handleDialogueOpen = () => {
    setErrorDialogueBoxOpen(true);
  };

  const handleDialogueClose = () => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false);
  };

  const handleDelete = async () => {
    if (!itemId) {
      setErrorList([`No ${itemType} ID provided for deletion`]);
      handleDialogueOpen();
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.delete(`${deleteEndpoint}/${itemId}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.message === "success" || response.status === 200) {
        if (onSuccess) {
          onSuccess();
        }
        if (redirectPath) {
          navigate(redirectPath);
        }
        onClose();
      } else {
        setErrorList([response.data.message || `Failed to delete ${itemType}`]);
        handleDialogueOpen();
      }
    } catch (error) {
      console.error(`Delete ${itemType} error:`, error);
      
      if (error.response?.data?.errors) {
        setErrorList(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrorList([error.response.data.message]);
      } else {
        setErrorList([error.message || `Failed to delete ${itemType}`]);
      }
      handleDialogueOpen();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={!loading ? onClose : undefined}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this {itemType} 
            {itemName ? ` "${itemName}"` : ''}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose} 
            color="secondary" 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained" 
            disabled={loading}
            autoFocus
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <ErrorDialogueBox
        open={errorDialogueBoxOpen}
        handleToClose={handleDialogueClose}
        ErrorTitle={`Error: Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
        ErrorList={errorList}
      />
    </>
  );
}

export default Delete;