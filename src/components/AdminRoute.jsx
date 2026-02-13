import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !userStr) {
        return <Navigate to="/login" />;
    }

    const user = JSON.parse(userStr);

    if (user.isAdmin !== 1) {
        return <Navigate to="/home" />;
    }

    return children;
};

export default AdminRoute;
