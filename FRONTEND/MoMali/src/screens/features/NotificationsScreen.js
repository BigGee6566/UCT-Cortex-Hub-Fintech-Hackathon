import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Colors } from '@/constants/theme';

const NotificationsScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'transaction',
      title: 'Payment Received',
      message: 'You received R2,500 from Salary Deposit',
      time: '2 hours ago',
      read: false,
      icon: '💰'
    },
    {
      id: 2,
      type: 'budget',
      title: 'Budget Alert',
      message: 'You\'ve spent 85% of your Food budget',
      time: '4 hours ago',
      read: false,
      icon: '⚠️'
    },
    {
      id: 3,
      type: 'security',
      title: 'Login Detected',
      message: 'New login from iPhone 14',
      time: '1 day ago',
      read: true,
      icon: '🔒'
    },
    {
      id: 4,
      type: 'transaction',
      title: 'Payment Made',
      message: 'R120 paid to Electricity Bill',
      time: '1 day ago',
      read: false,
      icon: '💳'
    },
    {
      id: 5,
      type: 'promotion',
      title: 'Special Offer',
      message: '20% cashback at Woolworths this weekend',
      time: '2 days ago',
      read: true,
      icon: '🎉'
    },
    {
      id: 6,
      type: 'budget',
      title: 'Budget Exceeded',
      message: 'Entertainment budget exceeded by R45',
      time: '3 days ago',
      read: false,
      icon: '🚨'
    }
  ]);

  const filterTypes = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'transaction', label: 'Transactions', count: notifications.filter(n => n.type === 'transaction').length },
    { key: 'budget', label: 'Budget', count: notifications.filter(n => n.type === 'budget').length },
    { key: 'security', label: 'Security', count: notifications.filter(n => n.type === 'security').length },
    { key: 'promotion', label: 'Offers', count: notifications.filter(n => n.type === 'promotion').length }
  ];

  const filteredNotifications = selectedFilter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === selectedFilter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => setNotifications([])
        }
      ]
    );
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
      >
        {filterTypes.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilter
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.selectedFilterText
            ]}>
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id.toString()}
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyMessage}>
              {selectedFilter === 'all' 
                ? 'You\'re all caught up!' 
                : `No ${selectedFilter} notifications`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    fontSize: 24,
    color: Colors.light.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  clearButton: {
    fontSize: 16,
    color: Colors.light.error,
    fontWeight: '600',
  },
  unreadBanner: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  unreadText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: Colors.light.card,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    marginRight: 10,
  },
  selectedFilter: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.light.mutedText,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: Colors.light.text,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadItem: {
    borderLeftColor: Colors.light.primary,
    backgroundColor: '#FAFAFA',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.light.mutedText,
    textAlign: 'center',
  },
});

export default NotificationsScreen;