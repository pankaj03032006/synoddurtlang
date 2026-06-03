import { Outlet } from "react-router-dom";

/**
 * User Layout Component
 * This component acts as a layout wrapper for all user-related routes.
 * It renders child components using React Router's Outlet.
 * 
 * Child routes should be defined in the parent route configuration.
 * 
 * @example
 * // Route configuration example:
 * {
 *   path: "users",
 *   element: <User />,
 *   children: [
 *     { index: true, element: <UserList /> },
 *     { path: "add", element: <AddUser /> },
 *     { path: "edit/:id", element: <EditUser /> }
 *   ]
 * }
 * 
 * @returns {JSX.Element} - The outlet component that renders child routes
 */
export default function User() {
    return <Outlet />;
}