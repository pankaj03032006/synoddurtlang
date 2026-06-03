import React, { useContext, useState, useEffect, useMemo } from "react"; // Removed unused useCallback
import { UserContext } from '../../Context/UserContext';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import PropTypes from 'prop-types';

function PrescriptionForm(props) {
    const { currentUser } = useContext(UserContext);
    
    const [medicines, setMedicines] = useState([]);
    const [medicineItems, setMedicineItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [successSnackbar, setSuccessSnackbar] = useState(false);
    const [errorSnackbar, setErrorSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    // Removed unused fetchingPatient and setFetchingPatient

    // Get patient name - prioritize direct props
    const selectedPatientName = useMemo(() => {
        // First check if patientName was passed directly (from parent component)
        if (props.patientName && props.patientName !== '') {
            return props.patientName;
        }
        
        // Check if patientFirstName and patientLastName were passed
        if (props.patientFirstName && props.patientLastName) {
            return `${props.patientFirstName} ${props.patientLastName}`.trim();
        }
        
        // Then check props.patientList
        if (props.patientSelected && props.patientList && props.patientList.length > 0) {
            const patient = props.patientList.find(p => p._id === props.patientSelected);
            if (patient) {
                if (patient.userId) {
                    return `${patient.userId.firstName || ''} ${patient.userId.lastName || ''}`.trim();
                }
                return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
            }
        }
        
        return props.patientSelected ? 'Loading...' : 'No patient selected';
    }, [props.patientName, props.patientFirstName, props.patientLastName, props.patientSelected, props.patientList]);

    // Fetch medicines on component mount
    useEffect(() => {
        getMedicines();
    }, []);

    // Load existing prescription data if editing - Fixed dependency
    const loadExistingPrescription = React.useCallback(() => {
        if (props.existingPrescription && medicines.length > 0) {
            const existingMedicines = props.existingPrescription.medicines || [];
            const loadedItems = existingMedicines.map((med, index) => ({
                id: med._id || Date.now() + index,
                medicineId: med.medicineId?._id || med.medicineId,
                medicine: med.medicineId?.name || '',
                qty: med.qty || "",
                dosage: med.dosage || "",
                timing: med.timing || "after meal",
                duration: med.duration || "3 days"
            }));
            setMedicineItems(loadedItems);
            setRemarks(props.existingPrescription.remarks || '');
        }
    }, [props.existingPrescription, medicines]);

    useEffect(() => {
        if (props.existingPrescription && medicines.length > 0) {
            loadExistingPrescription();
            setIsEditing(true);
        }
    }, [props.existingPrescription, medicines, loadExistingPrescription]); // Added loadExistingPrescription to dependencies

    const getMedicines = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/medicines`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setMedicines(response.data);
        } catch (error) {
            console.error("Error fetching medicines:", error);
            setErrorMessage(error.response?.data?.message || "Failed to load medicines list");
            setErrorSnackbar(true);
        }
    };

    const validateMedicineItems = () => {
        if (medicineItems.length === 0) {
            setErrorMessage("Please add at least one medicine to the prescription");
            setErrorSnackbar(true);
            return false;
        }

        for (let i = 0; i < medicineItems.length; i++) {
            const item = medicineItems[i];
            if (!item.medicineId) {
                setErrorMessage(`Medicine ${i + 1}: Please select a medicine`);
                setErrorSnackbar(true);
                return false;
            }
            if (!item.qty || item.qty <= 0) {
                setErrorMessage(`Medicine ${i + 1}: Please enter valid quantity`);
                setErrorSnackbar(true);
                return false;
            }
            if (!item.dosage || item.dosage.trim() === '') {
                setErrorMessage(`Medicine ${i + 1}: Please enter dosage information`);
                setErrorSnackbar(true);
                return false;
            }
            if (isNaN(item.qty) || item.qty < 1) {
                setErrorMessage(`Medicine ${i + 1}: Quantity must be a positive number`);
                setErrorSnackbar(true);
                return false;
            }
        }
        return true;
    };

    const addMedicineItem = () => {
        if (medicines.length === 0) {
            setErrorMessage("No medicines available. Please add medicines first.");
            setErrorSnackbar(true);
            return;
        }

        const newItem = {
            id: Date.now(),
            medicineId: medicines[0]._id,
            medicine: medicines[0].name,
            qty: "",
            dosage: "",
            timing: "after meal",
            duration: "3 days",
            isNew: true
        };
        
        setMedicineItems(prevItems => [...prevItems, newItem]);
        
        setTimeout(() => {
            const medicineDiv = document.querySelector('.medicineDiv');
            if (medicineDiv) {
                medicineDiv.scrollTop = medicineDiv.scrollHeight;
            }
        }, 100);
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        setMedicineItems(prevItems => prevItems.filter((item) => item.id !== itemToDelete));
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleMedicineChange = (id, field, value) => {
        setMedicineItems(prevItems => {
            return prevItems.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    
                    if (field === 'medicineId') {
                        const selectedMedicine = medicines.find(m => m._id === value);
                        updatedItem.medicine = selectedMedicine ? selectedMedicine.name : '';
                    }
                    
                    return updatedItem;
                }
                return item;
            });
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateMedicineItems()) {
            return;
        }

        setLoading(true);
        
        try {
            const prescriptionData = {
                appointmentId: props.appointmentId,
                patientId: props.patientSelected,
                doctorId: currentUser?.doctorId || props.doctorId,
                remarks: remarks,
                medicines: medicineItems.map(item => ({
                    medicineId: item.medicineId,
                    qty: parseInt(item.qty, 10),
                    dosage: item.dosage,
                    timing: item.timing,
                    duration: item.duration
                }))
            };

            await props.formOnSubmit(event, prescriptionData);
            
            setSuccessSnackbar(true);
            
            if (!props.existingPrescription) {
                setMedicineItems([]);
                setRemarks('');
            }
            
            setTimeout(() => {
                if (props.onCloseAfterSave) {
                    props.onCloseAfterSave();
                }
            }, 2000);
            
        } catch (error) {
            console.error("Error saving prescription:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to save prescription";
            setErrorMessage(errorMsg);
            setErrorSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (props.onCancel) {
            props.onCancel();
        } else {
            window.history.back();
        }
    };

    const renderMedicineItems = () => {
        if (medicineItems.length === 0) {
            return (
                <div className="text-center py-4">
                    <Alert severity="info" className="mb-3">
                        <strong>No medicines added yet.</strong>
                        <div className="mt-2">
                            Click "Add Medicine" to start creating the prescription.
                        </div>
                    </Alert>
                </div>
            );
        }

        return medicineItems.map((item, index) => (
            <div className="card mb-3 p-3 shadow-sm" key={item.id}>
                <div className="row align-items-start">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <label className="fw-bold mb-2">
                            Medicine {index + 1} <span className="text-danger">*</span>
                        </label>
                        <select
                            required
                            className="form-control"
                            value={item.medicineId}
                            onChange={(e) => handleMedicineChange(item.id, 'medicineId', e.target.value)}
                        >
                            <option value="">Select Medicine</option>
                            {medicines.map((medicine) => (
                                <option key={medicine._id} value={medicine._id}>
                                    {medicine.name} {medicine.strength && `(${medicine.strength})`}
                                    {medicine.stock && ` - Stock: ${medicine.stock}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="col-md-2 mb-3 mb-md-0">
                        <label className="fw-bold mb-2">
                            Quantity <span className="text-danger">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            className="form-control"
                            placeholder="e.g., 10"
                            value={item.qty}
                            onChange={(e) => handleMedicineChange(item.id, 'qty', e.target.value)}
                            min="1"
                            step="1"
                        />
                    </div>
                    
                    <div className="col-md-3 mb-3 mb-md-0">
                        <label className="fw-bold mb-2">
                            Dosage <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            className="form-control"
                            placeholder="e.g., 1 tablet twice daily"
                            value={item.dosage}
                            onChange={(e) => handleMedicineChange(item.id, 'dosage', e.target.value)}
                        />
                    </div>
                    
                    <div className="col-md-2 mb-3 mb-md-0">
                        <label className="fw-bold mb-2">Timing</label>
                        <select
                            className="form-control"
                            value={item.timing || "after meal"}
                            onChange={(e) => handleMedicineChange(item.id, 'timing', e.target.value)}
                        >
                            <option value="before meal">Before Meal</option>
                            <option value="after meal">After Meal</option>
                            <option value="with meal">With Meal</option>
                            <option value="morning">Morning</option>
                            <option value="evening">Evening</option>
                            <option value="night">Night</option>
                            <option value="as needed">As Needed</option>
                        </select>
                    </div>
                    
                    <div className="col-md-1">
                        <label className="fw-bold mb-2 invisible d-none d-md-block">Action</label>
                        <button
                            type="button"
                            className="btn btn-outline-danger w-100"
                            onClick={() => handleDeleteClick(item.id)}
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
                
                <div className="row mt-3">
                    <div className="col-md-6">
                        <label className="fw-bold mb-2">Duration</label>
                        <select
                            className="form-control"
                            value={item.duration || "3 days"}
                            onChange={(e) => handleMedicineChange(item.id, 'duration', e.target.value)}
                        >
                            <option value="1 day">1 Day</option>
                            <option value="3 days">3 Days</option>
                            <option value="5 days">5 Days</option>
                            <option value="7 days">7 Days</option>
                            <option value="10 days">10 Days</option>
                            <option value="14 days">14 Days</option>
                            <option value="1 month">1 Month</option>
                            <option value="3 months">3 Months</option>
                            <option value="6 months">6 Months</option>
                        </select>
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <form name={props.formName} onSubmit={handleSubmit}>
            <div className="form-row">
                {/* Patient Information */}
                <div className="form-group col-11 mx-auto mb-3">
                    <label htmlFor="patient" className="fw-bold mb-2">
                        Patient Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        id="patient"
                        className="form-control bg-light"
                        value={selectedPatientName}
                        disabled
                        readOnly
                    />
                    <small className="text-muted">Prescription for selected patient</small>
                </div>

                {/* Doctor Information */}
                <div className="form-group col-11 mx-auto mb-3">
                    <label className="fw-bold mb-2">
                        Prescribing Doctor <span className="text-danger">*</span>
                    </label>
                    <input 
                        type="text" 
                        className="form-control bg-light" 
                        disabled 
                        readOnly
                        value={`Dr. ${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()}
                    />
                </div>

                {/* Remarks/Instructions */}
                <div className="form-group col-11 mx-auto mb-3">
                    <label htmlFor="remarks" className="fw-bold mb-2">
                        Doctor's Remarks & Instructions
                    </label>
                    <textarea 
                        className="form-control" 
                        id="remarks" 
                        name="remarks" 
                        rows="4"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter any special instructions, precautions, or notes for the patient..."
                    ></textarea>
                    <small className="text-muted">Include diet restrictions, precautions, follow-up instructions, or any additional notes</small>
                </div>

                {/* Medicines Section */}
                <div className="form-group col-11 mx-auto mb-3">
                    <label className="fw-bold mb-2">
                        Prescribed Medicines <span className="text-danger">*</span>
                        <span className="ms-2 text-muted fs-6">({medicineItems.length} {medicineItems.length === 1 ? 'item' : 'items'})</span>
                    </label>
                    <div className="medicineDiv" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {renderMedicineItems()}
                    </div>
                    
                    <div className="text-center mt-3">
                        <Button 
                            variant="outlined" 
                            onClick={addMedicineItem} 
                            className="my-2"
                            style={{ border: "1px solid rgb(49, 179, 114)", color: "rgb(49, 179, 114)" }}
                            startIcon={<AddIcon />}
                            disabled={medicines.length === 0 || loading}
                        >
                            Add Medicine
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hidden fields */}
            <input type="hidden" name="appointmentId" value={props.appointmentId} />

            {/* Form Actions */}
            <div className="text-center mt-4 pb-4">
                <button 
                    type="submit" 
                    className="btn btn-primary px-5 py-2" 
                    id="customBtn" 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} color="inherit" />
                            <span className="ms-2">Saving Prescription...</span>
                        </>
                    ) : (
                        <>
                            <SaveIcon className="me-2" />
                            {isEditing ? 'Update Prescription' : 'Save Prescription'}
                        </>
                    )}
                </button>
                <button 
                    type="button" 
                    className="btn btn-secondary px-5 py-2 ms-2" 
                    onClick={handleCancel}
                    disabled={loading}
                >
                    <CancelIcon className="me-2" />
                    Cancel
                </button>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={cancelDelete}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    <DeleteIcon className="me-2 text-danger" />
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to remove this medicine from the prescription?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={successSnackbar}
                autoHideDuration={3000}
                onClose={() => setSuccessSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSuccessSnackbar(false)} elevation={6}>
                    {isEditing ? 'Prescription updated successfully!' : 'Prescription saved successfully!'}
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={errorSnackbar}
                autoHideDuration={6000}
                onClose={() => setErrorSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setErrorSnackbar(false)} elevation={6}>
                    <strong>Error:</strong> {errorMessage}
                </Alert>
            </Snackbar>
        </form>
    );
}

// PropTypes
PrescriptionForm.propTypes = {
    formName: PropTypes.string,
    appointmentId: PropTypes.string,
    patientSelected: PropTypes.string.isRequired,
    patientName: PropTypes.string,
    patientFirstName: PropTypes.string,
    patientLastName: PropTypes.string,
    doctorId: PropTypes.string,
    patientList: PropTypes.array,
    existingPrescription: PropTypes.object,
    formOnSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
    onCloseAfterSave: PropTypes.func,
    remarksRequired: PropTypes.bool
};

// Default props
PrescriptionForm.defaultProps = {
    formName: 'prescriptionForm',
    appointmentId: '',
    patientName: '',
    patientFirstName: '',
    patientLastName: '',
    doctorId: '',
    patientList: [],
    existingPrescription: null,
    onCancel: null,
    onSuccess: null,
    onCloseAfterSave: null,
    remarksRequired: false
};

export default PrescriptionForm;