import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';

const FinancialHealthScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('6M');

  const overallScore = 72;
  const previousScore = 68;
  const scoreChange = overallScore - previousScore;

  const categoryScores = [
    { 
      category: 'Budgeting', 
      score: 85, 
      maxScore: 100, 
      color: '#4CAF50',
      icon: '📊',
      tips: [
        'Great job staying within budget limits',
        'Consider setting up automatic savings transfers',
        'Review and adjust budgets monthly'
      ]
    },
    { 
      category: 'Savings', 
      score: 65, 
      maxScore: 100, 
      color: '#FF9800',
      icon: '💰',
      tips: [
        'Aim to save at least 20% of your income',
        'Set up an emergency fund covering 6 months expenses',
        'Consider high-yield savings accounts'
      ]
    },
    { 
      category: 'Debt Management', 
      score: 78, 
      maxScore: 100, 
      color: '#2196F3',
      icon: '💳',
      tips: [
        'Keep credit utilization below 30%',
        'Pay more than minimum payments when possible',
        'Consider debt consolidation for multiple debts'
      ]
    },
    { 
      category: 'Investment', 
      score: 45, 
      maxScore: 100, 
      color: '#FF5722',
      icon: '📈',
      tips: [
        'Start with low-cost index funds',
        'Diversify across different asset classes',
        'Consider tax-advantaged retirement accounts'
      ]
    },
    { 
      category: 'Financial Planning', 
      score: 70, 
      maxScore: 100, 
      color: '#9C27B0',
      icon: '🎯',
      tips: [
        'Set clear short and long-term financial goals',
        'Review insurance coverage annually',
        'Create a will and estate plan'
      ]
    }
  ];

  const historicalData = [
    { month: 'Jul', score: 58 },
    { month: 'Aug', score: 62 },
    { month: 'Sep', score: 65 },
    { month: 'Oct', score: 68 },
    { month: 'Nov', score: 70 },
    { month: 'Dec', score: 72 }
  ];

  const peerComparison = {
    yourScore: 72,
    averageScore: 65,
    topPercentile: 85,
    ageGroup: '25-35',
    incomeRange: 'R15k-R25k'
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#FF5722';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const renderCircularProgress = () => {
    const circumference = 2 * Math.PI * 60;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (overallScore / 100) * circumference;

    return (
      <View style={styles.circularProgressContainer}>
        <View style={styles.circularProgress}>
          <View style={styles.progressCircle}>
            <Text style={styles.scoreText}>{overallScore}</Text>
            <Text style={styles.scoreLabel}>Financial Health</Text>
            <Text style={[
              styles.scoreChange,
              { color: scoreChange >= 0 ? '#4CAF50' : '#FF5722' }
            ]}>
              {scoreChange >= 0 ? '+' : ''}{scoreChange} this month
            </Text>
          </View>
        </View>
        <Text style={[styles.overallLabel, { color: getScoreColor(overallScore) }]}>
          {getScoreLabel(overallScore)}
        </Text>
      </View>
    );
  };

  const renderCategoryBreakdown = () => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>Score Breakdown</Text>
      {categoryScores.map((category, index) => (
        <View key={index} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryLeft}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.category}</Text>
            </View>
            <Text style={[styles.categoryScore, { color: getScoreColor(category.score) }]}>
              {category.score}/100
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${category.score}%`,
                    backgroundColor: getScoreColor(category.score)
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Tips to Improve:</Text>
            {category.tips.map((tip, tipIndex) => (
              <Text key={tipIndex} style={styles.tipText}>• {tip}</Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderHistoricalGraph = () => (
    <View style={styles.graphSection}>
      <View style={styles.graphHeader}>
        <Text style={styles.sectionTitle}>Score History</Text>
        <View style={styles.periodSelector}>
          {['3M', '6M', '1Y'].map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                { backgroundColor: selectedPeriod === period ? '#2196F3' : '#f0f0f0' }
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                { color: selectedPeriod === period ? '#fff' : '#666' }
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.graphContainer}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>100</Text>
          <Text style={styles.axisLabel}>75</Text>
          <Text style={styles.axisLabel}>50</Text>
          <Text style={styles.axisLabel}>25</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>
        
        <View style={styles.graphArea}>
          {historicalData.map((data, index) => (
            <View key={index} style={styles.graphColumn}>
              <View style={styles.graphBar}>
                <View 
                  style={[
                    styles.graphBarFill,
                    { 
                      height: `${data.score}%`,
                      backgroundColor: getScoreColor(data.score)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.monthLabel}>{data.month}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPeerComparison = () => (
    <View style={styles.comparisonSection}>
      <Text style={styles.sectionTitle}>How You Compare</Text>
      <Text style={styles.comparisonSubtitle}>
        Compared to others in your age group ({peerComparison.ageGroup}) and income range ({peerComparison.incomeRange})
      </Text>
      
      <View style={styles.comparisonBars}>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Your Score</Text>
          <View style={styles.comparisonBar}>
            <View 
              style={[
                styles.comparisonBarFill,
                { 
                  width: `${(peerComparison.yourScore / 100) * 100}%`,
                  backgroundColor: '#4CAF50'
                }
              ]} 
            />
          </View>
          <Text style={styles.comparisonScore}>{peerComparison.yourScore}</Text>
        </View>

        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Average</Text>
          <View style={styles.comparisonBar}>
            <View 
              style={[
                styles.comparisonBarFill,
                { 
                  width: `${(peerComparison.averageScore / 100) * 100}%`,
                  backgroundColor: '#FF9800'
                }
              ]} 
            />
          </View>
          <Text style={styles.comparisonScore}>{peerComparison.averageScore}</Text>
        </View>

        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Top 10%</Text>
          <View style={styles.comparisonBar}>
            <View 
              style={[
                styles.comparisonBarFill,
                { 
                  width: `${(peerComparison.topPercentile / 100) * 100}%`,
                  backgroundColor: '#2196F3'
                }
              ]} 
            />
          </View>
          <Text style={styles.comparisonScore}>{peerComparison.topPercentile}</Text>
        </View>
      </View>

      <View style={styles.comparisonInsight}>
        <Text style={styles.insightText}>
          🎉 You're performing {peerComparison.yourScore - peerComparison.averageScore} points above average!
        </Text>
        <Text style={styles.insightSubtext}>
          Keep up the great work. Focus on Investment to reach the top 10%.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Financial Health</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Overall Score */}
        {renderCircularProgress()}

        {/* Category Breakdown */}
        {renderCategoryBreakdown()}

        {/* Historical Graph */}
        {renderHistoricalGraph()}

        {/* Peer Comparison */}
        {renderPeerComparison()}

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📋 Get Personalized Action Plan</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  circularProgressContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  circularProgress: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressCircle: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  scoreChange: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  categorySection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  categoryItem: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tipsContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginBottom: 3,
  },
  graphSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  graphContainer: {
    flexDirection: 'row',
    height: 120,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 10,
    width: 30,
  },
  axisLabel: {
    fontSize: 10,
    color: '#666',
  },
  graphArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  graphColumn: {
    alignItems: 'center',
    flex: 1,
  },
  graphBar: {
    width: 20,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  graphBarFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 5,
  },
  monthLabel: {
    fontSize: 10,
    color: '#666',
  },
  comparisonSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  comparisonSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    lineHeight: 18,
  },
  comparisonBars: {
    marginBottom: 20,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#333',
    width: 80,
  },
  comparisonBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  comparisonBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  comparisonScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 30,
  },
  comparisonInsight: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 5,
  },
  insightSubtext: {
    fontSize: 12,
    color: '#2E7D32',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FinancialHealthScreen;