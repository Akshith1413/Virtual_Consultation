import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HealthProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [submitting, setSubmitting] = useState(false);

  // Form state with proper initialization
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    bloodGroup: '',
    conditions: [],
    dietPreference: '',
    healthGoal: '',
    dailyCalorieTarget: '',
    smokingHabit: '',
    alcoholConsumption: '',
    emergencyContact: { name: '', phone: '' },
    allergies: [],
    medications: [],
    activityLevel: '',
    sleepHours: ''
  });

  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });

  useEffect(() => {
    const fetchHealthProfile = async () => {
      try {
        const response = await axios.get('health-profile');
        setProfile(response.data);
        setFormData({
          age: response.data.age || '',
          gender: response.data.gender || '',
          height: response.data.height || '',
          weight: response.data.weight || '',
          targetWeight: response.data.targetWeight || '',
          bloodGroup: response.data.bloodGroup || '',
          conditions: response.data.conditions || [],
          dietPreference: response.data.dietPreference || '',
          healthGoal: response.data.healthGoal || '',
          dailyCalorieTarget: response.data.dailyCalorieTarget || '',
          smokingHabit: response.data.smokingHabit || '',
          alcoholConsumption: response.data.alcoholConsumption || '',
          emergencyContact: response.data.emergencyContact || { name: '', phone: '' },
          allergies: response.data.allergies || [],
          medications: response.data.medications || [],
          activityLevel: response.data.activityLevel || '',
          sleepHours: response.data.sleepHours || ''
        });
      } catch (err) {
        if (err.response?.status === 404) {
          // Profile doesn't exist yet, show form
          setEditing(true);
        } else {
          setError('Failed to fetch health profile');
          console.error('Fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHealthProfile();
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleEmergencyContactChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value
      }
    }));
  }, []);

  const addCondition = useCallback(() => {
    if (newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  }, [newCondition]);

  const removeCondition = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  }, []);

  const addAllergy = useCallback(() => {
    if (newAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  }, [newAllergy]);

  const removeAllergy = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  }, []);

  const addMedication = useCallback(() => {
    if (newMedication.name.trim()) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, { ...newMedication }]
      }));
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  }, [newMedication]);

  const removeMedication = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  }, []);

  // Fixed submit handler with proper validation and error handling
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.age || !formData.gender || !formData.height || !formData.weight) {
        setError('Please fill in all required fields (Age, Gender, Height, Weight)');
        setSubmitting(false);
        return;
      }

      // Prepare data for submission - ensure proper data types
      const submitData = {
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        height: parseFloat(formData.height) || 0,
        weight: parseFloat(formData.weight) || 0,
        targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined,
        bloodGroup: formData.bloodGroup || undefined,
        conditions: Array.isArray(formData.conditions) ? formData.conditions : [],
        dietPreference: formData.dietPreference || undefined,
        healthGoal: formData.healthGoal || undefined,
        dailyCalorieTarget: formData.dailyCalorieTarget ? parseInt(formData.dailyCalorieTarget) : undefined,
        smokingHabit: formData.smokingHabit || undefined,
        alcoholConsumption: formData.alcoholConsumption || undefined,
        emergencyContact: {
          name: formData.emergencyContact?.name || '',
          phone: formData.emergencyContact?.phone || ''
        },
        allergies: Array.isArray(formData.allergies) ? formData.allergies : [],
        medications: Array.isArray(formData.medications) ? formData.medications : [],
        activityLevel: formData.activityLevel || undefined,
        sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : undefined
      };

      // Remove undefined values to avoid validation issues
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined || submitData[key] === '') {
          delete submitData[key];
        }
      });

      console.log('Submitting data:', submitData); // Debug log

      const response = await axios.post('health-profile', submitData);

      setProfile(response.data.healthProfile);
      setEditing(false);
      setSuccess('Health profile saved successfully');
      setError('');

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit error:', err);

      if (err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = err.response.data.errors
          .map(error => error.msg || error.message)
          .join(', ');
        setError(`Validation errors: ${validationErrors}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save health profile. Please check your internet connection and try again.');
      }
      setSuccess('');
    } finally {
      setSubmitting(false);
    }
  }, [formData]);

  // Memoized CustomDropdown component
  const CustomDropdown = useCallback(({ name, value, options, onChange, placeholder, required = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleSelect = useCallback((optionValue) => {
      onChange({ target: { name, value: optionValue } });
      setIsOpen(false);
    }, [name, onChange]);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex justify-between items-center border rounded-md shadow-sm p-2 text-left transition-colors duration-200 ${required && !value
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600'
            } text-gray-900 dark:text-white`}
        >
          <span className={value ? '' : 'text-gray-500 dark:text-gray-400'}>
            {value || placeholder}
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 shadow-lg rounded-md border border-gray-200 dark:border-slate-600 max-h-60 overflow-auto"
            >
              <ul className="py-1">
                {options.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors duration-150 ${value === option.value ? 'bg-indigo-100 dark:bg-slate-600 text-indigo-700 dark:text-indigo-300' : ''
                      }`}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }, []);

  // Memoized FormSection component
  const FormSection = useCallback(({ title, children, className = '', id }) => (
    <div id={id} className={`bg-gray-50 dark:bg-slate-700/30 p-6 rounded-lg ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <span className="bg-indigo-100 dark:bg-indigo-900/30 w-6 h-6 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-sm mr-2">
          {title[0]}
        </span>
        {title}
      </h3>
      {children}
    </div>
  ), []);

  // Memoized SectionNav component
  const SectionNav = useMemo(() => (
    <div className="sticky top-6 z-10 mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
      <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Jump to Section:
      </h4>
      <div className="flex flex-wrap gap-4">
        {['Personal', 'Lifestyle', 'Health', 'Medications', 'Emergency'].map((section) => (
          <motion.button
            key={section}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById(section.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
              setActiveSection(section.toLowerCase());
            }}
            className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${activeSection === section.toLowerCase()
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
          >
            {section}
          </motion.button>
        ))}
      </div>
    </div>
  ), [activeSection]);

  // Memoized cancel handler
  const handleCancel = useCallback(() => {
    if (profile) {
      setEditing(false);
      setFormData({
        age: profile.age || '',
        gender: profile.gender || '',
        height: profile.height || '',
        weight: profile.weight || '',
        targetWeight: profile.targetWeight || '',
        bloodGroup: profile.bloodGroup || '',
        conditions: profile.conditions || [],
        dietPreference: profile.dietPreference || '',
        healthGoal: profile.healthGoal || '',
        dailyCalorieTarget: profile.dailyCalorieTarget || '',
        smokingHabit: profile.smokingHabit || '',
        alcoholConsumption: profile.alcoholConsumption || '',
        emergencyContact: profile.emergencyContact || { name: '', phone: '' },
        allergies: profile.allergies || [],
        medications: profile.medications || [],
        activityLevel: profile.activityLevel || '',
        sleepHours: profile.sleepHours || ''
      });
    } else {
      setFormData({
        age: '',
        gender: '',
        height: '',
        weight: '',
        targetWeight: '',
        bloodGroup: '',
        conditions: [],
        dietPreference: '',
        healthGoal: '',
        dailyCalorieTarget: '',
        smokingHabit: '',
        alcoholConsumption: '',
        emergencyContact: { name: '', phone: '' },
        allergies: [],
        medications: [],
        activityLevel: '',
        sleepHours: ''
      });
    }
    setError('');
    setSuccess('');
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-slate-900"
    >
      <Navbar />
      <main className={`mx-auto py-12 px-4 sm:px-6 lg:px-8 ${editing ? 'w-[90%] max-w-6xl' : 'w-[80%] max-w-5xl'}`}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 shadow-xl overflow-hidden sm:rounded-xl border border-gray-200 dark:border-slate-700"
        >
          <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800">
            <div>
              <h3 className="text-xl leading-6 font-semibold text-gray-900 dark:text-white">Health Profile</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                {editing ? 'Complete your health profile' : 'Your health information'}
              </p>
            </div>
            {!editing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </motion.button>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-start"
            >
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="m-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-300 flex items-start"
            >
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </motion.div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {SectionNav}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormSection title="Personal Information" id="personal">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${!formData.age ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-slate-600'
                          }`}
                        required
                        min="1"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <CustomDropdown
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        placeholder="Select Gender"
                        required={true}
                        options={[
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' },
                          { value: 'Other', label: 'Other' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Height (cm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${!formData.height ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-slate-600'
                          }`}
                        required
                        min="50"
                        max="250"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Weight (kg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${!formData.weight ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-slate-600'
                          }`}
                        required
                        min="2"
                        max="300"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Weight (kg)</label>
                      <input
                        type="number"
                        name="targetWeight"
                        value={formData.targetWeight}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        min="2"
                        max="300"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                      <CustomDropdown
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        placeholder="Select Blood Group"
                        options={[
                          { value: 'A+', label: 'A+' },
                          { value: 'A-', label: 'A-' },
                          { value: 'B+', label: 'B+' },
                          { value: 'B-', label: 'B-' },
                          { value: 'AB+', label: 'AB+' },
                          { value: 'AB-', label: 'AB-' },
                          { value: 'O+', label: 'O+' },
                          { value: 'O-', label: 'O-' }
                        ]}
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Lifestyle & Goals" id="lifestyle">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diet Preference</label>
                      <CustomDropdown
                        name="dietPreference"
                        value={formData.dietPreference}
                        onChange={handleInputChange}
                        placeholder="Select Diet Preference"
                        options={[
                          { value: 'Vegetarian', label: 'Vegetarian' },
                          { value: 'Vegan', label: 'Vegan' },
                          { value: 'Non-vegetarian', label: 'Non-vegetarian' },
                          { value: 'Pescatarian', label: 'Pescatarian' },
                          { value: 'Keto', label: 'Keto' },
                          { value: 'Paleo', label: 'Paleo' },
                          { value: 'Other', label: 'Other' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Health Goal</label>
                      <CustomDropdown
                        name="healthGoal"
                        value={formData.healthGoal}
                        onChange={handleInputChange}
                        placeholder="Select Health Goal"
                        options={[
                          { value: 'Weight Loss', label: 'Weight Loss' },
                          { value: 'Weight Gain', label: 'Weight Gain' },
                          { value: 'Maintain Weight', label: 'Maintain Weight' },
                          { value: 'Muscle Building', label: 'Muscle Building' },
                          { value: 'Improve Fitness', label: 'Improve Fitness' },
                          { value: 'Manage Condition', label: 'Manage Condition' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Calorie Target</label>
                      <input
                        type="number"
                        name="dailyCalorieTarget"
                        value={formData.dailyCalorieTarget}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        min="500"
                        max="10000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Smoking Habit</label>
                      <CustomDropdown
                        name="smokingHabit"
                        value={formData.smokingHabit}
                        onChange={handleInputChange}
                        placeholder="Select Smoking Habit"
                        options={[
                          { value: 'Non-smoker', label: 'Non-smoker' },
                          { value: 'Occasional', label: 'Occasional' },
                          { value: 'Regular', label: 'Regular' },
                          { value: 'Former smoker', label: 'Former smoker' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alcohol Consumption</label>
                      <CustomDropdown
                        name="alcoholConsumption"
                        value={formData.alcoholConsumption}
                        onChange={handleInputChange}
                        placeholder="Select Alcohol Consumption"
                        options={[
                          { value: 'Non-drinker', label: 'Non-drinker' },
                          { value: 'Occasional', label: 'Occasional' },
                          { value: 'Regular', label: 'Regular' },
                          { value: 'Former drinker', label: 'Former drinker' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity Level</label>
                      <CustomDropdown
                        name="activityLevel"
                        value={formData.activityLevel}
                        onChange={handleInputChange}
                        placeholder="Select Activity Level"
                        options={[
                          { value: 'Sedentary', label: 'Sedentary' },
                          { value: 'Lightly Active', label: 'Lightly Active' },
                          { value: 'Moderately Active', label: 'Moderately Active' },
                          { value: 'Very Active', label: 'Very Active' },
                          { value: 'Extremely Active', label: 'Extremely Active' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sleep Hours (per night)</label>
                      <input
                        type="number"
                        name="sleepHours"
                        value={formData.sleepHours}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        min="0"
                        max="24"
                        step="0.5"
                      />
                    </div>
                  </div>
                </FormSection>
              </div>

              <FormSection title="Health Conditions" id="health">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Conditions</label>
                    <div className="flex mt-1">
                      <input
                        type="text"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                        className="flex-1 border border-gray-300 dark:border-slate-600 rounded-l-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="Add a condition"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={addCondition}
                        className="px-4 py-3 border border-transparent text-sm font-medium rounded-r-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        Add
                      </motion.button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.conditions.map((condition, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="inline-flex items-center pl-3 pr-2 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
                        >
                          {condition}
                          <button
                            type="button"
                            onClick={() => removeCondition(index)}
                            className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 dark:hover:bg-indigo-800 dark:hover:text-indigo-300 transition-colors duration-150"
                          >
                            Ã—
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergies</label>
                    <div className="flex mt-1">
                      <input
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                        className="flex-1 border border-gray-300 dark:border-slate-600 rounded-l-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="Add an allergy"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={addAllergy}
                        className="px-4 py-3 border border-transparent text-sm font-medium rounded-r-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        Add
                      </motion.button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.allergies.map((allergy, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="inline-flex items-center pl-3 pr-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                        >
                          {allergy}
                          <button
                            type="button"
                            onClick={() => removeAllergy(index)}
                            className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-red-400 hover:bg-red-200 hover:text-red-500 dark:hover:bg-red-800 dark:hover:text-red-300 transition-colors duration-150"
                          >
                            Ã—
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Medications" id="medications">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medication Name</label>
                      <input
                        type="text"
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="Medication Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="Dosage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="Frequency"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={addMedication}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Medication
                  </motion.button>

                  <div className="mt-4 space-y-3">
                    {formData.medications.map((med, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
                      >
                        <div className="text-gray-900 dark:text-white">
                          <span className="font-medium">{med.name}</span> - {med.dosage} ({med.frequency})
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </FormSection>

              <FormSection title="Emergency Contact" id="emergency">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.emergencyContact.name}
                      onChange={handleEmergencyContactChange}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Contact Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleEmergencyContactChange}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm p-3 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>
              </FormSection>

              <div className="flex justify-end space-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: submitting ? 1 : 1.05 }}
                  whileTap={{ scale: submitting ? 1 : 0.95 }}
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {submitting ? 'Saving...' : 'Save Profile'}
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              {profile ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormSection title="Personal Information">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.age}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.gender}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Height</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.height} cm</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.weight} kg</dd>
                      </div>
                      {profile.targetWeight && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Weight</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.targetWeight} kg</dd>
                        </div>
                      )}
                      {profile.bmi && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">BMI</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.bmi}</dd>
                        </div>
                      )}
                      {profile.bloodGroup && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Blood Group</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.bloodGroup}</dd>
                        </div>
                      )}
                    </dl>
                  </FormSection>

                  <FormSection title="Lifestyle & Goals">
                    <dl className="space-y-4">
                      {profile.dietPreference && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Diet Preference</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.dietPreference}</dd>
                        </div>
                      )}
                      {profile.healthGoal && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Health Goal</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.healthGoal}</dd>
                        </div>
                      )}
                      {profile.dailyCalorieTarget && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Calorie Target</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.dailyCalorieTarget} calories</dd>
                        </div>
                      )}
                      {profile.smokingHabit && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Smoking Habit</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.smokingHabit}</dd>
                        </div>
                      )}
                      {profile.alcoholConsumption && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Alcohol Consumption</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.alcoholConsumption}</dd>
                        </div>
                      )}
                      {profile.activityLevel && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Activity Level</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.activityLevel}</dd>
                        </div>
                      )}
                      {profile.sleepHours && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sleep Hours (per night)</dt>
                          <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.sleepHours} hours</dd>
                        </div>
                      )}
                    </dl>
                  </FormSection>

                  {profile.conditions && profile.conditions.length > 0 && (
                    <FormSection title="Health Conditions">
                      <div className="flex flex-wrap gap-2">
                        {profile.conditions.map((condition, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </FormSection>
                  )}

                  {profile.allergies && profile.allergies.length > 0 && (
                    <FormSection title="Allergies">
                      <div className="flex flex-wrap gap-2">
                        {profile.allergies.map((allergy, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </FormSection>
                  )}

                  {profile.medications && profile.medications.length > 0 && (
                    <FormSection title="Medications" className="md:col-span-2">
                      <ul className="space-y-3">
                        {profile.medications.map((med, index) => (
                          <li key={index} className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                            <span className="font-medium text-gray-900 dark:text-white">{med.name}</span> - {med.dosage} ({med.frequency})
                          </li>
                        ))}
                      </ul>
                    </FormSection>
                  )}

                  {profile.emergencyContact && (profile.emergencyContact.name || profile.emergencyContact.phone) && (
                    <FormSection title="Emergency Contact" className="md:col-span-2">
                      <div className="space-y-2">
                        {profile.emergencyContact.name && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.emergencyContact.name}</dd>
                          </div>
                        )}
                        {profile.emergencyContact.phone && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                            <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{profile.emergencyContact.phone}</dd>
                          </div>
                        )}
                      </div>
                    </FormSection>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No health profile found. Please create one.</p>
              )}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default HealthProfile;
