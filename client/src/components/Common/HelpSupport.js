import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button, Alert,
    Accordion, AccordionSummary, AccordionDetails,
    Snackbar, CircularProgress, Divider, Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HelpIcon from '@mui/icons-material/Help';
import SendIcon from '@mui/icons-material/Send';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

const GREEN = '#1b4932';
const GREEN_DARK = '#285c41';
const RED = '#da2926';

const FAQS = [
    {
        question: 'How do I schedule an appointment?',
        answer: 'Click on "Appointments" in the sidebar, then click "Book New Appointment". Select your department, preferred doctor, and available time slot.',
    },
    {
        question: 'How do I view my patient history?',
        answer: 'Navigate to "My Patients" in the sidebar, select a patient, and click "View History" to see their complete medical history.',
    },
    {
        question: 'How do I write a prescription?',
        answer: 'Go to Appointments, select a completed appointment from the list, and click "Write Prescription" to open the prescription form.',
    },
    {
        question: 'How do I update my profile?',
        answer: 'Click "Settings" in the sidebar to update your personal information and change your password.',
    },
    {
        question: 'What should I do in case of an emergency?',
        answer: 'For medical emergencies, call our emergency line immediately at +1 (555) 999-9999, or dial 911 for immediate assistance.',
    },
];

export default function HelpSupport() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const notify = (severity, message) =>
        setSnack({ open: true, severity, message });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!subject.trim() || !message.trim()) {
            notify('error', 'Please fill in both subject and message.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('https://synoddurtlang.onrender.com/support', { subject, message });
            notify('success', "Message sent! We'll get back to you within 24 hours.");
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error('Error sending support request:', error);
            notify(
                'error',
                error.response?.data?.message || 'Failed to send message. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>

            {/* ================= HEADER ================= */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 44, height: 44, borderRadius: '50%',
                            bgcolor: 'rgba(49,179,114,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <HelpIcon sx={{ color: GREEN }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Help & Support
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            We're here to help — reach out any time.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ================= EMERGENCY BANNER ================= */}
            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${RED} 0%, #e32929 100%)`,
                    color: '#fff',
                }}
            >
                <CardContent
                    sx={{
                        display: 'flex', alignItems: 'center',
                        gap: 2, flexWrap: 'wrap', py: 2.5,
                    }}
                >
                     <WarningAmberIcon sx={{ fontSize: 40 }} />
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Typography variant="h6" fontWeight={700}>
                            Medical Emergency?
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.95 }}>
                            Call our 24/7 emergency line immediately.
                        </Typography>
                    </Box>
                    <Button
                        href="tel:+15559999999"
                        variant="contained"
                        startIcon={<PhoneIcon />}
                        sx={{
                            bgcolor: '#fff', color: RED,
                            fontWeight: 700, textTransform: 'none',
                            '&:hover': { bgcolor: '#fbe9e7' },
                        }}
                    >
                        +1 (555) 999-9999
                    </Button>
                </CardContent>
            </Card>

            {/* ================= CONTACT TILES ================= */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                    gap: 2, mb: 3,
                }}
            >
                <ContactTile
                    icon={<EmailIcon />}
                    label="Email Support"
                    value="support@synodhospital.com"
                    color={GREEN}
                />
                <ContactTile
                    icon={<PhoneIcon />}
                    label="General Enquiries"
                    value="+1 (555) 123-4567"
                    color="#1976d2"
                />
                <ContactTile
                    icon={<AccessTimeIcon />}
                    label="Working Hours"
                    value="Mon–Sat, 9:00 AM – 6:00 PM"
                    color="#f57c00"
                />
            </Box>

            {/* ================= MAIN CONTENT ================= */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 3,
                }}
            >
                {/* ---------- Contact Form ---------- */}
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <SendIcon sx={{ color: GREEN }} />
                            <Typography variant="h6" fontWeight={700}>
                                Send Us a Message
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Describe your issue and our team will respond shortly.
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Subject"
                                placeholder="Brief title of your issue"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                size="small"
                                label="Message"
                                placeholder="Explain your issue in detail..."
                                multiline
                                rows={6}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                sx={{ mt: 2 }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    startIcon={
                                        loading
                                            ? <CircularProgress size={16} color="inherit" />
                                            : <SendIcon />
                                    }
                                    sx={{
                                        backgroundColor: GREEN,
                                        '&:hover': { backgroundColor: GREEN_DARK },
                                        textTransform: 'none',
                                        px: 3,
                                    }}
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>

                {/* ---------- FAQ ---------- */}
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocalHospitalIcon sx={{ color: GREEN }} />
                            <Typography variant="h6" fontWeight={700}>
                                Frequently Asked Questions
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Quick answers to common questions.
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box>
                            {FAQS.map((faq, index) => (
                                <Accordion
                                    key={index}
                                    elevation={0}
                                    disableGutters
                                    sx={{
                                        border: '1px solid #eee',
                                        borderRadius: 2,
                                        mb: 1,
                                        '&:before': { display: 'none' },
                                        '&.Mui-expanded': {
                                            borderColor: GREEN,
                                            backgroundColor: 'rgba(49,179,114,0.04)',
                                        },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: GREEN }} />}
                                        sx={{
                                            '& .MuiAccordionSummary-content': {
                                                alignItems: 'center', gap: 1.5,
                                            },
                                        }}
                                    >
                                        <Chip
                                            label={index + 1}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(49,179,114,0.15)',
                                                color: GREEN,
                                                fontWeight: 700,
                                                minWidth: 28,
                                            }}
                                        />
                                        <Typography fontWeight={600}>
                                            {faq.question}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ pt: 0 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ pl: 5 }}
                                        >
                                            {faq.answer}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* ================= SNACKBAR ================= */}
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snack.severity}
                    icon={snack.severity === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                    onClose={() => setSnack((s) => ({ ...s, open: false }))}
                    elevation={6}
                    sx={{ borderRadius: 2 }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

/* ================= Contact Tile Sub-component ================= */
function ContactTile({ icon, label, value, color }) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid #eee',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    borderColor: color,
                },
            }}
        >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 48, height: 48, borderRadius: 2,
                        bgcolor: `${color}1a`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {React.cloneElement(icon, { sx: { color } })}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} noWrap>
                        {value}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}