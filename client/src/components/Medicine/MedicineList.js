// client/src/components/Medicine/MedicineList.js
import { Link } from "react-router-dom";
import axios from "axios";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import React, { useEffect, useState, useCallback } from 'react';

function MedicineList() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');

    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState(null);
    const [successSnackbar, setSuccessSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);

    const handleDialogueOpen = useCallback(() => {
        setErrorDialogueBoxOpen(true);
    }, []);

    const handleDialogueClose = useCallback(() => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false);
    }, []);

    const getMedicines = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/medicines`, {
                params: {
                    name: name || undefined
                },
                headers: {
                    'authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });
            console.log("Fetched medicines:", response.data);
            setMedicines(response.data);
        } catch (error) {
            console.error("Error fetching medicines:", error);
            let errorMsg = "Failed to load medicines";
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }
            setErrorList([errorMsg]);
            handleDialogueOpen();
        } finally {
            setLoading(false);
        }
    }, [name, handleDialogueOpen]);

    useEffect(() => {
        getMedicines();
    }, [getMedicines]);

    const handleDeleteClick = (medicine) => {
        setMedicineToDelete(medicine);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!medicineToDelete) return;
        
        setDeleteLoading(true);
        
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/medicines/${medicineToDelete._id}`, {
                headers: {
                    'authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });
            
            setSuccessMessage(`Medicine "${medicineToDelete.name}" deleted successfully!`);
            setSuccessSnackbar(true);
            await getMedicines();
            
        } catch (error) {
            console.error("Error deleting medicine:", error);
            let errorMsg = "Failed to delete medicine";
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }
            setErrorList([errorMsg]);
            handleDialogueOpen();
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
            setMedicineToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setMedicineToDelete(null);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const searchName = formData.get('name');
        
        if (searchName) {
            window.location.href = `/admin/dashboard/medicines?name=${encodeURIComponent(searchName)}`;
        } else {
            window.location.href = `/admin/dashboard/medicines`;
        }
    };

    // SAFE FUNCTION: Get quantity with proper fallback
    const getQuantity = (quantity) => {
        if (quantity === undefined || quantity === null) return 0;
        const qty = typeof quantity === 'string' ? parseInt(quantity) : quantity;
        return isNaN(qty) ? 0 : qty;
    };

    // SAFE FUNCTION: Get stock status
    const getStockStatus = (quantity) => {
        const qty = getQuantity(quantity);
        
        if (qty === 0) {
            return <span className="badge bg-danger">Out of Stock</span>;
        } else if (qty < 10) {
            return <span className="badge bg-warning text-dark">Low Stock ({qty})</span>;
        } else if (qty < 50) {
            return <span className="badge bg-info">In Stock ({qty})</span>;
        } else {
            return <span className="badge bg-success">Well Stocked ({qty})</span>;
        }
    };

    // SAFE FUNCTION: Format price
    const formatPrice = (price) => {
        if (!price && price !== 0) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(price);
    };

    // SAFE FUNCTION: Get discount percentage
    const getDiscountPercentage = (basePrice, finalPrice) => {
        if (!basePrice || !finalPrice || basePrice <= finalPrice) return 0;
        return ((basePrice - finalPrice) / basePrice * 100).toFixed(1);
    };

    // SAFE FUNCTION: Get total value
    const getTotalValue = (price, quantity) => {
        if (!price) return 0;
        const qty = getQuantity(quantity);
        return price * qty;
    };

    // Calculate summary statistics safely
    const totalMedicines = medicines.length;
    const totalUnits = medicines.reduce((sum, m) => sum + getQuantity(m.quantity), 0);
    const totalStockValue = medicines.reduce((sum, m) => sum + getTotalValue(m.price, m.quantity), 0);
    const lowStockItems = medicines.filter(m => {
        const qty = getQuantity(m.quantity);
        return qty > 0 && qty < 10;
    }).length;
    const outOfStockItems = medicines.filter(m => getQuantity(m.quantity) === 0).length;

    if (loading) {
        return (
            <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="text-center">
                    <CircularProgress size={50} />
                    <p className="mt-3 text-muted">Loading medicines...</p>
                </div>
            </Box>
        );
    }

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div className="page-wrapper">
                <div className="content">
                    <div className="row">
                        <div className="col-sm-4 col-3">
                            <h4 className="page-title">Medicine Inventory</h4>
                            {name && (
                                <p className="text-muted">
                                    Showing results for: <strong>"{name}"</strong>
                                    <Link to="/admin/dashboard/medicines" className="ms-2 text-decoration-none">
                                        (Clear filter)
                                    </Link>
                                </p>
                            )}
                        </div>
                        <div className="col-sm-8 col-9 text-right m-b-20">
                            <Link to="/admin/dashboard/medicines/add" className="btn btn-primary float-right btn-rounded">
                                <i className="fa fa-plus"></i> Add Medicine
                            </Link>
                        </div>
                    </div>
                    
                    {/* Search Form */}
                    <form onSubmit={handleSearch}>
                        <div className="row filter-row">
                            <div className="col-sm-4 col-md-4">
                                <div className="form-floating">
                                    <input 
                                        type="text" 
                                        name="name" 
                                        className="form-control" 
                                        placeholder="Medicine Name"
                                        defaultValue={name || ''}
                                    />
                                    <label className="focus-label">Medicine Name</label>
                                </div>
                            </div>
                            <div className="col-sm-4 col-md-4">
                                <button type="submit" className="btn btn-primary btn-block">
                                    <i className="fa fa-search"></i> Search
                                </button>
                                {name && (
                                    <Link to="/admin/dashboard/medicines" className="btn btn-secondary btn-block ms-2">
                                        <i className="fa fa-times"></i> Clear
                                    </Link>
                                )}
                            </div>
                        </div>
                    </form>
                    
                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card bg-primary text-white">
                                <div className="card-body">
                                    <h6 className="card-title">Total Medicines</h6>
                                    <h3 className="mb-0">{totalMedicines}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card bg-success text-white">
                                <div className="card-body">
                                    <h6 className="card-title">Total Stock Value</h6>
                                    <h4 className="mb-0">{formatPrice(totalStockValue)}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card bg-info text-white">
                                <div className="card-body">
                                    <h6 className="card-title">Total Units</h6>
                                    <h3 className="mb-0">{totalUnits}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card bg-warning text-dark">
                                <div className="card-body">
                                    <h6 className="card-title">Low/Out Stock</h6>
                                    <h3 className="mb-0">
                                        {lowStockItems + outOfStockItems}
                                        <small className="text-muted fs-6">
                                            ({outOfStockItems} out)
                                        </small>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Medicine Table */}
                    <div className="row">
                        <div className="col-md-12">
                            <div className="table-responsive">
                                {medicines.length === 0 ? (
                                    <div className="text-center py-5">
                                        <Alert severity="info">
                                            {name ? 
                                                `No medicines found matching "${name}".` : 
                                                "No medicines available. Click 'Add Medicine' to create one."
                                            }
                                        </Alert>
                                    </div>
                                ) : (
                                    <table className="table table-striped custom-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Company/Brand</th>
                                                <th>Medicine Name</th>
                                                <th>Description</th>
                                                <th className="text-center">Quantity</th>
                                                <th className="text-end">Base Price</th>
                                                <th className="text-end">Selling Price</th>
                                                <th className="text-center">Discount</th>
                                                <th className="text-end">Total Value</th>
                                                <th className="text-center">Status</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {medicines.map((medicine, index) => {
                                                const quantity = getQuantity(medicine.quantity);
                                                const discount = getDiscountPercentage(medicine.basePrice, medicine.price);
                                                const totalValue = getTotalValue(medicine.price, quantity);
                                                
                                                return (
                                                    <tr key={medicine._id || index}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <strong>{medicine.company || 'N/A'}</strong>
                                                        </td>
                                                        <td>{medicine.name || 'N/A'}</td>
                                                        <td>
                                                            {medicine.description ? (
                                                                <small className="text-muted">
                                                                    {medicine.description.length > 50 
                                                                        ? medicine.description.substring(0, 50) + '...' 
                                                                        : medicine.description}
                                                                </small>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="fw-bold">{quantity}</span>
                                                        </td>
                                                        <td className="text-end">
                                                            <span className="text-secondary">
                                                                {medicine.basePrice ? formatPrice(medicine.basePrice) : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="text-end">
                                                            <span className="text-success fw-bold">
                                                                {medicine.price ? formatPrice(medicine.price) : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            {discount > 0 ? (
                                                                <span className="badge bg-success">{discount}% off</span>
                                                            ) : (
                                                                <span className="badge bg-secondary">0%</span>
                                                            )}
                                                        </td>
                                                        <td className="text-end">
                                                            <span className="text-primary fw-bold">
                                                                {formatPrice(totalValue)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            {getStockStatus(medicine.quantity)}
                                                        </td>
                                                        <td className="text-center">
                                                            <Link 
                                                                to={`/admin/dashboard/medicines/edit/${medicine._id}`} 
                                                                className="btn btn-warning btn-sm me-1"
                                                                title="Edit Medicine"
                                                            >
                                                                <i className="fa fa-edit"></i> Edit
                                                            </Link>
                                                            <button 
                                                                onClick={() => handleDeleteClick(medicine)} 
                                                                className="btn btn-danger btn-sm"
                                                                disabled={deleteLoading}
                                                                title="Delete Medicine"
                                                            >
                                                                <i className="fa fa-trash"></i> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        {totalUnits > 0 && (
                                            <tfoot>
                                                <tr className="table-info">
                                                    <td colSpan="4" className="text-end fw-bold">Totals:</td>
                                                    <td className="text-center fw-bold">{totalUnits}</td>
                                                    <td colSpan="2"></td>
                                                    <td colSpan="2" className="text-end fw-bold">
                                                        {formatPrice(totalStockValue)}
                                                    </td>
                                                    <td colSpan="2"></td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <ErrorDialogueBox
                    open={errorDialogueBoxOpen}
                    handleToClose={handleDialogueClose}
                    ErrorTitle="Error"
                    ErrorList={errorList}
                />
                
                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={cancelDelete}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete the medicine 
                            <strong> "{medicineToDelete?.name}"</strong>?
                            <br />
                            <span className="text-danger mt-2 d-block">
                                This action cannot be undone.
                            </span>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelDelete} color="primary" disabled={deleteLoading}>
                            Cancel
                        </Button>
                        <Button onClick={confirmDelete} color="error" disabled={deleteLoading}>
                            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
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
                        {successMessage}
                    </Alert>
                </Snackbar>
            </div>
        </Box>
    );
}

export default MedicineList;