import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, Utensils } from 'lucide-react';
import { mealPlanTemplatesApi, weeklyMealPlansApi } from '../services/nutritionApi';

const MealPlanningTab = () => {
  const [weeklyMealPlan, setWeeklyMealPlan] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Predefined templates from the image
  const predefinedTemplates = [
    {
      _id: 'high-protein',
      name: 'High Protein Plan',
      description: 'High protein diet for muscle building and recovery',
      dailyCalories: 2200,
      protein: 180
    },
    {
      _id: 'balanced-diet',
      name: 'Balanced Diet',
      description: 'Well-balanced diet for maintaining healthy lifestyle',
      dailyCalories: 2000,
      protein: 150
    },
    {
      _id: 'low-carb',
      name: 'Low Carb Plan',
      description: 'Low carbohydrate diet for weight management',
      dailyCalories: 1800,
      protein: 160
    }
  ];

  // Fetch weekly meal plan and templates
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [planResponse, templatesResponse] = await Promise.all([
        weeklyMealPlansApi.get(),
        mealPlanTemplatesApi.getAll()
      ]);

      setWeeklyMealPlan(planResponse.data.data);
      
      // Use predefined templates if no templates from API
      if (templatesResponse.data.data && templatesResponse.data.data.length > 0) {
        setTemplates(templatesResponse.data.data);
      } else {
        setTemplates(predefinedTemplates);
      }

    } catch (err) {
      console.error('Error fetching meal planning data:', err);
      setError('Failed to load meal planning data');
      // Use predefined templates as fallback
      setTemplates(predefinedTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle meal click
  const handleMealClick = (day, mealType, currentMeal) => {
    setSelectedDay(day);
    setSelectedMeal({
      mealType,
      ...currentMeal
    });
    setShowMealForm(true);
  };

  // Save meal
  const handleSaveMeal = async (mealData) => {
    try {
      const response = await weeklyMealPlansApi.updateMeal(
        selectedDay.day,
        selectedMeal.mealType,
        mealData
      );
      
      setWeeklyMealPlan(response.data.data);
      setShowMealForm(false);
      setSelectedMeal(null);
      setSelectedDay(null);
    } catch (err) {
      console.error('Error saving meal:', err);
      setError('Failed to save meal');
    }
  };

  // Generate from template - show alert instead
  const handleGenerateFromTemplate = async (templateId) => {
    alert('Template functionality will be implemented in a future update!');
    setShowTemplateModal(false);
  };

  // Get week dates
  const getWeekDates = () => {
    if (!weeklyMealPlan) return [];
    
    return weeklyMealPlan.days.map(day => {
      const date = new Date(day.date);
      return {
        dayName: day.day.charAt(0).toUpperCase() + day.day.slice(1),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Meal Planning</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600 dark:text-gray-400">Loading meal plan...</span>
        </div>
      </div>
    );
  }

  const weekDates = getWeekDates();

  return (
    <div className="space-y-6 text-gray-600">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Weekly Meal Plan</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Plan your meals for the week ahead
          </p>
        </div>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Use Template</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-800 dark:text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Weekly Meal Plan */}
      {weeklyMealPlan && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 overflow-x-auto">
          {/* Week Header - Improved alignment */}
          <div className="grid grid-cols-8 gap-2 sm:gap-4 mb-4 sm:mb-6 min-w-[800px]">
            <div className="text-center"></div> {/* Empty cell for meal labels */}
            {weekDates.map((weekDay, index) => (
              <div key={index} className="text-center">
                <div className="font-bold text-sm sm:text-base dark:text-white truncate px-1">
                  {weekDay.dayName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {weekDay.date}
                </div>
              </div>
            ))}
          </div>

          {/* Meal Plan Grid - Responsive */}
          <div className="space-y-3 sm:space-y-4 min-w-[800px]">
            {/* Breakfast Row */}
            <div className="grid grid-cols-8 gap-2 sm:gap-4">
              <div className="font-medium dark:text-white text-xs sm:text-sm flex items-center justify-end sm:justify-start pr-2">
                <span className="hidden sm:inline">Breakfast</span>
                <span className="sm:hidden">B</span>
              </div>
              {weeklyMealPlan.days.map((day, dayIndex) => {
                const breakfast = day.meals.find(m => m.mealType === 'breakfast');
                return (
                  <div 
                    key={`breakfast-${dayIndex}`}
                    onClick={() => handleMealClick(day, 'breakfast', breakfast)}
                    className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-h-[60px] sm:min-h-[80px] flex items-center justify-center col-span-1"
                  >
                    {breakfast.name ? (
                      <div className="text-center w-full">
                        <div className="font-medium text-xs sm:text-sm dark:text-white truncate px-1">
                          {breakfast.name}
                        </div>
                        {breakfast.totalNutrition.calories > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {breakfast.totalNutrition.calories} cal
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm text-center">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1" />
                        <span className="hidden sm:inline">Add</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Lunch Row */}
            <div className="grid grid-cols-8 gap-2 sm:gap-4">
              <div className="font-medium dark:text-white text-xs sm:text-sm flex items-center justify-end sm:justify-start pr-2">
                <span className="hidden sm:inline">Lunch</span>
                <span className="sm:hidden">L</span>
              </div>
              {weeklyMealPlan.days.map((day, dayIndex) => {
                const lunch = day.meals.find(m => m.mealType === 'lunch');
                return (
                  <div 
                    key={`lunch-${dayIndex}`}
                    onClick={() => handleMealClick(day, 'lunch', lunch)}
                    className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-h-[60px] sm:min-h-[80px] flex items-center justify-center col-span-1"
                  >
                    {lunch.name ? (
                      <div className="text-center w-full">
                        <div className="font-medium text-xs sm:text-sm dark:text-white truncate px-1">
                          {lunch.name}
                        </div>
                        {lunch.totalNutrition.calories > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {lunch.totalNutrition.calories} cal
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm text-center">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1" />
                        <span className="hidden sm:inline">Add</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dinner Row */}
            <div className="grid grid-cols-8 gap-2 sm:gap-4">
              <div className="font-medium dark:text-white text-xs sm:text-sm flex items-center justify-end sm:justify-start pr-2">
                <span className="hidden sm:inline">Dinner</span>
                <span className="sm:hidden">D</span>
              </div>
              {weeklyMealPlan.days.map((day, dayIndex) => {
                const dinner = day.meals.find(m => m.mealType === 'dinner');
                return (
                  <div 
                    key={`dinner-${dayIndex}`}
                    onClick={() => handleMealClick(day, 'dinner', dinner)}
                    className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-h-[60px] sm:min-h-[80px] flex items-center justify-center col-span-1"
                  >
                    {dinner.name ? (
                      <div className="text-center w-full">
                        <div className="font-medium text-xs sm:text-sm dark:text-white truncate px-1">
                          {dinner.name}
                        </div>
                        {dinner.totalNutrition.calories > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {dinner.totalNutrition.calories} cal
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm text-center">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1" />
                        <span className="hidden sm:inline">Add</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Templates Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Utensils className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-bold dark:text-white">Meal Templates</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div key={template._id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
              <h4 className="font-bold dark:text-white text-lg mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {template.description || 'A balanced meal plan template'}
              </p>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <span className="w-24">Calories:</span>
                  <span className="font-medium">{template.dailyCalories} cal/day</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24">Protein:</span>
                  <span className="font-medium">{template.protein}g</span>
                </div>
              </div>
              <button
                onClick={() => handleGenerateFromTemplate(template._id)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplatesModal
          templates={templates}
          onGenerate={handleGenerateFromTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {/* Meal Form Modal */}
      {showMealForm && (
        <MealFormModal
          meal={selectedMeal}
          day={selectedDay}
          onSave={handleSaveMeal}
          onClose={() => {
            setShowMealForm(false);
            setSelectedMeal(null);
            setSelectedDay(null);
          }}
        />
      )}
    </div>
  );
};

// Templates Modal Component
const TemplatesModal = ({ templates, onGenerate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Choose a Meal Plan Template</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {templates.map(template => (
            <div key={template._id} className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              <h4 className="font-bold mb-2 dark:text-white">{template.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {template.description || 'A balanced meal plan template designed for optimal nutrition and variety.'}
              </p>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex justify-between">
                  <span>Daily Calories:</span>
                  <span className="font-medium">{template.dailyCalories} cal</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span className="font-medium">{template.protein}g</span>
                </div>
              </div>
              <button
                onClick={() => onGenerate(template._id)}
                className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Use This Template
              </button>
            </div>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Meal Form Modal Component (unchanged)
const MealFormModal = ({ meal, day, onSave, onClose }) => {
  const [mealName, setMealName] = useState(meal?.name || '');
  const [items, setItems] = useState(meal?.items || []);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCalories, setNewItemCalories] = useState('');
  const [newItemProtein, setNewItemProtein] = useState('');

  const addItem = () => {
    if (newItemName.trim() && newItemQuantity.trim()) {
      const newItem = {
        name: newItemName.trim(),
        quantity: newItemQuantity.trim(),
        nutrition: {
          calories: parseInt(newItemCalories) || 0,
          protein: parseInt(newItemProtein) || 0,
          carbs: 0,
          fat: 0
        }
      };
      
      setItems([...items, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemCalories('');
      setNewItemProtein('');
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: mealName,
      items: items
    });
  };

  const calculateTotalNutrition = () => {
    return items.reduce((total, item) => ({
      calories: total.calories + (item.nutrition?.calories || 0),
      protein: total.protein + (item.nutrition?.protein || 0),
      carbs: total.carbs + (item.nutrition?.carbs || 0),
      fat: total.fat + (item.nutrition?.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 dark:text-white">
          {day?.day ? `${day.day.charAt(0).toUpperCase() + day.day.slice(1)} ${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}` : 'Add Meal'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meal Name */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Meal Name
            </label>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Protein Power Bowl"
            />
          </div>

          {/* Add Item Form */}
          <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
            <h4 className="font-medium mb-3 dark:text-white">Add Food Items</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Item name"
              />
              <input
                type="text"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Quantity (e.g., 1 cup)"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                type="number"
                value={newItemCalories}
                onChange={(e) => setNewItemCalories(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Calories"
              />
              <input
                type="number"
                value={newItemProtein}
                onChange={(e) => setNewItemProtein(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Protein (g)"
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              className="w-full bg-indigo-500 text-white py-2 rounded text-sm hover:bg-indigo-600 transition-colors"
            >
              Add Item
            </button>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 dark:text-white">Meal Items</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm dark:text-white">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity} • {item.nutrition?.calories || 0} cal • {item.nutrition?.protein || 0}g protein
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 text-sm bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Summary */}
          {items.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium mb-3 dark:text-white text-center">Total Nutrition</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="text-center bg-white dark:bg-blue-800/30 py-2 rounded">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                    {totalNutrition.calories}
                  </div>
                  <div className="text-blue-700 dark:text-blue-400 text-xs">Calories</div>
                </div>
                <div className="text-center bg-white dark:bg-blue-800/30 py-2 rounded">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                    {totalNutrition.protein}g
                  </div>
                  <div className="text-blue-700 dark:text-blue-400 text-xs">Protein</div>
                </div>
                <div className="text-center bg-white dark:bg-blue-800/30 py-2 rounded">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                    {totalNutrition.carbs}g
                  </div>
                  <div className="text-blue-700 dark:text-blue-400 text-xs">Carbs</div>
                </div>
                <div className="text-center bg-white dark:bg-blue-800/30 py-2 rounded">
                  <div className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                    {totalNutrition.fat}g
                  </div>
                  <div className="text-blue-700 dark:text-blue-400 text-xs">Fat</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Save Meal
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealPlanningTab;
 
 
 
 
 
 
 
