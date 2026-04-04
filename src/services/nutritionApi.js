import axios from 'axios';

// API Configuration from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/';
const USDA_API_BASE_URL = import.meta.env.VITE_USDA_API_BASE_URL || 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;

// Debug configuration
const DEBUG_MODE = process.env.NODE_ENV === 'development';
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};
const CURRENT_LOG_LEVEL = DEBUG_MODE ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

// Validate required environment variables
if (!USDA_API_KEY) {
  console.error('❌ USDA_API_KEY is required. Please check your environment variables.');
  if (DEBUG_MODE) {
    console.warn('Running without USDA API key - food search will not work');
  }
}

if (!API_BASE_URL) {
  console.error('❌ API_BASE_URL is required. Please check your environment variables.');
}

// Logger utility
class ApiLogger {
  static log(level, message, data = null) {
    if (level <= CURRENT_LOG_LEVEL) {
      const timestamp = new Date().toISOString();
      const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
      const prefix = `[API:${levelNames[level]}] ${timestamp}`;

      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }

  static error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  static warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  static info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  static debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }
}

// Rest of your existing code remains the same...
// [Keep all the existing cache, axios instances, API functions, etc.]
// The only changes are at the top where we get values from process.env

// Cache configuration
const cacheConfig = {
  maxAge: 30 * 1000, // 30 seconds for better real-time consistency
  maxSize: 100
};

class ApiCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, data) {
    if (this.cache.size >= cacheConfig.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Auto-cleanup timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, cacheConfig.maxAge);

    this.timers.set(key, timer);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > cacheConfig.maxAge) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key) {
    this.cache.delete(key);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  clear() {
    this.cache.clear();
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

// Create cache instances
const apiCache = new ApiCache();

// Enhanced axios instances with better retry logic
const createAxiosInstance = (baseURL, timeout = 10000) => {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Add retry interceptor
  instance.interceptors.request.use((config) => {
    config.metadata = {
      startTime: Date.now(),
      retryCount: 0,
      maxRetries: config.maxRetries !== undefined ? config.maxRetries : 2
    };
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const duration = Date.now() - response.config.metadata.startTime;
      ApiLogger.debug(`Request completed in ${duration}ms`, {
        url: response.config.url,
        method: response.config.method,
        status: response.status
      });
      return response;
    },
    async (error) => {
      const config = error.config;

      // Fix: Don't retry cached responses or requests without config
      if (!config || error.cached) {
        return Promise.reject(error);
      }

      // Fix: Safe access to metadata
      const metadata = config.metadata || { retryCount: 0, maxRetries: 2 };
      metadata.retryCount = metadata.retryCount || 0;

      // Don't retry for 500 errors on nutritional-goals endpoint
      const isNutritionalGoals = config.url?.includes('/nutritional-goals');
      const isServerError = error.response?.status >= 500;

      if (isNutritionalGoals && isServerError) {
        ApiLogger.warn('Skipping retry for nutritional goals 500 error');
        return Promise.reject(error);
      }

      // Retry logic for network errors or transient errors
      if (shouldRetry(error) && metadata.retryCount < metadata.maxRetries) {
        metadata.retryCount++;
        const delay = Math.pow(2, metadata.retryCount) * 1000; // Exponential backoff

        ApiLogger.warn(`Retrying request (attempt ${metadata.retryCount})`, {
          url: config.url,
          error: error.message,
          delay
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return instance(config);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const shouldRetry = (error) => {
  if (!error.response) {
    // Network error - retry
    return true;
  }

  const status = error.response.status;
  // Retry on rate limits and gateway errors, but not on persistent server errors
  return status === 429 || status === 502 || status === 503;
};

// Create axios instances with shorter timeouts for better UX
const api = createAxiosInstance(API_BASE_URL, 8000); // 8 second timeout
const usdaApi = createAxiosInstance(USDA_API_BASE_URL, 5000); // 5 second timeout

// Add USDA API key to all requests
usdaApi.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    api_key: USDA_API_KEY
  };
  return config;
});

// Token management with enhanced security
class TokenManager {
  static getToken() {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      ApiLogger.error('Error accessing localStorage', error);
      return null;
    }
  }

  static setToken(token) {
    try {
      localStorage.setItem('token', token);
      return true;
    } catch (error) {
      ApiLogger.error('Error setting token in localStorage', error);
      return false;
    }
  }

  static removeToken() {
    try {
      localStorage.removeItem('token');
      apiCache.clear(); // Clear cache on logout
      return true;
    } catch (error) {
      ApiLogger.error('Error removing token from localStorage', error);
      return false;
    }
  }

  static validateToken() {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      // Basic JWT format validation
      if (token.split('.').length !== 3) {
        this.removeToken();
        return false;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        this.removeToken();
        return false;
      }

      return true;
    } catch (error) {
      this.removeToken();
      return false;
    }
  }

  static getTokenPayload() {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }
}

// Enhanced request interceptor
api.interceptors.request.use((config) => {
  const token = TokenManager.getToken();
  const isTokenValid = TokenManager.validateToken();

  ApiLogger.debug('Request interceptor', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenValid: isTokenValid
  });

  // Add authentication header if token is valid
  if (token && isTokenValid) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && !isTokenValid) {
    // Token exists but invalid - remove it
    TokenManager.removeToken();
  }

  // Add cache key for GET requests
  if (config.method === 'get') {
    const cacheKey = `${config.url}?${new URLSearchParams(config.params).toString()}`;
    config.cacheKey = cacheKey;

    // Check cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      ApiLogger.debug('Serving from cache', { cacheKey });
      return Promise.reject({
        cached: true,
        data: cachedData,
        config
      });
    }
  }

  return config;
}, (error) => {
  ApiLogger.error('Request interceptor error', error);
  return Promise.reject(error);
});

// Enhanced response interceptor with caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.config.cacheKey) {
      apiCache.set(response.config.cacheKey, response.data);
      ApiLogger.debug('Response cached', {
        cacheKey: response.config.cacheKey
      });
    }

    ApiLogger.info('API Response success', {
      url: response.config.url,
      status: response.status
    });

    return response;
  },
  (error) => {
    // Handle cache hits (simulated errors from request interceptor)
    if (error.cached) {
      ApiLogger.debug('Cache hit', { url: error.config?.url });
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK (Cached)',
        headers: {},
        config: error.config,
        cached: true
      });
    }

    // Fix: Check if error.config exists before accessing its properties
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message
    };

    ApiLogger.error('API Response error', errorDetails);

    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      ApiLogger.warn('Authentication error detected');
      setTimeout(() => {
        TokenManager.removeToken();
        if (!window.location.hash.includes('/signin')) {
          window.location.hash = '#/signin';
        }
      }, 1000);
    }

    // Enhanced error object with safe property access
    const enhancedError = {
      message: getErrorMessage(error),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      code: error.code,
      config: error.config,
      isNetworkError: !error.response,
      isTimeout: error.code === 'ECONNABORTED',
      originalError: error
    };

    return Promise.reject(enhancedError);
  }
);

// Error message utility
const getErrorMessage = (error) => {
  if (error.isNetworkError) {
    return 'Network error: Please check your internet connection';
  }

  if (error.isTimeout) {
    return 'Request timeout: Server is taking too long to respond';
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  switch (error.response?.status) {
    case 400: return 'Bad request: Please check your input data';
    case 401: return 'Authentication required: Please sign in again';
    case 403: return 'Access denied: You do not have permission';
    case 404: return 'Resource not found';
    case 429: return 'Too many requests: Please try again later';
    case 500: return 'Server error: Please try again later';
    case 502: return 'Bad gateway: Service temporarily unavailable';
    case 503: return 'Service unavailable: Please try again later';
    default: return error.message || 'An unexpected error occurred';
  }
};

// USDA API helper functions
const getCaloriesFromNutrients = (nutrients) => {
  if (!nutrients || !Array.isArray(nutrients)) return 0;

  const energyNutrient = nutrients.find(n =>
    n.nutrient?.name === 'Energy' ||
    n.nutrientName === 'Energy' ||
    n.nutrient?.number === 208
  );
  return energyNutrient ? Math.round(energyNutrient.amount || energyNutrient.value || 0) : 0;
};

const getNutrientValue = (nutrients, nutrientName) => {
  if (!nutrients || !Array.isArray(nutrients)) return 0;

  const nutrient = nutrients.find(n =>
    n.nutrient?.name === nutrientName ||
    n.nutrientName === nutrientName
  );
  return nutrient ? Math.round((nutrient.amount || nutrient.value || 0) * 100) / 100 : 0;
};

// USDA Food Search API with enhanced error handling
export const usdaFoodApi = {
  searchFoods: async (query, pageSize = 25, pageNumber = 1) => {
    try {
      ApiLogger.debug('Searching USDA foods', { query, pageSize, pageNumber });

      if (!query || query.trim().length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      const response = await usdaApi.post('/foods/search', {
        query: query.trim(),
        dataType: ["Foundation", "SR Legacy", "Branded"],
        pageSize: Math.min(pageSize, 200),
        pageNumber: pageNumber,
        sortBy: "dataType.keyword",
        sortOrder: "asc"
      });

      const transformedFoods = response.data.foods?.map(food => ({
        fdcId: food.fdcId,
        name: food.description,
        brandOwner: food.brandOwner || '',
        dataType: food.dataType,
        calories: getCaloriesFromNutrients(food.foodNutrients),
        protein: getNutrientValue(food.foodNutrients, 'Protein'),
        carbs: getNutrientValue(food.foodNutrients, 'Carbohydrate, by difference'),
        fat: getNutrientValue(food.foodNutrients, 'Total lipid (fat)'),
        fiber: getNutrientValue(food.foodNutrients, 'Fiber, total dietary'),
        servingSize: food.servingSize || 100,
        servingSizeUnit: food.servingSizeUnit || 'g',
        ingredients: food.ingredients || '',
        publishedDate: food.publishedDate
      })) || [];

      ApiLogger.info('USDA search successful', {
        query,
        results: transformedFoods.length,
        totalHits: response.data.totalHits
      });

      return {
        ...response,
        data: {
          foods: transformedFoods,
          totalHits: response.data.totalHits,
          totalPages: response.data.totalPages,
          currentPage: pageNumber
        }
      };
    } catch (error) {
      ApiLogger.error('USDA search failed', error);
      throw new Error(`Food search failed: ${error.message}`);
    }
  },

  getFoodDetails: async (fdcId) => {
    try {
      ApiLogger.debug('Fetching USDA food details', { fdcId });

      const response = await usdaApi.get(`/food/${fdcId}`);
      const food = response.data;

      const transformedFood = {
        fdcId: food.fdcId,
        name: food.description,
        brandOwner: food.brandOwner || '',
        dataType: food.dataType,
        calories: getCaloriesFromNutrients(food.foodNutrients),
        protein: getNutrientValue(food.foodNutrients, 'Protein'),
        carbs: getNutrientValue(food.foodNutrients, 'Carbohydrate, by difference'),
        fat: getNutrientValue(food.foodNutrients, 'Total lipid (fat)'),
        fiber: getNutrientValue(food.foodNutrients, 'Fiber, total dietary'),
        servingSize: food.servingSize || 100,
        servingSizeUnit: food.servingSizeUnit || 'g',
        ingredients: food.ingredients || '',
        nutrients: food.foodNutrients || []
      };

      ApiLogger.debug('USDA food details fetched', { fdcId, name: transformedFood.name });

      return {
        ...response,
        data: transformedFood
      };
    } catch (error) {
      ApiLogger.error('Failed to fetch USDA food details', error);
      throw new Error(`Failed to fetch food details: ${error.message}`);
    }
  }
};

// Default nutritional goals fallback
const DEFAULT_NUTRITIONAL_GOALS = {
  dailyCalories: 2000,
  protein: 150,
  carbs: 250,
  fat: 67,
  fiber: 25,
  water: 2000
};

// FIXED: Enhanced Nutritional Goals API with proper error handling
export const nutritionalGoalsApi = {
  get: async () => {
    try {
      ApiLogger.debug('Fetching nutritional goals');

      if (!TokenManager.validateToken()) {
        ApiLogger.warn('No valid token, returning default goals');
        return {
          data: {
            success: true,
            ...DEFAULT_NUTRITIONAL_GOALS,
            fromCache: false,
            fromDefaults: true
          }
        };
      }

      // Use a shorter timeout and disable retries for nutritional goals
      const response = await api.get('nutritional-goals', {
        timeout: 5000,
        maxRetries: 0 // Disable retries for this endpoint
      });

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response structure from server');
      }

      ApiLogger.info('Nutritional goals fetched successfully');
      return response;
    } catch (error) {
      ApiLogger.error('Failed to fetch nutritional goals', error);

      // For server errors, return defaults immediately without retries
      if (error.status === 500 || error.status === 404 || error.isNetworkError || error.isTimeout) {
        ApiLogger.warn('Using default nutritional goals due to server error');
        return {
          data: {
            success: false,
            message: 'Using default goals due to server unavailability',
            ...DEFAULT_NUTRITIONAL_GOALS,
            fromCache: false,
            fromDefaults: true,
            originalError: error.message
          }
        };
      }

      // Re-throw auth errors to trigger redirect
      if (error.status === 401 || error.status === 403) {
        throw error;
      }

      // For other errors, return defaults but log the error
      return {
        data: {
          success: false,
          message: 'Using default goals due to unexpected error',
          ...DEFAULT_NUTRITIONAL_GOALS,
          fromCache: false,
          fromDefaults: true,
          originalError: error.message
        }
      };
    }
  },

  update: async (goals) => {
    try {
      ApiLogger.debug('Updating nutritional goals', goals);

      const response = await api.put('nutritional-goals', goals);

      // Clear cache to ensure fresh data on next fetch
      apiCache.clear();

      ApiLogger.info('Nutritional goals updated successfully');
      return response;
    } catch (error) {
      ApiLogger.error('Failed to update nutritional goals', error);
      throw error;
    }
  },

  create: async (goals) => {
    try {
      ApiLogger.debug('Creating nutritional goals', goals);

      const response = await api.post('nutritional-goals', goals);

      // Clear cache to ensure fresh data on next fetch
      apiCache.clear();

      ApiLogger.info('Nutritional goals created successfully');
      return response;
    } catch (error) {
      ApiLogger.error('Failed to create nutritional goals', error);
      throw error;
    }
  }
};

// Food Items API
export const foodItemsApi = {
  getAll: (search, page = 1, limit = 20) => {
    const params = { page, limit };
    if (search) params.search = search;
    return api.get('food-items', { params });
  },

  getById: (id) => api.get(`food-items/${id}`),

  create: (foodItem) => {
    ApiLogger.debug('Creating food item', foodItem);
    return api.post('food-items', foodItem);
  },

  update: (id, foodItem) => {
    ApiLogger.debug('Updating food item', { id, foodItem });
    return api.put(`food-items/${id}`, foodItem);
  },

  delete: (id) => {
    ApiLogger.debug('Deleting food item', { id });
    return api.delete(`food-items/${id}`);
  }
};

// Enhanced Recipes API
export const recipesApi = {
  getAll: () => api.get('recipes'),

  getById: (id) => api.get(`recipes/${id}`),

  create: (recipe) => {
    ApiLogger.debug('Creating recipe', recipe);
    return api.post('recipes', recipe);
  },

  update: (id, recipe) => {
    ApiLogger.debug('Updating recipe', { id, recipe });
    return api.put(`recipes/${id}`, recipe);
  },

  delete: (id) => {
    ApiLogger.debug('Deleting recipe', { id });
    return api.delete(`recipes/${id}`);
  }
};

// Ingredients Search API
export const ingredientsApi = {
  search: (query, pageSize = 10, pageNumber = 1) => {
    const params = { query, pageSize, pageNumber };
    return api.get('ingredients/search', { params });
  }
};

// Meals API with enhanced logging
export const mealsApi = {
  getAll: (date) => {
    const params = {};
    if (date) params.date = date;
    ApiLogger.debug('Fetching meals', { date });
    return api.get('meals', { params });
  },

  getById: (id) => api.get(`meals/${id}`),

  create: (meal) => {
    ApiLogger.debug('Creating meal', meal);
    return api.post('meals', meal);
  },

  update: (id, meal) => {
    ApiLogger.debug('Updating meal', { id, meal });
    return api.put(`meals/${id}`, meal);
  },

  delete: (id) => {
    ApiLogger.debug('Deleting meal', { id });
    return api.delete(`meals/${id}`);
  }
};

// Water Intake API
export const waterIntakeApi = {
  getAll: (date) => {
    const params = {};
    if (date) params.date = date;
    return api.get('water-intake', { params });
  },

  create: (intake) => {
    ApiLogger.debug('Creating water intake', intake);
    return api.post('water-intake', intake);
  },

  delete: (id) => {
    ApiLogger.debug('Deleting water intake', { id });
    return api.delete(`water-intake/${id}`);
  }
};

// Reports API
export const reportsApi = {
  // Existing functions...
  getDaily: (date) => {
    const params = {};
    if (date) params.date = date;
    return api.get('reports/daily', { params });
  },

  getWeekly: (startDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    return api.get('reports/weekly', { params });
  },

  // NEW: Comprehensive reports
  getComprehensive: (period = '7') => {
    return api.get('reports/comprehensive', { params: { period } });
  },

  // NEW: Export reports
  exportReport: (type, format = 'json', period = '7') => {
    return api.get('reports/export', {
      params: { type, format, period },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
  }
};

// Health Profile API
export const healthProfileApi = {
  get: () => api.get('health-profilefornutrition'),

  update: (profile) => {
    ApiLogger.debug('Updating health profile', profile);
    return api.put('health-profilefornutrition', profile);
  }
};

// Meal Planning API
export const mealPlansApi = {
  getAll: (active = false) => {
    const params = active ? { active: 'true' } : {};
    return api.get('meal-plans', { params });
  },

  getById: (id) => api.get(`/meal-plans/${id}`),

  create: (mealPlan) => {
    ApiLogger.debug('Creating meal plan', mealPlan);
    return api.post('meal-plans', mealPlan);
  },

  update: (id, mealPlan) => {
    ApiLogger.debug('Updating meal plan', { id, mealPlan });
    return api.put(`/meal-plans/${id}`, mealPlan);
  },

  delete: (id) => {
    ApiLogger.debug('Deleting meal plan', { id });
    return api.delete(`/meal-plans/${id}`);
  },

  generateFromTemplate: (templateId, startDate, name) => {
    return api.post('meal-plans/generate-from-template', {
      templateId,
      startDate,
      name
    });
  }
};

// Shopping List API
export const shoppingListsApi = {
  getAll: () => api.get('shopping-lists'),

  generateFromMealPlan: (mealPlanId, name) => {
    return api.post('shopping-lists/generate-from-meal-plan', {
      mealPlanId,
      name
    });
  },

  update: (id, shoppingList) => {
    return api.put(`/shopping-lists/${id}`, shoppingList);
  },

  delete: (id) => {
    return api.delete(`/shopping-lists/${id}`);
  }
};

// Weight Tracking API
export const weightTrackingApi = {
  getAll: (startDate, endDate, limit = 30) => {
    const params = { limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('weight-tracking', { params });
  },

  create: (weight) => {
    ApiLogger.debug('Creating weight entry', weight);
    return api.post('weight-tracking', weight);
  },

  delete: (id) => {
    ApiLogger.debug('Deleting weight entry', { id });
    return api.delete(`/weight-tracking/${id}`);
  }
};

// Meal Planning APIs
export const mealPlanTemplatesApi = {
  getAll: () => api.get('meal-plan-templates'),

  seed: () => api.post('meal-plan-templates/seed')
};

export const weeklyMealPlansApi = {
  get: (weekStartDate) => {
    const params = weekStartDate ? { weekStartDate } : {};
    return api.get('weekly-meal-plans', { params });
  },

  updateMeal: (day, mealType, mealData) => {
    return api.put(`/weekly-meal-plans/${day}/${mealType}`, mealData);
  },

  generateFromTemplate: (templateId) => {
    return api.post('weekly-meal-plans/generate-from-template', { templateId });
  }
};

// API Health Monitoring
export const apiHealthMonitor = {
  checkBackendHealth: async () => {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        data: response.data
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      };
    }
  },

  checkUSDAApiHealth: async () => {
    try {
      const startTime = Date.now();
      const response = await usdaApi.get('/foods/search', {
        params: { query: 'test', pageSize: 1 },
        timeout: 5000
      });
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      };
    }
  }
};

// Debugging utilities for browser console
export const apiDebug = {
  // Test nutritional goals endpoint
  testNutritionalGoals: async () => {
    console.group('🔧 Nutritional Goals API Test');
    try {
      const token = TokenManager.getToken();
      console.log('Token available:', !!token);
      console.log('Token valid:', TokenManager.validateToken());

      const response = await nutritionalGoalsApi.get();
      console.log('API Response:', response.data);
      console.log('Success:', response.data.success);
    } catch (error) {
      console.error('Test failed:', error);
    }
    console.groupEnd();
  },

  // Clear all caches
  clearCache: () => {
    apiCache.clear();
    console.log('🗑️ API cache cleared');
  },

  // Check token status
  checkToken: () => {
    const payload = TokenManager.getTokenPayload();
    console.log('🔐 Token Status:', {
      exists: !!TokenManager.getToken(),
      valid: TokenManager.validateToken(),
      payload: payload,
      expired: payload ? payload.exp * 1000 < Date.now() : null
    });
  }
};

// Make debug utilities available globally in development
if (DEBUG_MODE && typeof window !== 'undefined') {
  window.apiDebug = apiDebug;
  window.apiHealthMonitor = apiHealthMonitor;
  window.TokenManager = TokenManager;
}

const apiClient = api;

// Add this to your nutritionApi.js
export const dailyTotalsApi = {
  get: (date) => {
    const params = date ? { date } : {};
    return apiClient.get('/daily-totals', { params });
  }
};

// Add to your existing API exports
export const weeklyCaloriesApi = {
  get: (startDate) => {
    const params = startDate ? { startDate } : {};
    return api.get('reports/weekly-calories', { params }); // Remove /api prefix
  }
};

export const getAuthToken = () => TokenManager.getToken();
export const validateToken = () => TokenManager.validateToken();
export const handleAuthError = () => {
  TokenManager.removeToken();
  window.location.hash = '#/signin';
};

export default api; 
 
 
 

// minor tweak for clarity

// minor tweak for clarity
