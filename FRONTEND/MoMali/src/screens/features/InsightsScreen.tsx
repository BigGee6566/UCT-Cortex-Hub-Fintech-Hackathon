import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';

const InsightsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const monthlyData = {
    totalSpent: 8750,
    totalIncome: 15000,
    savingsRate: 41.7,
    transactionCount: 127,
    avgTransactionSize: 68.90,
    topCategory: 'Food & Dining'
  };

  const categoryTrends = [
    { category: 'Food & Dining', thisMonth: 2450, lastMonth: 2200, trend: 'up', color: '#4CAF50' },
    { category: 'Transportation', thisMonth: 1200, lastMonth: 1350, trend: 'down', color: '#2196F3' },
    { category: 'Entertainment', thisMonth: 650, lastMonth: 480, trend: 'up', color: '#9C27B0' },
    { category: 'Shopping', thisMonth: 980, lastMonth: 1200, trend: 'down', color: '#FF5722' }
  ];

  const aiInsights = [
    {
      id: 1,
      title: 'Weekend Spending Alert',
      message: 'You spend 40% more on weekends. Consider setting a weekend budget limit.',
      priority: 'high',
      icon: '⚠️'
    },
    {
      id: 2,
      title: 'Great Progress!',
      message: 'Your food spending decreased by 8% this month. Keep it up!',
      priority: 'low',
      icon: '🎉'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial Insights</Text>
        </View>

        {/* Monthly Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Monthly Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>R{monthlyData.totalSpent.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Total Spent</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                {monthlyData.savingsRate}%
              </Text>
              <Text style={styles.summaryLabel}>Savings Rate</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{monthlyData.transactionCount}</Text>
              <Text style={styles.summaryLabel}>Transactions</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>R{monthlyData.avgTransactionSize}</Text>
              <Text style={styles.summaryLabel}>Avg Transaction</Text>
            </View>
          </View>
        </View>

        {/* Category Trends */}
        <View style={styles.trendsCard}>
          <Text style={styles.sectionTitle}>Category Trends</Text>
          {categoryTrends.map((category, index) => {
            const change = category.thisMonth - category.lastMonth;
            const changePercent = ((change / category.lastMonth) * 100).toFixed(1);
            return (
              <View key={index} style={styles.trendItem}>
                <View style={styles.trendLeft}>
                  <View style={[styles.trendDot, { backgroundColor: category.color }]} />
                  <Text style={styles.trendCategory}>{category.category}</Text>
                </View>
                <View style={styles.trendRight}>
                  <Text style={styles.trendAmount}>R{category.thisMonth}</Text>
                  <Text style={[
                    styles.trendChangeText,
                    { color: category.trend === 'up' ? '#FF5722' : '#4CAF50' }
                  ]}>
                    {category.trend === 'up' ? '↗' : '↘'} {Math.abs(Number(changePercent))}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* AI Insights */}
        <View style={styles.aiInsightsContainer}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          {aiInsights.map(insight => (
            <View key={insight.id} style={[
              styles.aiInsightCard,
              { borderLeftColor: insight.priority === 'high' ? '#FF5722' : '#4CAF50' }
            ]}>
              <View style={styles.aiInsightHeader}>
                <Text style={styles.aiInsightIcon}>{insight.icon}</Text>
                <Text style={styles.aiInsightTitle}>{insight.title}</Text>
              </View>
              <Text style={styles.aiInsightMessage}>{insight.message}</Text>
            </View>
          ))}
        </View>
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
  summaryCard: {
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  trendsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  trendCategory: {
    fontSize: 14,
    color: '#333',
  },
  trendRight: {
    alignItems: 'flex-end',
  },
  trendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  trendChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  aiInsightsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  aiInsightCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiInsightIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  aiInsightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  aiInsightMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default InsightsScreen;