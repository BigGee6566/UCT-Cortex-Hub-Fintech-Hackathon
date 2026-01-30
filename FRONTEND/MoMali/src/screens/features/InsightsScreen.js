import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Colors } from '@/constants/theme';

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

  const dayOfWeekData = [
    { day: 'Mon', amount: 1250, transactions: 18 },
    { day: 'Tue', amount: 980, transactions: 15 },
    { day: 'Wed', amount: 1100, transactions: 16 },
    { day: 'Thu', amount: 1350, transactions: 20 },
    { day: 'Fri', amount: 1680, transactions: 25 },
    { day: 'Sat', amount: 1890, transactions: 22 },
    { day: 'Sun', amount: 500, transactions: 11 }
  ];

  const timeHeatmapData = [
    { hour: '6-9', intensity: 0.3, label: 'Morning' },
    { hour: '9-12', intensity: 0.6, label: 'Mid Morning' },
    { hour: '12-15', intensity: 0.9, label: 'Lunch' },
    { hour: '15-18', intensity: 0.4, label: 'Afternoon' },
    { hour: '18-21', intensity: 0.8, label: 'Evening' },
    { hour: '21-24', intensity: 0.2, label: 'Night' }
  ];

  const categoryTrends = [
    { category: 'Food & Dining', thisMonth: 2450, lastMonth: 2200, trend: 'up', color: Colors.light.primary },
    { category: 'Transportation', thisMonth: 1200, lastMonth: 1350, trend: 'down', color: Colors.light.primary },
    { category: 'Entertainment', thisMonth: 650, lastMonth: 480, trend: 'up', color: Colors.light.secondary },
    { category: 'Shopping', thisMonth: 980, lastMonth: 1200, trend: 'down', color: Colors.light.error },
    { category: 'Bills', thisMonth: 2100, lastMonth: 2050, trend: 'up', color: Colors.light.secondary }
  ];

  const hiddenCosts = [
    { type: 'Subscription Overlap', amount: 199, description: 'Netflix + Amazon Prime both have similar content' },
    { type: 'ATM Fees', amount: 45, description: 'Using out-of-network ATMs 9 times this month' },
    { type: 'Late Payment Fees', amount: 75, description: 'Credit card payment was 2 days late' },
    { type: 'Impulse Purchases', amount: 320, description: 'Unplanned purchases under R50 each' }
  ];

  const achievements = [
    { id: 1, title: 'Budget Master', description: 'Stayed under budget for 3 months', icon: '🏆', earned: true },
    { id: 2, title: 'Savings Streak', description: 'Saved money for 30 days straight', icon: '💰', earned: true },
    { id: 3, title: 'Category King', description: 'Reduced food spending by 15%', icon: '👑', earned: true },
    { id: 4, title: 'Early Bird', description: 'Pay all bills before due date', icon: '⏰', earned: false },
    { id: 5, title: 'Frugal Fighter', description: 'Find 5 ways to save money', icon: '🛡️', earned: false }
  ];

  const aiInsights = [
    {
      id: 1,
      type: 'spending_pattern',
      title: 'Weekend Spending Alert',
      message: 'You spend 40% more on weekends. Consider setting a weekend budget limit.',
      action: 'Set Weekend Budget',
      priority: 'high',
      icon: '⚠️'
    },
    {
      id: 2,
      type: 'savings_opportunity',
      title: 'Subscription Optimization',
      message: 'You could save R199/month by canceling overlapping streaming services.',
      action: 'Review Subscriptions',
      priority: 'medium',
      icon: '💡'
    },
    {
      id: 3,
      type: 'positive_trend',
      title: 'Great Progress!',
      message: 'Your food spending decreased by 8% this month. Keep it up!',
      action: 'View Details',
      priority: 'low',
      icon: '🎉'
    }
  ];

  const renderMonthlySummary = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.sectionTitle}>Monthly Summary</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>R{monthlyData.totalSpent.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.light.primary }]}>
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
  );

  const renderDayOfWeekChart = () => (
    <View style={styles.chartCard}>
      <Text style={styles.sectionTitle}>Spending by Day of Week</Text>
      <View style={styles.dayChart}>
        {dayOfWeekData.map((day, index) => {
          const maxAmount = Math.max(...dayOfWeekData.map(d => d.amount));
          const height = (day.amount / maxAmount) * 100;
          return (
            <View key={index} style={styles.dayColumn}>
              <View style={styles.dayBar}>
                <View 
                  style={[
                    styles.dayBarFill, 
                    { 
                      height: `${height}%`,
                      backgroundColor: index >= 5 ? Colors.light.secondary : Colors.light.primary
                    }
                  ]} 
                />
              </View>
              <Text style={styles.dayLabel}>{day.day}</Text>
              <Text style={styles.dayAmount}>R{day.amount}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderTimeHeatmap = () => (
    <View style={styles.chartCard}>
      <Text style={styles.sectionTitle}>Time of Day Spending</Text>
      <View style={styles.heatmapContainer}>
        {timeHeatmapData.map((time, index) => (
          <View key={index} style={styles.heatmapItem}>
            <View 
              style={[
                styles.heatmapCell,
                { 
                  backgroundColor: `rgba(76, 175, 80, ${time.intensity})`,
                }
              ]}
            >
              <Text style={styles.heatmapHour}>{time.hour}</Text>
            </View>
            <Text style={styles.heatmapLabel}>{time.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCategoryTrends = () => (
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
              <View style={styles.trendChange}>
                <Text style={[
                  styles.trendChangeText,
                  { color: category.trend === 'up' ? Colors.light.error : Colors.light.primary }
                ]}>
                  {category.trend === 'up' ? '↗' : '↘'} {Math.abs(changePercent)}%
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderHiddenCosts = () => (
    <View style={styles.hiddenCostsCard}>
      <Text style={styles.sectionTitle}>Hidden Costs Revealed</Text>
      <Text style={styles.hiddenCostsSubtitle}>
        We found R{hiddenCosts.reduce((sum, cost) => sum + cost.amount, 0)} in hidden costs
      </Text>
      {hiddenCosts.map((cost, index) => (
        <View key={index} style={styles.hiddenCostItem}>
          <View style={styles.hiddenCostLeft}>
            <Text style={styles.hiddenCostType}>{cost.type}</Text>
            <Text style={styles.hiddenCostDescription}>{cost.description}</Text>
          </View>
          <Text style={styles.hiddenCostAmount}>R{cost.amount}</Text>
        </View>
      ))}
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsCard}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementsGrid}>
        {achievements.map(achievement => (
          <View 
            key={achievement.id} 
            style={[
              styles.achievementBadge,
              { opacity: achievement.earned ? 1 : 0.4 }
            ]}
          >
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAIInsights = () => (
    <View style={styles.aiInsightsContainer}>
      <Text style={styles.sectionTitle}>AI Insights</Text>
      {aiInsights.map(insight => (
        <View key={insight.id} style={[
          styles.aiInsightCard,
          { borderLeftColor: insight.priority === 'high' ? Colors.light.error : 
                            insight.priority === 'medium' ? Colors.light.secondary : Colors.light.primary }
        ]}>
          <View style={styles.aiInsightHeader}>
            <Text style={styles.aiInsightIcon}>{insight.icon}</Text>
            <Text style={styles.aiInsightTitle}>{insight.title}</Text>
          </View>
          <Text style={styles.aiInsightMessage}>{insight.message}</Text>
          <TouchableOpacity style={styles.aiInsightAction}>
            <Text style={styles.aiInsightActionText}>{insight.action}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial Insights</Text>
          
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {['This Week', 'This Month', 'Last Month'].map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  { backgroundColor: selectedPeriod === period ? Colors.light.primary : Colors.light.border }
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodText,
                  { color: selectedPeriod === period ? Colors.light.card : Colors.light.mutedText }
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Monthly Summary Card */}
        {renderMonthlySummary()}

        {/* Spending Patterns Charts */}
        {renderDayOfWeekChart()}

        {/* Time of Day Heatmap */}
        {renderTimeHeatmap()}

        {/* Category Trends */}
        {renderCategoryTrends()}

        {/* Hidden Costs Revealed */}
        {renderHiddenCosts()}

        {/* Achievement Badges */}
        {renderAchievements()}

        {/* AI Insights Cards */}
        {renderAIInsights()}
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
    marginBottom: 15,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.light.border,
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  chartCard: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  dayChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayBar: {
    width: 20,
    height: 80,
    backgroundColor: Colors.light.border,
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 5,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.light.mutedText,
    marginBottom: 2,
  },
  dayAmount: {
    fontSize: 8,
    color: Colors.light.text,
    fontWeight: '600',
  },
  heatmapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  heatmapItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
  },
  heatmapCell: {
    width: 60,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  heatmapHour: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.text,
  },
  heatmapLabel: {
    fontSize: 10,
    color: Colors.light.mutedText,
  },
  trendsCard: {
    backgroundColor: Colors.light.card,
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
    borderBottomColor: Colors.light.border,
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
    color: Colors.light.text,
  },
  trendRight: {
    alignItems: 'flex-end',
  },
  trendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  hiddenCostsCard: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.secondary,
  },
  hiddenCostsSubtitle: {
    fontSize: 14,
    color: Colors.light.secondary,
    marginBottom: 15,
    fontWeight: '500',
  },
  hiddenCostItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  hiddenCostLeft: {
    flex: 1,
  },
  hiddenCostType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  hiddenCostDescription: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  hiddenCostAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.error,
  },
  achievementsCard: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    width: '48%',
    backgroundColor: Colors.light.surfaceAlt,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    color: Colors.light.mutedText,
    textAlign: 'center',
  },
  aiInsightsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  aiInsightCard: {
    backgroundColor: Colors.light.card,
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
    color: Colors.light.text,
  },
  aiInsightMessage: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginBottom: 12,
    lineHeight: 20,
  },
  aiInsightAction: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  aiInsightActionText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '600',
  },
});

export default InsightsScreen;