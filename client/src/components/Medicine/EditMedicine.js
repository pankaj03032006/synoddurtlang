// client/src/components/Medicine/Editmedicine.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import axios from "axios";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import SearchableDropdown from '../SearchableDropdown';
import { 
  getAllMedicines, 
  medicineBrands, 
  getMedicinesByBrand,
  // getMedicineBasePrice 
} from '../../utils/medicinesData';
import { 
  calculateTieredPrice, 
  getPriceTierLabel, 
  calculateSavings,
  priceTiers 
} from '../../utils/pricingConfig';

function Editmedicine() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [showPricingDetails, setShowPricingDetails] = useState(false);
  
  // const [medicinesList, setMedicinesList] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [brandsList] = useState(medicineBrands);
  
  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const handleDialogueOpen = useCallback(() => {
    setErrorDialogueBoxOpen(true);
  }, []);

  const handleDialogueClose = useCallback(() => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false);
  }, []);

  // Load all medicines on component mount
  useEffect(() => {
    const medicines = getAllMedicines();
    // setMedicinesList(medicines);
    setFilteredMedicines(medicines);
  }, []);

  // Filter medicines when brand is selected
  useEffect(() => {
    if (company) {
      const filtered = getMedicinesByBrand(company);
      setFilteredMedicines(filtered);
    } else {
      const all = getAllMedicines();
      setFilteredMedicines(all);
    }
  }, [company]);

  // Handle medicine selection
  const handleMedicineSelect = useCallback((selectedMedicine) => {
    console.log("Selected medicine:", selectedMedicine);
    
    if (!selectedMedicine) {
      setName('');
      setBasePrice('');
      setPrice('');
      setShowPricingDetails(false);
      return;
    }
    
    let medicineName = '';
    let medicinePrice = null;
    
    // Handle both string and object selection
    if (typeof selectedMedicine === 'object') {
      medicineName = selectedMedicine.name;
      medicinePrice = parseFloat(selectedMedicine.basePrice);
    } else {
      medicineName = selectedMedicine;
      // Find the medicine in filteredMedicines
      const medicine = filteredMedicines.find(m => m.name === medicineName);
      if (medicine) {
        medicinePrice = parseFloat(medicine.basePrice);
      }
    }
    
    setName(medicineName);
    
    if (medicinePrice && !isNaN(medicinePrice)) {
      setBasePrice(medicinePrice);
      
      if (quantity && parseInt(quantity) > 0) {
        const quantityValue = parseInt(quantity);
        const calculatedPrice = calculateTieredPrice(medicinePrice, quantityValue);
        setPrice(calculatedPrice);
        setShowPricingDetails(true);
      } else {
        setPrice(medicinePrice);
        setShowPricingDetails(false);
      }
    }
    
    if (fieldErrors.name) {
      setFieldErrors(prev => ({ ...prev, name: '' }));
    }
  }, [filteredMedicines, quantity, fieldErrors.name]);

  // Handle brand selection
  const handleBrandSelect = useCallback((selectedBrand) => {
    console.log("Selected brand:", selectedBrand);
    setCompany(selectedBrand || '');
    if (fieldErrors.company) {
      setFieldErrors(prev => ({ ...prev, company: '' }));
    }
  }, [fieldErrors.company]);

  // Update price when quantity changes
  useEffect(() => {
    if (basePrice && parseFloat(basePrice) > 0 && quantity && parseInt(quantity) > 0) {
      const quantityValue = parseInt(quantity);
      const calculatedPrice = calculateTieredPrice(parseFloat(basePrice), quantityValue);
      setPrice(calculatedPrice);
      setShowPricingDetails(true);
    } else if (basePrice && parseFloat(basePrice) > 0) {
      setPrice(parseFloat(basePrice));
      setShowPricingDetails(false);
    }
  }, [quantity, basePrice]);

  const getmedicineById = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/medicines/${id}`, {
        headers: {
          'authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.data) {
        setCompany(response.data.company || '');
        setName(response.data.name || '');
        setDescription(response.data.description || '');
        setBasePrice(response.data.basePrice || response.data.price || '');
        setPrice(response.data.price || '');
        setQuantity(response.data.quantity || '');
        
        // If quantity exists, show pricing details
        if (response.data.quantity && response.data.quantity > 0) {
          setShowPricingDetails(true);
        }
      }
    } catch (error) {
      console.error("Error fetching medicine:", error);
      let errorMsg = "Failed to load medicine details";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setErrorList([errorMsg]);
      handleDialogueOpen();
      
      // Navigate back after a short delay if medicine not found
      setTimeout(() => {
        navigate("/admin/dashboard/medicines");
      }, 2000);
    } finally {
      setFetchLoading(false);
    }
  }, [id, navigate, handleDialogueOpen]);

  useEffect(() => {
    getmedicineById();
  }, [getmedicineById]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!company || company.trim() === '') {
      errors.company = "Please select a brand";
    }
    
    if (!name || name.trim() === '') {
      errors.name = "Please select a medicine name";
    }
    
    if (!basePrice) {
      errors.basePrice = "Base price not found for this medicine";
    } else if (isNaN(basePrice) || parseFloat(basePrice) <= 0) {
      errors.basePrice = "Invalid base price";
    }
    
    if (!price) {
      errors.price = "Final price is required";
    } else if (isNaN(price) || parseFloat(price) <= 0) {
      errors.price = "Price must be a positive number";
    }
    
    if (!quantity && quantity !== 0) {
      errors.quantity = "Quantity is required";
    } else if (isNaN(quantity) || !Number.isInteger(parseFloat(quantity))) {
      errors.quantity = "Quantity must be a whole number";
    } else if (parseInt(quantity) < 0) {
      errors.quantity = "Quantity cannot be negative";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [company, name, basePrice, price, quantity]);

  const updatemedicine = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const medicineData = {
        company: company.trim(),
        name: name.trim(),
        description: description.trim(),
        basePrice: parseFloat(basePrice),
        price: parseFloat(price),
        quantity: parseInt(quantity),
        totalValue: parseFloat(price) * parseInt(quantity)
      };
      
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL || 'https://hospital-management-system-2-dni5.onrender.com'}/medicines/${id}`,
        medicineData,
        {
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      if (response.data.message === "success") {
        setSuccessSnackbar(true);
        
        setTimeout(() => {
          navigate("/admin/dashboard/medicines");
        }, 1500);
      } else {
        if (response.data.errors && Array.isArray(response.data.errors)) {
          setErrorList(response.data.errors);
        } else if (response.data.message) {
          setErrorList([response.data.message]);
        } else {
          setErrorList(["Failed to update medicine. Please try again."]);
        }
        handleDialogueOpen();
      }
    } catch (error) {
      console.error("Error updating medicine:", error);
      
      let errorMsg = "Failed to update medicine";
      if (error.response?.data?.errors) {
        setErrorList(error.response.data.errors);
        handleDialogueOpen();
        return;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorList([errorMsg]);
      handleDialogueOpen();
    } finally {
      setLoading(false);
    }
  }, [company, name, description, basePrice, price, quantity, id, validateForm, navigate, handleDialogueOpen]);

  const handleCancel = useCallback(() => {
    navigate("/admin/dashboard/medicines");
  }, [navigate]);

  // Calculate savings display
  const savingsInfo = basePrice && quantity && price ? 
    calculateSavings(parseFloat(basePrice), parseInt(quantity), parseFloat(price)) : null;

  const currentTier = quantity ? getPriceTierLabel(parseInt(quantity)) : null;

  // Show loading indicator while fetching data
  if (fetchLoading) {
    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="text-center">
          <CircularProgress size={50} />
          <p className="mt-3 text-muted">Loading medicine details...</p>
        </div>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <div className="page-wrapper">
        <div className="content">
          <div className="card-box">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <h3 className="page-title">Edit Medicine</h3>
                <p className="text-muted">Update the medicine details</p>
                
                <div className="alert alert-info">
                  <strong>🔍 How it works:</strong> Update brand or medicine name. Price will be automatically
                  adjusted based on the selected medicine and quantity!
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <form id="editmedicineForm" name="editmedicineForm" onSubmit={updatemedicine}>
                  <div className="row">
                    {/* Brand Name */}
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label>Select Brand <span className="text-danger">*</span></label>
                        <SearchableDropdown
                          options={brandsList}
                          label="Choose brand"
                          placeholder="Search or select brand..."
                          value={company}
                          onChange={handleBrandSelect}
                          required={true}
                          disabled={loading}
                          error={!!fieldErrors.company}
                          helperText={fieldErrors.company}
                        />
                        <small className="text-muted">Select brand to see available medicines</small>
                      </div>
                    </div>
                    
                    {/* Medicine Name */}
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label>Medicine Name <span className="text-danger">*</span></label>
                        <SearchableDropdown
                          options={filteredMedicines}
                          label="Choose medicine"
                          placeholder={company ? "Search or select medicine..." : "Please select a brand first"}
                          value={name}
                          onChange={handleMedicineSelect}
                          required={true}
                          disabled={loading || !company}
                          error={!!fieldErrors.name}
                          helperText={fieldErrors.name || (company ? `${filteredMedicines.length} medicines available for ${company}` : '')}
                          getOptionLabel={(option) => {
                            if (typeof option === 'string') return option;
                            return option.name || '';
                          }}
                          renderOption={(props, option) => (
                            <li {...props}>
                              <div>
                                <strong>{option.name}</strong>
                                <br />
                                <small className="text-muted">
                                  Category: {option.category} | Base Price: ₹{option.basePrice}
                                </small>
                              </div>
                            </li>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Quantity <span className="text-danger">*</span></label>
                        <input 
                          name="quantity" 
                          className={`form-control ${fieldErrors.quantity ? 'is-invalid' : ''}`} 
                          type="number" 
                          required 
                          value={quantity} 
                          onChange={(event) => {
                            setQuantity(event.target.value);
                            if (fieldErrors.quantity) {
                              setFieldErrors(prev => ({ ...prev, quantity: '' }));
                            }
                          }}
                          disabled={loading || !name}
                          placeholder="Enter quantity"
                          min="0"
                          step="1"
                        />
                        {fieldErrors.quantity && (
                          <div className="invalid-feedback">
                            {fieldErrors.quantity}
                          </div>
                        )}
                        <small className="text-muted">
                          {currentTier && `Current tier: ${currentTier}`}
                          {!name && "Select medicine first"}
                        </small>
                      </div>
                    </div>
                    
                    {/* Base Price Display */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Base Price (per unit)</label>
                        <input 
                          className="form-control bg-light" 
                          type="text" 
                          value={basePrice ? `₹${basePrice}` : 'Select medicine to see price'}
                          disabled
                          readOnly
                          style={{ backgroundColor: '#f8f9fa' }}
                        />
                        <small className="text-muted">Fixed price for this medicine from database</small>
                      </div>
                    </div>
                    
                    {/* Price Breakdown */}
                    {showPricingDetails && savingsInfo && (
                      <div className="col-sm-12">
                        <div className="alert alert-success">
                          <strong>📊 Price Breakdown:</strong>
                          <div className="row mt-2">
                            <div className="col-md-3">
                              <small>Base Price: ₹{savingsInfo.originalPricePerUnit}/unit</small>
                            </div>
                            <div className="col-md-3">
                              <small>Quantity: {quantity} units</small>
                            </div>
                            <div className="col-md-3">
                              <small>Price Tier: {currentTier}</small>
                            </div>
                            <div className="col-md-3">
                              <small>Final Price: ₹{savingsInfo.finalPricePerUnit}/unit</small>
                            </div>
                          </div>
                          <hr className="my-2" />
                          <div className="row">
                            <div className="col-md-4">
                              <strong>Original Total:</strong> ₹{savingsInfo.originalTotal}
                            </div>
                            <div className="col-md-4">
                              <strong>Discounted Total:</strong> ₹{savingsInfo.actualTotal}
                            </div>
                            <div className="col-md-4 text-success">
                              <strong>You Save:</strong> ₹{savingsInfo.savings} ({savingsInfo.savingsPercent}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Final Price */}
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>Final Price (per unit) <span className="text-danger">*</span></label>
                        <input 
                          name="price" 
                          className={`form-control ${fieldErrors.price ? 'is-invalid' : ''} bg-light`} 
                          type="number" 
                          required 
                          value={price} 
                          disabled={true}
                          readOnly
                          style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}
                        />
                        <small className="text-muted">
                          {price && basePrice && price < basePrice && 
                            `✨ ${((1 - price/basePrice) * 100).toFixed(1)}% discount applied!`}
                        </small>
                      </div>
                    </div>
                    
                    {/* Total Inventory Value */}
                    {price && quantity && (
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Total Inventory Value</label>
                          <input 
                            className="form-control bg-info text-white" 
                            type="text" 
                            value={`₹${(parseFloat(price) * parseInt(quantity)).toFixed(2)}`}
                            disabled
                            readOnly
                            style={{ fontWeight: 'bold' }}
                          />
                          <small className="text-muted">Total value of this medicine in stock</small>
                        </div>
                      </div>
                    )}
                    
                    {/* Description */}
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label>Description</label>
                        <textarea 
                          name="description" 
                          className="form-control" 
                          value={description} 
                          onChange={(event) => setDescription(event.target.value)}
                          disabled={loading}
                          rows="3"
                          placeholder="Enter medicine description (optional)"
                        />
                        <small className="text-muted">Brief description of the medicine</small>
                      </div>
                    </div>
                  </div>

                  {/* Price Tiers Reference */}
                  <div className="row mt-3">
                    <div className="col-sm-12">
                      <div className="card">
                        <div className="card-header bg-light">
                          <strong>💰 Bulk Discount Tiers</strong>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-link float-end"
                            onClick={() => setShowPricingDetails(!showPricingDetails)}
                          >
                            {showPricingDetails ? 'Hide' : 'Show'} Table
                          </button>
                        </div>
                        {showPricingDetails && (
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table table-sm table-bordered">
                                <thead className="thead-light">
                                  <tr>
                                    <th>Quantity Range</th>
                                    <th>Discount</th>
                                    <th>Price Tier</th>
                                    <th>Final Price/Unit</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {priceTiers.map((tier, index) => {
                                    const tierPrice = basePrice ? (basePrice * tier.multiplier).toFixed(2) : 0;
                                    return (
                                      <tr key={index} className={quantity >= tier.minQty && quantity <= tier.maxQty ? 'table-success' : ''}>
                                        <td>
                                          {tier.minQty === 1 ? '1-10' : `${tier.minQty}-${tier.maxQty === Infinity ? '+' : tier.maxQty}`}
                                        </td>
                                        <td>{(tier.multiplier * 100).toFixed(0)}% of base</td>
                                        <td className="fw-bold">₹{tierPrice}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="m-t-20 text-center mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary submit-btn me-2" 
                      disabled={loading}
                      style={{ minWidth: '150px' }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} color="inherit" />
                          <span className="ms-2">Updating...</span>
                        </>
                      ) : (
                        'Update Medicine'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary submit-btn" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        <ErrorDialogueBox
          open={errorDialogueBoxOpen}
          handleToClose={handleDialogueClose}
          ErrorTitle="Error: Edit Medicine"
          ErrorList={errorList}
        />
        
        {/* Success Snackbar */}
        <Snackbar
          open={successSnackbar}
          autoHideDuration={3000}
          onClose={() => setSuccessSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccessSnackbar(false)} elevation={6}>
            Medicine updated successfully! Redirecting to medicines list...
          </Alert>
        </Snackbar>
      </div>
    </Box>
  );
}

export default Editmedicine;