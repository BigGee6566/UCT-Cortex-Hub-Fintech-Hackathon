import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';

const BankConnectionScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState('intro'); // intro, banks, permissions, connecting, success
  const [selectedBank, setSelectedBank] = useState(null);

  const banks = [
    { id: 1, name: 'Standard Bank', logo: '🏦', color: '#0066CC', popular: true },
    { id: 2, name: 'FNB', logo: '🏛️', color: '#FF6B35', popular: true },
    { id: 3, name: 'ABSA', logo: '🏢', color: '#CC0000', popular: true },
    { id: 4, name: 'Nedbank', logo: '🏪', color: '#00A651', popular: true },
    { id: 5, name: 'Capitec', logo: '💳', color: '#E31E24', popular: true },
    { id: 6, name: 'Discovery Bank', logo: '🔍', color: '#8B4A9C', popular: false },
    { id: 7, name: 'TymeBank', logo: '⏰', color: '#FF6B00', popular: false },
    { id: 8, name: 'African Bank', logo: '🌍', color: '#1E3A8A', popular: false }
  ];

  const permissions = [
    { id: 1, title: 'Account Balance', description: 'View your current account balances', icon: '💰', required: true },
    { id: 2, title: 'Transaction History', description: 'Access your past transactions for insights', icon: '📊', required: true },
    { id: 3, title: 'Account Details', description: 'Basic account information and type', icon: '🏦', required: true },
    { id: 4, title: 'Spending Categories', description: 'Categorize transactions for budgeting', icon: '🏷️', required: false },
    { id: 5, title: 'Direct Debits', description: 'View recurring payments and subscriptions', icon: '🔄', required: false }
  ];

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setCurrentStep('permissions');
  };

  const handleConnect = () => {
    setCurrentStep('connecting');
    // Simulate OAuth flow
    setTimeout(() => {
      setCurrentStep('success');
    }, 3000);
  };

  const handleConnectLater = () => {
    Alert.alert(
      'Connect Later',
      'You can always connect your bank account later from the Profile settings.',
      [
        { text: 'OK', onPress: () => navigation?.goBack() }
      ]
    );
  };

  const renderIntroStep = () => (
    <View style={styles.stepContainer}>
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🔐</Text>
        <Text style={styles.illustrationSubtext}>🏦 ↔️ 📱</Text>
      </View>

      <Text style={styles.stepTitle}>Connect Your Bank Account</Text>
      <Text style={styles.stepDescription}>
        Securely link your bank account to get personalized insights, automatic transaction categorization, and smart budgeting recommendations.
      </Text>

      {/* Security Explanation */}
      <View style={styles.securitySection}>
        <Text style={styles.securityTitle}>🛡️ Bank-Level Security</Text>
        <View style={styles.securityPoints}>
          <Text style={styles.securityPoint}>• 256-bit encryption for all data</Text>
          <Text style={styles.securityPoint}>• Read-only access to your accounts</Text>
          <Text style={styles.securityPoint}>• No storage of login credentials</Text>
          <Text style={styles.securityPoint}>• Regulated by financial authorities</Text>
        </View>
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setCurrentStep('banks')}
        >
          <Text style={styles.primaryButtonText}>Choose Your Bank</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleConnectLater}
        >
          <Text style={styles.secondaryButtonText}>Connect Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBankSelectionStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Your Bank</Text>
      <Text style={styles.stepDescription}>
        Choose your primary bank to get started. You can add more accounts later.
      </Text>

      {/* Popular Banks */}
      <Text style={styles.sectionLabel}>Popular Banks</Text>
      <View style={styles.bankGrid}>
        {banks.filter(bank => bank.popular).map(bank => (
          <TouchableOpacity
            key={bank.id}
            style={[
              styles.bankCard,
              { borderColor: selectedBank?.id === bank.id ? bank.color : '#ddd' }
            ]}
            onPress={() => handleBankSelect(bank)}
          >
            <Text style={styles.bankLogo}>{bank.logo}</Text>
            <Text style={styles.bankName}>{bank.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Other Banks */}
      <Text style={styles.sectionLabel}>Other Banks</Text>
      <View style={styles.bankGrid}>
        {banks.filter(bank => !bank.popular).map(bank => (
          <TouchableOpacity
            key={bank.id}
            style={[
              styles.bankCard,
              { borderColor: selectedBank?.id === bank.id ? bank.color : '#ddd' }
            ]}
            onPress={() => handleBankSelect(bank)}
          >
            <Text style={styles.bankLogo}>{bank.logo}</Text>
            <Text style={styles.bankName}>{bank.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setCurrentStep('intro')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleConnectLater}
        >
          <Text style={styles.secondaryButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPermissionsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Permission Details</Text>
      <Text style={styles.stepDescription}>
        MoMali will request the following permissions from {selectedBank?.name}:
      </Text>

      <View style={styles.permissionsContainer}>
        {permissions.map(permission => (
          <View key={permission.id} style={styles.permissionItem}>
            <View style={styles.permissionLeft}>
              <Text style={styles.permissionIcon}>{permission.icon}</Text>
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>{permission.title}</Text>
                <Text style={styles.permissionDescription}>{permission.description}</Text>
              </View>
            </View>
            <View style={styles.permissionRight}>
              <View style={[
                styles.permissionBadge,
                { backgroundColor: permission.required ? '#4CAF50' : '#FF9800' }
              ]}>
                <Text style={styles.permissionBadgeText}>
                  {permission.required ? 'Required' : 'Optional'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.oauthNotice}>
        <Text style={styles.oauthTitle}>🔒 Secure Connection</Text>
        <Text style={styles.oauthText}>
          You'll be redirected to {selectedBank?.name}'s secure login page. MoMali never sees your banking credentials.
        </Text>
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setCurrentStep('banks')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleConnect}
        >
          <Text style={styles.primaryButtonText}>Connect to {selectedBank?.name}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConnectingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🔄</Text>
        <Text style={styles.stepTitle}>Connecting to {selectedBank?.name}</Text>
        <Text style={styles.stepDescription}>
          Please complete the authentication on {selectedBank?.name}'s secure page...
        </Text>
        
        <View style={styles.loadingSteps}>
          <Text style={styles.loadingStep}>✓ Redirecting to {selectedBank?.name}</Text>
          <Text style={styles.loadingStep}>⏳ Authenticating your account</Text>
          <Text style={styles.loadingStep}>⏳ Establishing secure connection</Text>
        </View>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={styles.stepTitle}>Successfully Connected!</Text>
        <Text style={styles.stepDescription}>
          Your {selectedBank?.name} account has been securely linked to MoMali.
        </Text>

        <View style={styles.successDetails}>
          <View style={styles.successItem}>
            <Text style={styles.successItemIcon}>✓</Text>
            <Text style={styles.successItemText}>Account balance synced</Text>
          </View>
          <View style={styles.successItem}>
            <Text style={styles.successItemIcon}>✓</Text>
            <Text style={styles.successItemText}>Transaction history imported</Text>
          </View>
          <View style={styles.successItem}>
            <Text style={styles.successItemIcon}>✓</Text>
            <Text style={styles.successItemText}>Smart categorization enabled</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.primaryButtonText}>Continue to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro': return renderIntroStep();
      case 'banks': return renderBankSelectionStep();
      case 'permissions': return renderPermissionsStep();
      case 'connecting': return renderConnectingStep();
      case 'success': return renderSuccessStep();
      default: return renderIntroStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${(getStepNumber(currentStep) / 4) * 100}%` }
            ]} />
          </View>
          <Text style={styles.progressText}>
            Step {getStepNumber(currentStep)} of 4
          </Text>
        </View>

        {renderCurrentStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStepNumber = (step) => {
  const steps = { intro: 1, banks: 2, permissions: 3, connecting: 4, success: 4 };
  return steps[step] || 1;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  stepContainer: {
    padding: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  illustration: {
    fontSize: 80,
    marginBottom: 10,
  },
  illustrationSubtext: {
    fontSize: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  securitySection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  securityPoints: {
    gap: 8,
  },
  securityPoint: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bankCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
  },
  bankLogo: {
    fontSize: 32,
    marginBottom: 10,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  permissionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 12,
    color: '#666',
  },
  permissionRight: {
    marginLeft: 10,
  },
  permissionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  oauthNotice: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  oauthTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 5,
  },
  oauthText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingSteps: {
    marginTop: 30,
    gap: 10,
  },
  loadingStep: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successDetails: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  successItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  successItemIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 10,
  },
  successItemText: {
    fontSize: 14,
    color: '#333',
  },
  stepButtons: {
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BankConnectionScreen;