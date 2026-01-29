import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

const CategoryDetailScreen = ({ route, navigation }) => {
  const { category = 'Food' } = route?.params || {};
  const [budget, setBudget] = useState(600);

  const spendingData = [
    { month: 'Jan', amount: 450 },
    { month: 'Feb', amount: 520 },
    { month: 'Mar', amount: 380 },
    { month: 'Apr', amount: 610 },
    { month: 'May', amount: 490 },
    { month: 'Jun', amount: 580 }
  ];

  const topMerchants = [
    { name: 'Woolworths', amount: 245.50, transactions: 8 },
    { name: 'Pick n Pay', amount: 189.30, transactions: 5 },
    { name: 'Checkers', amount: 156.80, transactions: 4 },
    { name: 'Spar', amount: 98.40, transactions: 3 },
    { name: 'Food Lover\'s Market', amount: 67.20, transactions: 2 }
  ];

  const currentSpending = 580;
  const budgetUsage = (currentSpending / budget) * 100;
  const maxAmount = Math.max(...spendingData.map(d => d.amount));

  const getCategoryIcon = (cat) => {
    const icons = {
      'Food': '🍽️', 'Transport': '🚗', 'Entertainment': '🎬',
      'Bills': '💳', 'Shopping': '🛍️', 'Healthcare': '🏥'
    };
    return icons[cat] || '💸';
  };

  const renderSpendingChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Spending Over Time</Text>
      <View style={styles.chart}>
        {spendingData.map((item, index) => (
          <View key={index} style={styles.chartBar}>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { height: (item.amount / maxAmount) * 100 }
                ]} 
              />
            </View>
            <Text style={styles.barLabel}>{item.month}</Text>
            <Text style={styles.barAmount}>R{item.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTopMerchants = () => (
    <View style={styles.merchantsContainer}>
      <Text style={styles.sectionTitle}>Top Merchants</Text>
      {topMerchants.map((merchant, index) => (
        <View key={index} style={styles.merchantItem}>
          <View style={styles.merchantRank}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.merchantInfo}>
            <Text style={styles.merchantName}>{merchant.name}</Text>
            <Text style={styles.merchantTransactions}>{merchant.transactions} transactions</Text>
          </View>
          <Text style={styles.merchantAmount}>R{merchant.amount}</Text>
        </View>
      ))}
    </View>
  );

  const renderBudgetSection = () => (
    <View style={styles.budgetContainer}>
      <Text style={styles.sectionTitle}>Budget vs Actual</Text>
      
      <View style={styles.budgetComparison}>
        <View style={styles.budgetBar}>
          <View style={[styles.budgetFill, { width: `${Math.min(100, budgetUsage)}%` }]} />
        </View>
        <View style={styles.budgetLabels}>
          <Text style={styles.budgetLabel}>Spent: R{currentSpending}</Text>
          <Text style={styles.budgetLabel}>Budget: R{budget}</Text>
        </View>
        <Text style={[
          styles.budgetPercentage,
          { color: budgetUsage > 100 ? '#FF5722' : '#4CAF50' }
        ]}>
          {budgetUsage.toFixed(0)}% used
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Adjust Budget: R{budget}</Text>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={1500}
          value={budget}
          onValueChange={setBudget}
          step={50}
          minimumTrackTintColor="#2196F3"
          maximumTrackTintColor="#E0E0E0"
          thumbStyle={styles.sliderThumb}
        />
        <View style={styles.sliderRange}>
          <Text style={styles.rangeText}>R100</Text>
          <Text style={styles.rangeText}>R1500</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
          <Text style={styles.headerTitle}>{category}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSpendingChart()}
        {renderBudgetSection()}
        {renderTopMerchants()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 24,
    color: '#2196F3',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  bar: {
    backgroundColor: '#2196F3',
    width: 20,
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  barAmount: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  budgetContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  budgetComparison: {
    marginBottom: 20,
  },
  budgetBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 10,
  },
  budgetFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
  },
  budgetPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sliderContainer: {
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#2196F3',
    width: 20,
    height: 20,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  rangeText: {
    fontSize: 12,
    color: '#666',
  },
  merchantsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  merchantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  merchantRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  merchantTransactions: {
    fontSize: 12,
    color: '#666',
  },
  merchantAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CategoryDetailScreen;