import React, { Component } from 'react';
import { Calendar, Clock, User, Phone, MapPin, Bell, Search, Plus, Edit, Trash2, Check, X, AlertCircle, Users, Stethoscope, Mail, Globe, CreditCard, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { prescreenAppointment } from '../services/aiService';
import '../styles/appoint.css';

class AppointmentScheduling extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appointments: [],
      currentAppointment: {
        patientName: '',
        doctorName: '',
        specialty: '',
        date: '',
        time: '',
        type: '',
        status: 'pending',
        phone: '',
        clinic: '',
        address: '',
        notes: '',
        reminderSet: true,
        reminderTime: '1 day before',
        duration: '30 minutes',
        cost: 0.00,
        paymentMethod: 'insurance',
        insuranceProvider: '',
        policyNumber: '',
        referralRequired: false,
        referralSource: '',
        symptoms: '',
        priority: 'medium',
        followUpRequired: false,
        followUpDate: '',
        website: '',
        agreeToTerms: false
      },
      isEditing: false,
      editingId: null,
      activeTab: 'schedule',
      searchTerm: '',
      filterStatus: 'all',
      showReminders: [],
      formErrors: {},
      showAlert: false,
      alertMessage: '',
      alertType: 'success',
      showHiddenFields: false,
      loading: false,
      statistics: {
        total: 0,
        confirmed: 0,
        pending: 0,
        activeReminders: 0,
        completed: 0
      },
      aiPrescreenResult: null,
      aiPrescreenLoading: false
    };
  }

  // Get authentication token from localStorage
  getAuthToken = () => {
    return localStorage.getItem('token');
  }
  // Add this method to validate token
  validateToken = () => {
    const token = this.getAuthToken();
    if (!token) {
      return false;
    }

    try {
      // Simple check - you might want to add JWT expiration check here
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        console.log('Token expired');
        localStorage.removeItem('token');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('token');
      return false;
    }
  }
  // Configure axios headers with auth token
  configureAxiosHeaders = () => {
    const token = this.getAuthToken();
    console.log('Token found:', token ? 'Yes' : 'No'); // Debug log

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set'); // Debug log
    } else {
      console.log('No token available'); // Debug log
      delete axios.defaults.headers.common['Authorization'];
    }
  }
  async componentDidMount() {
    try {
      console.log('Component mounting, checking authentication...');

      // Configure headers first
      this.configureAxiosHeaders();

      // Check if user is authenticated
      const token = this.getAuthToken();
      if (!token) {
        console.log('No token found, redirecting to login...');
        this.handleAuthError();
        return;
      }

      console.log('User authenticated, loading data...');

      // Load data sequentially to avoid race conditions
      await this.loadAppointments();
      await this.loadStatistics();
      await this.loadActiveReminders();
      await this.loadReminders();

      // Set up interval for reminders
      this.intervalId = setInterval(this.loadActiveReminders, 60000);

      console.log('Component mounted successfully');
    } catch (error) {
      console.error('Error during component mount:', error);
      this.handleAuthError();
    }
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadAppointments = async () => {
    try {
      this.setState({ loading: true });
      this.configureAxiosHeaders();

      const response = await axios.get('appointments');
      if (response.data.success) {
        this.setState({ appointments: response.data.appointments });
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      if (error.response?.status === 401) {
        this.showAlert('Authentication failed. Please sign in again.', 'error');
        this.handleAuthError();
      } else if (error.response?.status === 500) {
        this.showAlert('Server error. Please try again later.', 'error');
      } else {
        this.showAlert('Failed to load appointments', 'error');
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  loadStatistics = async () => {
    try {
      console.log('Loading statistics...');

      const token = this.getAuthToken();
      if (!token) {
        console.error('No authentication token found');
        this.handleAuthError();
        return;
      }

      console.log('Making API call to statistics endpoint...');

      // Use the new consolidated endpoint
      const response = await axios.get('appointments/statistics/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('Statistics loaded successfully:', response.data.statistics);
        this.setState({ statistics: response.data.statistics });
      } else {
        console.error('Statistics API returned unsuccessful response');
        // Set default statistics
        this.setDefaultStatistics();
      }
    } catch (error) {
      console.error('Error loading statistics:', error);

      if (error.response?.status === 401) {
        console.log('Authentication failed, redirecting to login...');
        this.handleAuthError();
      } else {
        console.error('Other error loading statistics:', error.message);
        // Set default statistics on error
        this.setDefaultStatistics();
      }
    }
  }

  // Helper method to set default statistics
  setDefaultStatistics = () => {
    this.setState({
      statistics: { total: 0, confirmed: 0, pending: 0, activeReminders: 0, completed: 0 }
    });
  }
  loadActiveReminders = async () => {
    try {
      this.configureAxiosHeaders(); // Ensure token is set

      const response = await axios.get('appointments/reminders/active');
      if (response.data.success) {
        this.setState({ showReminders: response.data.reminders });
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      if (error.response?.status === 401) {
        this.handleAuthError();
      }
    }
  }

  // Handle authentication errors
  // Handle authentication errors
  handleAuthError = () => {
    console.log('Handling authentication error...');

    // Clear token and redirect to login
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];

    // Show alert before redirecting
    this.showAlert('Please sign in to continue', 'error');

    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.hash = '#/signin';
    }, 2000);
  }
  // loadActiveReminders = async () => {
  //   try {
  //     const response = await axios.get('/api/appointments/reminders/active');
  //     if (response.data.success) {
  //       this.setState({ showReminders: response.data.reminders });
  //     }
  //   } catch (error) {
  //     console.error('Error loading reminders:', error);
  //   }
  // }

  validateForm = () => {
    const { currentAppointment } = this.state;
    const errors = {};

    if (!currentAppointment.patientName.trim()) {
      errors.patientName = 'Patient name is required';
    }

    if (!currentAppointment.doctorName.trim()) {
      errors.doctorName = 'Doctor name is required';
    }

    if (!currentAppointment.specialty) {
      errors.specialty = 'Specialty is required';
    }

    if (!currentAppointment.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(currentAppointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past';
      }
    }

    if (!currentAppointment.time) {
      errors.time = 'Time is required';
    }

    if (!currentAppointment.type) {
      errors.type = 'Appointment type is required';
    }

    if (!currentAppointment.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{5}\s\d{5}$/.test(currentAppointment.phone)) {
      errors.phone = 'Phone format should be 12345 67890';
    }

    if (!currentAppointment.clinic.trim()) {
      errors.clinic = 'Clinic name is required';
    }

    if (currentAppointment.cost < 0) {
      errors.cost = 'Cost cannot be negative';
    }

    if (currentAppointment.paymentMethod === 'insurance' && !currentAppointment.insuranceProvider.trim()) {
      errors.insuranceProvider = 'Insurance provider is required when using insurance';
    }

    if (currentAppointment.referralRequired && !currentAppointment.referralSource.trim()) {
      errors.referralSource = 'Referral source is required when referral is needed';
    }

    if (currentAppointment.followUpRequired && !currentAppointment.followUpDate) {
      errors.followUpDate = 'Follow-up date is required when follow-up is needed';
    }

    if (!currentAppointment.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    this.setState({ formErrors: errors });
    return Object.keys(errors).length === 0;
  }

  handleInputChange = (field, value) => {
    this.setState(prevState => ({
      currentAppointment: {
        ...prevState.currentAppointment,
        [field]: value
      },
      formErrors: {
        ...prevState.formErrors,
        [field]: ''
      }
    }));

    if (field === 'referralRequired' && value) {
      this.setState({ showHiddenFields: true });
    } else if (field === 'referralRequired' && !value) {
      this.setState({ showHiddenFields: false });
    }
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    if (!this.validateForm()) {
      this.showAlert('Please fix the form errors', 'error');
      return;
    }

    const { currentAppointment, isEditing, editingId } = this.state;

    try {
      this.setState({ loading: true });
      this.configureAxiosHeaders(); // Ensure token is set

      if (isEditing) {
        const response = await axios.put(`appointments/${editingId}`, currentAppointment);
        if (response.data.success) {
          this.showAlert('Appointment updated successfully!', 'success');
          await this.loadAppointments();
          await this.loadStatistics();
          this.resetForm();
        }
      } else {
        const response = await axios.post('appointments', currentAppointment);
        if (response.data.success) {
          this.showAlert('Appointment scheduled successfully!', 'success');
          await this.loadAppointments();
          await this.loadStatistics();
          this.resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      if (error.response?.status === 401) {
        this.showAlert('Authentication failed. Please sign in again.', 'error');
        this.handleAuthError();
      } else if (error.response?.data?.errors) {
        this.setState({ formErrors: error.response.data.errors });
        this.showAlert(error.response?.data?.message || 'Failed to save appointment', 'error');
      } else {
        this.showAlert('Failed to save appointment', 'error');
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  handleEdit = (appointment) => {
    // Format date for input field (YYYY-MM-DD)
    const formattedDate = new Date(appointment.date).toISOString().split('T')[0];

    this.setState({
      currentAppointment: {
        ...appointment,
        date: formattedDate,
        followUpDate: appointment.followUpDate ?
          new Date(appointment.followUpDate).toISOString().split('T')[0] : ''
      },
      isEditing: true,
      editingId: appointment._id,
      activeTab: 'schedule',
      showHiddenFields: appointment.referralRequired
    });
  }

  handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        this.setState({ loading: true });
        this.configureAxiosHeaders(); // Ensure token is set

        const response = await axios.delete(`appointments/${id}`);
        if (response.data.success) {
          this.showAlert('Appointment deleted successfully!', 'success');
          await this.loadAppointments();
          await this.loadStatistics();
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
        if (error.response?.status === 401) {
          this.showAlert('Authentication failed. Please sign in again.', 'error');
          this.handleAuthError();
        } else {
          this.showAlert('Failed to delete appointment', 'error');
        }
      } finally {
        this.setState({ loading: false });
      }
    }
  }

  handleStatusChange = async (id, newStatus) => {
    try {
      this.setState({ loading: true });
      this.configureAxiosHeaders(); // Ensure token is set

      const response = await axios.patch(`appointments/${id}/status`, { status: newStatus });
      if (response.data.success) {
        this.showAlert(`Appointment ${newStatus}!`, 'success');
        await this.loadAppointments();
        await this.loadStatistics();
        await this.loadActiveReminders();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      if (error.response?.status === 401) {
        this.showAlert('Authentication failed. Please sign in again.', 'error');
        this.handleAuthError();
      } else {
        this.showAlert('Failed to update appointment status', 'error');
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  getEmptyAppointment = () => ({
    patientName: '',
    doctorName: '',
    specialty: '',
    date: '',
    time: '',
    type: '',
    status: 'pending',
    phone: '',
    clinic: '',
    address: '',
    notes: '',
    reminderSet: true,
    reminderTime: '1 day before',
    duration: '30 minutes',
    cost: 0.00,
    paymentMethod: 'insurance',
    insuranceProvider: '',
    policyNumber: '',
    referralRequired: false,
    referralSource: '',
    symptoms: '',
    priority: 'medium',
    followUpRequired: false,
    followUpDate: '',
    website: '',
    agreeToTerms: false
  })

  resetForm = () => {
    this.setState({
      currentAppointment: this.getEmptyAppointment(),
      isEditing: false,
      editingId: null,
      formErrors: {},
      showHiddenFields: false
    });
  }

  showAlert = (message, type) => {
    this.setState({
      showAlert: true,
      alertMessage: message,
      alertType: type
    });

    setTimeout(() => {
      this.setState({ showAlert: false });
    }, 3000);
  }

  formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength === 0) return '';
    if (phoneNumberLength <= 5) return phoneNumber;
    if (phoneNumberLength <= 10) return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;

    return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5, 10)}`;
  }

  getFilteredAppointments = () => {
    const { appointments, searchTerm, filterStatus } = this.state;

    return appointments.filter(appointment => {
      const matchesSearch =
        appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.clinic.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));
  }

  getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
  // New method to load reminder settings
  loadReminderSettings = async () => {
    try {
      this.configureAxiosHeaders();
      const response = await axios.get('appointments/settings/reminders');
      if (response.data.success) {
        return response.data.settings;
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
      if (error.response?.status === 401) {
        this.handleAuthError();
      }
    }
    return null;
  }
  // Load reminders from API
  loadReminders = async () => {
    try {
      this.configureAxiosHeaders();

      const response = await axios.get('appointments/reminders');
      if (response.data.success) {
        this.setState({ showReminders: response.data.reminders });
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      if (error.response?.status === 401) {
        this.handleAuthError();
      }
    }
  }

  // Snooze reminder
  handleSnoozeReminder = async (reminderId) => {
    try {
      this.setState({ loading: true });
      this.configureAxiosHeaders();

      const response = await axios.patch(`appointments/reminders/${reminderId}/snooze`);
      if (response.data.success) {
        this.showAlert('Reminder snoozed for 1 hour', 'success');
        await this.loadReminders(); // Refresh the reminders list
      }
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      this.showAlert('Failed to snooze reminder', 'error');
    } finally {
      this.setState({ loading: false });
    }
  }

  // AI Pre-screening
  handleAIPrescreen = async () => {
    const { currentAppointment } = this.state;
    if (!currentAppointment.symptoms.trim()) {
      this.showAlert('Please type your symptoms or reason for visit first.', 'error');
      return;
    }
    this.setState({ aiPrescreenLoading: true });
    try {
      const result = await prescreenAppointment(currentAppointment.symptoms);
      if (result && result.success) {
        this.setState({ aiPrescreenResult: result });
        
        // Auto-fill some fields based on AI, if empty
        const updates = {};
        if (!currentAppointment.type && result.suggestedSpecialty) {
          // Just as a hint
        }
        if (result.urgency === 'high' || result.urgency === 'critical') {
            updates.priority = 'high';
        }
        if (Object.keys(updates).length > 0) {
            this.setState(prevState => ({
               currentAppointment: { ...prevState.currentAppointment, ...updates }
            }));
        }
      }
    } catch (e) {
      console.error(e);
      this.showAlert('Failed to run AI Pre-screening.', 'error');
    } finally {
      this.setState({ aiPrescreenLoading: false });
    }
  }

  // Mark as missed
  handleMarkMissed = async (reminderId) => {
    try {
      this.setState({ loading: true });
      this.configureAxiosHeaders();

      const response = await axios.patch(`appointments/reminders/${reminderId}/mark-missed`);
      if (response.data.success) {
        this.showAlert('Appointment marked as missed', 'success');
        await this.loadReminders(); // Refresh the reminders list
        await this.loadStatistics(); // Refresh statistics
      }
    } catch (error) {
      console.error('Error marking as missed:', error);
      this.showAlert('Failed to mark as missed', 'error');
    } finally {
      this.setState({ loading: false });
    }
  }

  // Delete reminder
  handleDeleteReminder = async (reminderId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        this.setState({ loading: true });
        this.configureAxiosHeaders();

        const response = await axios.delete(`appointments/reminders/${reminderId}`);
        if (response.data.success) {
          this.showAlert('Reminder deleted successfully', 'success');
          await this.loadReminders(); // Refresh the reminders list
          await this.loadStatistics(); // Refresh statistics
        }
      } catch (error) {
        console.error('Error deleting reminder:', error);
        this.showAlert('Failed to delete reminder', 'error');
      } finally {
        this.setState({ loading: false });
      }
    }
  }
  render() {
    const {
      currentAppointment,
      isEditing,
      activeTab,
      searchTerm,
      filterStatus,
      showReminders,
      formErrors,
      showAlert,
      alertMessage,
      alertType,
      showHiddenFields,
      loading,
      statistics,
      aiPrescreenResult,
      aiPrescreenLoading
    } = this.state;

    const filteredAppointments = this.getFilteredAppointments();

    // Options for select elements
    const specialtyOptions = [
      { value: '', label: 'Select Specialty' },
      { value: 'General Practice', label: 'General Practice' },
      { value: 'Cardiology', label: 'Cardiology' },
      { value: 'Dermatology', label: 'Dermatology' },
      { value: 'Endocrinology', label: 'Endocrinology' },
      { value: 'Gastroenterology', label: 'Gastroenterology' },
      { value: 'Neurology', label: 'Neurology' },
      { value: 'Orthopedics', label: 'Orthopedics' },
      { value: 'Pediatrics', label: 'Pediatrics' },
      { value: 'Psychiatry', label: 'Psychiatry' },
      { value: 'Radiology', label: 'Radiology' },
      { value: 'Surgery', label: 'Surgery' },
      { value: 'Urology', label: 'Urology' }
    ];

    const appointmentTypeOptions = [
      { value: '', label: 'Select Type' },
      { value: 'Regular Checkup', label: 'Regular Checkup' },
      { value: 'Consultation', label: 'Consultation' },
      { value: 'Follow-up', label: 'Follow-up' },
      { value: 'Emergency', label: 'Emergency' },
      { value: 'Procedure', label: 'Procedure' },
      { value: 'Surgery', label: 'Surgery' },
      { value: 'Lab Test', label: 'Lab Test' },
      { value: 'Vaccination', label: 'Vaccination' }
    ];

    const insuranceProviders = [
      'Aetna',
      'Blue Cross Blue Shield',
      'Cigna',
      'Humana',
      'Kaiser Permanente',
      'UnitedHealthcare',
      'Other'
    ];

    return (
      <>
        <Navbar />
        <div className="min-h-screen text-black bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Loading overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-lg font-medium">Processing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white shadow-lg border-b-4 border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:shadow-xl">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Calendar className="text-blue-500 dark:text-blue-400" size={40} />
                    Appointment Scheduling
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Manage healthcare appointments for your family</p>
                </div>
                {showReminders.length > 0 && (
                  <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 dark:bg-orange-900/30 dark:border-orange-600">
                    <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
                      <Bell className="animate-bounce" size={20} />
                      <span className="font-semibold">{showReminders.length} Upcoming Reminders!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alert */}
          {showAlert && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${alertType === 'success' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
              <div className="flex items-center gap-2">
                {alertType === 'success' ? <Check size={20} /> : <X size={20} />}
                {alertMessage}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:shadow-xl">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { key: 'schedule', label: 'Schedule Appointment', icon: Plus },
                  { key: 'appointments', label: 'All Appointments', icon: Calendar },
                  { key: 'reminders', label: 'Reminders', icon: Bell }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => this.setState({ activeTab: key })}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 ${activeTab === key
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:bg-blue-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                      }`}
                  >
                    <Icon size={20} />
                    {label}
                    {key === 'reminders' && showReminders.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center dark:bg-red-600">
                        {showReminders.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Schedule Appointment Tab */}
              {activeTab === 'schedule' && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Plus className="text-blue-600 dark:text-blue-400" size={24} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-300">
                        {isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}
                      </h2>
                    </div>

                    <form onSubmit={this.handleSubmit} className="space-y-8">
                      {/* Patient Information */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Users className="text-blue-500 dark:text-blue-400" size={20} />
                          Patient Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Patient Name *
                            </label>
                            <input
                              type="text"
                              value={currentAppointment.patientName}
                              onChange={(e) => this.handleInputChange('patientName', e.target.value)}
                              className={`appointment-scheduler-input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${formErrors.patientName ? 'border-red-300 dark:border-red-500' : ''}`}
                              placeholder="Enter patient name"
                            />
                            {formErrors.patientName && (
                              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.patientName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={currentAppointment.phone}
                              onChange={(e) => this.handleInputChange('phone', this.formatPhoneNumber(e.target.value))}
                              className={`appointment-scheduler-input dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${formErrors.phone ? 'border-red-300 dark:border-red-500' : ''}`}
                              placeholder="12345 67890"
                            />
                            {formErrors.phone && (
                              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Healthcare Provider */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Stethoscope className="text-blue-500 dark:text-blue-400" size={20} />
                          Healthcare Provider
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Doctor Name *
                            </label>
                            <input
                              type="text"
                              value={currentAppointment.doctorName}
                              onChange={(e) => this.handleInputChange('doctorName', e.target.value)}
                              className={`appointment-scheduler-input ${formErrors.doctorName ? 'border-red-300 dark:border-red-500' : ''}`}
                              placeholder="Dr. John Smith"
                            />
                            {formErrors.doctorName && (
                              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.doctorName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Specialty *
                            </label>
                            <div className="appointment-scheduler-select-wrapper">
                              <select
                                value={currentAppointment.specialty}
                                onChange={(e) => this.handleInputChange('specialty', e.target.value)}
                                className={`appointment-scheduler-select ${formErrors.specialty ? 'border-red-300 dark:border-red-500' : ''}`}
                              >
                                {specialtyOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {formErrors.specialty && (
                              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.specialty}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Clinic/Hospital Website
                          </label>
                          <div className="flex items-center">
                            <Globe className="text-gray-400 dark:text-gray-500 mr-2" size={20} />
                            <input
                              type="url"
                              value={currentAppointment.website}
                              onChange={(e) => this.handleInputChange('website', e.target.value)}
                              className="appointment-scheduler-input"
                              placeholder="https://example.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Calendar className="text-blue-500 dark:text-blue-400" size={20} />
                          Appointment Details
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Date *
                            </label>
                            <div className="appointment-scheduler-date-wrapper">
                              <input
                                type="date"
                                value={currentAppointment.date}
                                onChange={(e) => this.handleInputChange('date', e.target.value)}
                                className={`appointment-scheduler-date ${formErrors.date ? 'border-red-300 dark:border-red-500' : ''}`}
                              />
                            </div>
                            {formErrors.date && (
                              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.date}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Time *
                            </label>
                            <div className="appointment-scheduler-time-wrapper">
                              <input
                                type="time"
                                value={currentAppointment.time}
                                onChange={(e) => this.handleInputChange('time', e.target.value)}
                                className={`appointment-scheduler-time ${formErrors.time ? 'border-red-300 dark:border-red-500' : ''}`}
                              />
                            </div>
                            {formErrors.time && (
                              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.time}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Duration
                            </label>
                            <div className="appointment-scheduler-select-wrapper">
                              <select
                                value={currentAppointment.duration}
                                onChange={(e) => this.handleInputChange('duration', e.target.value)}
                                className="appointment-scheduler-select"
                              >
                                <option value="15 minutes">15 minutes</option>
                                <option value="30 minutes">30 minutes</option>
                                <option value="45 minutes">45 minutes</option>
                                <option value="1 hour">1 hour</option>
                                <option value="1.5 hours">1.5 hours</option>
                                <option value="2 hours">2 hours</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Appointment Type *
                            </label>
                            <div className="appointment-scheduler-select-wrapper">
                              <select
                                value={currentAppointment.type}
                                onChange={(e) => this.handleInputChange('type', e.target.value)}
                                className={`appointment-scheduler-select ${formErrors.type ? 'border-red-300 dark:border-red-500' : ''}`}
                              >
                                {appointmentTypeOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {formErrors.type && (
                              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.type}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Priority Level
                            </label>
                            <div className="flex space-x-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="priority"
                                  value="low"
                                  checked={currentAppointment.priority === 'low'}
                                  onChange={(e) => this.handleInputChange('priority', e.target.value)}
                                  className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600"
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">Low</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="priority"
                                  value="medium"
                                  checked={currentAppointment.priority === 'medium'}
                                  onChange={(e) => this.handleInputChange('priority', e.target.value)}
                                  className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600"
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">Medium</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="priority"
                                  value="high"
                                  checked={currentAppointment.priority === 'high'}
                                  onChange={(e) => this.handleInputChange('priority', e.target.value)}
                                  className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600"
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">High</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Cost ($)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={currentAppointment.cost}
                              onChange={(e) => this.handleInputChange('cost', parseFloat(e.target.value) || 0)}
                              className={`appointment-scheduler-input ${formErrors.cost ? 'border-red-300 dark:border-red-500' : ''}`}
                              placeholder="0.00"
                            />
                            {formErrors.cost && (
                              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.cost}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Payment Method
                            </label>
                            <div className="flex space-x-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="insurance"
                                  checked={currentAppointment.paymentMethod === 'insurance'}
                                  onChange={(e) => this.handleInputChange('paymentMethod', e.target.value)}
                                  className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600"
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">Insurance</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="credit_card"
                                  checked={currentAppointment.paymentMethod === 'credit_card'}
                                  onChange={(e) => this.handleInputChange('paymentMethod', e.target.value)}
                                  className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600"
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">Credit Card</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="cash"
                                  checked={currentAppointment.paymentMethod === 'cash'}
                                  onChange={(e) => this.handleInputChange('paymentMethod', e.target.value)}
                                  className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600"
                                />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">Cash</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Insurance Information (shown when payment method is insurance) */}
                      {currentAppointment.paymentMethod === 'insurance' && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CreditCard className="text-blue-500 dark:text-blue-400" size={20} />
                            Insurance Information
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Insurance Provider *
                              </label>
                              <input
                                type="text"
                                list="insuranceProviders"
                                value={currentAppointment.insuranceProvider}
                                onChange={(e) => this.handleInputChange('insuranceProvider', e.target.value)}
                                className={`appointment-scheduler-input ${formErrors.insuranceProvider ? 'border-red-300 dark:border-red-500' : ''}`}
                                placeholder="Select or enter provider"
                              />
                              <datalist id="insuranceProviders">
                                {insuranceProviders.map(provider => (
                                  <option key={provider} value={provider} />
                                ))}
                              </datalist>
                              {formErrors.insuranceProvider && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.insuranceProvider}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Policy Number
                              </label>
                              <input
                                type="text"
                                value={currentAppointment.policyNumber}
                                onChange={(e) => this.handleInputChange('policyNumber', e.target.value)}
                                className="appointment-scheduler-input"
                                placeholder="Policy number"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Location & Contact */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <MapPin className="text-blue-500 dark:text-blue-400" size={20} />
                          Location & Contact
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Clinic/Hospital Name *
                            </label>
                            <input
                              type="text"
                              value={currentAppointment.clinic}
                              onChange={(e) => this.handleInputChange('clinic', e.target.value)}
                              className={`appointment-scheduler-input ${formErrors.clinic ? 'border-red-300 dark:border-red-500' : ''}`}
                              placeholder="Medical Center Name"
                            />
                            {formErrors.clinic && (
                              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.clinic}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Address
                            </label>
                            <input
                              type="text"
                              value={currentAppointment.address}
                              onChange={(e) => this.handleInputChange('address', e.target.value)}
                              className="appointment-scheduler-input"
                              placeholder="123 Medical Plaza, Suite 200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Medical Information */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FileText className="text-blue-500 dark:text-blue-400" size={20} />
                          Medical Information
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Symptoms or Reason for Visit
                            </label>
                            <textarea
                              value={currentAppointment.symptoms}
                              onChange={(e) => this.handleInputChange('symptoms', e.target.value)}
                              rows={3}
                              className="appointment-scheduler-textarea mb-3"
                              placeholder="Describe symptoms or reason for appointment..."
                            />
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={this.handleAIPrescreen}
                                    disabled={aiPrescreenLoading}
                                    className="self-start flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                >
                                    <Stethoscope size={16} />
                                    {aiPrescreenLoading ? 'Analyzing...' : 'AI Pre-Screen Check'}
                                </button>
                                {aiPrescreenResult && (
                                    <div className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1"><Stethoscope size={16}/> AI Insight</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                aiPrescreenResult.urgency === 'critical' ? 'bg-red-100 text-red-600' :
                                                aiPrescreenResult.urgency === 'high' ? 'bg-orange-100 text-orange-600' :
                                                aiPrescreenResult.urgency === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                                {aiPrescreenResult.urgency} Urgency
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{aiPrescreenResult.analysis}</p>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold block mb-1">Recommendation:</span>
                                            {aiPrescreenResult.recommendation}
                                            {aiPrescreenResult.suggestedSpecialty && <div className="mt-1"><strong>Suggested Specialty:</strong> {aiPrescreenResult.suggestedSpecialty}</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="referralRequired"
                              checked={currentAppointment.referralRequired}
                              onChange={(e) => this.handleInputChange('referralRequired', e.target.checked)}
                              className="h-5 w-5 text-blue-600 dark:text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                            />
                            <label htmlFor="referralRequired" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Referral Required
                            </label>
                          </div>

                          {/* Hidden field that appears when referral is required */}
                          {showHiddenFields && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Referral Source *
                              </label>
                              <input
                                type="text"
                                value={currentAppointment.referralSource}
                                onChange={(e) => this.handleInputChange('referralSource', e.target.value)}
                                className={`appointment-scheduler-input ${formErrors.referralSource ? 'border-red-300 dark:border-red-500' : ''}`}
                                placeholder="Referring doctor or clinic"
                              />
                              {formErrors.referralSource && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.referralSource}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Follow-up Information */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Calendar className="text-blue-500 dark:text-blue-400" size={20} />
                          Follow-up Information
                        </h3>
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="followUpRequired"
                              checked={currentAppointment.followUpRequired}
                              onChange={(e) => this.handleInputChange('followUpRequired', e.target.checked)}
                              className="h-5 w-5 text-blue-600 dark:text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                            />
                            <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Follow-up Appointment Required
                            </label>
                          </div>

                          {currentAppointment.followUpRequired && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Follow-up Date *
                              </label>
                              <div className="appointment-scheduler-date-wrapper">
                                <input
                                  type="date"
                                  value={currentAppointment.followUpDate}
                                  onChange={(e) => this.handleInputChange('followUpDate', e.target.value)}
                                  className={`appointment-scheduler-date ${formErrors.followUpDate ? 'border-red-300 dark:border-red-500' : ''}`}
                                />
                              </div>
                              {formErrors.followUpDate && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.followUpDate}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reminders & Notes */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Bell className="text-blue-500 dark:text-blue-400" size={20} />
                          Reminders & Notes
                        </h3>
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="reminderSet"
                                checked={currentAppointment.reminderSet}
                                onChange={(e) => this.handleInputChange('reminderSet', e.target.checked)}
                                className="h-5 w-5 text-blue-600 dark:text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                              />
                              <label htmlFor="reminderSet" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Set Reminder
                              </label>
                            </div>
                            {currentAppointment.reminderSet && (
                              <div className="appointment-scheduler-select-wrapper">
                                <select
                                  value={currentAppointment.reminderTime}
                                  onChange={(e) => this.handleInputChange('reminderTime', e.target.value)}
                                  className="appointment-scheduler-select"
                                >
                                  <option value="1 hour before">1 hour before</option>
                                  <option value="2 hours before">2 hours before</option>
                                  <option value="1 day before">1 day before</option>
                                  <option value="2 days before">2 days before</option>
                                </select>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Additional Notes
                            </label>
                            <textarea
                              value={currentAppointment.notes}
                              onChange={(e) => this.handleInputChange('notes', e.target.value)}
                              rows={4}
                              className="appointment-scheduler-textarea"
                              placeholder="Any special instructions or notes..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <FileText className="text-blue-500 dark:text-blue-400" size={20} />
                          Terms & Conditions
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              By scheduling this appointment, you agree to our terms and conditions.
                              You understand that cancellation fees may apply if you cancel with less than 24 hours notice.
                              You also consent to the sharing of your health information with the healthcare provider for treatment purposes.
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              id="agreeToTerms"
                              checked={currentAppointment.agreeToTerms}
                              onChange={(e) => this.handleInputChange('agreeToTerms', e.target.checked)}
                              className={`h-5 w-5 mt-1 text-blue-600 dark:text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 ${formErrors.agreeToTerms ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                            <label htmlFor="agreeToTerms" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              I agree to the terms and conditions *
                            </label>
                          </div>
                          {formErrors.agreeToTerms && (
                            <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.agreeToTerms}</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                          type="submit"
                          disabled={loading}
                          className="appointment-scheduler-primary-btn disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={20} />
                          {loading ? 'Processing...' : (isEditing ? 'Update Appointment' : 'Schedule Appointment')}
                        </button>
                        <button
                          type="button"
                          onClick={this.resetForm}
                          disabled={loading}
                          className="appointment-scheduler-secondary-btn disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={20} />
                          {isEditing ? 'Cancel Edit' : 'Reset Form'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* All Appointments Tab */}
              {activeTab === 'appointments' && (
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-300">All Appointments</h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view all scheduled appointments</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        <input
                          type="text"
                          placeholder="Search appointments..."
                          value={searchTerm}
                          onChange={(e) => this.setState({ searchTerm: e.target.value })}
                          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => this.setState({ filterStatus: e.target.value })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Appointments Grid */}
                  <div className="grid gap-6">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading appointments...</p>
                      </div>
                    ) : filteredAppointments.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">No Appointments Found</h3>
                        <p className="text-gray-400 dark:text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <div key={appointment._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200">
                          <div className="flex flex-col lg:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <User className="text-blue-500 dark:text-blue-400" size={20} />
                                    {appointment.patientName}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                                    <Stethoscope size={16} className="text-gray-500 dark:text-gray-400" />
                                    {appointment.doctorName} • {appointment.specialty}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${this.getStatusColor(appointment.status)}`}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                              </div>

                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                                  <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                                  <span>{appointment.time} ({appointment.duration})</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <Phone size={16} className="text-gray-500 dark:text-gray-400" />
                                  <span>{appointment.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
                                  <span>{appointment.clinic}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <AlertCircle size={16} className="text-gray-500 dark:text-gray-400" />
                                  <span>{appointment.type}</span>
                                </div>
                                {appointment.cost > 0 && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">${appointment.cost.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>

                              {appointment.address && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{appointment.address}</p>
                              )}

                              {appointment.notes && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                                </div>
                              )}

                              {appointment.reminderSet && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-4">
                                  <Bell size={16} />
                                  <span>Reminder set for {appointment.reminderTime}</span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 lg:w-48">
                              {appointment.status === 'pending' && (
                                <button
                                  onClick={() => this.handleStatusChange(appointment._id, 'confirmed')}
                                  disabled={loading}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
                                >
                                  <Check size={16} />
                                  Confirm
                                </button>
                              )}

                              {appointment.status === 'confirmed' && (
                                <button
                                  onClick={() => this.handleStatusChange(appointment._id, 'completed')}
                                  disabled={loading}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                                >
                                  <Check size={16} />
                                  Mark Complete
                                </button>
                              )}

                              <button
                                onClick={() => this.handleEdit(appointment)}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50"
                              >
                                <Edit size={16} />
                                Edit
                              </button>

                              {appointment.status !== 'cancelled' && (
                                <button
                                  onClick={() => this.handleStatusChange(appointment._id, 'cancelled')}
                                  disabled={loading}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 disabled:opacity-50"
                                >
                                  <X size={16} />
                                  Cancel
                                </button>
                              )}

                              <button
                                onClick={() => this.handleDelete(appointment._id)}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Reminders Tab */}
              {activeTab === 'reminders' && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Bell className="text-orange-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Appointment Reminders</h2>
                      <p className="text-gray-600 mt-1 dark:text-gray-400">Upcoming appointments that need your attention</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading reminders...</p>
                    </div>
                  ) : showReminders.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="mx-auto text-gray-300 mb-4" size={64} />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">No Active Reminders</h3>
                      <p className="text-gray-400">All your upcoming appointments are properly scheduled</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {showReminders.map((reminder) => {
                        // Determine urgency styling
                        let urgencyClass = 'border-blue-200 bg-blue-50';
                        let urgencyIcon = '📅…';
                        let urgencyText = 'Upcoming';

                        if (reminder.urgency === 'today') {
                          urgencyClass = 'border-orange-200 bg-orange-50';
                          urgencyIcon = '⚠️';
                          urgencyText = 'Today';
                        } else if (reminder.urgency === 'urgent') {
                          urgencyClass = 'border-red-200 bg-red-50';
                          urgencyIcon = '🔴';
                          urgencyText = 'Urgent';
                        }

                        return (
                          <div key={reminder._id} className={`border-2 rounded-xl p-6 ${urgencyClass} shadow-sm transition-all duration-300 hover:shadow-md`}>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-2xl">{urgencyIcon}</span>
                                  <h3 className="text-xl font-bold text-gray-900">{reminder.patientName}</h3>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${reminder.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                                    reminder.urgency === 'today' ? 'bg-orange-100 text-orange-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                    {urgencyText}
                                  </span>
                                </div>
                                <p className="text-gray-700 font-medium">{reminder.doctorName} • {reminder.specialty}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                  {reminder.hoursUntil <= 1 ? 'Within 1 hour' :
                                    reminder.hoursUntil <= 24 ? `In ${reminder.hoursUntil} hours` :
                                      `In ${Math.ceil(reminder.hoursUntil / 24)} days`}
                                </p>
                                <p className="text-sm text-gray-600">{new Date(reminder.date).toLocaleDateString()} at {reminder.time}</p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar size={16} className="text-gray-500" />
                                <span className="font-medium">{new Date(reminder.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock size={16} className="text-gray-500" />
                                <span className="font-medium">{reminder.time} ({reminder.duration})</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <MapPin size={16} className="text-gray-500" />
                                <span>{reminder.clinic}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone size={16} className="text-gray-500" />
                                <span>{reminder.phone}</span>
                              </div>
                            </div>

                            {reminder.address && (
                              <p className="text-gray-600 text-sm mb-4 bg-white p-2 rounded border">{reminder.address}</p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 justify-between items-center">
                              <div className="flex items-center gap-2 text-blue-600">
                                <Bell size={16} />
                                <span className="text-sm font-medium">
                                  {reminder.status === 'confirmed' ? 'Confirmed Appointment' : 'Pending Confirmation'}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                {/* Snooze Button */}
                                <button
                                  onClick={() => this.handleSnoozeReminder(reminder._id)}
                                  disabled={loading}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                                >
                                  <Clock size={16} />
                                  Snooze (1h)
                                </button>

                                {/* Mark as Missed Button */}
                                <button
                                  onClick={() => this.handleMarkMissed(reminder._id)}
                                  disabled={loading}
                                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                                >
                                  <X size={16} />
                                  Mark Missed
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => this.handleDeleteReminder(reminder._id)}
                                  disabled={loading}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => this.handleEdit(reminder)}
                                  disabled={loading}
                                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                                >
                                  <Edit size={16} />
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reminder Summary */}
                  {showReminders.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {showReminders.filter(r => r.urgency === 'upcoming').length}
                          </div>
                          <div className="text-sm text-blue-800">Upcoming</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {showReminders.filter(r => r.urgency === 'today').length}
                          </div>
                          <div className="text-sm text-orange-800">Today</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {showReminders.filter(r => r.urgency === 'urgent').length}
                          </div>
                          <div className="text-sm text-red-800">Urgent</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simple Reminder Settings (UI Only) */}
                  <div className="mt-12 bg-gray-50 rounded-xl p-6 dark:bg-gray-800/50 dark:border dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
                      <Bell className="text-blue-500 dark:text-white" size={20} />
                      Reminder Settings
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-4 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 mb-3 dark:text-gray-200">Default Reminder Times</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-400">1 hour before appointment</span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Active</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-400">1 day before appointment</span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Active</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-400">1 week before appointment</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Inactive</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 mb-3 dark:text-gray-200">Notification Methods</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-400">Browser notifications</span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Active</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-400">Email reminders</span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Active</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-400">SMS reminders</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Inactive</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Footer */}
          <div className="max-w-7xl mx-auto px-6 pb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white dark:from-blue-700 dark:to-purple-800">
              <h3 className="text-lg font-semibold mb-4">Appointment Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{loading ? '...' : statistics.total}</div>
                  <div className="text-sm opacity-90">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{loading ? '...' : statistics.confirmed}</div>
                  <div className="text-sm opacity-90">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{loading ? '...' : statistics.pending}</div>
                  <div className="text-sm opacity-90">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{loading ? '...' : statistics.completed}</div>
                  <div className="text-sm opacity-90">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{loading ? '...' : statistics.activeReminders}</div>
                  <div className="text-sm opacity-90">Reminders</div>
                </div>
              </div>

              {/* Show error message if statistics failed to load */}
              {!loading && statistics.total === 0 && statistics.confirmed === 0 &&
                statistics.pending === 0 && statistics.completed === 0 && statistics.activeReminders === 0 && (
                  <div className="text-center mt-4">
                    <p className="text-yellow-300 text-sm">
                      Statistics not available. Please check your connection.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default AppointmentScheduling;
