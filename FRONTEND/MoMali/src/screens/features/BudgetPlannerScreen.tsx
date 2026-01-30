import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Colors } from '@/constants/theme';

const BudgetPlannerScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  
  const overallScore = 72;
  const totalBudget = 12500;
  const totalSpent = 8750;
  const remainingBudget = totalBudget - totalSpent;

  const categories = [
    { name: 'Food & Dining', budget: 3000, spent: 2450, color: Colors.light.primary },
    { name: 'Transportation', budget: 1500, spent: 1200, color: Colors.light.primary },
    { name: 'Bills & Utilities', budget: 2500, spent: 2100, color: Colors.light.secondary },
    { name: 'Entertainment', budget: 800, spent: 650, color: Colors.light.secondary },
    { name: 'Shopping', budget: 1200, spent: 980, color: Colors.light.error }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budget Planner</Text>
        </View>

        {/* Budget Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Monthly Budget</Text>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>R{totalBudget.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Budget</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.light.error }]}>R{totalSpent.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Spent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.light.primary }]}>R{remainingBudget.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {categories.map((category, index) => {
            const percentage = (category.spent / category.budget) * 100;
            return (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryAmount}>R{category.spent} / R{category.budget}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${Math.min(100, percentage)}%`,
                          backgroundColor: category.color
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Budget Planner', 'Budget planning features coming soon!')}
        >
          <Text style={styles.actionButtonText}>💾 Update Budget</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  overviewCard: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 15,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  categorySection: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 20,
  },
  categoryItem: {
    marginBottom: 20,
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
    color: Colors.light.text,
  },
  categoryAmount: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.border,
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
  actionButton: {
    backgroundColor: Colors.light.primary,
    margin: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  actionButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BudgetPlannerScreen;