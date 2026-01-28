import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const RecentActivity = ({ transactions }) => {
  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍽️',
      'Income': '💰',
      'Entertainment': '🎬',
      'Transport': '🚗',
      'Bills': '💳',
      'Shopping': '🛍️'
    };
    return icons[category] || '💸';
  };

  const formatAmount = (amount) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}R${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {transactions.map(transaction => (
        <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.categoryIcon}>
                {getCategoryIcon(transaction.category)}
              </Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.title}>{transaction.title}</Text>
              <Text style={styles.time}>{transaction.time}</Text>
            </View>
          </View>
          
          <View style={styles.rightSection}>
            <Text style={[
              styles.amount,
              { color: transaction.amount >= 0 ? '#4CAF50' : '#333' }
            ]}>
              {formatAmount(transaction.amount)}
            </Text>
            <Text style={styles.category}>{transaction.category}</Text>
          </View>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All Transactions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 18,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#666',
  },
  viewAllButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default RecentActivity;