import React, { useEffect, useState } from 'react';
import '../assets/css/signup.css';
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import ErrorDialogueBox from '../components/MUIDialogueBox/ErrorDialogueBox';

function SignupPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [passwordMatchDisplay, setPasswordMatchDisplay] = useState('none');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);
  
  const handleDialogueOpen = () => {
    setErrorDialogueBoxOpen(true)
  };
  
  const handleDialogueClose = () => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false)
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validation checks
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
    
    setIsSubmitting(true);
    
    let user = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      userType: userType
    };
    
    try {
      const response = await fetch('https://hospital-management-system-2-dni5.onrender.com/api/signUp', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      
      const data = await response.json();
      let respMessage = data.message;
      
      if (respMessage === "success") {
        navigate("/");
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setErrorList(data.errors);
        } else if (data.message) {
          setErrorList([data.message]);
        } else {
          setErrorList(["An error occurred during signup"]);
        }
        handleDialogueOpen();
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorList([error.message || "Failed to connect to server"]);
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
              <option value="Nurse">Nurse</option>
            </select>
            <label htmlFor="userType">User Type</label>
          </div>
          
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
              id="signUp" 
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
      
      <ErrorDialogueBox
        open={errorDialogueBoxOpen}
        handleToClose={handleDialogueClose}
        ErrorTitle="Error Signing Up"
        ErrorList={errorList}
      />
    </div>
  );
}

export default SignupPage;