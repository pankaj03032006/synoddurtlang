import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";

// The server's message has a trailing space, so compare the trimmed text
const ALREADY_VALIDATED = "Session already create";

const PageShell = ({ children }) => (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <div className="page-wrapper">
            <div className="content">
                <div className="row filter-row">{children}</div>
            </div>
        </div>
    </Box>
);

const Success = () => {
    const { search } = useLocation();
    const navigate = useNavigate();

    // Without query params there is nothing to verify, so start in the error state
    const [status, setStatus] = useState(search ? "loading" : "error");
    const [errorMessage, setErrorMessage] = useState(
        search ? "" : "Payment details are missing from the link."
    );

    useEffect(() => {
        if (!search) return undefined;

        const controller = new AbortController();

        const verifyPayment = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_URL}/api/paypal/success${search}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }

                const data = await response.json();
                const verified =
                    data.status === "success" || data.message?.trim() === ALREADY_VALIDATED;

                if (verified) {
                    setStatus("done");
                } else {
                    setErrorMessage(data.message || "Your payment could not be verified.");
                    setStatus("error");
                }
            } catch (error) {
                if (error.name === "AbortError") return;
                console.error("Error verifying payment:", error);
                setErrorMessage(error.message || "Failed to verify your payment.");
                setStatus("error");
            }
        };

        verifyPayment();
        return () => controller.abort();
    }, [search]);

    if (status === "done") {
        return <Navigate to="/prescriptions" replace />;
    }

    if (status === "loading") {
        return (
            <PageShell>
                <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p>Processing your payment confirmation...</p>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <h1>Payment verification failed</h1>
            <h4>{errorMessage}</h4>
            <button
                onClick={() => navigate("/prescriptions")}
                className="btn btn-primary mt-3"
            >
                Go to Prescriptions
            </button>
        </PageShell>
    );
};

export default Success;