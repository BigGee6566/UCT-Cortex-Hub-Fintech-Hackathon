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
import { Colors } from '@/constants/theme';

interface EmergencyModeScreenProps {
  navigation?: any;
}

const EmergencyModeScreen: React.FC<EmergencyModeScreenProps> = ({ navigation }) => {
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

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleWebsite = (url: string) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Alert Header */}
        <View style={[styles.alertHeader, { backgroundColor: isEmergencyActive ? Colors.light.error : Colors.light.secondary }]}>
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

        {/* Emergency Mode Toggle */}
        <View style={styles.toggleSection}>
          <TouchableOpacity 
            style={[
              styles.emergencyToggle,
              { backgroundColor: isEmergencyActive ? Colors.light.error : Colors.light.primary }
            ]}
            onPress={isEmergencyActive ? deactivateEmergencyMode : activateEmergencyMode}
          >
            <Text style={styles.emergencyToggleText}>
              {isEmergencyActive ? '🔓 Deactivate Emergency Mode' : '🔒 Activate Emergency Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Survival Budget Calculator */}
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

        {/* Emergency Contacts */}
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
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 12,
    color: Colors.light.text,
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
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
  calculatorSection: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  calculateButtonText: {
    color: Colors.light.text,
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
  contactsSection: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 8,
    marginBottom: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 12,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  contactAvailable: {
    fontSize: 10,
    color: Colors.light.mutedText,
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