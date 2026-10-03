import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

import { UserContext } from "../../Context/UserContext";
import api from "../../utils/api";
import { getErrorMessages } from "../../utils/getErrorMessages";

const GREEN = "#31b372";
const GREEN_DARK = "#28995f";
const EMPTY_LIST = [];

const TIMING_OPTIONS = [
    ["before meal", "Before meal"],
    ["after meal", "After meal"],
    ["with meal", "With meal"],
    ["morning", "Morning"],
    ["evening", "Evening"],
    ["night", "Night"],
    ["as needed", "As needed"],
];

const DURATION_OPTIONS = [
    ["1 day", "1 day"],
    ["3 days", "3 days"],
    ["5 days", "5 days"],
    ["7 days", "7 days"],
    ["10 days", "10 days"],
    ["14 days", "14 days"],
    ["1 month", "1 month"],
    ["3 months", "3 months"],
    ["6 months", "6 months"],
];

// Columns adapt to the width of the form itself, not the browser window,
// so the layout also works inside a narrow dialog.
const autoGrid = (min) => ({
    display: "grid",
    gap: 2,
    gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
});

const fullName = (user) => `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

const createItem = (medicineId = "") => ({
    id: `${Date.now()}-${Math.random()}`,
    medicineId,
    qty: "",
    dosage: "",
    timing: "after meal",
    duration: "3 days",
});

const medicineLabel = ({ name, strength, stock }) =>
    [name, strength ? `(${strength})` : "", stock ? `- Stock: ${stock}` : ""]
        .filter(Boolean)
        .join(" ");

function MedicineRow({ item, index, medicines, onChange, onDelete }) {
    const set = (field) => (e) => onChange(item.id, field, e.target.value);

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                }}
            >
                <Typography variant="subtitle1" fontWeight={700}>
                    Medicine {index + 1}
                </Typography>
                <Tooltip title="Remove medicine">
                    <IconButton
                        size="small"
                        color="error"
                        aria-label={`Remove medicine ${index + 1}`}
                        onClick={() => onDelete(item.id)}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Box sx={autoGrid(170)}>
                <TextField
                    select
                    required
                    size="small"
                    label="Medicine"
                    value={item.medicineId}
                    onChange={set("medicineId")}
                    sx={{ gridColumn: "1 / -1" }}
                >
                    {medicines.map((medicine) => (
                        <MenuItem key={medicine._id} value={medicine._id}>
                            {medicineLabel(medicine)}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    required
                    size="small"
                    type="number"
                    label="Quantity"
                    placeholder="e.g., 10"
                    value={item.qty}
                    onChange={set("qty")}
                    inputProps={{ min: 1, step: 1 }}
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    required
                    size="small"
                    label="Dosage"
                    placeholder="e.g., 1 tablet twice daily"
                    value={item.dosage}
                    onChange={set("dosage")}
                    InputLabelProps={{ shrink: true }}
                />

                <TextField select size="small" label="Timing" value={item.timing} onChange={set("timing")}>
                    {TIMING_OPTIONS.map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField select size="small" label="Duration" value={item.duration} onChange={set("duration")}>
                    {DURATION_OPTIONS.map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>
        </Paper>
    );
}

function PrescriptionForm({
    formName = "prescriptionForm",
    appointmentId = "",
    patientSelected,
    patientName = "",
    patientFirstName = "",
    patientLastName = "",
    patientList = EMPTY_LIST,
    existingPrescription = null,
    formOnSubmit,
    onCancel = null,
    onCloseAfterSave = null,
}) {
    const { currentUser } = useContext(UserContext);

    const [medicines, setMedicines] = useState([]);
    const [items, setItems] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState(null); // { severity: "success" | "error", text }
    const [itemToDelete, setItemToDelete] = useState(null);

    const endRef = useRef(null);
    const closeTimer = useRef(null);
    const isEditing = Boolean(existingPrescription);

    const showError = (text) => setNotice({ severity: "error", text });

    const patientDisplayName = useMemo(() => {
        if (patientName) return patientName;
        if (patientFirstName && patientLastName) return `${patientFirstName} ${patientLastName}`;

        const patient = patientList.find((p) => p._id === patientSelected);
        if (patient) return fullName(patient.userId || patient) || "Unknown patient";

        return patientSelected ? "Loading..." : "No patient selected";
    }, [patientName, patientFirstName, patientLastName, patientSelected, patientList]);

    // Load the medicine list once
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const { data } = await api.get("/medicines");
                if (!cancelled) setMedicines(Array.isArray(data) ? data : data?.medicines ?? []);
            } catch (error) {
                console.error("Error fetching medicines:", error);
                if (!cancelled) {
                    setNotice({
                        severity: "error",
                        text: getErrorMessages(error, "Failed to load medicines list").join(", "),
                    });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Pre-fill the form when editing
    useEffect(() => {
        if (!existingPrescription) return;

        const meds = existingPrescription.prescribedMed ?? existingPrescription.medicines ?? [];
        setItems(
            meds.map((med) => ({
                ...createItem(med.medicineId?._id || med.medicineId || ""),
                qty: med.qty || "",
                dosage: med.dosage || "",
                timing: med.timing || "after meal",
                duration: med.duration || "3 days",
            }))
        );
        setRemarks(existingPrescription.remarks || "");
    }, [existingPrescription]);

    // Don't fire the delayed close if the form is already gone
    useEffect(() => () => clearTimeout(closeTimer.current), []);

    const addMedicine = () => {
        if (medicines.length === 0) {
            showError("No medicines available. Please add medicines first.");
            return;
        }
        setItems((prev) => [...prev, createItem(medicines[0]._id)]);
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    };

    const changeItem = (id, field, value) =>
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

    const confirmDelete = () => {
        setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
        setItemToDelete(null);
    };

    // Returns an error message, or null when everything is valid
    const validate = () => {
        if (items.length === 0) return "Please add at least one medicine to the prescription";

        for (let i = 0; i < items.length; i++) {
            const { medicineId, qty, dosage } = items[i];
            const label = `Medicine ${i + 1}`;

            if (!medicineId) return `${label}: Please select a medicine`;
            if (!Number.isInteger(Number(qty)) || Number(qty) < 1) {
                return `${label}: Quantity must be a whole number of at least 1`;
            }
            if (!dosage.trim()) return `${label}: Please enter dosage information`;
        }
        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const problem = validate();
        if (problem) {
            showError(problem);
            return;
        }

        setLoading(true);

        try {
            // The server expects `prescribedMed`, not `medicines`
            const prescriptionData = {
                appointmentId,
                remarks,
                prescribedMed: items.map(({ medicineId, qty, dosage, timing, duration }) => ({
                    medicineId,
                    qty: parseInt(qty, 10),
                    dosage: dosage.trim(),
                    timing,
                    duration,
                })),
            };

            await formOnSubmit(event, prescriptionData);

            setNotice({
                severity: "success",
                text: isEditing
                    ? "Prescription updated successfully!"
                    : "Prescription saved successfully!",
            });

            if (!isEditing) {
                setItems([]);
                setRemarks("");
            }

            if (onCloseAfterSave) {
                closeTimer.current = setTimeout(onCloseAfterSave, 2000);
            }
        } catch (error) {
            console.error("Error saving prescription:", error);
            showError(getErrorMessages(error, "Failed to save prescription").join(", "));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => (onCancel ? onCancel() : window.history.back());

    return (
        <Box component="form" name={formName} onSubmit={handleSubmit} noValidate sx={{ pt: 1 }}>
            <Box sx={autoGrid(220)}>
                <TextField
                    size="small"
                    label="Patient"
                    value={patientDisplayName}
                    InputProps={{ readOnly: true }}
                    helperText="Prescription for selected patient"
                />
                <TextField
                    size="small"
                    label="Prescribing doctor"
                    value={`Dr. ${fullName(currentUser)}`.trim()}
                    InputProps={{ readOnly: true }}
                />
            </Box>

            <TextField
                fullWidth
                multiline
                minRows={3}
                label="Remarks and instructions"
                placeholder="Diet restrictions, precautions, follow-up instructions..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
            />

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 3,
                    mb: 1.5,
                }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Prescribed medicines{" "}
                    <Typography component="span" color="text.secondary">
                        ({items.length})
                    </Typography>
                </Typography>

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addMedicine}
                    disabled={medicines.length === 0 || loading}
                    sx={{
                        color: GREEN,
                        borderColor: GREEN,
                        "&:hover": { borderColor: GREEN_DARK, backgroundColor: "rgba(49,179,114,0.08)" },
                    }}
                >
                    Add medicine
                </Button>
            </Box>

            {items.length === 0 ? (
                <Box
                    sx={{
                        p: 3,
                        textAlign: "center",
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 2,
                        color: "text.secondary",
                    }}
                >
                    No medicines added yet. Choose "Add medicine" to start the prescription.
                </Box>
            ) : (
                <Stack spacing={2}>
                    {items.map((item, index) => (
                        <MedicineRow
                            key={item.id}
                            item={item}
                            index={index}
                            medicines={medicines}
                            onChange={changeItem}
                            onDelete={setItemToDelete}
                        />
                    ))}
                </Stack>
            )}
            <div ref={endRef} />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                    gap: 1.5,
                    mt: 3,
                    pb: 1,
                }}
            >
                <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={
                        loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
                    }
                    sx={{ backgroundColor: GREEN, "&:hover": { backgroundColor: GREEN_DARK } }}
                >
                    {loading
                        ? "Saving..."
                        : isEditing
                        ? "Update prescription"
                        : "Save prescription"}
                </Button>
            </Box>

            <Dialog
                open={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">Remove this medicine?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        It will be taken off the prescription. This can't be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setItemToDelete(null)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={Boolean(notice)}
                autoHideDuration={notice?.severity === "error" ? 6000 : 3000}
                onClose={() => setNotice(null)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                {notice ? (
                    <Alert severity={notice.severity} onClose={() => setNotice(null)} elevation={6}>
                        {notice.text}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </Box>
    );
}

PrescriptionForm.propTypes = {
    formName: PropTypes.string,
    appointmentId: PropTypes.string,
    patientSelected: PropTypes.string.isRequired,
    patientName: PropTypes.string,
    patientFirstName: PropTypes.string,
    patientLastName: PropTypes.string,
    patientList: PropTypes.array,
    existingPrescription: PropTypes.object,
    formOnSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    onCloseAfterSave: PropTypes.func,
};

export default PrescriptionForm;