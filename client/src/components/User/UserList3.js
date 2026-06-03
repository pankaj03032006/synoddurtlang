import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import UserTable from '../MUITable/UserTable';

function UserList() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    const name = params.get('name');
    const [users, setUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    
    const handleDialogueOpen = () => {
        setErrorDialogueBoxOpen(true)
    };
    
    const handleDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false)
    };

    const getUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://hospital-management-system-2-dni5.onrender.com/users", {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                },
                params: {
                    role: role,
                    name: name
                }
            });
            setUser(response.data);
            setErrorList([]);
        } catch (error) {
            console.error("Error fetching users:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users";
            setErrorList([errorMessage]);
            handleDialogueOpen();
        } finally {
            setLoading(false);
        }
    }, [role, name]);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const deleteUser = async (id) => {
        if (!id) {
            setErrorList(["No user ID provided for deletion"]);
            handleDialogueOpen();
            return;
        }

        try {
            await axios.delete(`https://hospital-management-system-2-dni5.onrender.com/users/${id}`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            await getUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            if (error.response?.data?.errors) {
                setErrorList(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrorList([error.response.data.message]);
            } else {
                setErrorList([error.message || "Failed to delete user"]);
            }
            handleDialogueOpen();
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const searchName = formData.get('name');
        const searchRole = formData.get('role');
        
        const searchParams = new URLSearchParams();
        if (searchName) searchParams.append('name', searchName);
        if (searchRole && searchRole !== '') searchParams.append('role', searchRole);
        
        navigate(`/users?${searchParams.toString()}`);
    };

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div className="page-wrapper">
                <div className="content">
                    <div className="row">
                        <div className="col-sm-4 col-3">
                            <h4 className="page-title">User</h4>
                        </div>
                        <div className="col-sm-8 col-9 text-right m-b-20">
                            <button 
                                onClick={() => navigate("/users/add")} 
                                className="btn btn-primary float-right btn-rounded"
                            >
                                <i className="fa fa-plus"></i> Add User
                            </button>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSearch} name="userFilter">
                        <div className="row filter-row pb-4">
                            <div className="col-sm-4 col-md-4">
                                <div className="form-floating">
                                    <input 
                                        name="name" 
                                        type="text" 
                                        id="empNameSearch" 
                                        className="form-control" 
                                        placeholder='Name'
                                        defaultValue={name || ''}
                                    />
                                    <label htmlFor='empNameSearch'>User Name</label>
                                </div>
                            </div>
                            <div className="col-sm-4 col-md-4">
                                <div className="form-floating">
                                    <select 
                                        name="role" 
                                        className="form-select floating"
                                        defaultValue={role || ''}
                                    >
                                        <option value="">All</option>
                                        <option value="Doctor">Doctor</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Patient">Patient</option>
                                    </select>
                                    <label htmlFor='role' className="focus-label">Role</label>
                                </div>
                            </div>
                            <div className="col-sm-4 col-md-4">
                                <button type="submit" className="btn btn-primary btn-block">Search</button>
                            </div>
                        </div>
                    </form>
                    
                    {loading ? (
                        <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p>Loading users...</p>
                        </div>
                    ) : (
                        <UserTable userList={users} deleteUser={deleteUser} />
                    )}
                </div>
                <ErrorDialogueBox
                    open={errorDialogueBoxOpen}
                    handleToClose={handleDialogueClose}
                    ErrorTitle="Error: User Operation"
                    ErrorList={errorList}
                />
            </div>
        </Box>
    )
}

export default UserList;