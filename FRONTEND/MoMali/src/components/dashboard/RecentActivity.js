import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';

const RecentActivity = ({ transactions }) => {
  const router = useRouter();
  const getCategoryIcon = (category) => {
    const icons = {
      Food: { name: 'restaurant', color: Colors.light.primary },
      Income: { name: 'payments', color: Colors.light.primary },
      Entertainment: { name: 'movie', color: Colors.light.secondary },
      Transport: { name: 'local-gas-station', color: Colors.light.secondary },
      Bills: { name: 'credit-card', color: Colors.light.secondary },
      Shopping: { name: 'shopping-bag', color: Colors.light.error }
    };
    return icons[category] || { name: 'attach-money', color: Colors.light.mutedText };
  };

  const formatAmount = (amount) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}R${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {transactions.map(transaction => (
        <TouchableOpacity
          key={transaction.id}
          style={styles.transactionItem}
          onPress={() => router.push('/transaction-detail')}
        >
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={getCategoryIcon(transaction.category).name}
                size={20}
                color={getCategoryIcon(transaction.category).color}
              />
            </View>
            <View style={styles.details}>
              <Text style={styles.title}>{transaction.title}</Text>
              <Text style={styles.time}>{transaction.time}</Text>
            </View>
          </View>
          
          <View style={styles.rightSection}>
            <Text style={[
              styles.amount,
              { color: transaction.amount >= 0 ? Colors.light.primary : Colors.light.text }
            ]}>
              {formatAmount(transaction.amount)}
            </Text>
            <Text style={styles.category}>{transaction.category}</Text>
          </View>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push('/(tabs)/transactions')}>
        <Text style={styles.viewAllText}>View All Transactions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
    backgroundColor: Colors.light.surfaceAlt,
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
    color: Colors.light.text,
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: Colors.light.mutedText,
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
    color: Colors.light.mutedText,
  },
  viewAllButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});

export default RecentActivity;
