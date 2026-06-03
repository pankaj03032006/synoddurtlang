import React, { useEffect, useState } from 'react';
import '../../assets/css/signup.css';
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';

function SignupPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [department, setDepartment] = useState('');
  const [passwordMatchDisplay, setPasswordMatchDisplay] = useState('none');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const departmentList = [
    'Cardiology',
    'Gynecology', 
    'Hematology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Radiology',
    'Emergency Medicine',
    'Oncology',
    'Dermatology'
  ];
  
  const handleDialogueOpen = () => {
    setErrorDialogueBoxOpen(true)
  };
  
  const handleDialogueClose = () => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false)
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    setSuccessMessage('');
    navigate("/login"); // Redirect to login page
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorList(["Password and Confirm Password do not match"]);
      handleDialogueOpen();
      return;
    }
    
    if (password.trim().length <= 6) {
      setErrorList(["Password length must be greater than 6 characters"]);
      handleDialogueOpen();
      return;
    }
    
    if (!termsAccepted) {
      setErrorList(["Please accept the terms and conditions"]);
      handleDialogueOpen();
      return;
    }
    
    if (!userType) {
      setErrorList(["Please select a user type"]);
      handleDialogueOpen();
      return;
    }
    
    if (userType === "Doctor" && !department) {
      setErrorList(["Please select a department for Doctor"]);
      handleDialogueOpen();
      return;
    }
    
    setIsSubmitting(true);
    
    let user = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      userType: userType
    };
    
    if (userType === "Doctor") {
      user.department = department;
    }
    
    try {
      console.log('Sending user data:', user);
      
      const response = await fetch('https://hospital-management-system-2-dni5.onrender.com/signup', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(user)
      });
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.status === 201 && data.message === "success") {
        // UPDATED: Removed email verification message
        setSuccessMessage("✓ Account created successfully! You can now login.");
        setSuccessDialogOpen(true);
      } else {
        const errorMessages = data.errors || [data.message || "An error occurred during signup"];
        setErrorList(errorMessages);
        handleDialogueOpen();
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      if (error.message === 'Failed to fetch') {
        setErrorList([
          "Cannot connect to backend server. Please check:",
          "1. Backend is running on port 3001",
          "2. Run 'nodemon index.js' in backend folder"
        ]);
      } else {
        setErrorList([error.message || "Failed to connect to server"]);
      }
      handleDialogueOpen();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (password && password.trim().length > 0 && password.trim().length <= 6) {
      setPasswordValidationMessage('Password Length must be greater than 6 characters');
    } else {
      setPasswordValidationMessage('');
    }
    
    if (password === confirmPassword) {
      setPasswordMatchDisplay('none');
    } else {
      setPasswordMatchDisplay('block');
    }
  }, [password, confirmPassword]);

  return (
    <div id="signUpBody">
      <div id="signUpBG">
        <div className='greenLayer'>
        </div>
      </div>
      <div className="signup-form">
        <h2>Create An Account</h2>
        <form id="signUpform" name='signUpform' onSubmit={handleSubmit}>
          <div className='d-flex flex-row mt-5'>
            <div className='col-6 form-floating mx-2'>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-control"
                placeholder="first name"
                value={firstName}
                required
                onChange={(event) => setFirstName(event.target.value)}
                disabled={isSubmitting}
              />
              <label htmlFor="firstName">First Name</label>
            </div>
            <div className='col-6 form-floating mx-2'>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-control"
                placeholder="last name"
                value={lastName}
                required
                onChange={(event) => setLastName(event.target.value)}
                disabled={isSubmitting}
              />
              <label htmlFor="lastName">Last Name</label>
            </div>
          </div>
          
          <div className='form-floating mt-3 col-12 mx-2'>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="form-control"
              disabled={isSubmitting}
            />
            <label htmlFor="email">Email</label>
          </div>
          
          <div className='form-floating mt-3 col-12 mx-2'>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="form-control"
              required
              placeholder="password"
              disabled={isSubmitting}
            />
            <label htmlFor="password">Password</label>
          </div>
          
          <div className="mx-2 text-danger">
            {passwordValidationMessage}
          </div>
          
          <div className='form-floating mt-3 col-12 mx-2'>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="form-control"
              required
              placeholder="confirm password"
              disabled={isSubmitting}
            />
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>
          
          <div
            className="mx-2 text-danger"
            style={{
              display: `${passwordMatchDisplay}`
            }}>
            Password did not match
          </div>
          
          <div className='form-floating mt-3 col-12 mx-2'>
            <select
              id="userType"
              name="userType"
              value={userType}
              onChange={(event) => setUserType(event.target.value)}
              className="form-select"
              required
              disabled={isSubmitting}
            >
              <option value="">Select User Type</option>
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
            </select>
            <label htmlFor="userType">User Type</label>
          </div>

          {userType === "Doctor" && (
            <div className='form-floating mt-3 col-12 mx-2'>
              <select
                id="department"
                name="department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="form-select"
                required
                disabled={isSubmitting}
              >
                <option value="">Select Department</option>
                {departmentList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <label htmlFor="department">Department</label>
            </div>
          )}
          
          <div className="form-group form-check mt-5 mx-2">
            <input 
              type="checkbox" 
              className="form-check-input" 
              id="terms-chkbox" 
              required 
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              disabled={isSubmitting}
            />
            <label className='' htmlFor="terms-chkbox">I agree with the terms and conditions</label>
          </div>
          
          <div className='text-center'>
            <button 
              id="signUpBtn" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
          
          <div className='text-center'>
            Already have an account? <NavLink to="/login">Sign In</NavLink>
          </div>
        </form>
      </div>
      
      {/* Error Dialog */}
      <ErrorDialogueBox
        open={errorDialogueBoxOpen}
        handleToClose={handleDialogueClose}
        ErrorTitle="Error Signing Up"
        ErrorList={errorList}
      />
      
      {/* Success Dialog */}
      <ErrorDialogueBox
        open={successDialogOpen}
        handleToClose={handleSuccessDialogClose}
        ErrorTitle="Signup Successful! ✓"
        ErrorList={[successMessage]}
      />
    </div>
  );
}

export default SignupPage;