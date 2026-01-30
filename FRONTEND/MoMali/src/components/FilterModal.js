import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput
} from 'react-native';
import { Colors } from '@/constants/theme';

const FilterModal = ({ 
  visible, 
  onClose, 
  onApply,
  initialFilters = {}
}) => {
  const [selectedPocket, setSelectedPocket] = useState(initialFilters.pocket || null);
  const [selectedCategories, setSelectedCategories] = useState(initialFilters.categories || []);
  const [dateRange, setDateRange] = useState(initialFilters.dateRange || { start: '', end: '' });
  const [transactionType, setTransactionType] = useState(initialFilters.type || 'all');

  const pockets = [
    { id: 1, name: 'Daily Spending', color: Colors.light.primary },
    { id: 2, name: 'Bills & Subscriptions', color: Colors.light.secondary },
    { id: 3, name: 'Emergency Buffer', color: Colors.light.primary },
    { id: 4, name: 'Savings Goal', color: Colors.light.secondary }
  ];

  const categories = [
    'Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Income', 'Healthcare', 'Education'
  ];

  const dateRangePresets = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Custom Range', value: 'custom' }
  ];

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleApply = () => {
    const filters = {
      pocket: selectedPocket,
      categories: selectedCategories,
      dateRange,
      type: transactionType
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedPocket(null);
    setSelectedCategories([]);
    setDateRange({ start: '', end: '' });
    setTransactionType('all');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Transactions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* Pocket Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pocket</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.pocketChip, !selectedPocket && styles.selectedChip]}
                  onPress={() => setSelectedPocket(null)}
                >
                  <Text style={[styles.chipText, !selectedPocket && styles.selectedChipText]}>
                    All Pockets
                  </Text>
                </TouchableOpacity>
                {pockets.map(pocket => (
                  <TouchableOpacity
                    key={pocket.id}
                    style={[
                      styles.pocketChip,
                      selectedPocket?.id === pocket.id && styles.selectedChip
                    ]}
                    onPress={() => setSelectedPocket(pocket)}
                  >
                    <View style={[styles.pocketDot, { backgroundColor: pocket.color }]} />
                    <Text style={[
                      styles.chipText,
                      selectedPocket?.id === pocket.id && styles.selectedChipText
                    ]}>
                      {pocket.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Category Multi-select */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoryGrid}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategories.includes(category) && styles.selectedChip
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedCategories.includes(category) && styles.selectedChipText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePresets}>
                {dateRangePresets.map(preset => (
                  <TouchableOpacity
                    key={preset.value}
                    style={[
                      styles.datePresetChip,
                      dateRange.preset === preset.value && styles.selectedChip
                    ]}
                    onPress={() => setDateRange({ ...dateRange, preset: preset.value })}
                  >
                    <Text style={[
                      styles.chipText,
                      dateRange.preset === preset.value && styles.selectedChipText
                    ]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {dateRange.preset === 'custom' && (
                <View style={styles.customDateRange}>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>From</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY-MM-DD"
                      value={dateRange.start}
                      onChangeText={(text) => setDateRange({ ...dateRange, start: text })}
                    />
                  </View>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>To</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY-MM-DD"
                      value={dateRange.end}
                      onChangeText={(text) => setDateRange({ ...dateRange, end: text })}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Income/Spending Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Type</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    transactionType === 'all' && styles.selectedToggle
                  ]}
                  onPress={() => setTransactionType('all')}
                >
                  <Text style={[
                    styles.toggleText,
                    transactionType === 'all' && styles.selectedToggleText
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    transactionType === 'income' && styles.selectedToggle
                  ]}
                  onPress={() => setTransactionType('income')}
                >
                  <Text style={[
                    styles.toggleText,
                    transactionType === 'income' && styles.selectedToggleText
                  ]}>
                    💰 Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    transactionType === 'spending' && styles.selectedToggle
                  ]}
                  onPress={() => setTransactionType('spending')}
                >
                  <Text style={[
                    styles.toggleText,
                    transactionType === 'spending' && styles.selectedToggleText
                  ]}>
                    💸 Spending
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>

          {/* Apply/Reset Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: Colors.light.mutedText,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  pocketChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    marginRight: 10,
  },
  pocketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.light.mutedText,
    fontWeight: '500',
  },
  selectedChipText: {
    color: Colors.light.text,
  },
  datePresets: {
    marginBottom: 15,
  },
  datePresetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    marginRight: 10,
  },
  customDateRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginBottom: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectedToggle: {
    backgroundColor: Colors.light.primary,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.light.mutedText,
    fontWeight: '500',
  },
  selectedToggleText: {
    color: Colors.light.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    marginRight: 10,
  },
  resetButtonText: {
    fontSize: 16,
    color: Colors.light.mutedText,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    marginLeft: 10,
  },
  applyButtonText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
  },
});

export default FilterModal;