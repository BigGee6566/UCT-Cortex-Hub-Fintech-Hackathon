import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert
} from 'react-native';

const BillsScreen = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [expandedBill, setExpandedBill] = useState(null);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDueDate, setNewBillDueDate] = useState('');

  const [bills, setBills] = useState([
    {
      id: 1,
      name: 'Electricity',
      amount: 450.00,
      dueDate: '2024-01-25',
      status: 'pending',
      category: 'Utilities',
      autoPay: true,
      lastPaid: '2023-12-25',
      provider: 'City Power',
      icon: '⚡'
    },
    {
      id: 2,
      name: 'Netflix',
      amount: 199.00,
      dueDate: '2024-01-20',
      status: 'paid',
      category: 'Entertainment',
      autoPay: true,
      lastPaid: '2024-01-20',
      provider: 'Netflix',
      icon: '🎬'
    },
    {
      id: 3,
      name: 'Cell Phone',
      amount: 299.00,
      dueDate: '2024-01-28',
      status: 'overdue',
      category: 'Communication',
      autoPay: false,
      lastPaid: '2023-12-28',
      provider: 'Vodacom',
      icon: '📱'
    },
    {
      id: 4,
      name: 'Internet',
      amount: 599.00,
      dueDate: '2024-01-30',
      status: 'pending',
      category: 'Utilities',
      autoPay: true,
      lastPaid: '2023-12-30',
      provider: 'Telkom',
      icon: '🌐'
    },
    {
      id: 5,
      name: 'Gym Membership',
      amount: 350.00,
      dueDate: '2024-02-01',
      status: 'upcoming',
      category: 'Health',
      autoPay: false,
      lastPaid: '2024-01-01',
      provider: 'Virgin Active',
      icon: '💪'
    }
  ]);

  const totalMonthlyBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidBills = bills.filter(bill => bill.status === 'paid').length;
  const pendingBills = bills.filter(bill => bill.status === 'pending').length;
  const overdueBills = bills.filter(bill => bill.status === 'overdue').length;

  const subscriptionInsights = {
    totalSubscriptions: bills.filter(bill => ['Entertainment', 'Software'].includes(bill.category)).length,
    monthlySubscriptionCost: bills.filter(bill => ['Entertainment', 'Software'].includes(bill.category))
      .reduce((sum, bill) => sum + bill.amount, 0),
    unusedSubscriptions: 1,
    potentialSavings: 199.00
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#FF5722';
      case 'upcoming': return '#2196F3';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Due Soon';
      case 'overdue': return 'Overdue';
      case 'upcoming': return 'Upcoming';
      default: return status;
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleAutoPay = (billId) => {
    setBills(bills.map(bill => 
      bill.id === billId 
        ? { ...bill, autoPay: !bill.autoPay }
        : bill
    ));
  };

  const handleAddBill = () => {
    if (newBillName && newBillAmount && newBillDueDate) {
      const newBill = {
        id: Date.now(),
        name: newBillName,
        amount: parseFloat(newBillAmount),
        dueDate: newBillDueDate,
        status: 'upcoming',
        category: 'Other',
        autoPay: false,
        lastPaid: null,
        provider: 'Custom',
        icon: '📄'
      };
      setBills([...bills, newBill]);
      setNewBillName('');
      setNewBillAmount('');
      setNewBillDueDate('');
      setShowAddBillModal(false);
      Alert.alert('Success', 'New bill added successfully!');
    }
  };

  const renderTimeline = () => {
    const sortedBills = [...bills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    return (
      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>Upcoming Bills</Text>
        {sortedBills.slice(0, 5).map((bill, index) => {
          const daysUntil = getDaysUntilDue(bill.dueDate);
          return (
            <View key={bill.id} style={styles.timelineItem}>
              <View style={styles.timelineDate}>
                <Text style={styles.timelineDays}>
                  {daysUntil < 0 ? 'Overdue' : daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                </Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineBill}>{bill.name}</Text>
                <Text style={styles.timelineAmount}>R{bill.amount.toFixed(2)}</Text>
              </View>
              <View style={[styles.timelineStatus, { backgroundColor: getStatusColor(bill.status) }]} />
            </View>
          );
        })}
      </View>
    );
  };

  const renderBillCard = (bill) => {
    const isExpanded = expandedBill === bill.id;
    const daysUntil = getDaysUntilDue(bill.dueDate);

    return (
      <View key={bill.id} style={styles.billCard}>
        <TouchableOpacity 
          style={styles.billHeader}
          onPress={() => setExpandedBill(isExpanded ? null : bill.id)}
        >
          <View style={styles.billHeaderLeft}>
            <Text style={styles.billIcon}>{bill.icon}</Text>
            <View style={styles.billInfo}>
              <Text style={styles.billName}>{bill.name}</Text>
              <Text style={styles.billProvider}>{bill.provider}</Text>
            </View>
          </View>
          <View style={styles.billHeaderRight}>
            <Text style={styles.billAmount}>R{bill.amount.toFixed(2)}</Text>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(bill.status) }]}>
              <Text style={styles.statusText}>{getStatusText(bill.status)}</Text>
            </View>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.billDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(bill.dueDate).toLocaleDateString()} 
                ({daysUntil < 0 ? 'Overdue' : daysUntil === 0 ? 'Today' : `${daysUntil} days`})
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{bill.category}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Paid:</Text>
              <Text style={styles.detailValue}>
                {bill.lastPaid ? new Date(bill.lastPaid).toLocaleDateString() : 'Never'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Auto-Pay:</Text>
              <Switch
                value={bill.autoPay}
                onValueChange={() => toggleAutoPay(bill.id)}
                trackColor={{ false: '#ddd', true: '#4CAF50' }}
                thumbColor={bill.autoPay ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.billActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Pay Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bills & Subscriptions</Text>
          
          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>
                📋 List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'calendar' && styles.activeToggle]}
              onPress={() => setViewMode('calendar')}
            >
              <Text style={[styles.toggleText, viewMode === 'calendar' && styles.activeToggleText]}>
                📅 Calendar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bills Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Monthly Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>R{totalMonthlyBills.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Bills</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{paidBills}</Text>
              <Text style={styles.statLabel}>Paid</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF9800' }]}>{pendingBills}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF5722' }]}>{overdueBills}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </View>
        </View>

        {/* Subscription Insights Card */}
        <View style={styles.insightsCard}>
          <Text style={styles.sectionTitle}>Subscription Insights</Text>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Active Subscriptions:</Text>
            <Text style={styles.insightValue}>{subscriptionInsights.totalSubscriptions}</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Monthly Cost:</Text>
            <Text style={styles.insightValue}>R{subscriptionInsights.monthlySubscriptionCost.toFixed(2)}</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Potential Savings:</Text>
            <Text style={[styles.insightValue, { color: '#4CAF50' }]}>
              R{subscriptionInsights.potentialSavings.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Timeline or Calendar View */}
        {viewMode === 'list' && renderTimeline()}

        {/* Add Bill Button */}
        <TouchableOpacity 
          style={styles.addBillButton}
          onPress={() => setShowAddBillModal(true)}
        >
          <Text style={styles.addBillIcon}>➕</Text>
          <Text style={styles.addBillText}>Add New Bill</Text>
        </TouchableOpacity>

        {/* Bill Cards */}
        <View style={styles.billsContainer}>
          <Text style={styles.sectionTitle}>All Bills</Text>
          {bills.map(renderBillCard)}
        </View>
      </ScrollView>

      {/* Add Bill Modal */}
      <Modal
        visible={showAddBillModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddBillModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Bill</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Bill Name"
              value={newBillName}
              onChangeText={setNewBillName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={newBillAmount}
              onChangeText={setNewBillAmount}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD)"
              value={newBillDueDate}
              onChangeText={setNewBillDueDate}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddBillModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddBill}
              >
                <Text style={styles.confirmButtonText}>Add Bill</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 15,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#2196F3',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#fff',
  },
  overviewCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  insightsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timeline: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timelineDate: {
    width: 60,
    alignItems: 'center',
  },
  timelineDays: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timelineContent: {
    flex: 1,
    marginLeft: 15,
  },
  timelineBill: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timelineAmount: {
    fontSize: 14,
    color: '#666',
  },
  timelineStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addBillButton: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  addBillIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  addBillText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  billsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  billHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  billProvider: {
    fontSize: 12,
    color: '#666',
  },
  billHeaderRight: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  billDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  billActions: {
    flexDirection: 'row',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    marginLeft: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BillsScreen;