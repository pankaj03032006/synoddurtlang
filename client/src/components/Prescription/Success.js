import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';

const Success = () => {
  const [session, setSession] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
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
        process.env.REACT_APP_SERVER_URL + '/api/paypal/success' + queryLocation
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      setSession(products);
      
      // Set redirect flag for successful session
      if (products.status === 'success' || products.message === 'Session already create ') {
        setShouldRedirect(true);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setError(error.message || 'Failed to fetch session data');
      setSession({ status: 'fail', message: 'An error occurred while processing your payment' });
    } finally {
      setLoading(false);
    }
  }, [queryLocation]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Handle redirect after session is processed
  if (shouldRedirect) {
    return <Navigate to="/prescriptions" />;
  }

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
                <p>Processing your payment confirmation...</p>
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
              <h1>Payment Verification Error</h1>
              <h4>{error}</h4>
              <button 
                onClick={() => window.location.href = '/prescriptions'} 
                className="btn btn-primary mt-3"
              >
                Go to Prescriptions
              </button>
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
          {session.status === 'success' ? (
            <div className="row filter-row">
              <h1>Your payment succeeded</h1>
              <h4>View CheckoutSession response:</h4>
              <pre className="mt-3 p-3 bg-light rounded">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          ) : session.message === 'Session already create ' ? (
            <div className="row filter-row">
              <h1>Your payment Already Validated</h1>
              <h4>View CheckoutSession response:</h4>
              <pre className="mt-3 p-3 bg-light rounded">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          ) : session.status === 'fail' ? (
            <div className="row filter-row">
              <h1>Your payment Failed</h1>
              <h4>View CheckoutSession response:</h4>
              <pre className="mt-3 p-3 bg-light rounded">
                {JSON.stringify(session, null, 2)}
              </pre>
              <button 
                onClick={() => window.location.href = '/prescriptions'} 
                className="btn btn-primary mt-3"
              >
                Return to Prescriptions
              </button>
            </div>
          ) : (
            <div className="row filter-row">
              <h1>Processing your payment...</h1>
              <h4>Please wait while we verify your payment status.</h4>
            </div>
          )}
        </div>
      </div>
    </Box>
  );
};

export default Success;