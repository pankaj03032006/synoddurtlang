import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

function LoginPage() {

  const navigate = useNavigate();

  const { signInUser } = useContext(UserContext);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

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

  const handleSubmit = async (event) => {

    event.preventDefault();

    // Validation
    if (!email.trim()) {

      setErrorList(["Email is required"]);

      handleDialogueOpen();

      return;
    }

    if (!password.trim()) {

      setErrorList(["Password is required"]);

      handleDialogueOpen();

      return;
    }

    setLoading(true);

    try {

      console.log("Attempting login...");

      const response = await fetch(
        'https://hospital-management-system-2-dni5.onrender.com/login',
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();

      console.log("Login response:", data);

      // Login success
      if (response.ok && data.message === "success") {

        // Save user in context
        if (signInUser) {

          signInUser(
            data.user,
            data.token
          );

        }

        // Save in localStorage
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "userType",
          data.user.userType
        );

        localStorage.setItem(
          "userId",
          data.user.userId
        );

        localStorage.setItem(
          "userName",
          `${data.user.firstName} ${data.user.lastName}`
        );

        console.log("Login Successful");

        // Redirect according to role
        if (data.user.userType === 'Admin') {

          navigate('/admin/dashboard');

        }
        else if (data.user.userType === 'Doctor') {

          navigate('/doctor/dashboard');

        }
        else if (data.user.userType === 'Patient') {

          navigate('/patient/dashboard');

        }
        else {

          navigate('/login');

        }

      }
      else {

        const errorMessages =
          data.errors ||
          [data.message || "Invalid email or password"];

        setErrorList(errorMessages);

        handleDialogueOpen();

      }

    } catch (error) {

      console.error("Login error:", error);

      if (error.message === 'Failed to fetch') {

        setErrorList([
          "Cannot connect to server.",
          "Please make sure backend is running on port 3001."
        ]);

      } else {

        setErrorList([
          error.message || "Login failed"
        ]);

      }

      handleDialogueOpen();

    } finally {

      setLoading(false);

    }

  };

  return (

    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>

      <div className="page-wrapper">

        <div className="content">

          <div className="row">

            <div className="col-lg-4 offset-lg-4">

              <div className="card-box">

                <h3 className="page-title text-center">
                  Login
                </h3>

                <form onSubmit={handleSubmit}>

                  <div className="form-group">

                    <label htmlFor="email">
                      Email Address
                    </label>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      disabled={loading}
                      required
                      autoFocus
                      placeholder="Enter your email"
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="password">
                      Password
                    </label>

                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      disabled={loading}
                      required
                      placeholder="Enter your password"
                    />

                  </div>

                  <div className="form-group text-center">

                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '10px'
                      }}
                    >

                      {
                        loading
                          ? <CircularProgress size={24} />
                          : "Login"
                      }

                    </button>

                  </div>

                  <div className="text-center">

                    <a href="/forgot-password">
                      Forgot Password?
                    </a>

                  </div>

                  <div className="text-center mt-3">

                    Don't have an account?

                    {" "}

                    <a href="/signup">
                      Sign Up
                    </a>

                  </div>

                </form>

              </div>

            </div>

          </div>

        </div>

      </div>

      <ErrorDialogueBox
        open={errorDialogueBoxOpen}
        handleToClose={handleDialogueClose}
        ErrorTitle="Login Error"
        ErrorList={errorList}
      />

    </Box>
  );
}

export default LoginPage;