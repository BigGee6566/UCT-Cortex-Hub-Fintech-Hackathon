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
  ScrollView
} from 'react-native';
import FilterModal from '../../components/FilterModal';
import { Colors } from '@/constants/theme';

const TransactionsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    pocket: null,
    categories: [],
    dateRange: { preset: 'month' },
    type: 'all'
  });



  const mockTransactions = [
    { id: 1, title: 'Grocery Store', amount: -45.50, category: 'Food', date: '2024-01-15', time: '14:30', pocketId: 1 },
    { id: 2, title: 'Salary Deposit', amount: 2500.00, category: 'Income', date: '2024-01-15', time: '09:00', pocketId: null },
    { id: 3, title: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', date: '2024-01-14', time: '12:00', pocketId: 2 },
    { id: 4, title: 'Gas Station', amount: -35.20, category: 'Transport', date: '2024-01-14', time: '08:15', pocketId: 1 },
    { id: 5, title: 'Coffee Shop', amount: -4.50, category: 'Food', date: '2024-01-13', time: '16:45', pocketId: 1 },
    { id: 6, title: 'Online Shopping', amount: -89.99, category: 'Shopping', date: '2024-01-13', time: '20:30', pocketId: 1 },
    { id: 7, title: 'Electricity Bill', amount: -120.00, category: 'Bills', date: '2024-01-12', time: '11:00', pocketId: 2 },
    { id: 8, title: 'Restaurant', amount: -67.80, category: 'Food', date: '2024-01-12', time: '19:15', pocketId: 1 },
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
    
    const matchesCategory = activeFilters.categories.length === 0 || 
                           activeFilters.categories.includes(transaction.category);
    
    const matchesType = activeFilters.type === 'all' || 
                       (activeFilters.type === 'income' && transaction.amount > 0) ||
                       (activeFilters.type === 'spending' && transaction.amount < 0);
    
    const matchesPocket = !activeFilters.pocket || transaction.pocketId === activeFilters.pocket.id;
    
    return matchesSearch && matchesCategory && matchesType && matchesPocket;
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

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.pocket) count++;
    if (activeFilters.categories.length > 0) count++;
    if (activeFilters.type !== 'all') count++;
    if (activeFilters.dateRange.preset !== 'month') count++;
    return count;
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
        { color: item.amount >= 0 ? Colors.light.primary : Colors.light.text }
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
            { color: dayTotal >= 0 ? Colors.light.primary : Colors.light.error }
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
          style={[styles.filterButton, getActiveFilterCount() > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>⚙️</Text>
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active
          </Text>
          <TouchableOpacity 
            onPress={() => setActiveFilters({ pocket: null, categories: [], dateRange: { preset: 'month' }, type: 'all' })}
            style={styles.clearFiltersButton}
          >
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Monthly Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Filtered Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: Colors.light.primary }]}>
              +R{monthlyIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: Colors.light.error }]}>
              -R{monthlyExpenses.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={[
              styles.summaryAmount,
              { color: monthlyTotal >= 0 ? Colors.light.primary : Colors.light.error }
            ]}>
              {monthlyTotal >= 0 ? '+' : ''}R{Math.abs(monthlyTotal).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>



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
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={activeFilters}
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
    backgroundColor: Colors.light.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: Colors.light.card,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#1976D2',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.light.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: Colors.light.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterButtonText: {
    fontSize: 16,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1976D2',
    borderRadius: 15,
  },
  clearFiltersText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
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
    color: Colors.light.mutedText,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  transactionsList: {
    flex: 1,
  },
  dateGroup: {
    backgroundColor: Colors.light.card,
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
    backgroundColor: Colors.light.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
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
    borderBottomColor: Colors.light.border,
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
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },

});

export default TransactionsScreen;