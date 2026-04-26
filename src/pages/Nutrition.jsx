import React, { useState, useEffect, useRef } from 'react'; // Add useRef here
import {
  Calendar,
  Plus,
  Search,
  Target,
  TrendingUp,
  Droplets,
  Utensils,
  PieChart as PieChartIcon,
  BarChart3 as BarChartIcon,
  Clock,
  User,
  BookOpen,
  Settings,
  RefreshCw, // Add this import
  Loader2, Edit,
  Trash2,
  X,
  Users
} from 'lucide-react';

// Recharts (keep chart components clean)
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Navbar from '../components/Navbar';
import {
  foodItemsApi, recipesApi, mealsApi, waterIntakeApi,
  nutritionalGoalsApi, reportsApi, usdaFoodApi, dailyTotalsApi,
  weeklyCaloriesApi, ingredientsApi,
  getAuthToken, validateToken, handleAuthError
} from '../services/nutritionApi';
import MealPlanningTab from './MealPlanningTab';
// Add these missing API imports
const mealPlansApi = {
  getAll: () => Promise.resolve({ data: { data: [] } }),
  generateFromTemplate: () => Promise.resolve({ data: { data: {} } })
};

const shoppingListsApi = {
  getAll: () => Promise.resolve({ data: { data: [] } }),
  generateFromMealPlan: () => Promise.resolve({ data: { data: {} } })
};

const mealPlanTemplateApi = {
  getAll: () => Promise.resolve({ data: { data: [] } })
};
// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const RecipeForm = ({ onAdd, onClose, editingRecipe = null }) => {
  const [formData, setFormData] = useState({
    name: editingRecipe?.name || '',
    description: editingRecipe?.description || '',
    servings: editingRecipe?.servings || 1,
    prepTime: editingRecipe?.prepTime || 0,
    cookTime: editingRecipe?.cookTime || 0,
    category: editingRecipe?.category || 'other',
    difficulty: editingRecipe?.difficulty || 'easy',
    instructions: editingRecipe?.instructions || [''],
    tags: editingRecipe?.tags || [],
    ingredients: editingRecipe?.ingredients || []
  });

  const [ingredientSearch, setIngredientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced ingredient search
  useEffect(() => {
    const searchIngredients = async () => {
      if (ingredientSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await ingredientsApi.search(ingredientSearch, 10, 1);
        if (response.data.success) {
          setSearchResults(response.data.data.ingredients);
        }
      } catch (error) {
        console.error('Ingredient search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchIngredients, 500);
    return () => clearTimeout(timeoutId);
  }, [ingredientSearch]);

  const addIngredient = (ingredient) => {
    const newIngredient = {
      name: ingredient.name,
      quantity: 1,
      unit: 'g',
      nutrition: ingredient.nutrition,
      externalId: ingredient.id
    };

    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));

    setIngredientSearch('');
    setSearchResults([]);
  };

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst
      )
    }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const calculateNutrition = () => {
    const total = formData.ingredients.reduce((acc, ing) => ({
      calories: acc.calories + (ing.nutrition?.calories || 0) * ing.quantity,
      protein: acc.protein + (ing.nutrition?.protein || 0) * ing.quantity,
      carbs: acc.carbs + (ing.nutrition?.carbs || 0) * ing.quantity,
      fat: acc.fat + (ing.nutrition?.fat || 0) * ing.quantity,
      fiber: acc.fiber + (ing.nutrition?.fiber || 0) * ing.quantity
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    return {
      calories: Math.round(total.calories / formData.servings),
      protein: Math.round(total.protein / formData.servings),
      carbs: Math.round(total.carbs / formData.servings),
      fat: Math.round(total.fat / formData.servings),
      fiber: Math.round(total.fiber / formData.servings)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recipeData = {
        ...formData,
        nutrition: calculateNutrition(),
        instructions: formData.instructions.filter(inst => inst.trim())
      };

      let response;
      if (editingRecipe) {
        response = await recipesApi.update(editingRecipe._id, recipeData);
      } else {
        response = await recipesApi.create(recipeData);
      }

      if (response.data.success) {
        await onAdd(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nutrition = calculateNutrition();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 dark:text-white">
          {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Recipe Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              rows="2"
              maxLength={500}
              placeholder="Describe your recipe..."
            />
          </div>

          {/* Recipe Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Servings *
              </label>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="1"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Prep Time (min)
              </label>
              <input
                type="number"
                value={formData.prepTime}
                onChange={(e) => setFormData(prev => ({ ...prev, prepTime: Math.max(0, parseInt(e.target.value) || 0) }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Cook Time (min)
              </label>
              <input
                type="number"
                value={formData.cookTime}
                onChange={(e) => setFormData(prev => ({ ...prev, cookTime: Math.max(0, parseInt(e.target.value) || 0) }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Ingredients Section */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Ingredients *
            </label>

            {/* Ingredient Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Search for ingredients (e.g., chicken, rice, tomato)..."
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 text-blue-500 animate-spin" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700">
                  {searchResults.map((ingredient, index) => (
                    <div
                      key={`${ingredient.id}-${index}`}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b dark:border-gray-600 last:border-b-0"
                      onClick={() => addIngredient(ingredient)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium dark:text-white">
                            {ingredient.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {ingredient.brand} • {ingredient.category}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {ingredient.nutrition.calories} cal per {ingredient.servingSize}{ingredient.servingUnit}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-blue-500 ml-2 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Ingredients */}
            {formData.ingredients.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium dark:text-white mb-1">
                        {ingredient.name}
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                          <input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            min="0.1"
                            step="0.1"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Unit:</span>
                          <select
                            value={ingredient.unit}
                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                            className="px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
                          >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="l">l</option>
                            <option value="tsp">tsp</option>
                            <option value="tbsp">tbsp</option>
                            <option value="cup">cup</option>
                            <option value="piece">piece</option>
                            <option value="slice">slice</option>
                            <option value="pinch">pinch</option>
                            <option value="clove">clove</option>
                            <option value="bunch">bunch</option>
                            <option value="can">can</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Instructions *
            </label>
            <div className="space-y-2">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-sm font-medium dark:text-white mt-2">{index + 1}.</span>
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder={`Step ${index + 1}...`}
                      maxLength={500}
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="px-3 py-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addInstruction}
                className="text-blue-500 text-sm hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Add a tag..."
                maxLength={50}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Add
              </button>
            </div>
          </div>

          {/* Nutrition Summary */}
          {formData.ingredients.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-3 dark:text-white">Nutrition Summary (per serving)</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                    {nutrition.calories}
                  </div>
                  <div className="text-blue-700 dark:text-blue-400">Calories</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                    {nutrition.protein}g
                  </div>
                  <div className="text-blue-700 dark:text-blue-400">Protein</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                    {nutrition.carbs}g
                  </div>
                  <div className="text-blue-700 dark:text-blue-400">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                    {nutrition.fat}g
                  </div>
                  <div className="text-blue-700 dark:text-blue-400">Fat</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                    {nutrition.fiber}g
                  </div>
                  <div className="text-blue-700 dark:text-blue-400">Fiber</div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={!formData.name || !formData.ingredients.length || !formData.instructions.some(inst => inst.trim()) || isSubmitting}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-blue-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {editingRecipe ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingRecipe ? 'Update Recipe' : 'Create Recipe'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// Enhanced Recipes Tab
const RecipesTab = () => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await recipesApi.getAll();
      if (response.data.success) {
        setRecipes(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch recipes');
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err.message || 'Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleAddRecipe = async (newRecipe) => {
    setRecipes(prev => [newRecipe, ...prev]);
    setShowRecipeForm(false);
    setEditingRecipe(null);
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setShowRecipeForm(true);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await recipesApi.delete(recipeId);
      if (response.data.success) {
        setRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
      }
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
        <span className="text-gray-600 dark:text-gray-400">Loading recipes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-600">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">My Recipes</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your favorite recipes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRecipe(null);
            setShowRecipeForm(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Recipe</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="Search recipes by name, description, or tags..."
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-800 dark:text-red-300">{error}</span>
          </div>
          <button
            onClick={fetchRecipes}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <BookOpen className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg mb-2">
            {searchTerm ? 'No recipes found' : 'No recipes yet'}
          </p>
          <p className="text-sm mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first recipe to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowRecipeForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Recipe</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
            />
          ))}
        </div>
      )}

      {/* Recipe Form Modal */}
      {showRecipeForm && (
        <RecipeForm
          onAdd={handleAddRecipe}
          onClose={() => {
            setShowRecipeForm(false);
            setEditingRecipe(null);
          }}
          editingRecipe={editingRecipe}
        />
      )}
    </div>
  );
};

// Recipe Card Component
const RecipeCard = ({ recipe, onEdit, onDelete }) => {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Recipe Image Placeholder */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Utensils className="h-12 w-12 text-gray-400" />
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold dark:text-white line-clamp-2">
            {recipe.name}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(recipe)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(recipe._id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Recipe Details */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Servings:</span>
            <span className="ml-2 font-medium dark:text-white">{recipe.servings}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Time:</span>
            <span className="ml-2 font-medium dark:text-white">
              {totalTime > 0 ? `${totalTime}min` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
            <span className="ml-2 font-medium dark:text-white capitalize">
              {recipe.difficulty}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Category:</span>
            <span className="ml-2 font-medium dark:text-white capitalize">
              {recipe.category}
            </span>
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Nutrition per serving:
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold dark:text-white">{recipe.nutrition?.calories || 0}</div>
              <div className="text-gray-500 dark:text-gray-400">Cal</div>
            </div>
            <div className="text-center">
              <div className="font-bold dark:text-white">{recipe.nutrition?.protein || 0}g</div>
              <div className="text-gray-500 dark:text-gray-400">Protein</div>
            </div>
            <div className="text-center">
              <div className="font-bold dark:text-white">{recipe.nutrition?.carbs || 0}g</div>
              <div className="text-gray-500 dark:text-gray-400">Carbs</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 rounded-full">
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Meal Planning Tab Component
// Templates Modal Component
const TemplatesModal = ({ templates, onGenerate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Choose a Meal Plan Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(template => (
            <div key={template._id} className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <h4 className="font-bold mb-2 dark:text-white">{template.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {template.description}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                {template.meals.length} meals planned
              </div>
              <button
                onClick={() => onGenerate(template._id, template.name)}
                className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
              >
                Use This Template
              </button>
            </div>
          ))}
        </div>
        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No templates available yet.</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Create Plan Modal Component (Simplified)
const CreatePlanModal = ({ onClose, onSave }) => {
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implementation for creating a custom plan
    // This would involve more complex UI for adding meals to each day
    alert('Custom plan creation would be implemented here');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Create New Meal Plan</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Plan Name
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Create Plan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced Reports Tab Component
// Enhanced Reports Tab Component
const ReportsTab = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportDateRange, setReportDateRange] = useState('7');
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch comprehensive report data
  const fetchReportData = async (period = reportDateRange) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await reportsApi.getComprehensive(period);

      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch report data');
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      const response = await reportsApi.exportReport('comprehensive', format, reportDateRange);

      if (format === 'csv') {
        // Create and download CSV file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutrition-report-${reportDateRange}days.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Download JSON file
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutrition-report-${reportDateRange}days.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      // Show success message
      alert(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };

  // Fetch data when component mounts or date range changes
  useEffect(() => {
    fetchReportData();
  }, [reportDateRange]);

  // Refresh button component
  const RefreshButton = () => (
    <button
      onClick={() => fetchReportData()}
      disabled={isLoading}
      className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      <span>Refresh</span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Nutritional Reports</h2>
          <RefreshButton />
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600 dark:text-gray-400">Loading report data...</span>
        </div>
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Nutritional Reports</h2>
          <RefreshButton />
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-800 dark:text-red-300">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Nutritional Reports</h2>
          <RefreshButton />
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <BarChartIcon className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg mb-2">No report data available</p>
          <p className="text-sm">Start logging meals to see your nutrition reports</p>
        </div>
      </div>
    );
  }

  const { dailyData, summary, goals, goalAchievement, mealTypeBreakdown, statistics } = reportData;

  return (
    <div className="space-y-6 text-black">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Nutritional Reports</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={reportDateRange}
            onChange={(e) => setReportDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              className="flex items-center space-x-1 bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exportLoading}
              className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <BarChartIcon className="h-4 w-4" />
              <span>Export JSON</span>
            </button>
          </div>

          <RefreshButton />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Calories</div>
              <div className="text-2xl font-bold dark:text-white">
                {summary.totalCalories.toLocaleString()}
              </div>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            {summary.daysTracked} of {summary.totalDays} days tracked ({summary.trackingRate}%)
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Daily Average</div>
              <div className="text-2xl font-bold dark:text-white">
                {summary.averageCalories.toLocaleString()} cal
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Goal: {goals.dailyCalories} cal/day
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Consistency</div>
              <div className="text-2xl font-bold dark:text-white">
                {statistics.consistency}%
              </div>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Meal logging consistency
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Best Day</div>
              <div className="text-2xl font-bold dark:text-white">
                {statistics.bestDay?.calories?.toLocaleString() || 0} cal
              </div>
            </div>
            <PieChartIcon className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            {statistics.bestDay?.day || 'No data'}
          </div>
        </div>
      </div>

      {/* Weekly Overview Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Nutrition Overview</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                color: '#F9FAFB',
                borderRadius: '8px'
              }}
              itemStyle={{ color: '#F9FAFB' }}
              formatter={(value, name) => {
                if (name === 'calories') return [`${value} cal`, 'Calories'];
                if (name === 'protein') return [`${value}g`, 'Protein'];
                if (name === 'carbs') return [`${value}g`, 'Carbs'];
                if (name === 'fat') return [`${value}g`, 'Fat'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="calories" fill="#3b82f6" name="Calories" />
            <Bar dataKey="protein" fill="#10b981" name="Protein" />
            <Bar dataKey="carbs" fill="#f59e0b" name="Carbs" />
            <Bar dataKey="fat" fill="#ef4444" name="Fat" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Macronutrient Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Macronutrient Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                color: '#F9FAFB',
                borderRadius: '8px'
              }}
              itemStyle={{ color: '#F9FAFB' }}
              formatter={(value, name) => {
                return [`${value}g`, name];
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="protein"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              name="Protein (g)"
            />
            <Area
              type="monotone"
              dataKey="carbs"
              stackId="1"
              stroke="#f59e0b"
              fill="#f59e0b"
              name="Carbs (g)"
            />
            <Area
              type="monotone"
              dataKey="fat"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              name="Fat (g)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Achievement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { key: 'calories', label: 'Calories', color: 'blue', unit: '', goal: goals.dailyCalories },
          { key: 'protein', label: 'Protein', color: 'green', unit: 'g', goal: goals.protein },
          { key: 'carbs', label: 'Carbs', color: 'yellow', unit: 'g', goal: goals.carbs },
          { key: 'fat', label: 'Fat', color: 'orange', unit: 'g', goal: goals.fat },
          { key: 'water', label: 'Water', color: 'cyan', unit: 'ml', goal: goals.water }
        ].map(({ key, label, color, unit, goal }) => {
          const achievement = goalAchievement[key] || 0;
          const average = summary[`average${label.charAt(0).toUpperCase() + label.slice(1)}`] || 0;

          const colorClasses = {
            blue: { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
            green: { bg: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
            yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
            orange: { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
            cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400' }
          };

          return (
            <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
                  <div className="text-2xl font-bold dark:text-white">
                    {Math.round(average)}{unit}
                  </div>
                </div>
                <div className={`text-sm font-medium ${colorClasses[color].text}`}>
                  {Math.round(achievement)}%
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                Goal: {goal}{unit}/day
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${colorClasses[color].bg}`}
                    style={{ width: `${achievement}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Water Intake Trend */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Water Intake Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              label={{
                value: 'Water (ml)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#9CA3AF' }
              }}
            />
            <Tooltip
              formatter={(value) => [`${value} ml`, 'Water']}
              contentStyle={{
                backgroundColor: '#1F2937',
                borderColor: '#374151',
                color: '#F9FAFB',
                borderRadius: '8px'
              }}
              itemStyle={{ color: '#F9FAFB' }}
            />
            <Line
              type="monotone"
              dataKey="water"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#0891b2' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Daily Nutrition Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Meal Type Breakdown */}
          <div>
            <h4 className="font-medium mb-3 dark:text-white">Calories by Meal Type</h4>
            <div className="space-y-3">
              {Object.entries(mealTypeBreakdown || {}).map(([mealType, calories]) => {
                const percentage = summary.totalCalories > 0
                  ? (calories / summary.totalCalories) * 100
                  : 0;

                return (
                  <div key={mealType} className="flex items-center justify-between">
                    <span className="text-sm capitalize dark:text-gray-300">{mealType}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium dark:text-white">
                        {Math.round(calories).toLocaleString()} cal
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Macronutrient Ratios */}
          <div>
            <h4 className="font-medium mb-3 dark:text-white">Macronutrient Ratios</h4>
            <div className="space-y-3">
              {[
                { key: 'protein', label: 'Protein', color: '#10b981' },
                { key: 'carbs', label: 'Carbs', color: '#f59e0b' },
                { key: 'fat', label: 'Fat', color: '#ef4444' }
              ].map(({ key, label, color }) => {
                const total = summary[`total${label}`] || 0;
                const caloriesFromMacro = key === 'fat' ? total * 9 : total * 4;
                const percentage = summary.totalCalories > 0
                  ? (caloriesFromMacro / summary.totalCalories) * 100
                  : 0;

                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-sm dark:text-gray-300">{label}</span>
                    </div>
                    <span className="text-sm font-medium dark:text-white">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Summary */}
          <div>
            <h4 className="font-medium mb-3 dark:text-white">Period Summary</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="dark:text-gray-300">Days Tracked</span>
                  <span className="dark:text-white">
                    {summary.daysTracked} / {summary.totalDays}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${summary.trackingRate}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="dark:text-gray-300">Calorie Goal</span>
                  <span className="dark:text-white">
                    {Math.round(goalAchievement.calories)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${goalAchievement.calories}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="dark:text-gray-300">Water Goal</span>
                  <span className="dark:text-white">
                    {Math.round(goalAchievement.water)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${goalAchievement.water}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Weekly Calorie Trend - IMPROVED VERSION
const WeeklyCalorieTrend = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch weekly calorie data
  const fetchWeeklyCalories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate start date (one week ago from today)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6); // 7 days total including today

      console.log('Fetching weekly calories from:', startDate.toISOString().split('T')[0]);

      const response = await weeklyCaloriesApi.get(startDate.toISOString().split('T')[0]);

      if (response.data.success) {
        const data = response.data.data.dailyData || [];
        console.log('Weekly calories data received:', data);

        // Check if all data is zero
        const allZero = data.every(day => day.calories === 0);
        if (allZero) {
          setError('No calorie data found for this week. Start logging meals to see your trends!');
        }

        setWeeklyData(data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch weekly data');
      }
    } catch (err) {
      console.error('Error fetching weekly calories:', err);
      setError(err.message || 'Failed to load weekly data');
      // Clear data on error
      setWeeklyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchWeeklyCalories();
  }, []);

  // Refresh button component
  const RefreshButton = () => (
    <button
      onClick={fetchWeeklyCalories}
      disabled={isLoading}
      className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      <span>Refresh</span>
    </button>
  );

  // Calculate statistics
  const totalCalories = weeklyData.reduce((sum, day) => sum + (day.calories || 0), 0);
  const dailyAverage = Math.round(totalCalories / (weeklyData.length || 1));
  const daysTracked = weeklyData.filter(day => (day.calories || 0) > 0).length;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold dark:text-white">Weekly Calorie Trend</h3>
        <RefreshButton />
      </div>

      {error && (
        <div className={`mb-4 p-3 rounded-lg border ${error.includes('No calorie data')
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
          <div className="flex items-center">
            <span className={`text-sm ${error.includes('No calorie data')
                ? 'text-blue-800 dark:text-blue-300'
                : 'text-yellow-800 dark:text-yellow-300'
              }`}>
              {error}
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading calorie data...</p>
        </div>
      ) : weeklyData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis
                dataKey="day"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
                label={{
                  value: 'Calories',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#9CA3AF' }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  color: '#F9FAFB',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#F9FAFB' }}
                formatter={(value, name) => {
                  if (name === 'calories') return [`${value} cal`, 'Calories'];
                  if (name === 'protein') return [`${value}g`, 'Protein'];
                  if (name === 'carbs') return [`${value}g`, 'Carbs'];
                  if (name === 'fat') return [`${value}g`, 'Fat'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1d4ed8' }}
                name="Calories"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                {totalCalories.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Calories</div>
            </div>
            <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                {dailyAverage.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Daily Average</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                {daysTracked}/7
              </div>
              <div className="text-gray-600 dark:text-gray-400">Days Tracked</div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 dark:text-gray-300">Daily Breakdown</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <span className="font-medium dark:text-white">{day.day}</span>
                  <span className={`font-bold ${day.calories > 2000 ? 'text-red-500' :
                      day.calories > 1500 ? 'text-orange-500' : 'text-indigo-500'
                    }`}>
                    {day.calories || 0} cal
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg mb-2">No weekly data available</p>
          <p className="text-sm mb-4">Start logging meals to see your calorie trends</p>
          <button
            onClick={() => setShowMealForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Meal</span>
          </button>
        </div>
      )}
    </div>
  );
};
const NutritionTracker = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0
  });
  // Default nutritional goals in case API fails
  const defaultNutritionalGoals = {
    dailyCalories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
    fiber: 25,
    water: 2000
  };

  const [nutritionalGoals, setNutritionalGoals] = useState(defaultNutritionalGoals);
  const [foodItems, setFoodItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMealForm, setShowMealForm] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [showGoalsForm, setShowGoalsForm] = useState(false);
  const [goalsError, setGoalsError] = useState(null); // Separate error for goals
  const [reportDateRange, setReportDateRange] = useState('7'); // 7, 14, 30 days

  const fetchInProgress = useRef(false);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      if (!validateToken()) {
        handleAuthError();
        return false;
      }
      return true;
    };

    if (checkAuth()) {
      fetchData();
    }
  }, []);

  // Fetch data on component mount and when selectedDate changes
  useEffect(() => {
    if (!fetchInProgress.current) {
      fetchData();
    }
  }, [selectedDate, activeTab]);

  const fetchData = async () => {
    if (fetchInProgress.current) return;

    try {
      fetchInProgress.current = true;
      setIsLoading(true);
      setError(null);
      setGoalsError(null);

      // Check authentication
      if (!validateToken()) {
        handleAuthError();
        return;
      }

      // Fetch nutritional goals with proper error handling and data structure
      try {
        const goalsResponse = await nutritionalGoalsApi.get();
        console.log('Goals API Response:', goalsResponse);

        if (goalsResponse.data && goalsResponse.data.success !== false) {
          const goalsData = goalsResponse.data.data || goalsResponse.data;
          const updatedGoals = {
            dailyCalories: goalsData.dailyCalories || 2000,
            protein: goalsData.protein || 150,
            carbs: goalsData.carbs || 250,
            fat: goalsData.fat || 67,
            fiber: goalsData.fiber || 25,
            water: goalsData.water || 2000
          };

          setNutritionalGoals(updatedGoals);
          console.log('Goals set successfully: ', updatedGoals);
        } else {
          console.warn('Goals API returned error:', goalsResponse.data?.message);
          throw new Error(goalsResponse.data?.message || 'Failed to fetch nutritional goals');
        }
      } catch (goalsErr) {
        console.warn('Failed to fetch nutritional goals, using defaults:', goalsErr);
        setGoalsError('Using default nutritional goals. Personal goals unavailable.');
        setNutritionalGoals(defaultNutritionalGoals);
      }

      // Use Promise.allSettled for other APIs
      const promises = [
        foodItemsApi.getAll().catch(err => ({ error: err, data: [] })),
        recipesApi.getAll().catch(err => ({ error: err, data: [] })),
        mealsApi.getAll(selectedDate).catch(err => ({ error: err, data: [] })),
        waterIntakeApi.getAll(selectedDate).catch(err => ({ error: err, data: { total: 0 } }))
      ];

      // Only fetch weekly data if needed
      // Only fetch weekly data if needed
      if (activeTab === 'dashboard' || activeTab === 'reports') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        try {
          const weeklyResponse = await weeklyCaloriesApi.get(weekAgo.toISOString().split('T')[0]);
          if (weeklyResponse.data.success) {
            setWeeklyData(weeklyResponse.data.data.dailyData || []);
          } else {
            console.warn('Weekly calories API returned error:', weeklyResponse.data.message);
            setWeeklyData([]);
          }
        } catch (err) {
          console.warn('Failed to fetch weekly calories data:', err);
          setWeeklyData([]);
        }
      }

      const results = await Promise.allSettled(promises);

      // Process results with proper data extraction
      const [foodItemsResult, recipesResult, mealsResult, waterResult, weeklyResult] = results;

      // Set food items
      if (foodItemsResult.status === 'fulfilled') {
        const responseData = foodItemsResult.value;
        setFoodItems(responseData.data?.data || responseData.data || []);
      }

      // Set recipes
      if (recipesResult.status === 'fulfilled') {
        const responseData = recipesResult.value;
        setRecipes(responseData.data?.data || responseData.data || []);
      }
      // Helper function to calculate daily totals from meals
      const calculateDailyTotalsFromMeals = (meals) => {
        if (!Array.isArray(meals) || meals.length === 0) {
          return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 };
        }

        const totals = meals.reduce((acc, meal) => {
          let mealNutrition = {};

          if (meal.totalNutrition && meal.totalNutrition.calories > 0) {
            // Use totalNutrition if available and has data
            mealNutrition = meal.totalNutrition;
          } else if (meal.items && Array.isArray(meal.items)) {
            // Calculate from individual items
            mealNutrition = meal.items.reduce((itemAcc, item) => {
              const itemNutrition = item.foodItem || item;
              return {
                calories: itemAcc.calories + ((itemNutrition.calories || 0) * (item.quantity || 1)),
                protein: itemAcc.protein + ((itemNutrition.protein || 0) * (item.quantity || 1)),
                carbs: itemAcc.carbs + ((itemNutrition.carbs || 0) * (item.quantity || 1)),
                fat: itemAcc.fat + ((itemNutrition.fat || 0) * (item.quantity || 1)),
                fiber: itemAcc.fiber + ((itemNutrition.fiber || 0) * (item.quantity || 1))
              };
            }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
          }

          return {
            calories: acc.calories + (Number(mealNutrition.calories) || 0),
            protein: acc.protein + (Number(mealNutrition.protein) || 0),
            carbs: acc.carbs + (Number(mealNutrition.carbs) || 0),
            fat: acc.fat + (Number(mealNutrition.fat) || 0),
            fiber: acc.fiber + (Number(mealNutrition.fiber) || 0)
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

        return {
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein * 100) / 100, // Keep 2 decimal places for grams
          carbs: Math.round(totals.carbs * 100) / 100,
          fat: Math.round(totals.fat * 100) / 100,
          fiber: Math.round(totals.fiber * 100) / 100,
          water: 0 // Will be set separately from water intake
        };
      };
      // Set meals and calculate totals
      let mealsData = [];
      let calculatedTotals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        water: 0
      };

      if (mealsResult.status === 'fulfilled') {
        const responseData = mealsResult.value;
        console.log('Meals API Response:', responseData);

        // Handle different response structures
        if (responseData.data) {
          if (responseData.data.data) {
            mealsData = responseData.data.data;
          } else if (Array.isArray(responseData.data)) {
            mealsData = responseData.data;
          } else if (responseData.data.meals) {
            mealsData = responseData.data.meals;
          }
        } else if (Array.isArray(responseData)) {
          mealsData = responseData;
        }

        console.log('Processed meals data:', mealsData);
        setMeals(Array.isArray(mealsData) ? mealsData : []);

        // Calculate totals from all meals
        if (Array.isArray(mealsData) && mealsData.length > 0) {
          calculatedTotals = calculateDailyTotalsFromMeals(mealsData);
          console.log('Calculated totals from meals:', calculatedTotals);
        }
      } else {
        console.warn('Meals API call failed:', mealsResult.reason);
        setMeals([]);
      }

      // Set water intake
      let waterValue = 0;
      if (waterResult.status === 'fulfilled') {
        const responseData = waterResult.value;
        const waterData = responseData.data?.data || responseData.data;

        if (waterData && typeof waterData === 'object') {
          waterValue = waterData.total || waterData.amount || waterData.water || 0;
        } else {
          waterValue = waterData || 0;
        }
        setWaterIntake(waterValue);

        // Update totals with water intake
        calculatedTotals.water = waterValue;
      }

      // Set the final daily totals
      setDailyTotals(calculatedTotals);
      console.log('Final daily totals set:', calculatedTotals);

      // Set weekly data if fetched
      if (weeklyResult && weeklyResult.status === 'fulfilled') {
        const responseData = weeklyResult.value;
        const weeklyDataResponse = responseData.data?.data || responseData.data;
        setWeeklyData(weeklyDataResponse?.dailyData || weeklyDataResponse || []);
      }

    } catch (err) {
      console.error('Error fetching data:', err);

      // Handle authentication errors
      if (err.status === 401 || err.status === 403) {
        handleAuthError();
        return;
      }

      setError(err.message || 'Failed to load data. Please try again.');
      setMeals([]);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  };

  // Add retry function for nutritional goals
  const retryNutritionalGoals = async () => {
    try {
      setGoalsError(null);
      const goalsResponse = await nutritionalGoalsApi.get();

      if (goalsResponse.data && goalsResponse.data.success !== false) {
        const goalsData = goalsResponse.data.data || goalsResponse.data;
        const updatedGoals = {
          dailyCalories: goalsData.dailyCalories || 2000,
          protein: goalsData.protein || 150,
          carbs: goalsData.carbs || 250,
          fat: goalsData.fat || 67,
          fiber: goalsData.fiber || 25,
          water: goalsData.water || 2000
        };

        setNutritionalGoals(updatedGoals);
        console.log('Goals retry successful: ', updatedGoals);
      } else {
        throw new Error(goalsResponse.data?.message || 'Failed to fetch nutritional goals');
      }
    } catch (err) {
      console.warn('Still unable to load nutritional goals:', err);
      setGoalsError('Failed to load nutritional goals. Using defaults.');
    }
  };

  // Macronutrient pie chart data - FIXED
  const macroData = [
    {
      name: 'Protein',
      value: Math.round(dailyTotals.protein * 4), // 4 calories per gram
      fill: '#3b82f6'
    },
    {
      name: 'Carbs',
      value: Math.round(dailyTotals.carbs * 4), // 4 calories per gram
      fill: '#10b981'
    },
    {
      name: 'Fat',
      value: Math.round(dailyTotals.fat * 9), // 9 calories per gram
      fill: '#f59e0b'
    }
  ].filter(item => item.value > 0); // Only show non-zero values
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Fixed addMeal function
  const addMeal = async (mealData) => {
    try {
      if (!validateToken()) {
        handleAuthError();
        return false;
      }

      console.log('Adding meal with data:', mealData);

      // Transform items to ensure all nutrition data is included
      const transformedItems = mealData.items.map(item => {
        console.log('Processing item for backend:', item);

        // Ensure all nutrition fields are present with proper values
        const nutritionData = {
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          fiber: item.fiber || 0
        };

        console.log('Nutrition data:', nutritionData);

        // Return the item with all necessary fields
        return {
          fdcId: item.fdcId, // Include fdcId for USDA foods
          name: item.name,
          brandOwner: item.brandOwner || '',
          dataType: item.dataType,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat,
          fiber: nutritionData.fiber,
          servingSize: item.servingSize || 100,
          servingSizeUnit: item.servingSizeUnit || 'g',
          quantity: item.quantity || 1
        };
      });

      console.log('Transformed items for backend:', transformedItems);

      const mealToSend = {
        name: mealData.name,
        type: mealData.type,
        items: transformedItems,
        date: selectedDate,
        time: mealData.time || new Date().toLocaleTimeString(),
        notes: mealData.notes || ''
      };

      console.log('Sending meal to backend:', mealToSend);

      const response = await mealsApi.create(mealToSend);
      console.log('Meal created successfully:', response.data);

      // Refresh the data to show the new meal with nutrition
      await fetchData();
      setShowMealForm(false);
      return true;
    } catch (err) {
      console.error('Error adding meal:', err);
      if (err.status === 401 || err.status === 403) {
        handleAuthError();
        return false;
      }

      console.error('Error response:', err.response?.data);

      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to add meal. Please try again.';
      setError(errorMessage);
      return false;
    }
  };
  const addWaterIntake = async (amount) => {
    try {
      const intakeData = {
        amount,
        date: selectedDate,
        time: new Date().toLocaleTimeString()
      };

      await waterIntakeApi.create(intakeData);

      // Update water intake locally
      const newWaterIntake = waterIntake + amount;
      setWaterIntake(newWaterIntake);
      setDailyTotals(prev => ({
        ...prev,
        water: newWaterIntake
      }));

      return true;
    } catch (err) {
      console.error('Error adding water intake:', err);
      setError('Failed to add water intake. Please try again.');
      return false;
    }
  };

  const updateNutritionalGoals = async (newGoals) => {
    try {
      const response = await nutritionalGoalsApi.update(newGoals);

      // Refresh the goals data from the backend to ensure we have the latest
      await fetchData(); // This will reload all data including the updated goals

      setShowGoalsForm(false);
      setGoalsError(null); // Clear error on successful update
      return true;
    } catch (err) {
      console.error('Error updating goals:', err);
      setError('Failed to update goals. Please try again.');
      return false;
    }
  };

  const addRecipe = async (recipeData) => {
    try {
      const recipeToSend = {
        name: recipeData.name,
        description: recipeData.description,
        ingredients: recipeData.ingredients.map(ing => ({
          foodItem: ing.foodItem.id,
          quantity: ing.quantity,
          unit: ing.unit || 'serving'
        })),
        servings: recipeData.servings,
        instructions: recipeData.instructions.filter(inst => inst.trim())
      };

      const response = await recipesApi.create(recipeToSend);
      setRecipes([...recipes, response.data]);
      setShowRecipeForm(false);
      return true;
    } catch (err) {
      console.error('Error adding recipe:', err);
      setError('Failed to add recipe. Please try again.');
      return false;
    }
  };
  const exportReport = async (type) => {
    try {
      setIsLoading(true);

      let response;
      switch (type) {
        case 'weekly':
          // Generate weekly report
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          response = await weeklyCaloriesApi.get(weekAgo.toISOString().split('T')[0]);
          break;
        case 'monthly':
          // You might want to create a monthly endpoint
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          response = await weeklyCaloriesApi.get(monthAgo.toISOString().split('T')[0]);
          break;
        case 'nutrition':
          // Export current nutrition data
          response = await dailyTotalsApi.get(selectedDate);
          break;
        default:
          return;
      }

      if (response.data.success) {
        // In a real app, you would generate and download a PDF/CSV
        // For now, we'll just show a success message
        alert(`${type} report data ready for export!`);
        console.log('Export data:', response.data);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export report');
    } finally {
      setIsLoading(false);
    }
  };
  // Refresh button component
  const RefreshButton = () => (
    <button
      onClick={fetchData}
      disabled={isLoading}
      className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      <span>Refresh</span>
    </button>
  );
  // Nutritional Goals Status Component
  // Fixed Nutritional Goals Status Component
  const NutritionalGoalsStatus = () => {
    if (!goalsError) return null;

    return (
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
            <span className="text-yellow-800 dark:text-yellow-300 text-sm">
              {goalsError}
            </span>
          </div>
          <button
            onClick={retryNutritionalGoals}
            className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  };

  const MealForm = ({ onAdd, onClose }) => {
    const [mealName, setMealName] = useState('');
    const [mealType, setMealType] = useState('breakfast');
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const searchTimeoutRef = useRef(null);
    // Add these state variables to your NutritionTracker component

    // Add this function to handle report exports

    // Validation function for meal name
    const validateMealName = (name) => {
      if (!name.trim()) {
        return 'Meal name is required';
      }
      if (name.length < 2) {
        return 'Meal name must be at least 2 characters';
      }
      if (!/^[a-zA-Z0-9\s\-.,!?()&']+$/.test(name)) {
        return 'Meal name contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed';
      }
      if (name.length > 50) {
        return 'Meal name must be less than 50 characters';
      }
      return '';
    };

    // Handle meal name change with validation
    const handleMealNameChange = (value) => {
      setMealName(value);

      // Clear error when user starts typing
      if (errors.mealName && touched.mealName) {
        const error = validateMealName(value);
        setErrors({ ...errors, mealName: error });
      }
    };

    // Handle blur for meal name
    const handleMealNameBlur = () => {
      setTouched({ ...touched, mealName: true });
      const error = validateMealName(mealName);
      setErrors({ ...errors, mealName: error });
    };

    // Validate form before submission
    const validateForm = () => {
      const newErrors = {};
      let isValid = true;

      // Validate meal name
      const mealNameError = validateMealName(mealName);
      if (mealNameError) {
        newErrors.mealName = mealNameError;
        isValid = false;
      }

      // Validate selected items
      if (selectedItems.length === 0) {
        newErrors.items = 'Please add at least one food item';
        isValid = false;
      }

      setErrors(newErrors);
      setTouched({
        mealName: true,
        items: true
      });

      return isValid;
    };

    // Debounced search function
    useEffect(() => {
      if (searchTerm.length >= 2) {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          searchFoods();
        }, 500);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, [searchTerm]);

    const searchFoods = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) return;

      setIsSearching(true);
      setSearchError('');
      setShowResults(true);

      try {
        const response = await usdaFoodApi.searchFoods(searchTerm, 15, 1);
        setSearchResults(response.data.foods);
      } catch (error) {
        console.error('Error searching foods:', error);
        setSearchError('Failed to search foods. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const addFoodItem = (food) => {
      console.log('Adding food item with nutrition data:', {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        fullObject: food
      });

      const existingItem = selectedItems.find(item => item.fdcId === food.fdcId);
      if (existingItem) {
        setSelectedItems(selectedItems.map(item =>
          item.fdcId === food.fdcId ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        setSelectedItems([...selectedItems, {
          ...food,
          quantity: 1,
          // Ensure all nutrition fields have values
          calories: food.calories || 0,
          protein: food.protein || 0,
          carbs: food.carbs || 0,
          fat: food.fat || 0,
          fiber: food.fiber || 0
        }]);
      }

      // Clear search after adding
      setSearchTerm('');
      setShowResults(false);
      setSearchResults([]);

      // Clear items error if any
      if (errors.items) {
        setErrors({ ...errors, items: '' });
      }
    };

    const updateQuantity = (fdcId, quantity) => {
      setSelectedItems(selectedItems.map(item =>
        item.fdcId === fdcId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);

      // Transform selected items to include nutrition data directly
      const transformedItems = selectedItems.map(item => ({
        fdcId: item.fdcId,
        name: item.name,
        brandOwner: item.brandOwner || '',
        dataType: item.dataType,
        calories: item.calories || 0,
        protein: item.protein || 0,
        carbs: item.carbs || 0,
        fat: item.fat || 0,
        fiber: item.fiber || 0,
        servingSize: item.servingSize,
        servingSizeUnit: item.servingSizeUnit,
        quantity: item.quantity
      }));

      console.log('Transformed items with nutrition:', transformedItems);

      const success = await onAdd({
        name: mealName.trim(),
        type: mealType,
        items: transformedItems,
        time: new Date().toLocaleTimeString()
      });

      if (success) {
        // Close the modal first
        onClose();

        // Then do a full page refresh after a short delay to show the success state
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // If failed, just stop loading
        setIsSubmitting(false);
      }
    };

    const handleSearchInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value.length < 2) {
        setShowResults(false);
        setSearchResults([]);
      }
    };

    return (
      <div className="fixed text-gray-600 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Add New Meal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Meal Name Field */}
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Meal Name *
              </label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => handleMealNameChange(e.target.value)}
                onBlur={handleMealNameBlur}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.mealName && touched.mealName ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                placeholder="e.g., Protein Power Bowl"
                required
                maxLength={50}
              />
              {errors.mealName && touched.mealName && (
                <p className="text-red-500 text-xs mt-1">{errors.mealName}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {mealName.length}/50 characters
              </p>
            </div>

            {/* Meal Type Field */}
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            {/* Food Search Field */}
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Search Foods</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Type to search foods (e.g., chicken breast, banana)..."
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 text-blue-500 animate-spin" />
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Searching foods...
                    </div>
                  ) : searchError ? (
                    <div className="p-4 text-center text-red-500">
                      {searchError}
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((food, index) => (
                      <div
                        key={`${food.fdcId}-${index}`}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b dark:border-gray-600 last:border-b-0"
                        onClick={() => addFoodItem(food)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium dark:text-white line-clamp-1">
                              {food.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {food.calories} cal
                              </span>
                              {' per '}
                              {food.servingSize} {food.servingSizeUnit}
                              {food.brandOwner && (
                                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                                  {food.brandOwner}
                                </span>
                              )}
                            </div>
                            {food.protein > 0 || food.carbs > 0 || food.fat > 0 ? (
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                              </div>
                            ) : null}
                          </div>
                          <Plus className="h-4 w-4 text-blue-500 ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    ))
                  ) : searchTerm.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No foods found for "{searchTerm}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 dark:text-white">Selected Items</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedItems.map(item => (
                    <div key={item.fdcId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium dark:text-white text-sm">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(item.calories * item.quantity)} cal total
                          {item.brandOwner && (
                            <span className="ml-2">• {item.brandOwner}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.fdcId, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.fdcId, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Nutrition Summary */}
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Total Nutrition:
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-blue-900 dark:text-blue-200">
                        {Math.round(selectedItems.reduce((acc, item) => acc + (item.calories * item.quantity), 0))}
                      </div>
                      <div className="text-blue-700 dark:text-blue-400">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-900 dark:text-blue-200">
                        {Math.round(selectedItems.reduce((acc, item) => acc + (item.protein * item.quantity), 0))}g
                      </div>
                      <div className="text-blue-700 dark:text-blue-400">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-900 dark:text-blue-200">
                        {Math.round(selectedItems.reduce((acc, item) => acc + (item.carbs * item.quantity), 0))}g
                      </div>
                      <div className="text-blue-700 dark:text-blue-400">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-900 dark:text-blue-200">
                        {Math.round(selectedItems.reduce((acc, item) => acc + (item.fat * item.quantity), 0))}g
                      </div>
                      <div className="text-blue-700 dark:text-blue-400">Fat</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Items validation error */}
            {errors.items && touched.items && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-500 text-sm">{errors.items}</p>
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <button
                type="submit"
                disabled={!mealName.trim() || selectedItems.length === 0 || isSubmitting || Object.values(errors).some(error => error)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-blue-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding Meal...
                  </>
                ) : (
                  'Add Meal'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const RecipeForm = ({ onAdd, onClose }) => {
    const [recipeName, setRecipeName] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [servings, setServings] = useState(1);
    const [instructions, setInstructions] = useState(['']);

    const addIngredient = (food) => {
      const existingIngredient = ingredients.find(ing => ing.foodItem.id === food.id);
      if (!existingIngredient) {
        setIngredients([...ingredients, { foodItem: food, quantity: 1, unit: 'serving' }]);
      }
    };

    const updateIngredientQuantity = (index, quantity) => {
      setIngredients(ingredients.map((ing, i) =>
        i === index ? { ...ing, quantity: Math.max(0, quantity) } : ing
      ).filter(ing => ing.quantity > 0));
    };

    const addInstruction = () => {
      setInstructions([...instructions, '']);
    };

    const updateInstruction = (index, value) => {
      setInstructions(instructions.map((inst, i) => i === index ? value : inst));
    };

    const calculateNutrition = () => {
      const total = ingredients.reduce((acc, ing) => ({
        calories: acc.calories + (ing.foodItem.calories * ing.quantity),
        protein: acc.protein + (ing.foodItem.protein * ing.quantity),
        carbs: acc.carbs + (ing.foodItem.carbs * ing.quantity),
        fat: acc.fat + (ing.foodItem.fat * ing.quantity),
        fiber: acc.fiber + (ing.foodItem.fiber * ing.quantity)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

      return {
        calories: Math.round(total.calories / servings),
        protein: Math.round(total.protein / servings),
        carbs: Math.round(total.carbs / servings),
        fat: Math.round(total.fat / servings),
        fiber: Math.round(total.fiber / servings)
      };
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const nutrition = calculateNutrition();
      const newRecipe = {
        id: Date.now(),
        name: recipeName,
        description,
        ingredients,
        servings,
        instructions: instructions.filter(inst => inst.trim()),
        nutrition
      };
      setRecipes([...recipes, newRecipe]);
      onAdd(newRecipe);
      onClose();
    };

    return (
      <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Create New Recipe</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Recipe Name</label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Servings</label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Add Ingredients</label>
                <div className="max-h-60 overflow-y-auto border rounded-lg dark:border-gray-600">
                  {foodItems.map(food => (
                    <div key={food.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-600 last:border-b-0"
                      onClick={() => addIngredient(food)}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium dark:text-white">{food.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{food.calories} cal per {food.servingSize}</div>
                        </div>
                        <Plus className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Recipe Ingredients</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span className="text-sm dark:text-white">{ingredient.foodItem.name}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateIngredientQuantity(index, ingredient.quantity - 0.5)}
                          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm dark:text-white"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-sm dark:text-white">{ingredient.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateIngredientQuantity(index, ingredient.quantity + 0.5)}
                          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm dark:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Instructions</label>
              <div className="space-y-2">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium dark:text-white">{index + 1}.</span>
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Enter instruction step..."
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-blue-500 text-sm hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Add Step
                </button>
              </div>
            </div>

            {ingredients.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 dark:text-white">Estimated Nutrition (per serving)</h4>
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium dark:text-white">{calculateNutrition().calories}</div>
                    <div className="text-gray-600 dark:text-gray-400">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium dark:text-white">{calculateNutrition().protein}g</div>
                    <div className="text-gray-600 dark:text-gray-400">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium dark:text-white">{calculateNutrition().carbs}g</div>
                    <div className="text-gray-600 dark:text-gray-400">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium dark:text-white">{calculateNutrition().fat}g</div>
                    <div className="text-gray-600 dark:text-gray-400">Fat</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium dark:text-white">{calculateNutrition().fiber}g</div>
                    <div className="text-gray-600 dark:text-gray-400">Fiber</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={!recipeName || ingredients.length === 0}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                Create Recipe
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const GoalsForm = ({ goals, onUpdate, onClose }) => {
    // Initialize with proper default values to avoid undefined
    const [formGoals, setFormGoals] = useState({
      dailyCalories: goals?.dailyCalories || 2000,
      protein: goals?.protein || 150,
      carbs: goals?.carbs || 250,
      fat: goals?.fat || 67,
      fiber: goals?.fiber || 25,
      water: goals?.water || 2000
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onUpdate(formGoals);
    };

    // Safe value handler to prevent undefined/NaN
    const handleNumberChange = (field, value) => {
      const numValue = parseInt(value) || 0;
      setFormGoals(prev => ({
        ...prev,
        [field]: Math.max(0, numValue)
      }));
    };

    return (
      <div className="fixed text-gray-600 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Update Nutritional Goals</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Daily Calories</label>
              <input
                type="number"
                value={formGoals.dailyCalories}
                onChange={(e) => handleNumberChange('dailyCalories', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Protein (g)</label>
              <input
                type="number"
                value={formGoals.protein}
                onChange={(e) => handleNumberChange('protein', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Carbs (g)</label>
              <input
                type="number"
                value={formGoals.carbs}
                onChange={(e) => handleNumberChange('carbs', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fat (g)</label>
              <input
                type="number"
                value={formGoals.fat}
                onChange={(e) => handleNumberChange('fat', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fiber (g)</label>
              <input
                type="number"
                value={formGoals.fiber}
                onChange={(e) => handleNumberChange('fiber', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Water (ml)</label>
              <input
                type="number"
                value={formGoals.water}
                onChange={(e) => handleNumberChange('water', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="0"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Update Goals
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add loading and error states to the UI
  if (isLoading && meals.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading nutrition data...</p>
        </div>
      </div>
    );
  }

  if (error && meals.length === 0 && foodItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error Loading Data</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 block w-full"
            >
              Try Again
            </button>
            <button
              onClick={retryNutritionalGoals}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 block w-full"
            >
              Retry Goals Only
            </button>
          </div>
        </div>
      </div>
    );
  }

  const theme = localStorage.getItem("theme");
  // Add this component to show nutritional goals status
  // const NutritionalGoalsStatus = () => {
  //   const hasCustomGoals = nutritionalGoals.dailyCalories !== 2000; // Check if using defaults

  //   if (hasCustomGoals) {
  //     return null; // Don't show anything if custom goals are loaded
  //   }

  //   return (
  //     <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
  //       <div className="flex items-center justify-between">
  //         <div className="flex items-center">
  //           <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
  //           <span className="text-yellow-800 dark:text-yellow-300 text-sm">
  //             Using default nutritional goals
  //           </span>
  //         </div>
  //         <button
  //           onClick={retryNutritionalGoals}
  //           className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 text-sm font-medium"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </div>
  //   );
  // };
  return (<>
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <Navbar />
        <br />
        <br />
        {/* Nutritional Goals Status Warning
    */}<NutritionalGoalsStatus />
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Nutrition Tracker</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your daily nutrition and achieve your health goals</p>
            </div>
            <div className="flex text-black items-center space-x-4 mt-4 md:mt-0">

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 text-black border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                style={{ colorScheme: theme === "dark" ? "dark" : "light" }} // Ensures white theme styling
              />

              <button
                onClick={() => setShowGoalsForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="flex flex-wrap border-b dark:border-gray-700">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChartIcon },
              { id: 'meals', label: 'Meals', icon: Utensils },
              { id: 'recipes', label: 'Recipes', icon: BookOpen },
              { id: 'reports', label: 'Reports', icon: TrendingUp },
              { id: 'planning', label: 'Meal Planning', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 text-gray-600">
            {/* Quick Stats - UPDATED VERSION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Calories - UPDATED */}
              <div className="bg-white text-gray-600 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                    <p className="text-2xl mb-3 text-black font-bold dark:text-white">{Math.round(dailyTotals.calories)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">/ {nutritionalGoals.dailyCalories}</p>
                  </div>
                  <div className={`w-12 h-12 text-gray-600 rounded-full flex items-center justify-center ${dailyTotals.calories >= (nutritionalGoals.dailyCalories || 2000) ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                    <Target className={`h-6 w-6 ${dailyTotals.calories >= (nutritionalGoals.dailyCalories || 2000) ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600 dark:text-blue-400'
                      }`} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (dailyTotals.calories / (nutritionalGoals.dailyCalories || 2000)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Protein - UPDATED */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                    <p className="text-2xl text-black mb-3 font-bold dark:text-white">{Math.round(dailyTotals.protein)}g</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">/ {nutritionalGoals.protein} g</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dailyTotals.protein >= (nutritionalGoals.protein || 150) ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                    <User className={`h-6 w-6 ${dailyTotals.protein >= (nutritionalGoals.protein || 150) ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'
                      }`} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (dailyTotals.protein / (nutritionalGoals.protein || 150)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Carbs - UPDATED */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                    <p className="text-2xl text-black mb-3 font-bold dark:text-white">{Math.round(dailyTotals.carbs)}g</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">/ {nutritionalGoals.carbs} g</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dailyTotals.carbs >= (nutritionalGoals.carbs || 250) ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                    <Settings className={`h-6 w-6 ${dailyTotals.carbs >= (nutritionalGoals.carbs || 250) ? 'text-indigo-600 dark:text-indigo-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (dailyTotals.carbs / (nutritionalGoals.carbs || 250)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Fat - UPDATED */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
                    <p className="text-2xl text-black mb-3 font-bold dark:text-white">{Math.round(dailyTotals.fat)}g</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">/ {nutritionalGoals.fat} g</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dailyTotals.fat >= (nutritionalGoals.fat || 67) ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                    <Droplets className={`h-6 w-6 ${dailyTotals.fat >= (nutritionalGoals.fat || 67) ? 'text-indigo-600 dark:text-indigo-400' : 'text-orange-600 dark:text-orange-400'
                      }`} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (dailyTotals.fat / (nutritionalGoals.fat || 67)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Water - UPDATED */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Water</p>
                    <p className="text-2xl text-black mb-3 font-bold dark:text-white">{waterIntake}ml</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">/ {nutritionalGoals.water} ml</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${waterIntake >= (nutritionalGoals.water || 2000) ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                    <Droplets className={`h-6 w-6 ${waterIntake >= (nutritionalGoals.water || 2000) ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600 dark:text-blue-400'
                      }`} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (waterIntake / (nutritionalGoals.water || 2000)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rest of your dashboard content remains the same */}
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Macronutrient Distribution */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Macronutrient Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Math.round(value)} cal`, 'Calories']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Calorie Trend - NEW FUNCTIONAL COMPONENT */}
              <WeeklyCalorieTrend />
            </div>

            {/* Water Intake Widget */}
            <div className="bg-white text-gray-600 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold dark:text-white">Water Intake</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addWaterIntake(250)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    +250ml
                  </button>
                  <button
                    onClick={() => addWaterIntake(500)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    +500ml
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (waterIntake / (nutritionalGoals.water || 2000)) * 100)}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {waterIntake} / {nutritionalGoals.water || 2000} ml
                </span>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-black font-bold dark:text-white">Today's Meals</h2>
              <button
                onClick={() => setShowMealForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Meal</span>
              </button>
            </div>

            <div className="grid gap-4">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                const mealTypeData = Array.isArray(meals)
                  ? meals.filter(meal => meal && meal.type === mealType)
                  : [];

                // Calculate totals for this meal type
                const mealTotals = mealTypeData.reduce((acc, meal) => {
                  let nutrition = {};

                  if (meal.totalNutrition && meal.totalNutrition.calories > 0) {
                    // Use totalNutrition if available and has data
                    nutrition = meal.totalNutrition;
                  } else if (meal.items && Array.isArray(meal.items)) {
                    // Calculate from individual items
                    nutrition = meal.items.reduce((itemAcc, item) => {
                      const itemNutrition = item.foodItem || item;
                      return {
                        calories: itemAcc.calories + ((itemNutrition.calories || 0) * (item.quantity || 1)),
                        protein: itemAcc.protein + ((itemNutrition.protein || 0) * (item.quantity || 1)),
                        carbs: itemAcc.carbs + ((itemNutrition.carbs || 0) * (item.quantity || 1)),
                        fat: itemAcc.fat + ((itemNutrition.fat || 0) * (item.quantity || 1)),
                        fiber: itemAcc.fiber + ((itemNutrition.fiber || 0) * (item.quantity || 1))
                      };
                    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
                  }

                  return {
                    calories: acc.calories + (Number(nutrition.calories) || 0),
                    protein: acc.protein + (Number(nutrition.protein) || 0),
                    carbs: acc.carbs + (Number(nutrition.carbs) || 0),
                    fat: acc.fat + (Number(nutrition.fat) || 0),
                    fiber: acc.fiber + (Number(nutrition.fiber) || 0)
                  };
                }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

                return (
                  <div key={mealType} className="bg-white text-gray-600 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold capitalize dark:text-white">{mealType}</h3>
                      <div className="text-right">
                        <div className="text-lg font-bold dark:text-white">{Math.round(mealTotals.calories)} cal</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          P: {Math.round(mealTotals.protein)}g | C: {Math.round(mealTotals.carbs)}g | F: {Math.round(mealTotals.fat)}g
                        </div>
                      </div>
                    </div>

                    {mealTypeData.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-500 text-center py-8">
                        No {mealType} added yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mealTypeData.map(meal => {
                          // Calculate nutrition for individual meal
                          let mealNutrition = {};

                          if (meal.totalNutrition && meal.totalNutrition.calories > 0) {
                            mealNutrition = meal.totalNutrition;
                          } else if (meal.items && Array.isArray(meal.items)) {
                            mealNutrition = meal.items.reduce((acc, item) => {
                              const itemNutrition = item.foodItem || item;
                              return {
                                calories: acc.calories + ((itemNutrition.calories || 0) * (item.quantity || 1)),
                                protein: acc.protein + ((itemNutrition.protein || 0) * (item.quantity || 1)),
                                carbs: acc.carbs + ((itemNutrition.carbs || 0) * (item.quantity || 1)),
                                fat: acc.fat + ((itemNutrition.fat || 0) * (item.quantity || 1)),
                                fiber: acc.fiber + ((itemNutrition.fiber || 0) * (item.quantity || 1))
                              };
                            }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
                          }

                          return (
                            <div key={meal._id || meal.id} className="border dark:border-gray-700 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium dark:text-white">{meal.name}</h4>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {meal.items?.map((item, index) => {
                                      const itemData = item.foodItem || item;
                                      const itemCalories = (itemData.calories || 0) * (item.quantity || 1);
                                      const itemProtein = (itemData.protein || 0) * (item.quantity || 1);
                                      const itemCarbs = (itemData.carbs || 0) * (item.quantity || 1);
                                      const itemFat = (itemData.fat || 0) * (item.quantity || 1);

                                      return (
                                        <div key={item._id || index} className="mb-1">
                                          <div className="font-medium">{itemData.name} ({item.quantity || 1}x)</div>
                                          <div className="text-xs text-gray-500 ml-2">
                                            {Math.round(itemCalories)} cal |
                                            P: {Math.round(itemProtein)}g |
                                            C: {Math.round(itemCarbs)}g |
                                            F: {Math.round(itemFat)}g
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="text-right text-sm ml-4">
                                  <div className="font-medium dark:text-white">{meal.time}</div>
                                  <div className="text-gray-600 dark:text-gray-400 font-bold">
                                    {Math.round(mealNutrition.calories || 0)} cal
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    P: {Math.round(mealNutrition.protein || 0)}g |
                                    C: {Math.round(mealNutrition.carbs || 0)}g |
                                    F: {Math.round(mealNutrition.fat || 0)}g
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Recipes Tab */}
        {activeTab === 'recipes' && <RecipesTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'planning' && <MealPlanningTab />}

        {/* Modals */}
        {showMealForm && (
          <MealForm
            onAdd={addMeal}
            onClose={() => setShowMealForm(false)}
          />
        )}

        {showRecipeForm && (
          <RecipeForm
            onAdd={(addRecipe) => console.log('Recipe added:', addRecipe)}
            onClose={() => setShowRecipeForm(false)}
          />
        )}

        {showGoalsForm && (
          <GoalsForm
            goals={nutritionalGoals}
            onUpdate={updateNutritionalGoals}
            onClose={() => setShowGoalsForm(false)}
          />
        )}
      </div>
    </ErrorBoundary></>
  );
};

export default NutritionTracker;
