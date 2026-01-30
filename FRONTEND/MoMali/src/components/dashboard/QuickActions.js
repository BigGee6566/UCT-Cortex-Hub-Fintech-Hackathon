import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';

const QuickActions = () => {
  const router = useRouter();
  const actions = [
    { id: 1, title: 'Add Money', icon: 'account-balance-wallet', color: Colors.light.primary, route: '/bank-providers' },
    { id: 2, title: 'Pay Bills', icon: 'credit-card', color: Colors.light.secondary, route: '/bills' },
    { id: 3, title: 'Budget Plan', icon: 'pie-chart', color: Colors.light.secondary, route: '/(tabs)/budgets' },
    { id: 4, title: 'Insights', icon: 'insights', color: Colors.light.primary, route: '/(tabs)/explore' }
  ];

  const handleActionPress = (action) => {
    if (action.route) {
      router.push(action.route);
    }
  };

  return (
    <View style={styles.container}>
      {actions.map(action => (
        <TouchableOpacity 
          key={action.id}
          style={[styles.actionButton, { borderColor: action.color }]}
          onPress={() => handleActionPress(action)}
        >
          <MaterialIcons name={action.icon} size={26} color={action.color} />
          <Text style={styles.title}>{action.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    width: '48%',
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
});

export default QuickActions;
