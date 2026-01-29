import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PocketCard = ({ pocket }) => {
  const progressPercentage = (pocket.amount / pocket.budget) * 100;
  const isOverBudget = progressPercentage > 100;

  return (
    <TouchableOpacity style={styles.card}>
      <View style={[styles.colorBar, { backgroundColor: pocket.color }]} />
      
      <View style={styles.content}>
        <Text style={styles.name}>{pocket.name}</Text>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>R{pocket.amount}</Text>
          <Text style={styles.budget}>/ R{pocket.budget}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(100, progressPercentage)}%`,
                  backgroundColor: isOverBudget ? '#FF5722' : pocket.color
                }
              ]} 
            />
          </View>
          <Text style={[
            styles.progressText,
            { color: isOverBudget ? '#FF5722' : '#666' }
          ]}>
            {progressPercentage.toFixed(0)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    width: 160,
    marginRight: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  colorBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 15,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  budget: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default PocketCard;