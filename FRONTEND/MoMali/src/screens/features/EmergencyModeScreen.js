import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert
} from 'react-native';

const EmergencyModeScreen = ({ navigation }) => {
  const [currentBalance, setCurrentBalance] = useState('1250');
  const [emergencyDays, setEmergencyDays] = useState('14');
  const [dailyLimit, setDailyLimit] = useState(0);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const calculateSurvivalBudget = () => {
    const balance = parseFloat(currentBalance) || 0;
    const days = parseInt(emergencyDays) || 1;
    const limit = balance / days;
    setDailyLimit(limit);
  };

  const activateEmergencyMode = () => {
    Alert.alert(
      'Activate Emergency Mode',
      'This will:\n• Set strict daily spending limits\n• Freeze non-essential subscriptions\n• Enable emergency notifications\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          style: 'destructive',
          onPress: () => {
            setIsEmergencyActive(true);
            Alert.alert('Emergency Mode Activated', 'Your account is now in emergency mode. Stay strong! 💪');
          }
        }
      ]
    );
  };

  const deactivateEmergencyMode = () => {
    Alert.alert(
      'Deactivate Emergency Mode',
      'Are you sure you want to return to normal spending mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          onPress: () => {
            setIsEmergencyActive(false);
            Alert.alert('Emergency Mode Deactivated', 'Welcome back to normal mode!');
          }
        }
      ]
    );
  };

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleWebsite = (url) => {
    Linking.openURL(url);
  };

  const freezeSuggestions = [
    { category: 'Entertainment', items: ['Netflix', 'Spotify', 'DSTV'], savings: 'R299/month' },
    { category: 'Food Delivery', items: ['Uber Eats', 'Mr D Food'], savings: 'R400/month' },
    { category: 'Shopping', items: ['Online subscriptions', 'Gym membership'], savings: 'R350/month' },
    { category: 'Transport', items: ['Switch to public transport'], savings: 'R800/month' }
  ];

  const campusResources = [
    {
      name: 'Student Financial Aid Office',
      description: 'Emergency bursaries and financial assistance',
      phone: '+27 11 717 1000',
      website: 'https://wits.ac.za/financial-aid',
      icon: '🎓'
    },
    {
      name: 'Campus Food Bank',
      description: 'Free meals and food parcels for students',
      phone: '+27 11 717 2000',
      website: 'https://wits.ac.za/student-support',
      icon: '🍽️'
    },
    {
      name: 'Student Counselling Centre',
      description: 'Free counselling and mental health support',
      phone: '+27 11 717 1820',
      website: 'https://wits.ac.za/counselling',
      icon: '🧠'
    },
    {
      name: 'Career Services',
      description: 'Part-time job opportunities and career guidance',
      phone: '+27 11 717 1058',
      website: 'https://wits.ac.za/careers',
      icon: '💼'
    }
  ];

  const emergencyContacts = [
    { name: 'Campus Security', number: '+27 11 717 4444', available: '24/7' },
    { name: 'Student Crisis Line', number: '0800 12 13 14', available: '24/7' },
    { name: 'SADAG Mental Health', number: '0800 567 567', available: '24/7' },
    { name: 'Campus Health Centre', number: '+27 11 717 2019', available: 'Mon-Fri 8AM-5PM' }
  ];

  const renderAlertHeader = () => (
    <View style={[styles.alertHeader, { backgroundColor: isEmergencyActive ? '#FF5722' : '#FF9800' }]}>
      <Text style={styles.alertIcon}>⚠️</Text>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>
          {isEmergencyActive ? 'Emergency Mode Active' : 'Financial Emergency Support'}
        </Text>
        <Text style={styles.alertSubtitle}>
          {isEmergencyActive 
            ? 'Strict spending limits are in effect' 
            : 'Get help managing your finances during tough times'
          }
        </Text>
      </View>
    </View>
  );

  const renderSurvivalCalculator = () => (
    <View style={styles.calculatorSection}>
      <Text style={styles.sectionTitle}>💰 Survival Budget Calculator</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Current Available Balance</Text>
        <TextInput
          style={styles.input}
          value={currentBalance}
          onChangeText={setCurrentBalance}
          placeholder="Enter amount"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Days to Stretch Budget</Text>
        <TextInput
          style={styles.input}
          value={emergencyDays}
          onChangeText={setEmergencyDays}
          placeholder="Enter days"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={calculateSurvivalBudget}>
        <Text style={styles.calculateButtonText}>Calculate Daily Limit</Text>
      </TouchableOpacity>

      {dailyLimit > 0 && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Your Daily Spending Limit:</Text>
          <Text style={styles.resultAmount}>R{dailyLimit.toFixed(2)}</Text>
          <Text style={styles.resultDescription}>
            Stick to this limit to make your money last {emergencyDays} days
          </Text>
        </View>
      )}
    </View>
  );

  const renderFreezeSuggestions = () => (
    <View style={styles.freezeSection}>
      <Text style={styles.sectionTitle}>❄️ Freeze Suggestions</Text>
      <Text style={styles.sectionDescription}>
        Consider temporarily pausing these expenses to save money:
      </Text>
      
      {freezeSuggestions.map((suggestion, index) => (
        <View key={index} style={styles.freezeItem}>
          <View style={styles.freezeHeader}>
            <Text style={styles.freezeCategory}>{suggestion.category}</Text>
            <Text style={styles.freezeSavings}>{suggestion.savings}</Text>
          </View>
          <Text style={styles.freezeItems}>
            {suggestion.items.join(', ')}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderCampusResources = () => (
    <View style={styles.resourcesSection}>
      <Text style={styles.sectionTitle}>🏫 Campus Resources</Text>
      
      {campusResources.map((resource, index) => (
        <View key={index} style={styles.resourceItem}>
          <View style={styles.resourceHeader}>
            <Text style={styles.resourceIcon}>{resource.icon}</Text>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceName}>{resource.name}</Text>
              <Text style={styles.resourceDescription}>{resource.description}</Text>
            </View>
          </View>
          
          <View style={styles.resourceActions}>
            <TouchableOpacity 
              style={styles.resourceButton}
              onPress={() => handleCall(resource.phone)}
            >
              <Text style={styles.resourceButtonText}>📞 Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.resourceButton}
              onPress={() => handleWebsite(resource.website)}
            >
              <Text style={styles.resourceButtonText}>🌐 Website</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmergencyContacts = () => (
    <View style={styles.contactsSection}>
      <Text style={styles.sectionTitle}>🚨 Emergency Contacts</Text>
      
      {emergencyContacts.map((contact, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.contactItem}
          onPress={() => handleCall(contact.number)}
        >
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactNumber}>{contact.number}</Text>
            <Text style={styles.contactAvailable}>{contact.available}</Text>
          </View>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Mode</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Alert Header */}
        {renderAlertHeader()}

        {/* Emergency Mode Toggle */}
        <View style={styles.toggleSection}>
          <TouchableOpacity 
            style={[
              styles.emergencyToggle,
              { backgroundColor: isEmergencyActive ? '#FF5722' : '#4CAF50' }
            ]}
            onPress={isEmergencyActive ? deactivateEmergencyMode : activateEmergencyMode}
          >
            <Text style={styles.emergencyToggleText}>
              {isEmergencyActive ? '🔓 Deactivate Emergency Mode' : '🔒 Activate Emergency Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Survival Budget Calculator */}
        {renderSurvivalCalculator()}

        {/* Freeze Suggestions */}
        {renderFreezeSuggestions()}

        {/* Campus Resources */}
        {renderCampusResources()}

        {/* Emergency Contacts */}
        {renderEmergencyContacts()}

        {/* Support Message */}
        <View style={styles.supportMessage}>
          <Text style={styles.supportTitle}>💪 You've Got This!</Text>
          <Text style={styles.supportText}>
            Financial difficulties are temporary. Use these resources and remember that asking for help is a sign of strength, not weakness.
          </Text>
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
  backButton: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    margin: 15,
    borderRadius: 12,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  toggleSection: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  emergencyToggle: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencyToggleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  calculatorSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 5,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  resultDescription: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
  },
  freezeSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  freezeItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  freezeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  freezeCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  freezeSavings: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  freezeItems: {
    fontSize: 12,
    color: '#666',
  },
  resourcesSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  resourceItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resourceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 10,
  },
  resourceButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resourceButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contactsSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 2,
  },
  contactAvailable: {
    fontSize: 10,
    color: '#666',
  },
  callIcon: {
    fontSize: 20,
  },
  supportMessage: {
    backgroundColor: '#E3F2FD',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  supportText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmergencyModeScreen;