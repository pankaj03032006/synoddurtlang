import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import DoctorTable from '../MUITable/DoctorTable';
import { CircularProgress, TextField, InputAdornment, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

function DoctorList() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const nameParam = searchParams.get('name');

    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(nameParam || '');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [departments, setDepartments] = useState([]);
    
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    const [successSnackbar, setSuccessSnackbar] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleDialogueOpen = () => setErrorDialogueBoxOpen(true);
    const handleDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false);
    };

    const handleSuccessClose = () => {
        setSuccessSnackbar(false);
        setDeleteSuccess(false);
    };

    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
    };

    const handleDepartmentFilter = (dept) => {
        setDepartmentFilter(dept);
        handleFilterClose();
        filterDoctors(doctors, dept, searchTerm);
    };

    const clearFilters = () => {
        setDepartmentFilter('');
        setSearchTerm('');
        filterDoctors(doctors, '', '');
        navigate('/doctors');
    };

    const getdoctors = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://hospital-management-system-2-dni5.onrender.com/doctors", {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setDoctors(response.data);
            filterDoctors(response.data, departmentFilter, searchTerm);
            
            // Extract unique departments
            const uniqueDepts = [...new Set(response.data.map(doc => doc.department))];
            setDepartments(uniqueDepts);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setErrorList([error.response?.data?.message || "Failed to fetch doctors"]);
            handleDialogueOpen();
        } finally {
            setLoading(false);
        }
    }, [departmentFilter, searchTerm]);

    const filterDoctors = (docs, dept, search) => {
        let filtered = [...docs];
        
        // Filter by department
        if (dept) {
            filtered = filtered.filter(doc => doc.department === dept);
        }
        
        // Filter by search term (name)
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(doc => 
                doc.userId?.firstName?.toLowerCase().includes(searchLower) ||
                doc.userId?.lastName?.toLowerCase().includes(searchLower) ||
                `${doc.userId?.firstName} ${doc.userId?.lastName}`.toLowerCase().includes(searchLower)
            );
        }
        
        setFilteredDoctors(filtered);
    };

    const deleteDoctor = async (id) => {
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            try {
                await axios.delete(`https://hospital-management-system-2-dni5.onrender.com/doctors/${id}`, {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                setDeleteSuccess(true);
                setSuccessSnackbar(true);
                getdoctors(); // Refresh the list
            } catch (error) {
                console.error("Error deleting doctor:", error);
                setErrorList([error.response?.data?.message || "Failed to delete doctor"]);
                handleDialogueOpen();
            }
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const term = event.target.elements.searchName?.value || '';
        setSearchTerm(term);
        filterDoctors(doctors, departmentFilter, term);
        navigate(`/doctors${term ? `?name=${encodeURIComponent(term)}` : ''}`);
    };

    const handleSearchChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        filterDoctors(doctors, departmentFilter, term);
        
        // Update URL without refreshing
        const newUrl = term ? `/doctors?name=${encodeURIComponent(term)}` : '/doctors';
        navigate(newUrl, { replace: true });
    };

    const refreshList = () => {
        getdoctors();
        setSearchTerm('');
        setDepartmentFilter('');
        navigate('/doctors');
    };

    useEffect(() => {
        getdoctors();
    }, [getdoctors]);

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div className="page-wrapper">
                <div className="content">
                    <div className="row mb-4">
                        <div className="col-sm-4 col-3">
                            <h4 className="page-title">Doctor Management</h4>
                            <p className="text-muted">Manage your hospital doctors and their information</p>
                        </div>
                        <div className="col-sm-8 col-9 text-right">
                            <Link to="/doctors/add" className="btn btn-primary float-right btn-rounded">
                                <i className="fa fa-plus"></i> Add New Doctor
                            </Link>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="row mb-4">
                        <div className="col-md-8">
                            <form onSubmit={handleSearch}>
                                <div className="input-group">
                                    <TextField
                                        name="searchName"
                                        placeholder="Search by doctor name..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ backgroundColor: 'white' }}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary ms-2"
                                        style={{ display: 'none' }}
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-4 text-right">
                            <button 
                                className="btn btn-outline-secondary me-2"
                                onClick={refreshList}
                            >
                                <RefreshIcon /> Refresh
                            </button>
                            <button 
                                className="btn btn-outline-primary"
                                onClick={handleFilterClick}
                            >
                                <FilterListIcon /> Filter
                                {departmentFilter && <span className="badge bg-primary ms-2">1</span>}
                            </button>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleFilterClose}
                            >
                                <MenuItem onClick={() => handleDepartmentFilter('')}>
                                    <strong>All Departments</strong>
                                </MenuItem>
                                {departments.map(dept => (
                                    <MenuItem key={dept} onClick={() => handleDepartmentFilter(dept)}>
                                        {dept}
                                    </MenuItem>
                                ))}
                            </Menu>
                            {(departmentFilter || searchTerm) && (
                                <button 
                                    className="btn btn-link ms-2"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(departmentFilter || searchTerm) && (
                        <div className="row mb-3">
                            <div className="col-12">
                                <div className="alert alert-info">
                                    <strong>Active Filters:</strong>
                                    {departmentFilter && <span className="badge bg-primary ms-2 me-2">{departmentFilter}</span>}
                                    {searchTerm && <span className="badge bg-secondary">Search: {searchTerm}</span>}
                                    <button className="btn btn-sm btn-link" onClick={clearFilters}>
                                        Clear all
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="text-center py-5">
                            <CircularProgress />
                            <p className="mt-3 text-muted">Loading doctors...</p>
                        </div>
                    ) : (
                        <>
                            {/* Statistics Summary */}
                            <div className="row mb-3">
                                <div className="col-12">
                                    <p className="text-muted">
                                        Showing {filteredDoctors.length} of {doctors.length} doctors
                                        {departmentFilter && ` in ${departmentFilter} department`}
                                    </p>
                                </div>
                            </div>

                            {/* Doctor Table */}
                            <DoctorTable 
                                doctorList={filteredDoctors} 
                                deleteDoctor={deleteDoctor} 
                            />

                            {/* Empty State */}
                            {filteredDoctors.length === 0 && (
                                <div className="text-center py-5 bg-light rounded">
                                    <i className="fa fa-user-md fa-4x text-muted mb-3"></i>
                                    <h5>No doctors found</h5>
                                    <p className="text-muted">
                                        {searchTerm || departmentFilter 
                                            ? "Try adjusting your search or filter criteria" 
                                            : "Click 'Add New Doctor' to get started"}
                                    </p>
                                    {(searchTerm || departmentFilter) && (
                                        <button className="btn btn-primary" onClick={clearFilters}>
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <ErrorDialogueBox
                    open={errorDialogueBoxOpen}
                    handleToClose={handleDialogueClose}
                    ErrorTitle="Error"
                    ErrorList={errorList}
                />

                <Snackbar
                    open={successSnackbar}
                    autoHideDuration={3000}
                    onClose={handleSuccessClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleSuccessClose} severity="success">
                        {deleteSuccess ? "Doctor deleted successfully!" : "Operation completed successfully!"}
                    </Alert>
                </Snackbar>
            </div>
        </Box>
    );
}

export default DoctorList;