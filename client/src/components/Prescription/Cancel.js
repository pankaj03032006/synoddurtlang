import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';

const Cancel = () => {
  const [session, setSession] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const queryLocation = location.search;

  const fetchSession = useCallback(async () => {
    if (!queryLocation) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL + '/api/paypal/cancel' + queryLocation
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      setSession(products);
    } catch (error) {
      console.error('Error fetching session:', error);
      setError(error.message || 'Failed to fetch session data');
      setSession({ status: 'fail', msg: 'An error occurred while processing your request' });
    } finally {
      setLoading(false);
    }
  }, [queryLocation]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Show loading state
  if (loading) {
    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <div className="page-wrapper">
          <div className="content">
            <div className="row filter-row">
              <div className="text-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p>Processing your cancellation...</p>
              </div>
            </div>
          </div>
        </div>
      </Box>
    );
  }

  // Show error state
  if (error && !session.status) {
    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <div className="page-wrapper">
          <div className="content">
            <div className="row filter-row">
              <h1>Error</h1>
              <h4 className="page-title">{error}</h4>
              <Link to="/prescriptions" className="btn btn-primary mt-3">Go to Prescriptions</Link>
            </div>
          </div>
        </div>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <div className="page-wrapper">
        <div className="content">
          {session.status === 'fail' ? (
            <div className="row filter-row">
              <h1>Your payment was canceled</h1>
              <h4 className="page-title">
                <Link to="/prescriptions">{session.msg || 'Return to Prescriptions'}</Link>
              </h4>
            </div>
          ) : (
            <div className="row filter-row">
              <h1>Payment Cancelled</h1>
              <h4 className="page-title">
                <Link to="/prescriptions">Return to Prescriptions</Link>
              </h4>
            </div>
          )}
        </div>
      </div>
    </Box>
  );
};

export default Cancel;