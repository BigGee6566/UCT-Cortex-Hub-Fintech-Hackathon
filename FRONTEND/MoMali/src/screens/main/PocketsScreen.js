import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';

const PocketsScreen = () => {
  const [expandedPocket, setExpandedPocket] = useState(null);
  const [showMoveMoneyModal, setShowMoveMoneyModal] = useState(false);
  const [showCreatePocketModal, setShowCreatePocketModal] = useState(false);
  const [newPocketName, setNewPocketName] = useState('');
  const [newPocketBudget, setNewPocketBudget] = useState('');
  const [fromPocket, setFromPocket] = useState(null);
  const [toPocket, setToPocket] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const [pockets, setPockets] = useState([
    { 
      id: 1, 
      name: 'Daily Spending', 
      amount: 450, 
      budget: 600, 
      color: '#4CAF50',
      description: 'Food, transport, and daily expenses',
      transactions: [
        { id: 1, title: 'Grocery Store', amount: -45.50, date: '2024-01-15' },
        { id: 2, title: 'Coffee Shop', amount: -4.50, date: '2024-01-13' }
      ]
    },
    { 
      id: 2, 
      name: 'Bills & Subscriptions', 
      amount: 280, 
      budget: 400, 
      color: '#FF9800',
      description: 'Monthly bills and recurring payments',
      transactions: [
        { id: 3, title: 'Netflix', amount: -15.99, date: '2024-01-14' },
        { id: 4, title: 'Electricity Bill', amount: -120.00, date: '2024-01-12' }
      ]
    },
    { 
      id: 3, 
      name: 'Emergency Buffer', 
      amount: 1200, 
      budget: 1500, 
      color: '#2196F3',
      description: 'Emergency fund for unexpected expenses',
      transactions: []
    },
    { 
      id: 4, 
      name: 'Savings Goal', 
      amount: 800, 
      budget: 1000, 
      color: '#9C27B0',
      description: 'Saving for vacation',
      transactions: [
        { id: 5, title: 'Monthly Transfer', amount: 200, date: '2024-01-01' }
      ]
    }
  ]);

  const totalAmount = pockets.reduce((sum, pocket) => sum + pocket.amount, 0);
  const totalBudget = pockets.reduce((sum, pocket) => sum + pocket.budget, 0);

  const toggleExpanded = (pocketId) => {
    setExpandedPocket(expandedPocket === pocketId ? null : pocketId);
  };

  const handleCreatePocket = () => {
    if (newPocketName && newPocketBudget) {
      const newPocket = {
        id: Date.now(),
        name: newPocketName,
        amount: 0,
        budget: parseFloat(newPocketBudget),
        color: '#607D8B',
        description: 'Custom pocket',
        transactions: []
      };
      setPockets([...pockets, newPocket]);
      setNewPocketName('');
      setNewPocketBudget('');
      setShowCreatePocketModal(false);
      Alert.alert('Success', 'New pocket created successfully!');
    }
  };

  const renderChart = () => {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartCircle}>
          <Text style={styles.chartCenterText}>R{totalAmount.toFixed(0)}</Text>
          <Text style={styles.chartSubText}>Total</Text>
        </View>
        <View style={styles.chartLegend}>
          {pockets.map(pocket => {
            const percentage = ((pocket.amount / totalAmount) * 100).toFixed(1);
            return (
              <View key={pocket.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: pocket.color }]} />
                <Text style={styles.legendText}>
                  {pocket.name} ({percentage}%)
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderPocketCard = (pocket) => {
    const isExpanded = expandedPocket === pocket.id;
    const progressPercentage = (pocket.amount / pocket.budget) * 100;

    return (
      <View key={pocket.id} style={styles.pocketCard}>
        <TouchableOpacity 
          style={styles.pocketHeader}
          onPress={() => toggleExpanded(pocket.id)}
        >
          <View style={styles.pocketHeaderLeft}>
            <View style={[styles.pocketColorBar, { backgroundColor: pocket.color }]} />
            <View style={styles.pocketInfo}>
              <Text style={styles.pocketName}>{pocket.name}</Text>
              <Text style={styles.pocketDescription}>{pocket.description}</Text>
            </View>
          </View>
          <View style={styles.pocketHeaderRight}>
            <Text style={styles.pocketAmount}>R{pocket.amount}</Text>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(100, progressPercentage)}%`,
                  backgroundColor: pocket.color
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            R{pocket.amount} / R{pocket.budget} ({progressPercentage.toFixed(0)}%)
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton}>
                <Text style={styles.quickActionIcon}>💰</Text>
                <Text style={styles.quickActionText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Text style={styles.quickActionIcon}>📊</Text>
                <Text style={styles.quickActionText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Text style={styles.quickActionIcon}>⚙️</Text>
                <Text style={styles.quickActionText}>Settings</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <View style={styles.recentTransactions}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {pocket.transactions.length > 0 ? (
                pocket.transactions.slice(0, 3).map(transaction => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionTitle}>{transaction.title}</Text>
                      <Text style={styles.transactionDate}>{transaction.date}</Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.amount >= 0 ? '#4CAF50' : '#333' }
                    ]}>
                      {transaction.amount >= 0 ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noTransactions}>No recent transactions</Text>
              )}
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
          <Text style={styles.headerTitle}>My Pockets</Text>
        </View>

        {/* Total Overview Card */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Total Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>R{totalAmount.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Amount</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>R{totalBudget.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Budget</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pockets.length}</Text>
              <Text style={styles.statLabel}>Active Pockets</Text>
            </View>
          </View>
        </View>

        {/* Visual Distribution Chart */}
        {renderChart()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowMoveMoneyModal(true)}
          >
            <Text style={styles.actionButtonIcon}>🔄</Text>
            <Text style={styles.actionButtonText}>Move Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowCreatePocketModal(true)}
          >
            <Text style={styles.actionButtonIcon}>➕</Text>
            <Text style={styles.actionButtonText}>Create Pocket</Text>
          </TouchableOpacity>
        </View>

        {/* Expandable Pocket Cards */}
        <View style={styles.pocketsContainer}>
          {pockets.map(renderPocketCard)}
        </View>
      </ScrollView>

      {/* Move Money Modal */}
      <Modal
        visible={showMoveMoneyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMoveMoneyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move Money Between Pockets</Text>
            
            {/* From Pocket Dropdown */}
            <Text style={styles.dropdownLabel}>From Pocket</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowFromDropdown(!showFromDropdown)}
            >
              <Text style={styles.dropdownText}>
                {fromPocket ? fromPocket.name : 'Select source pocket'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            
            {showFromDropdown && (
              <View style={styles.dropdownOptions}>
                {pockets.filter(p => p.amount > 0).map(pocket => (
                  <TouchableOpacity
                    key={pocket.id}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setFromPocket(pocket);
                      setShowFromDropdown(false);
                    }}
                  >
                    <View style={[styles.pocketDot, { backgroundColor: pocket.color }]} />
                    <Text style={styles.dropdownOptionText}>
                      {pocket.name} (R{pocket.amount})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Animated Transfer Visualization */}
            {fromPocket && toPocket && (
              <View style={styles.transferVisualization}>
                <View style={styles.transferRow}>
                  <View style={[styles.transferPocket, { backgroundColor: fromPocket.color }]}>
                    <Text style={styles.transferPocketText}>{fromPocket.name}</Text>
                  </View>
                  <View style={styles.transferArrow}>
                    <Text style={[styles.transferArrowText, { opacity: isTransferring ? 1 : 0.3 }]}>→</Text>
                  </View>
                  <View style={[styles.transferPocket, { backgroundColor: toPocket.color }]}>
                    <Text style={styles.transferPocketText}>{toPocket.name}</Text>
                  </View>
                </View>
                {transferAmount && (
                  <Text style={styles.transferAmountDisplay}>R{transferAmount}</Text>
                )}
              </View>
            )}

            {/* To Pocket Dropdown */}
            <Text style={styles.dropdownLabel}>To Pocket</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowToDropdown(!showToDropdown)}
            >
              <Text style={styles.dropdownText}>
                {toPocket ? toPocket.name : 'Select destination pocket'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            
            {showToDropdown && (
              <View style={styles.dropdownOptions}>
                {pockets.filter(p => p.id !== fromPocket?.id).map(pocket => (
                  <TouchableOpacity
                    key={pocket.id}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setToPocket(pocket);
                      setShowToDropdown(false);
                    }}
                  >
                    <View style={[styles.pocketDot, { backgroundColor: pocket.color }]} />
                    <Text style={styles.dropdownOptionText}>
                      {pocket.name} (R{pocket.amount})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Amount Input */}
            <Text style={styles.dropdownLabel}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount to transfer"
              value={transferAmount}
              onChangeText={setTransferAmount}
              keyboardType="numeric"
            />
            
            {fromPocket && transferAmount && (
              <Text style={styles.availableAmount}>
                Available: R{fromPocket.amount} | 
                Remaining: R{(fromPocket.amount - parseFloat(transferAmount || 0)).toFixed(2)}
              </Text>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowMoveMoneyModal(false);
                  setFromPocket(null);
                  setToPocket(null);
                  setTransferAmount('');
                  setShowFromDropdown(false);
                  setShowToDropdown(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { opacity: fromPocket && toPocket && transferAmount ? 1 : 0.5 }
                ]}
                disabled={!fromPocket || !toPocket || !transferAmount}
                onPress={() => {
                  setIsTransferring(true);
                  setTimeout(() => {
                    const amount = parseFloat(transferAmount);
                    const updatedPockets = pockets.map(pocket => {
                      if (pocket.id === fromPocket.id) {
                        return { ...pocket, amount: pocket.amount - amount };
                      }
                      if (pocket.id === toPocket.id) {
                        return { ...pocket, amount: pocket.amount + amount };
                      }
                      return pocket;
                    });
                    setPockets(updatedPockets);
                    setIsTransferring(false);
                    setShowMoveMoneyModal(false);
                    setFromPocket(null);
                    setToPocket(null);
                    setTransferAmount('');
                    Alert.alert('Success', `R${amount} transferred successfully!`);
                  }, 1500);
                }}
              >
                <Text style={styles.confirmButtonText}>
                  {isTransferring ? 'Transferring...' : 'Confirm Transfer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Pocket Modal */}
      <Modal
        visible={showCreatePocketModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreatePocketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Pocket</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Pocket Name"
              value={newPocketName}
              onChangeText={setNewPocketName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Budget Amount"
              value={newPocketBudget}
              onChangeText={setNewPocketBudget}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreatePocketModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCreatePocket}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
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
  chartContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  chartCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartCenterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chartSubText: {
    fontSize: 12,
    color: '#666',
  },
  chartLegend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
    maxHeight: 150,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  pocketDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  availableAmount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  transferVisualization: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  transferPocket: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  transferPocketText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  transferArrow: {
    marginHorizontal: 15,
  },
  transferArrowText: {
    fontSize: 24,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  transferAmountDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pocketsContainer: {
    paddingHorizontal: 15,
  },
  pocketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  pocketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  pocketHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pocketColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  pocketInfo: {
    flex: 1,
  },
  pocketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  pocketDescription: {
    fontSize: 12,
    color: '#666',
  },
  pocketHeaderRight: {
    alignItems: 'flex-end',
  },
  pocketAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 10,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
  },
  recentTransactions: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noTransactions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
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
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
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
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PocketsScreen;