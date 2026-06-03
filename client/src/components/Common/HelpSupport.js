import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HelpIcon from '@mui/icons-material/Help';
import axios from 'axios';

export default function HelpSupport() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const faqs = [
        {
            question: 'How do I schedule an appointment?',
            answer: 'You can schedule an appointment by clicking on the "Appointments" tab in the sidebar and then clicking "Book New Appointment".'
        },
        {
            question: 'How do I view my patient history?',
            answer: 'Navigate to "My Patients" in the sidebar, select a patient, and click "View History" to see their medical history.'
        },
        {
            question: 'How do I write a prescription?',
            answer: 'Go to Appointments, select a completed appointment, and click on "Write Prescription".'
        },
        {
            question: 'How do I update my profile?',
            answer: 'Click on "Settings" in the sidebar to update your personal information and change your password.'
        },
        {
            question: 'What should I do in case of an emergency?',
            answer: 'For medical emergencies, please call 911 or visit the nearest emergency room immediately.'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('https://hospital-management-system-2-dni5.onrender.com/support', { subject, message });
            setSubmitted(true);
            setSubject('');
            setMessage('');
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error('Error sending support request:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                <HelpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Help & Support
            </Typography>
            
            <div className="row">
                <div className="col-md-6">
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Contact Support</Typography>
                            {submitted && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Message sent successfully! We'll get back to you soon.
                                </Alert>
                            )}
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="Subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Message"
                                    multiline
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    margin="normal"
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    sx={{ mt: 2 }}
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Contact Information</Typography>
                            <div style={{ marginTop: '16px' }}>
                                <Typography sx={{ mb: 1 }}>
                                    <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    support@synodhospital.com
                                </Typography>
                                <Typography sx={{ mb: 1 }}>
                                    <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    +1 (555) 123-4567
                                </Typography>
                                <Typography>
                                    <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Emergency: +1 (555) 999-9999
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="col-md-6">
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Frequently Asked Questions</Typography>
                            {faqs.map((faq, index) => (
                                <Accordion key={index}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>{faq.question}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography color="textSecondary">
                                            {faq.answer}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Box>
    );
}