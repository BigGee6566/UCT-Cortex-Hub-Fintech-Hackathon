import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { Colors } from '@/constants/theme';

const TransactionDetailScreen = ({ route, navigation }) => {
  const { transaction } = route?.params || {
    transaction: {
      id: 1,
      title: 'Grocery Store',
      amount: -45.50,
      category: 'Food',
      date: '2024-01-15',
      time: '14:30',
      pocket: 'Daily Spending',
      paymentMethod: 'Debit Card',
      merchant: 'Pick n Pay'
    }
  };

  const [note, setNote] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);

  const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Income', 'Other'];
  const pockets = ['Daily Spending', 'Bills & Subscriptions', 'Emergency Buffer'];

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍽️',
      'Transport': '🚗',
      'Entertainment': '🎬',
      'Bills': '💳',
      'Shopping': '🛍️',
      'Income': '💰',
      'Other': '💸'
    };
    return icons[category] || '💸';
  };

  const getMerchantIcon = (merchant) => {
    const icons = {
      'Pick n Pay': '🛒',
      'Netflix': '🎬',
      'Shell': '⛽',
      'Starbucks': '☕',
      'Uber': '🚗',
      'Woolworths': '🛍️'
    };
    return icons[merchant] || '🏪';
  };

  const handleSaveNote = () => {
    Alert.alert('Success', 'Note saved successfully');
  };

  const handleRecategorize = (newCategory) => {
    setSelectedCategory(newCategory);
    setShowCategoryModal(false);
    Alert.alert('Success', `Transaction recategorized to ${newCategory}`);
  };

  const handleReportIssue = () => {
    Alert.alert('Report Issue', 'Issue reported. Our team will review it shortly.');
  };

  const formatDate = (date, time) => {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${time}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Merchant Icon & Amount */}
        <View style={styles.mainSection}>
          <View style={styles.merchantIconContainer}>
            <Text style={styles.merchantIcon}>
              {getMerchantIcon(transaction.merchant)}
            </Text>
          </View>
          
          <Text style={styles.merchantName}>{transaction.title}</Text>
          
          <Text style={[
            styles.amount,
            { color: transaction.amount >= 0 ? Colors.light.primary : Colors.light.text }
          ]}>
            {transaction.amount >= 0 ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {formatDate(transaction.date, transaction.time)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryIcon}>
                {getCategoryIcon(selectedCategory)}
              </Text>
              <Text style={styles.detailValue}>{selectedCategory}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pocket</Text>
            <View style={styles.pocketIndicator}>
              <View style={[styles.pocketDot, { backgroundColor: Colors.light.primary }]} />
              <Text style={styles.detailValue}>{transaction.pocket}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
          </View>
        </View>

        {/* Add Note Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Note</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note about this transaction..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote}>
            <Text style={styles.saveButtonText}>Save Note</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.actionButtonIcon}>🏷️</Text>
            <Text style={styles.actionButtonText}>Recategorize</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowSplitModal(true)}
          >
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={styles.actionButtonText}>Split Between Pockets</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.reportButton}
            onPress={handleReportIssue}
          >
            <Text style={styles.reportButtonIcon}>⚠️</Text>
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={styles.categoryOption}
                onPress={() => handleRecategorize(category)}
              >
                <Text style={styles.categoryOptionIcon}>
                  {getCategoryIcon(category)}
                </Text>
                <Text style={styles.categoryOptionText}>{category}</Text>
                {selectedCategory === category && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Split Modal */}
      <Modal
        visible={showSplitModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSplitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Split Between Pockets</Text>
            <Text style={styles.modalSubtitle}>
              Total: R{Math.abs(transaction.amount).toFixed(2)}
            </Text>
            
            {pockets.map(pocket => (
              <View key={pocket} style={styles.splitRow}>
                <Text style={styles.pocketName}>{pocket}</Text>
                <TextInput
                  style={styles.splitInput}
                  placeholder="R0.00"
                  keyboardType="numeric"
                />
              </View>
            ))}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSplitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setShowSplitModal(false);
                  Alert.alert('Success', 'Transaction split successfully');
                }}
              >
                <Text style={styles.confirmButtonText}>Split</Text>
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
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.card,
  },
  backButton: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  placeholder: {
    width: 50,
  },
  mainSection: {
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    padding: 30,
    marginBottom: 20,
  },
  merchantIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  merchantIcon: {
    fontSize: 40,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 10,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  detailsSection: {
    backgroundColor: Colors.light.card,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.light.mutedText,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  pocketIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pocketDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  section: {
    backgroundColor: Colors.light.card,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 15,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
  actionsSection: {
    backgroundColor: Colors.light.card,
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  reportButtonIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  reportButtonText: {
    fontSize: 16,
    color: Colors.light.error,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.light.mutedText,
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  categoryOptionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  categoryOptionText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pocketName: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  splitInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 6,
    padding: 8,
    width: 100,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.border,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: Colors.light.mutedText,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    marginLeft: 10,
  },
  confirmButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionDetailScreen;