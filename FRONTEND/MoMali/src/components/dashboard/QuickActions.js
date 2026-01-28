import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const QuickActions = () => {
  const actions = [
    { id: 1, title: 'Add Money', icon: '💰', color: '#4CAF50' },
    { id: 2, title: 'Pay Bills', icon: '💳', color: '#2196F3' },
    { id: 3, title: 'Budget Plan', icon: '📊', color: '#FF9800' },
    { id: 4, title: 'Insights', icon: '📈', color: '#9C27B0' }
  ];

  const handleActionPress = (action) => {
    console.log(`${action.title} pressed`);
  };

  return (
    <View style={styles.container}>
      {actions.map(action => (
        <TouchableOpacity 
          key={action.id}
          style={[styles.actionButton, { borderColor: action.color }]}
          onPress={() => handleActionPress(action)}
        >
          <Text style={styles.icon}>{action.icon}</Text>
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default QuickActions;