import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';

const TransactionsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState('This Month');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ['All', 'Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Income'];
  const dateRanges = ['This Week', 'This Month', 'Last Month', 'Last 3 Months'];

  const mockTransactions = [
    { id: 1, title: 'Grocery Store', amount: -45.50, category: 'Food', date: '2024-01-15', time: '14:30' },
    { id: 2, title: 'Salary Deposit', amount: 2500.00, category: 'Income', date: '2024-01-15', time: '09:00' },
    { id: 3, title: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', date: '2024-01-14', time: '12:00' },
    { id: 4, title: 'Gas Station', amount: -35.20, category: 'Transport', date: '2024-01-14', time: '08:15' },
    { id: 5, title: 'Coffee Shop', amount: -4.50, category: 'Food', date: '2024-01-13', time: '16:45' },
    { id: 6, title: 'Online Shopping', amount: -89.99, category: 'Shopping', date: '2024-01-13', time: '20:30' },
    { id: 7, title: 'Electricity Bill', amount: -120.00, category: 'Bills', date: '2024-01-12', time: '11:00' },
    { id: 8, title: 'Restaurant', amount: -67.80, category: 'Food', date: '2024-01-12', time: '19:15' },
  ];

  useEffect(() => {
    setTransactions(mockTransactions);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setTransactions([...mockTransactions]);
      setRefreshing(false);
    }, 1000);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes('All') || 
                           selectedCategories.includes(transaction.category);
    return matchesSearch && matchesCategory;
  });

  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  const monthlyTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const monthlyIncome = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const toggleCategory = (category) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
    } else {
      const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories.filter(c => c !== 'All'), category];
      setSelectedCategories(newCategories);
    }
  };

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

  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={styles.iconContainer}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionTime}>{item.time}</Text>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.amount >= 0 ? '#4CAF50' : '#333' }
      ]}>
        {item.amount >= 0 ? '+' : ''}R{Math.abs(item.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  const renderDateGroup = ({ item }) => {
    const [date, dayTransactions] = item;
    const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return (
      <View style={styles.dateGroup}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{new Date(date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}</Text>
          <Text style={[
            styles.dayTotal,
            { color: dayTotal >= 0 ? '#4CAF50' : '#FF5722' }
          ]}>
            {dayTotal >= 0 ? '+' : ''}R{Math.abs(dayTotal).toFixed(2)}
          </Text>
        </View>
        {dayTransactions.map(transaction => (
          <View key={transaction.id}>
            {renderTransaction({ item: transaction })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Date Range Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRangeContainer}>
        {dateRanges.map(range => (
          <TouchableOpacity
            key={range}
            style={[
              styles.dateRangeButton,
              { backgroundColor: dateRange === range ? '#2196F3' : '#f0f0f0' }
            ]}
            onPress={() => setDateRange(range)}
          >
            <Text style={[
              styles.dateRangeText,
              { color: dateRange === range ? '#fff' : '#333' }
            ]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Monthly Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{dateRange} Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>
              +R{monthlyIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#FF5722' }]}>
              -R{monthlyExpenses.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={[
              styles.summaryAmount,
              { color: monthlyTotal >= 0 ? '#4CAF50' : '#FF5722' }
            ]}>
              {monthlyTotal >= 0 ? '+' : ''}R{Math.abs(monthlyTotal).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Category Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              { 
                backgroundColor: selectedCategories.includes(category) ? '#2196F3' : '#f0f0f0' 
              }
            ]}
            onPress={() => toggleCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              { color: selectedCategories.includes(category) ? '#fff' : '#333' }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <FlatList
        data={Object.entries(groupedTransactions)}
        renderItem={renderDateGroup}
        keyExtractor={([date]) => date}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        style={styles.transactionsList}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 16,
  },
  dateRangeContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  dateRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    flex: 1,
  },
  dateGroup: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dayTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
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
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TransactionsScreen;