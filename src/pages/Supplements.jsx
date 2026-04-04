import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart, Legend } from 'recharts';
import {
  Plus, Search, Filter, Calendar, Clock, AlertTriangle, TrendingUp, DollarSign,
  Activity, CheckCircle, XCircle, Bell, Edit, Trash2, Eye, User, Pill, Sun, Moon,
  ChevronDown, ChevronUp, Settings, BarChart3, Download, Upload, Heart, Brain, Zap,
  Coffee, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { checkSupplementInteractions } from '../services/aiService';
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
// Theme Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const SupplementManagementSystem = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [supplements, setSupplements] = useState([]);
  const [userSupplements, setUserSupplements] = useState([]);
  const [intakeHistory, setIntakeHistory] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [selectedSupplement, setSelectedSupplement] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [expandedSections, setExpandedSections] = useState({
    reminders: true,
    interactions: true,
    charts: true
  });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const { theme, toggleTheme } = useTheme();

  // Authentication methods
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const configureAxiosHeaders = () => {
    const token = getAuthToken();
    console.log('Token found:', token ? 'Yes' : 'No');

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.log('No token available');
      delete axios.defaults.headers.common['Authorization'];
    }
  };
  // Add this utility function for API calls with retry
  const apiCallWithRetry = async (url, options = {}, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`API call attempt ${attempt}:`, url);
        const response = await axios.get(url, options);
        console.log(`API call successful:`, url, response.data?.length || 'No data');
        return response.data;
      } catch (error) {
        console.error(`API call attempt ${attempt} failed:`, error.response?.status, error.message);

        if (error.response?.status === 429 && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`Rate limited, waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (error.response?.status === 401) {
          console.log('Authentication error in apiCallWithRetry');
          handleAuthError();
          throw error;
        }

        if (error.response?.status === 404) {
          console.log('Endpoint not found, returning empty data');
          return [];
        }

        throw error;
      }
    }
  };
  const validateToken = () => {
    const token = getAuthToken();
    if (!token) {
      return false;
    }

    try {
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
  };

  const handleAuthError = () => {
    console.log('Handling authentication error...');

    // Clear token and redirect to login
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];

    // Show alert before redirecting
    showAlertMessage('Please sign in to continue', 'error');

    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.hash = '#/signin';
    }, 2000);
  };

  const showAlertMessage = (message, type) => {
    setShowAlert(true);
    setAlertMessage(message);
    setAlertType(type);

    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };
  const handleEditSupplement = (supplement) => {
    // You'll need to create an EditModal similar to AddSupplementModal
    // For now, we'll just set it up for future implementation
    setSelectedSupplement(supplement);
    // setShowEditModal(true); // You'll need to create this state and modal
    showAlertMessage('Edit functionality coming soon!', 'info');
  };
  const LoadingOverlay = () => (
    loading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-black font-medium dark:text-black">Loading...</span>
          </div>
        </div>
      </div>
    )
  );

  // Add alert component
  const Alert = () => (
    showAlert && (
      <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${alertType === 'success' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
        <div className="flex items-center gap-2">
          {alertType === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {alertMessage}
        </div>
      </div>
    )
  );
  // Sample data
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        console.log('Component mounting, checking authentication...');

        // Configure headers first
        configureAxiosHeaders();

        // Check if user is authenticated
        const token = getAuthToken();
        if (!token) {
          console.log('No token found, redirecting to login...');
          handleAuthError();
          return;
        }

        if (!validateToken()) {
          console.log('Token invalid, redirecting to login...');
          handleAuthError();
          return;
        }

        console.log('User authenticated, loading data...');

        // Load initial data
        await loadInitialData();

        console.log('Component mounted successfully');
      } catch (error) {
        console.error('Error during component mount:', error);
        handleAuthError();
      }
    };

    initializeComponent();
  }, []);
  // Load initial data with authentication
  // Update the data loading part in loadInitialData
  const loadInitialData = async () => {
    try {
      setLoading(true);
      configureAxiosHeaders();

      // Load user supplements from backend
      const userSupplementsResponse = await axios.get('user-supplements');

      // Process the data to match frontend expectations
      const processedUserSupplements = userSupplementsResponse.data.map(supp => {
        const supplement = supp.supplementId
          ? {
            _id: supp.supplementId._id,
            name: supp.supplementId.name,
            brand: supp.supplementId.brand,
            type: supp.supplementId.type,
            dosageUnit: supp.supplementId.dosageUnit,
            servingSize: supp.supplementId.servingSize,
            description: supp.supplementId.description,
            potentialBenefits: supp.supplementId.potentialBenefits || [],
            potentialSideEffects: supp.supplementId.potentialSideEffects || []
          }
          : supp.customSupplement
            ? {
              _id: `custom_${supp._id}`,
              name: supp.customSupplement.name,
              brand: supp.customSupplement.brand,
              type: supp.customSupplement.type,
              dosageUnit: supp.customSupplement.dosageUnit,
              servingSize: supp.customSupplement.servingSize,
              description: supp.customSupplement.description || 'User-added supplement',
              potentialBenefits: [],
              potentialSideEffects: []
            }
            : null;

        return {
          ...supp,
          supplement // Use the supplement variable here
        };
      });

      setUserSupplements(processedUserSupplements);

      // Load intake history with proper error handling
      try {
        const intakeResponse = await axios.get('intake', {
          params: {
            limit: 100,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          }
        });

        // Process intake data to ensure consistent structure
        const processedIntakeHistory = intakeResponse.data.map(intake => ({
          ...intake,
          // Ensure userSupplementId is properly set
          userSupplementId: intake.userSupplementId?._id || intake.userSupplementId,
          // Ensure supplement name is available
          supplement: intake.supplement ||
            (intake.userSupplementId?.supplementId?.name ||
              intake.userSupplementId?.customSupplement?.name ||
              'Unknown Supplement'),
          // Ensure dosageTaken has a value
          dosageTaken: intake.dosageTaken || (intake.userSupplementId?.dosage || 0),
          // Ensure wasTaken is boolean
          wasTaken: intake.wasTaken !== undefined ? intake.wasTaken : true
        }));

        setIntakeHistory(processedIntakeHistory);
      } catch (error) {
        console.error('Error loading intake history:', error);
        setIntakeHistory([]);
      }

      // Load interactions (AI-powered first)
      try {
        const aiResponse = await checkSupplementInteractions();
        if (aiResponse && aiResponse.success && aiResponse.interactions) {
            setInteractions(aiResponse.interactions);
        } else {
            const interactionsResponse = await axios.get('interactions');
            setInteractions(interactionsResponse.data || []);
        }
      } catch (error) {
        console.log('AI Interactions not available, falling back to basic check');
        try {
            const interactionsResponse = await axios.get('interactions');
            setInteractions(interactionsResponse.data || []);
        } catch(fallbackError) {
            setInteractions([]);
        }
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showAlertMessage('Error loading data. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };


  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle intake recording
  const handleIntakeRecord = async (supplementId, taken = true, notes = '') => {
    try {
      setLoading(true);
      configureAxiosHeaders();

      // Get the user supplement to get dosage information
      const userSupplement = userSupplements.find(s => s._id === supplementId);
      if (!userSupplement) {
        showAlertMessage('Supplement not found', 'error');
        return;
      }

      const intakeData = {
        userSupplementId: supplementId,
        takenAt: new Date().toISOString(),
        dosageTaken: userSupplement.dosage || 0,
        wasTaken: taken,
        notes: notes,
        skippedReason: taken ? undefined : 'User skipped'
      };

      // Use the correct endpoint from your backend
      const response = await axios.post('intake', intakeData);

      // Update local state with the response data (which includes userId)
      const newIntake = {
        ...response.data,
        supplement: userSupplement.supplement?.name ||
          userSupplement.customSupplement?.name ||
          'Unknown Supplement'
      };

      setIntakeHistory(prev => [newIntake, ...prev]);
      setShowIntakeModal(false);
      showAlertMessage('Intake recorded successfully!', 'success');
    } catch (error) {
      console.error('Error recording intake:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showAlertMessage('Failed to record intake', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleAddSupplement = async (formData) => {
    try {
      // Don't set the main loading state here - let the modal handle its own loading state
      configureAxiosHeaders();

      const supplementData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        type: formData.type,
        dosageUnit: formData.unit,
        servingSize: parseInt(formData.dosage),
        description: 'User-added supplement'
      };

      // First, check if supplement exists or create a custom one
      let supplementId = null;
      let customSupplement = null;

      try {
        // Try to find existing supplement
        const searchResponse = await axios.get(`supplements?search=${encodeURIComponent(formData.name)}`);
        const existingSupplement = searchResponse.data.supplements?.find(
          s => s.name.toLowerCase() === formData.name.toLowerCase()
        );

        if (existingSupplement) {
          supplementId = existingSupplement._id;
        } else {
          // Create custom supplement
          const customSuppResponse = await axios.post('custom-supplement', supplementData);
          supplementId = customSuppResponse.data._id;
        }
      } catch (error) {
        // If custom supplement creation fails, use customSupplement field
        customSupplement = supplementData;
      }

      const userSupplementData = {
        supplementId: supplementId,
        customSupplement: customSupplement,
        dosage: parseInt(formData.dosage),
        frequency: formData.frequency,
        specificTimes: formData.times,
        withFood: formData.withFood,
        startDate: new Date(),
        reason: formData.reason.trim(),
        status: 'Active',
        cost: {
          price: parseFloat(formData.cost),
          quantity: parseInt(formData.quantity),
          currency: 'USD'
        }
      };

      await axios.post('user-supplements', userSupplementData);

      // Show success message
      showAlertMessage('Supplement added successfully! Reloading page...', 'success');

      // Close modal first
      setShowAddModal(false);

      // Reload the page after a short delay to show the success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error adding supplement:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showAlertMessage('Failed to add supplement', 'error');
      }
    }
  };

  // Add these functions near your other handler functions
  const handleUpdateSupplement = async (supplementId, updateData) => {
    try {
      setLoading(true);
      configureAxiosHeaders();

      const response = await axios.put(`user-supplements/${supplementId}`, updateData);

      // Update local state
      setUserSupplements(prev =>
        prev.map(supp =>
          supp._id === supplementId ? { ...supp, ...response.data } : supp
        )
      );

      showAlertMessage('Supplement updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating supplement:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showAlertMessage('Failed to update supplement', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  // Update the API call functions with better error handling
  const handleDeleteSupplement = async (supplementId) => {
    try {
      setLoading(true);
      configureAxiosHeaders();

      await axios.delete(`user-supplements/${supplementId}`);

      // Update local state
      setUserSupplements(prev => prev.filter(supp => supp._id !== supplementId));
      showAlertMessage('Supplement deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting supplement:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else if (error.response?.status === 404) {
        showAlertMessage('Supplement not found', 'error');
      } else {
        showAlertMessage('Failed to delete supplement', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  // Handle interaction acknowledgment
  const handleAcknowledgeInteraction = (interactionId) => {
    setInteractions(prev =>
      prev.map(interaction =>
        interaction._id === interactionId
          ? { ...interaction, acknowledged: true }
          : interaction
      )
    );
  };

  // Analytics calculations
  // Replace the calculateAdherence function with this improved version:
  // Improved adherence calculation
  const calculateAdherence = () => {
    if (userSupplements.length === 0) {
      return [];
    }

    const adherenceData = userSupplements.map(supp => {
      try {
        // Only calculate for active supplements
        if (supp.status !== 'Active') {
          return {
            supplement: supp.supplement?.name ||
              supp.customSupplement?.name ||
              'Unknown Supplement',
            adherence: 0,
            expected: 0,
            actual: 0,
            status: 'Inactive'
          };
        }

        // Calculate based on last 30 days (default period)
        const daysInPeriod = 30;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysInPeriod);

        // Get doses per day based on frequency
        const dosesPerDay = getDosesPerDay(supp.frequency);
        const expectedIntakes = daysInPeriod * dosesPerDay;

        // Count actual intakes for this supplement in the period
        const actualIntakes = intakeHistory.filter(intake => {
          if (!intake.userSupplementId || !supp._id) return false;

          // Check if this intake belongs to the current supplement
          let isSameSupplement;
          if (typeof intake.userSupplementId === 'string' && typeof supp._id === 'string') {
            isSameSupplement = intake.userSupplementId.toString() === supp._id.toString();
          } else if (typeof intake.userSupplementId === 'object' && intake.userSupplementId !== null && typeof supp._id === 'string') {
            isSameSupplement = intake.userSupplementId._id?.toString() === supp._id.toString();
          } else {
            return false;
          }

          // Check if intake was within the period and was taken
          let intakeDate;
          try {
            intakeDate = new Date(intake.takenAt || intake.date || intake.createdAt);
            if (isNaN(intakeDate.getTime())) return false;
          } catch (e) {
            return false;
          }

          const isWithinPeriod = intakeDate >= startDate && intakeDate <= endDate;
          const wasTaken = intake.wasTaken !== false; // Default to true if not specified

          return isSameSupplement && isWithinPeriod && wasTaken;
        }).length;

        const adherenceRate = expectedIntakes > 0 ?
          Math.round((actualIntakes / expectedIntakes) * 100) : 0;

        return {
          supplement: supp.supplement?.name ||
            supp.customSupplement?.name ||
            'Unknown Supplement',
          adherence: Math.min(adherenceRate, 100), // Cap at 100%
          expected: expectedIntakes,
          actual: actualIntakes,
          missed: Math.max(0, expectedIntakes - actualIntakes),
          status: 'Active'
        };
      } catch (error) {
        console.error('Error calculating adherence for supplement:', supp._id, error);
        return {
          supplement: supp.supplement?.name || 'Unknown Supplement',
          adherence: 0,
          expected: 0,
          actual: 0,
          missed: 0,
          status: 'Error'
        };
      }
    });

    console.log('Adherence calculation results:', adherenceData);
    return adherenceData;
  };

  // Helper function to get doses per day
  const getDosesPerDay = (frequency) => {
    switch (frequency) {
      case 'Once Daily': return 1;
      case 'Twice Daily': return 2;
      case 'Three Times Daily': return 3;
      case 'As Needed': return 1;
      default: return 1;
    }
  };

  // Improved cost calculation with better error handling
  const calculateCostAnalysis = () => {
    return userSupplements.map(supp => {
      try {
        const cost = supp.cost || {};

        // Validate cost data
        if (!cost.price || !cost.quantity || cost.price <= 0 || cost.quantity <= 0) {
          console.warn('Invalid cost data for supplement:', supp.supplement?.name, cost);
          return {
            name: supp.supplement?.name || supp.customSupplement?.name || 'Unknown Supplement',
            dailyCost: 0,
            monthlyCost: 0,
            yearlyCost: 0,
            costPerServing: 0,
            dosesPerDay: 0,
            hasValidCost: false
          };
        }

        // Calculate cost per serving (price per unit)
        const costPerServing = cost.price / cost.quantity;

        // Get doses per day based on frequency
        const dosesPerDay = getDosesPerDay(supp.frequency);

        // Calculate daily cost (cost per serving Ã— doses per day)
        const dailyCost = costPerServing * dosesPerDay;

        return {
          name: supp.supplement?.name || supp.customSupplement?.name || 'Unknown Supplement',
          dailyCost: parseFloat(dailyCost.toFixed(2)),
          monthlyCost: parseFloat((dailyCost * 30).toFixed(2)),
          yearlyCost: parseFloat((dailyCost * 365).toFixed(2)),
          costPerServing: parseFloat(costPerServing.toFixed(2)),
          dosesPerDay: dosesPerDay,
          hasValidCost: true,
          // Debug info
          price: cost.price,
          quantity: cost.quantity,
          dosage: supp.dosage,
          frequency: supp.frequency
        };
      } catch (error) {
        console.error('Error calculating cost for supplement:', supp._id, error);
        return {
          name: supp.supplement?.name || 'Error calculating cost',
          dailyCost: 0,
          monthlyCost: 0,
          yearlyCost: 0,
          costPerServing: 0,
          dosesPerDay: 0,
          hasValidCost: false,
          error: error.message
        };
      }
    }).filter(item => item.hasValidCost); // Only include supplements with valid cost data
  };

  // Helper function to get doses per day (make sure this exists)


  const getHealthCorrelationData = () => {
    const vitaminDStart = userSupplements.find(s => s.supplement?.name === 'Vitamin D3')?.startDate;
    const b12Start = userSupplements.find(s => s.supplement?.name === 'Vitamin B12')?.startDate;

    return healthMetrics
      .filter(metric => metric.type === 'Energy')
      .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
      .map(metric => ({
        date: metric.date,
        energy: metric.value,
        vitaminDActive: vitaminDStart ? new Date(metric.recordedAt) >= new Date(vitaminDStart) : false,
        b12Active: b12Start ? new Date(metric.recordedAt) >= new Date(b12Start) : false
      }));
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const today = now.toDateString();
    const reminders = [];

    userSupplements.forEach(supp => {
      supp.specificTimes?.forEach(time => {
        const [hours, minutes] = time.split(':');
        const reminderTime = new Date();
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (reminderTime.toDateString() === today && reminderTime > now) {
          reminders.push({
            supplement: supp.supplement?.name || 'Unknown',
            time: time,
            withFood: supp.withFood,
            dosage: supp.dosage,
            unit: supp.supplement?.dosageUnit || 'units',
            id: supp._id
          });
        }
      });
    });

    return reminders.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Modal components
  const AddSupplementModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      brand: '',
      type: 'Vitamin',
      dosage: '',
      unit: 'mg',
      frequency: 'Once Daily',
      times: ['08:00'],
      withFood: false,
      reason: '',
      cost: '',
      quantity: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTimeChange = (index, value) => {
      const newTimes = [...formData.times];
      newTimes[index] = value;
      setFormData({ ...formData, times: newTimes });
    };

    const addTime = () => {
      setFormData({ ...formData, times: [...formData.times, '08:00'] });
    };

    const removeTime = (index) => {
      if (formData.times.length > 1) {
        const newTimes = [...formData.times];
        newTimes.splice(index, 1);
        setFormData({ ...formData, times: newTimes });
      }
    };

    const validateField = (name, value) => {
      let error = '';

      switch (name) {
        case 'name':
          if (!value.trim()) error = 'Supplement name is required';
          else if (value.length < 2) error = 'Name must be at least 2 characters';
          break;
        case 'brand':
          if (!value.trim()) error = 'Brand name is required';
          break;
        case 'dosage':
          if (!value) error = 'Dosage is required';
          else if (isNaN(value) || parseFloat(value) <= 0) error = 'Dosage must be a positive number';
          else if (parseFloat(value) > 10000) error = 'Dosage seems too high';
          break;
        case 'cost':
          if (!value) error = 'Cost is required';
          else if (isNaN(value) || parseFloat(value) <= 0) error = 'Cost must be a positive number';
          else if (parseFloat(value) > 1000) error = 'Cost seems too high';
          break;
        case 'quantity':
          if (!value) error = 'Quantity is required';
          else if (isNaN(value) || parseInt(value) <= 0) error = 'Quantity must be a positive whole number';
          else if (parseInt(value) > 1000) error = 'Quantity seems too high';
          break;
        case 'reason':
          if (!value.trim()) error = 'Reason for taking is required';
          break;
        default:
          break;
      }

      return error;
    };

    const handleBlur = (field) => {
      setTouched({ ...touched, [field]: true });
      const error = validateField(field, formData[field]);
      setErrors({ ...errors, [field]: error });
    };

    const handleChange = (field, value) => {
      setFormData({ ...formData, [field]: value });

      // Clear error when user starts typing
      if (errors[field] && touched[field]) {
        const error = validateField(field, value);
        setErrors({ ...errors, [field]: error });
      }
    };

    const validateForm = () => {
      const newErrors = {};
      let isValid = true;

      const fieldsToValidate = ['name', 'brand', 'dosage', 'cost', 'quantity', 'reason'];

      fieldsToValidate.forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });

      // Validate times
      if (formData.times.some(time => !time)) {
        newErrors.times = 'All intake times must be set';
        isValid = false;
      }

      setErrors(newErrors);
      setTouched({
        name: true, brand: true, dosage: true, cost: true,
        quantity: true, reason: true, times: true
      });

      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      setIsSubmitting(true); // Start loading

      try {
        await handleAddSupplement(formData);
      } catch (error) {
        // Error is already handled in handleAddSupplement
      } finally {
        // Don't set isSubmitting to false here because the page will reload on success
        // If there's an error, the modal will stay open and the button will remain disabled
        // until the user interacts with it again
      }
    };


    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl text-black font-bold mb-4 dark:text-white">Add New Supplement</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
                Supplement Name *
              </label>
              <input
                type="text"
                className={`w-full p-3 border text-black border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.name && touched.name ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                placeholder="e.g., Vitamin D3"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                required
              />
              {errors.name && touched.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Brand Field */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
                Brand *
              </label>
              <input
                type="text"
                className={`w-full p-3 text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.brand && touched.brand ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                placeholder="e.g., Nature Made"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                onBlur={() => handleBlur('brand')}
                required
              />
              {errors.brand && touched.brand && (
                <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
              )}
            </div>

            {/* Type Field */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
                Type
              </label>
              <select
                className="w-full p-3 text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option>Vitamin</option>
                <option>Mineral</option>
                <option>Herbal</option>
                <option>Amino Acid</option>
                <option>Probiotic</option>
                <option>Other</option>
              </select>
            </div>

            {/* Dosage Field */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
                Dosage *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10000"
                  className={`flex-1 p-3 text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.dosage && touched.dosage ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                  placeholder="2000"
                  value={formData.dosage}
                  onChange={(e) => handleChange('dosage', e.target.value)}
                  onBlur={() => handleBlur('dosage')}
                  required
                />
                <select
                  className="w-24 p-3 border text-gray-700 border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                >
                  <option>mg</option>
                  <option>mcg</option>
                  <option>IU</option>
                  <option>g</option>
                </select>
              </div>
              {errors.dosage && touched.dosage && (
                <p className="text-red-500 text-xs mt-1">{errors.dosage}</p>
              )}
            </div>

            {/* Frequency Field */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
                Frequency
              </label>
              <select
                className="w-full text-black p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
              >
                <option>Once Daily</option>
                <option>Twice Daily</option>
                <option>Three Times Daily</option>
                <option>As Needed</option>
              </select>
            </div>

            {/* Cost Field */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
                Cost ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="1000"
                className={`w-full p-3 text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.cost && touched.cost ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                placeholder="15.99"
                value={formData.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
                onBlur={() => handleBlur('cost')}
                required
              />
              {errors.cost && touched.cost && (
                <p className="text-red-500 text-xs mt-1">{errors.cost}</p>
              )}
            </div>

            {/* Quantity Field */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
                Quantity (servings) *
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                className={`w-full p-3 text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.quantity && touched.quantity ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                placeholder="30"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                onBlur={() => handleBlur('quantity')}
                required
              />
              {errors.quantity && touched.quantity && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Intake Times */}
          <div className="mt-4">
            <label className="block text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
              Intake Times *
            </label>
            <div className="space-y-2">
              {formData.times.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    className="p-2 text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    required
                  />
                  {formData.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {errors.times && touched.times && (
                <p className="text-red-500 text-xs mt-1">{errors.times}</p>
              )}
              <button
                type="button"
                onClick={addTime}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Plus className="w-4 h-4" />
                Add another time
              </button>
            </div>
          </div>

          {/* With Food Checkbox */}
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="withFood"
              className="w-4 h-4 mr-2"
              checked={formData.withFood}
              onChange={(e) => handleChange('withFood', e.target.checked)}
            />
            <label htmlFor="withFood" className="text-sm text-gray-700 font-medium dark:text-gray-300">
              Take with food
            </label>
          </div>

          {/* Reason Field */}
          <div className="mt-4">
            <label className="block text-sm text-gray-700 font-medium mb-2 dark:text-gray-300">
              Reason for Taking *
            </label>
            <textarea
              className={`w-full p-3 text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.reason && touched.reason ? 'border-red-500 dark:border-red-500' : ''
                }`}
              rows="3"
              placeholder="e.g., Doctor recommended for vitamin D deficiency"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              onBlur={() => handleBlur('reason')}
              required
            ></textarea>
            {errors.reason && touched.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={isSubmitting} // Disable during submission
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={Object.values(errors).some(error => error) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                'Add Supplement'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  const IntakeModal = () => {
    const [selectedSupplementId, setSelectedSupplementId] = useState(userSupplements[0]?._id || '');
    const [takenTime, setTakenTime] = useState(new Date().toISOString().slice(0, 16));
    const [takenAsPrescribed, setTakenAsPrescribed] = useState(true);
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
      // Create proper intake data structure
      const intakeData = {
        userSupplementId: selectedSupplementId,
        takenAt: new Date(takenTime).toISOString(),
        dosageTaken: userSupplements.find(s => s._id === selectedSupplementId)?.dosage || 0,
        wasTaken: takenAsPrescribed,
        notes: notes,
        skippedReason: takenAsPrescribed ? undefined : 'User skipped'
      };

      handleIntakeRecord(selectedSupplementId, takenAsPrescribed, notes);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <h3 className="text-xl text-black font-bold mb-4 dark:text-white">Record Intake</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2 dark:text-gray-300">Supplement</label>
              <select
                className="w-full text-black p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedSupplementId}
                onChange={(e) => setSelectedSupplementId(e.target.value)}
              >
                {userSupplements.map(supp => (
                  <option key={supp._id} value={supp._id}>
                    {supp.supplement?.name} - {supp.dosage}{supp.supplement?.dosageUnit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2 dark:text-gray-300">Time Taken</label>
              <input
                type="datetime-local"
                className="w-full p-3  text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={takenTime}
                onChange={(e) => setTakenTime(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 mr-2 text-black "
                checked={takenAsPrescribed}
                onChange={(e) => setTakenAsPrescribed(e.target.checked)}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Taken as prescribed</span>
            </div>

            <div>
              <label className="block  text-gray-600 text-sm font-medium mb-2 dark:text-gray-300">Notes (optional)</label>
              <textarea
                className="w-full text-black p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="3"
                placeholder="Any side effects or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowIntakeModal(false)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
            >
              Record Intake
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SupplementDetailModal = () => {
    if (!selectedSupplement) return null;

    const supplementName = selectedSupplement.supplement?.name ||
      selectedSupplement.customSupplement?.name ||
      selectedSupplement.name ||
      'Unknown Supplement';

    const supplementBrand = selectedSupplement.supplement?.brand ||
      selectedSupplement.customSupplement?.brand ||
      selectedSupplement.brand ||
      '';
    const dosageUnit = selectedSupplement.supplement?.dosageUnit || selectedSupplement.customSupplement?.dosageUnit || 'units';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl text-black font-bold dark:text-white">{selectedSupplement.supplement?.name}</h3>
            <button
              onClick={() => setShowDetailModal(false)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-black dark:text-gray-300">Supplement Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Brand:</span>
                  <span className="font-medium text-black dark:text-gray-300">{selectedSupplement.supplement?.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-medium text-black dark:text-gray-300">{selectedSupplement.supplement?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dosage:</span>
                  <span className="font-medium text-black dark:text-gray-300">
                    {selectedSupplement.dosage} {selectedSupplement.supplement?.dosageUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                  <span className="font-medium text-black dark:text-gray-300">{selectedSupplement.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Times:</span>
                  <span className="font-medium text-black dark:text-gray-300">{selectedSupplement.specificTimes?.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">With Food:</span>
                  <span className="font-medium text-black dark:text-gray-300">{selectedSupplement.withFood ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between mt-7">
                  <span className="text-gray-600 dark:text-gray-400 ">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium -mt-2 ${selectedSupplement.status === 'Active' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                    selectedSupplement.status === 'Paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                    {selectedSupplement.status}
                  </span>
                </div>
              </div>

              {selectedSupplement.reason && (
                <div className="mt-4">
                  <h4 className="font-medium text-black mb-4 dark:text-gray-300">Reason for Taking</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-400">{selectedSupplement.reason}</p>
                </div>
              )}

              {selectedSupplement.cost && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-600 mb-2 dark:text-gray-300">Cost Information</h4>
                  <div className="text-sm text-gray-700 dark:text-gray-400">
                    <p>Price: ${selectedSupplement.cost.price} for {selectedSupplement.cost.quantity} servings</p>
                    <p>Daily cost: ${((selectedSupplement.cost.price / selectedSupplement.cost.quantity) * (selectedSupplement.frequency === 'Once Daily' ? 1 : 2)).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-black mb-3 dark:text-gray-300">Supplement Information</h4>
              <p className="text-sm text-gray-700 dark:text-gray-400 mb-4">{selectedSupplement.supplement?.description}</p>

              {selectedSupplement.supplement?.potentialBenefits && (
                <div className="mb-4">
                  <h5 className="font-medium text-black text-sm mb-2 dark:text-gray-300">Potential Benefits</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-400">
                    {selectedSupplement.supplement.potentialBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start mb-1">
                        <CheckCircle className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSupplement.supplement?.potentialSideEffects && (
                <div>
                  <h5 className="font-medium text-sm text-black mb-2 dark:text-gray-300">Potential Side Effects</h5>
                  <ul className="text-sm text-gray-700 dark:text-gray-400">
                    {selectedSupplement.supplement.potentialSideEffects.map((effect, index) => (
                      <li key={index} className="flex items-start mb-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowDetailModal(false);
                setShowIntakeModal(true);
              }}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
            >
              Record Intake
            </button>
            <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Edit Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Tab components
  const DashboardTab = () => {
    const adherenceData = calculateAdherence();
    const costData = calculateCostAnalysis();
    const reminders = getUpcomingReminders();

    // Calculate average adherence safely
    const averageAdherence = adherenceData.length > 0
      ? Math.round(adherenceData.reduce((sum, item) => sum + item.adherence, 0) / adherenceData.length)
      : 0;
    const totalMonthlyCost = costData.reduce((sum, item) => sum + item.monthlyCost, 0);

    // Add loading state check
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Supplements</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{userSupplements.length}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Avg. Adherence</p>
                <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-300">
                  {Math.round(adherenceData.reduce((sum, item) => sum + item.adherence, 0) / adherenceData.length) || 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Monthly Cost</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">${totalMonthlyCost.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Interactions</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-300">{interactions.filter(i => !i.acknowledged).length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg text-black font-semibold dark:text-white">Today's Reminders</h3>
            </div>
            <button
              onClick={() => toggleSection('reminders')}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {expandedSections.reminders ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedSections.reminders ? (
            reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-600 dark:text-white">{reminder.supplement}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reminder.dosage} {reminder.unit} {reminder.withFood ? '(with food)' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 dark:text-blue-400">{reminder.time}</p>
                      <button
                        onClick={() => handleIntakeRecord(reminder.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 mt-1"
                      >
                        Mark as taken
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No reminders for today</p>
            )
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Click to expand reminders</p>
          )}
        </div>

        {/* Interaction Warnings */}
        {interactions.filter(i => !i.acknowledged).length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Interaction Warnings</h3>
              </div>
              <button
                onClick={() => toggleSection('interactions')}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {expandedSections.interactions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {expandedSections.interactions ? (
              <div className="space-y-4">
                {interactions.filter(i => !i.acknowledged).map(interaction => (
                  <div key={interaction._id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${interaction.severity === 'Severe' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        interaction.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                        {interaction.severity}
                      </span>
                      <button
                        onClick={() => handleAcknowledgeInteraction(interaction._id)}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Acknowledge
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 dark:text-gray-300">{interaction.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{interaction.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Click to expand interaction warnings</p>
            )}
          </div>
        )}

        {/* Quick Charts */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg text-black font-semibold dark:text-white">Quick Overview</h3>
            <button
              onClick={() => toggleSection('charts')}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {expandedSections.charts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {expandedSections.charts ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-600 mb-4 dark:text-gray-300">Adherence Overview</h4>
                <div className="h-[250px] relative">
                  {adherenceData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">No adherence data yet</p>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={adherenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={theme === 'dark' ? 0.3 : 1} />
                      <XAxis dataKey="supplement" angle={-20} textAnchor="end" height={80} tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151', dy: 14, dx: 15 }} />
                      <YAxis tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
                          borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                          color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                        }}
                      />
                      <Bar dataKey="adherence" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-600 mb-4 dark:text-white">Cost Breakdown</h4>
                <div className="h-[250px] relative">
                  {costData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">No cost data available</p>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="monthlyCost"
                        nameKey="name"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {costData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Monthly Cost']}
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#141b25ff' : '#FFF',
                          borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                        }}
                        labelStyle={{
                          color: theme === 'dark' ? '#F9FAFB' : '#1F2937',
                        }}
                        itemStyle={{
                          color: theme === 'dark' ? '#F9FAFB' : '#1F2937',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Click to expand charts</p>
          )}
        </div>
      </div >
    );
  };

  const SupplementsTab = () => {
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    // Debounce the search to prevent excessive re-renders
    useEffect(() => {
      const timer = setTimeout(() => {
        setSearchQuery(localSearchQuery);
      }, 300);

      return () => clearTimeout(timer);
    }, [localSearchQuery]);

    const filteredSupplements = useMemo(() => {
      return userSupplements.filter(supp => {
        const supplementName = supp.supplement?.name || supp.customSupplement?.name || 'Unknown';
        const matchesSearch = supplementName.toLowerCase().includes(localSearchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || (supp.status && supp.status.toLowerCase() === filterType);
        return matchesSearch && matchesFilter;
      });
    }, [userSupplements, localSearchQuery, filterType]);

    // Helper function to get supplement display name - make it more robust
    const getSupplementDisplayName = (supp) => {
      return supp.supplement?.name ||
        supp.customSupplement?.name ||
        supp.name || // Direct name property
        'Unknown Supplement';
    };

    // Helper function to get supplement brand
    const getSupplementBrand = (supp) => {
      return supp.supplement?.brand ||
        supp.customSupplement?.brand ||
        supp.brand || // Direct brand property
        '';
    };

    // Helper function to get dosage unit
    const getDosageUnit = (supp) => {
      return supp.supplement?.dosageUnit ||
        supp.customSupplement?.dosageUnit ||
        supp.dosageUnit || // Direct dosageUnit property
        'units';
    };

    return (
      <div className="space-y-6">
        {/* Header with search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search supplements..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10 text-black pr-4 py-2 border border-gray-300 rounded-lg w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoComplete="off"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border text-black border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus className="w-4 h-4" />
            Add Supplement
          </button>
        </div>

        {/* Supplements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupplements.map(supp => (
            <div key={supp._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-black text-lg dark:text-white mb-2">
                    {getSupplementDisplayName(supp)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {getSupplementBrand(supp)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSupplement(supp)}
                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${getSupplementDisplayName(supp)}?`)) {
                        handleDeleteSupplement(supp._id);
                      }
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dosage:</span>
                  <span className="font-medium text-black dark:text-gray-300">
                    {supp.dosage} {getDosageUnit(supp)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                  <span className="font-medium text-black dark:text-gray-300">{supp.frequency || 'Once Daily'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Times:</span>
                  <span className="font-medium text-black dark:text-gray-300">
                    {supp.specificTimes?.join(', ') || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">With Food:</span>
                  <span className="font-medium text-black dark:text-gray-300 mb-3">
                    {supp.withFood ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${supp.status === 'Active' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                    supp.status === 'Paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                    {supp.status || 'Active'}
                  </span>
                </div>
              </div>

              {supp.reason && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{supp.reason}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleIntakeRecord(supp._id)}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                  Record Intake
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplement(supp);
                    setShowDetailModal(true);
                  }}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSupplements.length === 0 && (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {userSupplements.length === 0 ? 'No supplements added yet.' : 'No supplements found matching your criteria.'}
            </p>
            {userSupplements.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Supplement
              </button>
            )}
          </div>
        )}
      </div>
    );
  };
  const AnalyticsTab = () => {// Define timeRange FIRST
    const [timeRange, setTimeRange] = useState('14'); // Change default to 14 to match the heading

    // THEN use it in useDebounce
    const debouncedTimeRange = useDebounce(timeRange, 500);

    const [analyticsData, setAnalyticsData] = useState({
      adherence: [],
      cost: [],
      healthMetrics: [],
      timeline: [],
    });

    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    // Load analytics data from backend
    const loadAnalyticsData = async () => {
      try {
        setLoadingAnalytics(true);
        configureAxiosHeaders();

        const days = parseInt(timeRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        console.log('Loading analytics data for period:', {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
          days: days
        });

        // Use Promise.allSettled to handle partial failures
        const [adherenceResponse, costResponse, healthResponse, timelineResponse] =
          await Promise.allSettled([
            apiCallWithRetry(`adherence-reports?startDate=${startDate.toISOString()}&endDate=${new Date().toISOString()}`),
            apiCallWithRetry('cost-reports'),
            apiCallWithRetry(`health-metrics?startDate=${startDate.toISOString()}&endDate=${new Date().toISOString()}`),
            apiCallWithRetry(`intake-timeline?days=${days}`)
          ]);

        console.log('API Responses:', {
          adherence: adherenceResponse.status,
          cost: costResponse.status,
          health: healthResponse.status,
          timeline: timelineResponse.status
        });

        // Process timeline data with better error handling
        let timelineData = [];
        if (timelineResponse.status === 'fulfilled' && timelineResponse.value) {
          console.log('Timeline data received:', timelineResponse.value.timeline?.length || timelineResponse.value.length, 'records');
          // Handle both the new structured response and old format
          timelineData = processTimelineData(
            timelineResponse.value.timeline || timelineResponse.value,
            days
          );
        } else {
          console.log('Using fallback intake history');
          timelineData = processTimelineData(intakeHistory, days);
        }

        setAnalyticsData({
          adherence: adherenceResponse.status === 'fulfilled' ? adherenceResponse.value : [],
          cost: costResponse.status === 'fulfilled' ? costResponse.value?.supplements || [] : [],
          healthMetrics: healthResponse.status === 'fulfilled' ? healthResponse.value : [],
          timeline: timelineData
        });

      } catch (error) {
        console.error('Error loading analytics data:', error);
        // Use fallback data
        const fallbackAdherence = userSupplements.map(supp => {
          const daysInPeriod = parseInt(timeRange);
          const dosesPerDay = getDosesPerDay(supp.frequency);
          const expectedIntakes = daysInPeriod * dosesPerDay;

          const actualIntakes = intakeHistory.filter(intake =>
            intake.userSupplementId?.toString() === supp._id?.toString() && intake.wasTaken
          ).length;

          const adherenceRate = expectedIntakes > 0 ? Math.round((actualIntakes / expectedIntakes) * 100) : 0;

          return {
            supplement: supp.supplement?.name || supp.customSupplement?.name || 'Unknown Supplement',
            adherenceRate: adherenceRate,
            expectedIntakes: expectedIntakes,
            actualIntakes: actualIntakes
          };
        });

        setAnalyticsData({
          adherence: fallbackAdherence,
          cost: calculateCostAnalysis(),
          healthMetrics: healthMetrics,
          timeline: processTimelineData(intakeHistory, parseInt(timeRange))
        });
      } finally {
        setLoadingAnalytics(false);
      }
    };// Enhanced timeline data processing - FIXED VERSION
    // In your AnalyticsTab component, replace the processTimelineData function:
    const processTimelineData = (intakeData, days = 14) => {
      if (!intakeData || !Array.isArray(intakeData)) {
        console.warn('Invalid intake data for timeline processing');
        return generateEmptyTimeline(days);
      }

      try {
        // If data is already processed by backend (has date and count properties)
        if (intakeData.length > 0 && intakeData[0].date && intakeData[0].count !== undefined) {
          console.log('Using backend-processed timeline data');
          return intakeData;
        }

        // Fallback to frontend processing (your existing logic)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        console.log(`Frontend processing timeline data for ${days} days from ${startDate.toISOString()}`);

        // Filter intake data for the specified period, only including taken supplements
        const recentIntakes = intakeData.filter(intake => {
          try {
            let takenAtDate;

            if (intake.date) {
              takenAtDate = new Date(intake.date);
            } else if (intake.takenAt) {
              takenAtDate = new Date(intake.takenAt);
            } else if (intake.createdAt) {
              takenAtDate = new Date(intake.createdAt);
            } else {
              return false;
            }

            if (!(takenAtDate instanceof Date) || isNaN(takenAtDate.getTime())) {
              return false;
            }

            const wasTaken = intake.wasTaken !== false;
            const isWithinPeriod = takenAtDate >= startDate;

            return wasTaken && isWithinPeriod;
          } catch (error) {
            console.warn('Error processing intake date:', error, intake);
            return false;
          }
        });

        console.log(`Recent intakes for ${days}-day timeline:`, recentIntakes.length);

        // Count unique supplements per day (not total intake records)
        const uniqueSupplementsByDate = recentIntakes.reduce((acc, intake) => {
          try {
            let dateKey;

            if (intake.date) {
              dateKey = intake.date;
            } else {
              const takenAtDate = intake.takenAt ? new Date(intake.takenAt) : new Date(intake.createdAt);
              dateKey = takenAtDate.toISOString().split('T')[0];
            }

            if (!acc[dateKey]) {
              acc[dateKey] = new Set(); // Use Set to track unique supplements
            }

            // Use userSupplementId to identify unique supplements
            const supplementId = intake.userSupplementId?.toString() || intake._id?.toString();
            acc[dateKey].add(supplementId);

            return acc;
          } catch (error) {
            console.warn('Error counting intake for date:', error, intake);
            return acc;
          }
        }, {});

        // Generate timeline for the specified period including days with zero intakes
        const timelineData = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const currentDate = new Date(startDate);

        while (currentDate <= today) {
          const dateKey = currentDate.toISOString().split('T')[0];
          const uniqueSupplements = uniqueSupplementsByDate[dateKey];
          const count = uniqueSupplements ? uniqueSupplements.size : 0;

          timelineData.push({
            date: dateKey,
            count: count,
            displayDate: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
            fullDate: currentDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log('Final timeline data:', timelineData);
        return timelineData;
      } catch (error) {
        console.error('Error in processTimelineData:', error);
        return generateEmptyTimeline(days);
      }
    };

    // Helper function to generate empty timeline - FIXED VERSION
    const generateEmptyTimeline = (days) => {
      const timeline = [];
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const currentDate = new Date(startDate);

      while (currentDate <= today) {
        const dateKey = currentDate.toISOString().split('T')[0];

        timeline.push({
          date: dateKey,
          count: 0,
          displayDate: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
          fullDate: currentDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return timeline;
    };
    // Calculate adherence from backend data or fallback
    // In AnalyticsTab component, update the getAdherenceData function:
    // Fixed adherence data calculation for AnalyticsTab
    const getAdherenceData = () => {
      // Use backend data if available and properly structured
      if (analyticsData.adherence && analyticsData.adherence.length > 0) {
        console.log('Using backend adherence data:', analyticsData.adherence);
        return analyticsData.adherence.map(item => ({
          supplement: item.supplement || 'Unknown Supplement',
          adherence: item.adherenceRate || item.adherence || 0,
          expected: item.expectedIntakes || item.expected || 0,
          actual: item.actualIntakes || item.actual || 0,
          missed: item.missedIntakes || 0
        }));
      }

      // Fallback to frontend calculation using the main calculateAdherence function
      console.log('Using frontend adherence calculation');
      const adherenceResults = calculateAdherence();

      // Ensure consistent structure
      return adherenceResults.map(item => ({
        supplement: item.supplement,
        adherence: item.adherence,
        expected: item.expected,
        actual: item.actual,
        missed: Math.max(0, item.expected - item.actual)
      }));
    };
    // Calculate cost data from backend or fallback
    // Calculate cost data from backend or fallback - FIXED VERSION
    const getCostData = () => {
      if (analyticsData.cost && analyticsData.cost.supplements && analyticsData.cost.supplements.length > 0) {
        console.log('Using backend cost data:', analyticsData.cost.supplements);
        return analyticsData.cost.supplements.map(item => ({
          name: item.name,
          dailyCost: item.dailyCost || 0,
          monthlyCost: item.monthlyCost || 0,
          yearlyCost: item.yearlyCost || 0,
          costPerServing: item.costPerServing || 0,
          dosesPerDay: item.dosesPerDay || 1
        }));
      }

      console.log('Using frontend cost calculation');
      return calculateCostAnalysis();
    };

    // Get health correlation data
    // Get health correlation data
    const getHealthCorrelationData = () => {
      const vitaminDStart = userSupplements.find(s =>
        s.supplement?.name === 'Vitamin D3' || s.customSupplement?.name === 'Vitamin D3'
      )?.startDate;

      const b12Start = userSupplements.find(s =>
        s.supplement?.name === 'Vitamin B12' || s.customSupplement?.name === 'Vitamin B12'
      )?.startDate;

      return (analyticsData.healthMetrics || healthMetrics)
        .filter(metric => metric.type === 'Energy')
        .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
        .map(metric => ({
          date: new Date(metric.recordedAt).toISOString().split('T')[0],
          energy: metric.value,
          vitaminDActive: vitaminDStart ? new Date(metric.recordedAt) >= new Date(vitaminDStart) : false,
          b12Active: b12Start ? new Date(metric.recordedAt) >= new Date(b12Start) : false
        }));
    };


    // Load data when component mounts or timeRange changes
    useEffect(() => {
      loadAnalyticsData();
    }, [debouncedTimeRange]);

    const adherenceData = getAdherenceData();
    const costData = getCostData();
    const healthCorrelationData = getHealthCorrelationData();
    const timelineData = analyticsData.timeline || [];

    if (loadingAnalytics) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Time Range Selector */}
        <div className="bg-white text-black dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold dark:text-white">Analytics Dashboard</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>

        {/* Adherence Analysis */}
        <div className="bg-white text-black dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6 dark:text-white">Adherence Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4 dark:text-gray-300">Adherence Rates by Supplement</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={adherenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={theme === 'dark' ? 0.3 : 1} />
                  <XAxis
                    dataKey="supplement"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151', fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Adherence']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                    }}
                  />
                  <Bar dataKey="adherence" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div >
              <h4 className="font-medium mb-4 dark:text-gray-300">Expected vs Actual Intakes</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={adherenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={theme === 'dark' ? 0.3 : 1} />
                  <XAxis
                    dataKey="supplement"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                    }}
                  />
                  <Bar dataKey="expected" fill="#21706d" name="Expected" />
                  <Bar dataKey="actual" fill="#10B981" name="Actual" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white text-black dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6 dark:text-white">
            Intake Timeline (Last {timeRange} Days)
            {timelineData.length > 0 && (
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                - Total Intakes: {timelineData.reduce((sum, day) => sum + day.count, 0)}
                {analyticsData.timeline && analyticsData.timeline !== timelineData && (
                  <span className="text-blue-500 ml-2">(Real Data)</span>
                )}
              </span>
            )}
          </h3>

          {timelineData.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No intake data available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Record some supplement intakes to see your timeline
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Area Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={theme === 'dark' ? 0.3 : 1} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151' }}
                  />
                  <YAxis tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151' }} />
                  <Tooltip
                    labelFormatter={(value, payload) => {
                      if (payload && payload[0] && payload[0].payload) {
                        return payload[0].payload.fullDate || value;
                      }
                      return value;
                    }}
                    formatter={(value) => [`${value} intakes`, 'Daily Intakes']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="Daily Intakes"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Daily Breakdown Table */}
              <div className="mt-6">
                <h4 className="font-medium text-black mb-4 dark:text-gray-300">Daily Intake Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-xs">
                  {timelineData.map((day, index) => (
                    <div key={index} className={`p-2 rounded-lg text-center ${day.count > 0
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                      <div className="font-medium">{day.displayDate}</div>
                      <div className="text-lg font-bold">{day.count}</div>
                      <div>intake{day.count !== 1 ? 's' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cost Analysis */}
        <div className="bg-white text-black dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6 dark:text-white">Cost Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-4 dark:text-gray-300">Monthly Cost Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={costData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="monthlyCost"
                    nameKey="name"
                    label={({ name, monthlyCost }) => `${name}: $${monthlyCost?.toFixed(2) || '0.00'}`}
                  >
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`$${value?.toFixed(2) || '0.00'}`, 'Monthly Cost']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-medium mb-4 text-black dark:text-gray-300">Cost Breakdown by Time Period</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={theme === 'dark' ? 0.3 : 1} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151' }} />
                  <Tooltip
                    formatter={(value) => [`$${value?.toFixed(2) || '0.00'}`, 'Cost']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                    }}
                  />
                  <Bar dataKey="dailyCost" fill="#3B82F6" name="Daily Cost" />
                  <Bar dataKey="monthlyCost" fill="#10B981" name="Monthly Cost" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Summary Table */}
          <div className="mt-6">
            <h4 className="font-medium text-black mb-4 dark:text-gray-300">Detailed Cost Breakdown</h4>
            <div className="overflow-x-auto text-black">
              <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium dark:text-gray-300">Supplement</th>
                    <th className="px-4 py-3 text-right font-medium dark:text-gray-300">Daily Cost</th>
                    <th className="px-4 py-3 text-right font-medium dark:text-gray-300">Monthly Cost</th>
                    <th className="px-4 py-3 text-right font-medium dark:text-gray-300">Yearly Cost</th>
                    <th className="px-4 py-3 text-right font-medium dark:text-gray-300">Doses/Day</th>
                  </tr>
                </thead>
                <tbody>
                  {costData.map((item, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 dark:text-gray-300">{item.name}</td>
                      <td className="px-4 py-3 text-right dark:text-gray-300">${item.dailyCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right dark:text-gray-300">${item.monthlyCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right dark:text-gray-300">${item.yearlyCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right dark:text-gray-300">{item.dosesPerDay}</td>
                    </tr>
                  ))}
                  {costData.length > 0 && (
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-semibold bg-gray-50 dark:bg-gray-700">
                      <td className="px-4 py-3 dark:text-gray-300">Total</td>
                      <td className="px-4 py-3 text-right dark:text-gray-300">
                        ${costData.reduce((sum, item) => sum + item.dailyCost, 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right dark:text-gray-300">
                        ${costData.reduce((sum, item) => sum + item.monthlyCost, 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right dark:text-gray-300">
                        ${costData.reduce((sum, item) => sum + item.yearlyCost, 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right dark:text-gray-300">
                        {costData.reduce((sum, item) => sum + item.dosesPerDay, 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {costData.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No cost data available. Add cost information to your supplements to see cost analysis.
              </div>
            )}
          </div>
        </div>

        {/* Health Correlation */}
        {healthCorrelationData.length > 0 && (
          <div className="bg-white text-black dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6 dark:text-white">Health Metrics Correlation</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4 dark:text-gray-300">Energy Levels Over Time</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={healthCorrelationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={theme === 'dark' ? 0.3 : 1} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151' }}
                    />
                    <YAxis domain={[0, 10]} tick={{ fill: theme === 'dark' ? '#D1D5DB' : '#374151' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
                        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                        color: theme === 'dark' ? '#F9FAFB' : '#1F2937'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                      name="Energy Level"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-medium text-black mb-4 dark:text-gray-300">Health Metrics Summary</h4>
                <div className="space-y-4">
                  {['Energy', 'Mood', 'Sleep'].map(metric => {
                    const metricData = analyticsData.healthMetrics.filter(hm => hm.type === metric);
                    const average = metricData.length > 0
                      ? metricData.reduce((sum, hm) => sum + hm.value, 0) / metricData.length
                      : null;

                    return (
                      <div key={metric} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex text-black justify-between items-center mb-2">
                          <span className="font-medium dark:text-gray-300">{metric}</span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {average ? `${average.toFixed(1)}/10` : 'No data'}
                          </span>
                        </div>
                        <div className="w-full text-black bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(average || 0) * 10}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Based on {metricData.length} records
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white text-black dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Adherence Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="dark:text-gray-300">Average Adherence:</span>
                <span className="font-semibold dark:text-white">
                  {adherenceData.length > 0
                    ? `${Math.round(adherenceData.reduce((sum, item) => sum + item.adherence, 0) / adherenceData.length)}%`
                    : 'No data'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-300">Best Performing:</span>
                <span className="font-semibold dark:text-white">
                  {adherenceData.length > 0
                    ? adherenceData.reduce((best, current) => current.adherence > best.adherence ? current : best).supplement
                    : 'No data'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-300">Total Supplements:</span>
                <span className="font-semibold dark:text-white">{userSupplements.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white text-black dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Cost Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="dark:text-gray-300">Monthly Total:</span>
                <span className="font-semibold dark:text-white">
                  ${costData.reduce((sum, item) => sum + (item.monthlyCost || 0), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-300">Yearly Projection:</span>
                <span className="font-semibold dark:text-white">
                  ${costData.reduce((sum, item) => sum + (item.yearlyCost || 0), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-300">Most Expensive:</span>
                <span className="font-semibold dark:text-white">
                  {costData.length > 0
                    ? costData.reduce((max, current) => current.monthlyCost > max.monthlyCost ? current : max).name
                    : 'No data'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>


      </div>
    );
  };
  const HistoryTab = () => {
    // Fix: Ensure takenAt is converted to Date object before calling toISOString
    const filteredHistory = intakeHistory
      .filter(intake => {
        // Ensure takenAt is properly handled
        const takenAtDate = typeof intake.takenAt === 'string'
          ? new Date(intake.takenAt)
          : intake.takenAt;

        if (!(takenAtDate instanceof Date) || isNaN(takenAtDate.getTime())) {
          return false;
        }

        const intakeDate = takenAtDate.toISOString().split('T')[0];
        return intakeDate >= dateRange.start && intakeDate <= dateRange.end;
      })
      .sort((a, b) => {
        const dateA = typeof a.takenAt === 'string' ? new Date(a.takenAt) : a.takenAt;
        const dateB = typeof b.takenAt === 'string' ? new Date(b.takenAt) : b.takenAt;
        return dateB - dateA;
      });

    // Helper function to get supplement name safely - use the processed data from backend
    const getSupplementName = (intake) => {
      // Use the supplement name that's already processed by backend
      if (intake.supplement && intake.supplement !== 'Unknown Supplement') {
        return intake.supplement;
      }

      // Fallback: try to find the user supplement
      const userSupp = userSupplements.find(supp =>
        supp._id?.toString() === intake.userSupplementId?.toString()
      );

      if (userSupp) {
        return userSupp.supplement?.name ||
          userSupp.customSupplement?.name ||
          'Unknown Supplement';
      }

      return 'Unknown Supplement';
    };

    // Helper function to get dosage info
    const getDosageInfo = (intake) => {
      if (intake.dosageTaken) {
        return `${intake.dosageTaken} ${intake.unit || 'units'}`;
      }

      // Fallback to user supplement data
      const userSupp = userSupplements.find(supp =>
        supp._id?.toString() === intake.userSupplementId?.toString()
      );

      if (userSupp) {
        const unit = userSupp.supplement?.dosageUnit ||
          userSupp.customSupplement?.dosageUnit ||
          'units';
        return `${userSupp.dosage || intake.dosageTaken || 0} ${unit}`;
      }

      return '0 units';
    };
    return (
      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="bg-white text-gray-600 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <h3 className="text-lg text-gray-600 font-semibold dark:text-white mr-6">Intake History</h3>
            <div className="flex gap-4 items-center">
              <div className=" text-grey-600 ">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2  text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2  text-black border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* History Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Intakes</p>
                <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-300">{filteredHistory.filter(h => h.wasTaken).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Missed Doses</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-300">{filteredHistory.filter(h => !h.wasTaken).length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Adherence Rate</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                  {filteredHistory.length > 0
                    ? Math.round((filteredHistory.filter(h => h.wasTaken).length / filteredHistory.length) * 100)
                    : 0
                  }%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="bg-white text-gray-600 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">Intake Timeline</h3>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No intake records found for the selected date range.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.slice(0, 50).map(intake => {
                // Fix: Convert takenAt to Date object for display
                const takenAtDate = typeof intake.takenAt === 'string'
                  ? new Date(intake.takenAt)
                  : intake.takenAt;

                return (
                  <div key={intake._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${intake.wasTaken ? 'bg-indigo-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium dark:text-white">{getSupplementName(intake)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {intake.dosageTaken} units
                          {intake.notes && ` • ${intake.notes}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium dark:text-gray-300">
                        {takenAtDate.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {takenAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredHistory.length > 50 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing latest 50 entries. {filteredHistory.length - 50} more entries available.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  const InteractionsTab = () => {
    return (
      <div className="space-y-6">
        {/* Interaction Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Severe', 'Moderate', 'Mild'].map(severity => {
            const count = interactions.filter(i => i.severity === severity).length;
            const colors = {
              Severe: 'red',
              Moderate: 'yellow',
              Mild: 'blue'
            };
            const color = colors[severity];

            return (
              <div key={severity} className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800 rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm text-${color}-600 dark:text-${color}-400 font-medium`}>{severity} Interactions</p>
                    <p className={`text-2xl font-bold text-${color}-800 dark:text-${color}-300`}>{count}</p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 text-${color}-600 dark:text-${color}-400`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Interactions */}
        <div className="bg-white text-gray-600 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">Current Interaction Warnings</h3>

          {interactions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-indigo-300 dark:text-indigo-600 mx-auto mb-4" />
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">No interactions detected</p>
              <p className="text-gray-500 dark:text-gray-400">Your current supplement regimen appears safe.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interactions.map(interaction => (
                <div key={interaction._id} className={`p-6 border-2 rounded-xl ${interaction.severity === 'Severe' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' :
                  interaction.severity === 'Moderate' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' :
                    'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-6 h-6 ${interaction.severity === 'Severe' ? 'text-red-600 dark:text-red-400' :
                        interaction.severity === 'Moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`} />
                      <div>
                        <h4 className="font-semibold dark:text-white">{interaction.severity} Interaction</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Between {interaction.supplementsInvolved.join(' and ')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${interaction.severity === 'Severe' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      interaction.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                      {interaction.severity}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-1 dark:text-gray-300">Description:</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-400">{interaction.description}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1 dark:text-gray-300">Recommendation:</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-400">{interaction.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                      Consult Healthcare Provider
                    </button>
                    {!interaction.acknowledged && (
                      <button
                        onClick={() => handleAcknowledgeInteraction(interaction._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm dark:bg-blue-700 dark:hover:bg-blue-800"
                      >
                        Acknowledge Warning
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Educational Section */}
        <div className="bg-white  text-gray-600 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Understanding Supplement Interactions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 dark:text-gray-300">Common Interaction Types</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Absorption:</strong> One supplement may interfere with the absorption of another</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Metabolism:</strong> Changes in how supplements are processed by the body</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Synergistic:</strong> Supplements that work better together</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 dark:text-gray-300">Safety Tips</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>Always consult healthcare providers before starting new supplements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>Space out supplements that may interact by 2+ hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>Keep detailed records of all supplements and medications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Loading Overlay */}
      <LoadingOverlay />

      {/* Alert */}
      <Alert />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supplement Manager</h1>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowIntakeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
              >
                <Plus className="w-4 h-4" />
                Quick Log
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>Welcome back!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'supplements', label: 'My Supplements', icon: Pill },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'history', label: 'History', icon: Calendar },
              { id: 'interactions', label: 'Interactions', icon: AlertTriangle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'supplements' && <SupplementsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'interactions' && <InteractionsTab />}
      </div>

      {/* Modals */}
      {showAddModal && <AddSupplementModal />}
      {showIntakeModal && <IntakeModal />}
      {showDetailModal && <SupplementDetailModal />}
    </div>
  );
};

// Wrap the app with ThemeProvider
const AppWithTheme = () => (
  <ThemeProvider>
    <SupplementManagementSystem />
  </ThemeProvider>
);

export default AppWithTheme;
 
 
 
 
 
 
