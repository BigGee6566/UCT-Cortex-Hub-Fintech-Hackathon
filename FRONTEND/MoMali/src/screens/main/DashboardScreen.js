import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import MoneyOverviewCard from '../../components/dashboard/MoneyOverviewCard';
import PocketCard from '../../components/dashboard/PocketCard';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentActivity from '../../components/dashboard/RecentActivity';

const DashboardScreen = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const pockets = [
    { id: 1, name: 'Daily Spending', amount: 450, budget: 600, color: '#4CAF50' },
    { id: 2, name: 'Bills & Subscriptions', amount: 280, budget: 400, color: '#FF9800' },
    { id: 3, name: 'Emergency Buffer', amount: 1200, budget: 1500, color: '#2196F3' }
  ];

  const recentTransactions = [
    { id: 1, title: 'Grocery Store', amount: -45.50, category: 'Food', time: '2 hours ago' },
    { id: 2, title: 'Salary Deposit', amount: 2500.00, category: 'Income', time: '1 day ago' },
    { id: 3, title: 'Netflix', amount: -15.99, category: 'Entertainment', time: '2 days ago' },
    { id: 4, title: 'Gas Station', amount: -35.20, category: 'Transport', time: '3 days ago' },
    { id: 5, title: 'Coffee Shop', amount: -4.50, category: 'Food', time: '3 days ago' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
          <View style={styles.profileIcon}>
            <Text style={styles.profileInitial}>U</Text>
          </View>
        </View>

        {/* Money Overview Card */}
        <MoneyOverviewCard 
          totalBalance={3250.75}
          daysRemaining={12}
          isRunningLow={false}
        />

        {/* Pockets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Pockets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pocketsScroll}>
            {pockets.map(pocket => (
              <PocketCard key={pocket.id} pocket={pocket} />
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActions />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <RecentActivity transactions={recentTransactions} />
        </View>

        {/* Active Rewards Card */}
        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsTitle}>🎉 Active Rewards</Text>
          <Text style={styles.rewardsText}>Save R100 this week and earn 50 points!</Text>
          <Text style={styles.rewardsProgress}>Progress: 65% complete</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  pocketsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  rewardsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  rewardsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rewardsProgress: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
});

export default DashboardScreen;