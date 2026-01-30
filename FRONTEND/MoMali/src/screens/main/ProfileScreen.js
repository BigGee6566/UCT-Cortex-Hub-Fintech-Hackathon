import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

const ProfileScreen = () => {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({
    financial: false,
    income: false,
    banks: false,
    notifications: false,
    security: false,
    privacy: false,
    support: false,
    about: false
  });

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailAlerts: false,
    budgetAlerts: true,
    billReminders: true,
    weeklyReports: true,
    marketingEmails: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    biometricLogin: true,
    twoFactorAuth: false,
    autoLock: true
  });

  const userProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+27 82 123 4567',
    memberSince: 'January 2023',
    avatar: '👤'
  };

  const incomeSources = [
    { id: 1, name: 'Primary Salary', amount: 15000, frequency: 'Monthly', active: true },
    { id: 2, name: 'Freelance Work', amount: 2500, frequency: 'Variable', active: true },
    { id: 3, name: 'Investment Returns', amount: 800, frequency: 'Monthly', active: false }
  ];

  const bankConnections = [
    { id: 1, bank: 'Standard Bank', accountType: 'Cheque Account', connected: true, lastSync: '2 hours ago' },
    { id: 2, bank: 'FNB', accountType: 'Savings Account', connected: true, lastSync: '1 day ago' },
    { id: 3, bank: 'Capitec', accountType: 'Credit Card', connected: false, lastSync: 'Never' }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSecurityToggle = (key) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => Alert.alert('Logged Out', 'You have been logged out successfully.')
        }
      ]
    );
  };

  const handleComingSoon = (title) => {
    Alert.alert(title, 'This feature is coming soon.');
  };

  const renderProfileCard = () => (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{userProfile.avatar}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{userProfile.name}</Text>
        <Text style={styles.profileEmail}>{userProfile.email}</Text>
        <Text style={styles.memberSince}>Member since {userProfile.memberSince}</Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={() => handleComingSoon('Edit Profile')}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCollapsibleSection = (title, sectionKey, items, customContent = null) => (
    <View style={styles.settingsSection}>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection(sectionKey)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.dropdownArrow}>
          {expandedSections[sectionKey] ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>
      
      {expandedSections[sectionKey] && (
        <View style={styles.sectionContent}>
          {customContent || items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingsItem}
              onPress={() => (item.toggle ? item.onToggle?.() : (item.action ? item.action() : handleComingSoon(item.title)))}
            >
              <View style={styles.settingsLeft}>
                <Text style={styles.settingsIcon}>{item.icon}</Text>
                <View style={styles.settingsText}>
                  <Text style={styles.settingsTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              <View style={styles.settingsRight}>
                {item.toggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                    thumbColor={item.value ? Colors.light.card : '#f4f3f4'}
                  />
                ) : (
                  <Text style={styles.settingsArrow}>›</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderSettingsSection = (title, items) => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.settingsItem}>
          <View style={styles.settingsLeft}>
            <Text style={styles.settingsIcon}>{item.icon}</Text>
            <View style={styles.settingsText}>
              <Text style={styles.settingsTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          <View style={styles.settingsRight}>
            {item.toggle ? (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor={item.value ? Colors.light.card : '#f4f3f4'}
              />
            ) : (
              <Text style={styles.settingsArrow}>›</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderIncomeSourcesContent = () => (
    <View>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={() => handleComingSoon('Add Income Source')}>
          <Text style={styles.addButtonText}>+ Add Income Source</Text>
        </TouchableOpacity>
      </View>
      {incomeSources.map(source => (
        <View key={source.id} style={styles.incomeSourceItem}>
          <View style={styles.incomeSourceLeft}>
            <Text style={styles.incomeSourceName}>{source.name}</Text>
            <Text style={styles.incomeSourceDetails}>
              R{source.amount.toLocaleString()} • {source.frequency}
            </Text>
          </View>
          <View style={styles.incomeSourceRight}>
            <View style={[
              styles.statusDot,
              { backgroundColor: source.active ? Colors.light.primary : Colors.light.border }
            ]} />
            <Text style={styles.settingsArrow}>›</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderBankConnectionsContent = () => (
    <View>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/bank-providers')}>
          <Text style={styles.addButtonText}>+ Connect Bank</Text>
        </TouchableOpacity>
      </View>
      {bankConnections.map(bank => (
        <TouchableOpacity
          key={bank.id}
          style={styles.bankConnectionItem}
          onPress={() => handleComingSoon(`Manage ${bank.bank}`)}
        >
          <View style={styles.bankConnectionLeft}>
            <Text style={styles.bankName}>{bank.bank}</Text>
            <Text style={styles.bankDetails}>
              {bank.accountType} • Last sync: {bank.lastSync}
            </Text>
          </View>
          <View style={styles.bankConnectionRight}>
            <View style={[
              styles.connectionStatus,
              { backgroundColor: bank.connected ? Colors.light.primary : Colors.light.error }
            ]}>
              <Text style={styles.connectionStatusText}>
                {bank.connected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderIncomeSourcesSection = () => (
    <View style={styles.settingsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Income Sources</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {incomeSources.map(source => (
        <View key={source.id} style={styles.incomeSourceItem}>
          <View style={styles.incomeSourceLeft}>
            <Text style={styles.incomeSourceName}>{source.name}</Text>
            <Text style={styles.incomeSourceDetails}>
              R{source.amount.toLocaleString()} • {source.frequency}
            </Text>
          </View>
          <View style={styles.incomeSourceRight}>
            <View style={[
              styles.statusDot,
              { backgroundColor: source.active ? Colors.light.primary : Colors.light.border }
            ]} />
            <Text style={styles.settingsArrow}>›</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderBankConnectionsSection = () => (
    <View style={styles.settingsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bank Connections</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Connect</Text>
        </TouchableOpacity>
      </View>
      {bankConnections.map(bank => (
        <View key={bank.id} style={styles.bankConnectionItem}>
          <View style={styles.bankConnectionLeft}>
            <Text style={styles.bankName}>{bank.bank}</Text>
            <Text style={styles.bankDetails}>
              {bank.accountType} • Last sync: {bank.lastSync}
            </Text>
          </View>
          <View style={styles.bankConnectionRight}>
            <View style={[
              styles.connectionStatus,
              { backgroundColor: bank.connected ? Colors.light.primary : Colors.light.error }
            ]}>
              <Text style={styles.connectionStatusText}>
                {bank.connected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const financialSettings = [
    { icon: '💰', title: 'Default Currency', subtitle: 'South African Rand (ZAR)', action: () => handleComingSoon('Default Currency') },
    { icon: '📊', title: 'Budget Period', subtitle: 'Monthly', action: () => handleComingSoon('Budget Period') },
    { icon: '🎯', title: 'Financial Goals', subtitle: 'Manage your savings goals', action: () => handleComingSoon('Financial Goals') },
    { icon: '📈', title: 'Investment Preferences', subtitle: 'Risk tolerance and preferences', action: () => handleComingSoon('Investment Preferences') },
    { icon: '🏥', title: 'Financial Health', subtitle: 'View your financial health score', action: () => router.push('/financial-health') },
    { icon: '🎁', title: 'Refer Friends', subtitle: 'Earn rewards by inviting friends', action: () => router.push('/referral') },
    { icon: '🗺️', title: 'Nearby Offers', subtitle: 'Find deals and discounts near you', action: () => router.push('/merchant-offers') }
  ];

  const notificationItems = [
    { 
      icon: '🔔', 
      title: 'Push Notifications', 
      toggle: true, 
      value: notifications.pushNotifications,
      onToggle: () => handleNotificationToggle('pushNotifications')
    },
    { 
      icon: '📧', 
      title: 'Email Alerts', 
      toggle: true, 
      value: notifications.emailAlerts,
      onToggle: () => handleNotificationToggle('emailAlerts')
    },
    { 
      icon: '💸', 
      title: 'Budget Alerts', 
      toggle: true, 
      value: notifications.budgetAlerts,
      onToggle: () => handleNotificationToggle('budgetAlerts')
    },
    { 
      icon: '📅', 
      title: 'Bill Reminders', 
      toggle: true, 
      value: notifications.billReminders,
      onToggle: () => handleNotificationToggle('billReminders')
    },
    { 
      icon: '📊', 
      title: 'Weekly Reports', 
      toggle: true, 
      value: notifications.weeklyReports,
      onToggle: () => handleNotificationToggle('weeklyReports')
    },
    { 
      icon: '📢', 
      title: 'Marketing Emails', 
      toggle: true, 
      value: notifications.marketingEmails,
      onToggle: () => handleNotificationToggle('marketingEmails')
    }
  ];

  const securityItems = [
    { 
      icon: '👆', 
      title: 'Biometric Login', 
      subtitle: 'Use fingerprint or face ID',
      toggle: true, 
      value: securitySettings.biometricLogin,
      onToggle: () => handleSecurityToggle('biometricLogin')
    },
    { 
      icon: '🔐', 
      title: 'Two-Factor Authentication', 
      subtitle: 'Extra security for your account',
      toggle: true, 
      value: securitySettings.twoFactorAuth,
      onToggle: () => handleSecurityToggle('twoFactorAuth')
    },
    { 
      icon: '🔒', 
      title: 'Auto-Lock', 
      subtitle: 'Lock app when inactive',
      toggle: true, 
      value: securitySettings.autoLock,
      onToggle: () => handleSecurityToggle('autoLock')
    },
    { icon: '🔑', title: 'Change Password', subtitle: 'Update your login password', action: () => handleComingSoon('Change Password') },
    { icon: '📱', title: 'Trusted Devices', subtitle: 'Manage authorized devices', action: () => handleComingSoon('Trusted Devices') }
  ];

  const privacyItems = [
    { icon: '🛡️', title: 'Privacy Policy', subtitle: 'How we protect your data', action: () => handleComingSoon('Privacy Policy') },
    { icon: '📋', title: 'Terms of Service', subtitle: 'Our terms and conditions', action: () => handleComingSoon('Terms of Service') },
    { icon: '📊', title: 'Data Usage', subtitle: 'See how your data is used', action: () => handleComingSoon('Data Usage') },
    { icon: '⬇️', title: 'Export Data', subtitle: 'Download your information', action: () => handleComingSoon('Export Data') },
    { icon: '🗑️', title: 'Delete Account', subtitle: 'Permanently remove your account', action: () => handleComingSoon('Delete Account') }
  ];

  const supportItems = [
    { icon: '❓', title: 'FAQ', subtitle: 'Frequently asked questions', action: () => handleComingSoon('FAQ') },
    { icon: '💬', title: 'Contact Support', subtitle: 'Get help from our team', action: () => handleComingSoon('Contact Support') },
    { icon: '📞', title: 'Call Us', subtitle: '+27 11 123 4567', action: () => handleComingSoon('Call Us') },
    { icon: '⭐', title: 'Rate App', subtitle: 'Share your feedback', action: () => handleComingSoon('Rate App') },
    { icon: '🐛', title: 'Report Bug', subtitle: 'Help us improve the app', action: () => handleComingSoon('Report Bug') },
    { icon: '🏦', title: 'Bank Connections', subtitle: 'Manage your connected accounts', action: () => router.push('/bank-providers') },
    { icon: '🔗', title: 'Open Finance Manager', subtitle: 'View and manage account connections', action: () => router.push('/open-finance') },
    { icon: '💳', title: 'Bills & Subscriptions', subtitle: 'Manage recurring payments', action: () => router.push('/bills') },
    { icon: '📋', title: 'Transaction Details', subtitle: 'View detailed transaction information', action: () => router.push('/transaction-detail') }
  ];

  const aboutItems = [
    { icon: '📱', title: 'App Version', subtitle: '2.1.0 (Build 210)', action: () => handleComingSoon('App Version') },
    { icon: '🔄', title: 'Check for Updates', subtitle: 'Latest version available', action: () => handleComingSoon('Check for Updates') },
    { icon: '📜', title: 'Release Notes', subtitle: "What's new in this version", action: () => handleComingSoon('Release Notes') },
    { icon: '🏢', title: 'About MoMali', subtitle: 'Learn more about our company', action: () => handleComingSoon('About MoMali') }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        {renderProfileCard()}

        {/* Financial Settings */}
        {renderCollapsibleSection('Financial Settings', 'financial', financialSettings)}

        {/* Income Sources */}
        {renderCollapsibleSection('Income Sources', 'income', [], renderIncomeSourcesContent())}

        {/* Bank Connections */}
        {renderCollapsibleSection('Bank Connections', 'banks', [], renderBankConnectionsContent())}

        {/* Notifications */}
        {renderCollapsibleSection('Notifications', 'notifications', notificationItems)}

        {/* Security Settings */}
        {renderCollapsibleSection('Security Settings', 'security', securityItems)}

        {/* Data & Privacy */}
        {renderCollapsibleSection('Data & Privacy', 'privacy', privacyItems)}

        {/* Support & Help */}
        {renderCollapsibleSection('Support & Help', 'support', supportItems)}

        {/* About */}
        {renderCollapsibleSection('About', 'about', aboutItems)}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  profileCard: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    fontSize: 24,
    color: Colors.light.text,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  editButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: Colors.light.card,
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.surfaceAlt,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dropdownArrow: {
    fontSize: 16,
    color: Colors.light.mutedText,
    fontWeight: 'bold',
  },
  sectionContent: {
    backgroundColor: Colors.light.card,
  },
  addButtonContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  settingsRight: {
    alignItems: 'center',
  },
  settingsArrow: {
    fontSize: 12,
    color: Colors.light.border,
  },
  incomeSourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  incomeSourceLeft: {
    flex: 1,
  },
  incomeSourceName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  incomeSourceDetails: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  incomeSourceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  bankConnectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  bankConnectionLeft: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  bankDetails: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  bankConnectionRight: {
    alignItems: 'flex-end',
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionStatusText: {
    color: Colors.light.text,
    fontSize: 10,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: Colors.light.error,
    margin: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;