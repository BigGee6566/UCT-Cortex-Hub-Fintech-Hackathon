import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MoneyOverviewCard = ({ totalBalance, daysRemaining, isRunningLow }) => {
  const progressPercentage = Math.max(0, Math.min(100, (daysRemaining / 30) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Total Balance</Text>
        {isRunningLow && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>!</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.balance}>R{totalBalance.toFixed(2)}</Text>
      
      <View style={styles.daysContainer}>
        <Text style={styles.daysText}>{daysRemaining} days remaining</Text>
        <Text style={styles.daysSubtext}>until next payday</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: isRunningLow ? '#FF5722' : '#4CAF50'
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{progressPercentage.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  alertBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  daysContainer: {
    marginBottom: 15,
  },
  daysText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  daysSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default MoneyOverviewCard;