import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Slider,
  Alert
} from 'react-native';

const BudgetPlannerScreen = () => {
  const [hasChanges, setHasChanges] = useState(false);
  
  const [budgetData, setBudgetData] = useState({
    income: 15000,
    totalBudget: 12500,
    categories: [
      { id: 1, name: 'Food & Dining', budget: 3000, spent: 2450, color: '#4CAF50' },
      { id: 2, name: 'Transportation', budget: 1500, spent: 1200, color: '#2196F3' },
      { id: 3, name: 'Bills & Utilities', budget: 2500, spent: 2100, color: '#FF9800' },
      { id: 4, name: 'Entertainment', budget: 800, spent: 650, color: '#9C27B0' },
      { id: 5, name: 'Shopping', budget: 1200, spent: 980, color: '#FF5722' },
      { id: 6, name: 'Healthcare', budget: 600, spent: 320, color: '#607D8B' },
      { id: 7, name: 'Savings', budget: 2900, spent: 2900, color: '#4CAF50' }
    ]
  });

  // Calculate payday countdown (assuming monthly salary on 25th)
  const getPaydayCountdown = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let nextPayday = new Date(currentYear, currentMonth, 25);
    
    if (today.getDate() >= 25) {
      nextPayday = new Date(currentYear, currentMonth + 1, 25);
    }
    
    const diffTime = nextPayday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const paydayCountdown = getPaydayCountdown();
  const totalSpent = budgetData.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = budgetData.totalBudget - totalSpent;
  const budgetUtilization = (totalSpent / budgetData.totalBudget) * 100;

  const getBudgetStatus = () => {
    if (budgetUtilization <= 70) return { text: 'On Track', color: '#4CAF50' };
    if (budgetUtilization <= 90) return { text: 'Warning', color: '#FF9800' };
    return { text: 'Over Budget', color: '#FF5722' };
  };

  const budgetStatus = getBudgetStatus();

  const updateCategoryBudget = (categoryId, newBudget) => {
    setBudgetData(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, budget: newBudget } : cat
      )
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    Alert.alert('Success', 'Budget changes saved successfully!');
    setHasChanges(false);
  };

  const renderIncomeVsExpensesChart = () => {
    const expensePercentage = (totalSpent / budgetData.income) * 100;
    const savingsPercentage = ((budgetData.income - totalSpent) / budgetData.income) * 100;

    return (
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Income vs Expenses</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartBar}>
            <View style={[styles.chartSegment, { 
              width: `${expensePercentage}%`, 
              backgroundColor: '#FF5722' 
            }]} />
            <View style={[styles.chartSegment, { 
              width: `${savingsPercentage}%`, 
              backgroundColor: '#4CAF50' 
            }]} />
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
              <Text style={styles.legendText}>Expenses: R{totalSpent.toFixed(0)}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Savings: R{(budgetData.income - totalSpent).toFixed(0)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryBreakdown = () => {
    return (
      <View style={styles.categoryCard}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {budgetData.categories.map(category => {
          const percentage = (category.spent / category.budget) * 100;
          const isOverBudget = percentage > 100;
          
          return (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAmount}>
                  R{category.spent} / R{category.budget}
                </Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(100, percentage)}%`,
                        backgroundColor: isOverBudget ? '#FF5722' : category.color
                      }
                    ]} 
                  />
                </View>
                <Text style={[
                  styles.progressText,
                  { color: isOverBudget ? '#FF5722' : '#666' }
                ]}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
              
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Budget: R{category.budget}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={5000}
                  value={category.budget}
                  onValueChange={(value) => updateCategoryBudget(category.id, Math.round(value))}
                  minimumTrackTintColor={category.color}
                  maximumTrackTintColor="#ddd"
                  thumbStyle={{ backgroundColor: category.color }}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderForecastGraph = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const forecastData = [
      { month: 'Jan', income: 15000, expenses: 12500 },
      { month: 'Feb', income: 15000, expenses: 11800 },
      { month: 'Mar', income: 15000, expenses: 12200 },
      { month: 'Apr', income: 15000, expenses: 11900 },
      { month: 'May', income: 15000, expenses: 12100 },
      { month: 'Jun', income: 15000, expenses: 11700 }
    ];

    return (
      <View style={styles.forecastCard}>
        <Text style={styles.sectionTitle}>6-Month Forecast</Text>
        <View style={styles.forecastChart}>
          {forecastData.map((data, index) => {
            const savingsHeight = ((data.income - data.expenses) / data.income) * 100;
            return (
              <View key={index} style={styles.forecastBar}>
                <View style={styles.forecastColumn}>
                  <View 
                    style={[
                      styles.forecastSegment, 
                      { 
                        height: `${savingsHeight}%`,
                        backgroundColor: '#4CAF50'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.forecastMonth}>{data.month}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.forecastNote}>
          Projected monthly savings based on current budget
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budget Planner</Text>
        </View>

        {/* Countdown to Payday */}
        <View style={styles.paydayCard}>
          <Text style={styles.paydayTitle}>Next Payday</Text>
          <Text style={styles.paydayCountdown}>{paydayCountdown}</Text>
          <Text style={styles.paydaySubtext}>days remaining</Text>
          
          {/* Budget Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: budgetStatus.color }]}>
            <Text style={styles.statusText}>{budgetStatus.text}</Text>
          </View>
        </View>

        {/* Budget Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Monthly Income</Text>
              <Text style={styles.overviewValue}>R{budgetData.income.toLocaleString()}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Total Spent</Text>
              <Text style={[styles.overviewValue, { color: '#FF5722' }]}>
                R{totalSpent.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Remaining</Text>
              <Text style={[
                styles.overviewValue, 
                { color: remainingBudget >= 0 ? '#4CAF50' : '#FF5722' }
              ]}>
                R{remainingBudget.toLocaleString()}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Budget Used</Text>
              <Text style={styles.overviewValue}>{budgetUtilization.toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        {/* Income vs Expenses Chart */}
        {renderIncomeVsExpensesChart()}

        {/* Category Breakdown with Sliders */}
        {renderCategoryBreakdown()}

        {/* Forecast Graph */}
        {renderForecastGraph()}

        {/* Save Changes Button */}
        {hasChanges && (
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveChanges}
          >
            <Text style={styles.saveButtonText}>💾 Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  paydayCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  paydayTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  paydayCountdown: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  paydaySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  overviewCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartBar: {
    flexDirection: 'row',
    width: '100%',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  chartSegment: {
    height: '100%',
  },
  chartLegend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  categoryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  categoryItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    width: 35,
  },
  sliderContainer: {
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 20,
  },
  forecastCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  forecastChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 15,
  },
  forecastBar: {
    alignItems: 'center',
    flex: 1,
  },
  forecastColumn: {
    width: 20,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  forecastSegment: {
    width: '100%',
    borderRadius: 10,
    minHeight: 5,
  },
  forecastMonth: {
    fontSize: 10,
    color: '#666',
  },
  forecastNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BudgetPlannerScreen;