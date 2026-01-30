import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal
} from 'react-native';
import { Colors } from '@/constants/theme';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    darkTheme: false,
    notifications: true,
    biometric: true,
    autoSync: true,
    currency: 'ZAR',
    language: 'English'
  });
  
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [cacheSize] = useState('24.5 MB');
  const [dataUsage] = useState('156 MB');

  const currencies = [
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'zu', name: 'Zulu' },
    { code: 'xh', name: 'Xhosa' }
  ];

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully') }
      ]
    );
  };

  const resetDataUsage = () => {
    Alert.alert(
      'Reset Data Usage',
      'This will reset your data usage statistics. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => Alert.alert('Success', 'Data usage reset') }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderModal = (visible, onClose, title, items, selectedValue, onSelect) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {items.map(item => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.modalItem,
                selectedValue === item.code && styles.selectedModalItem
              ]}
              onPress={() => {
                onSelect(item.code);
                onClose();
              }}
            >
              <Text style={[
                styles.modalItemText,
                selectedValue === item.code && styles.selectedModalItemText
              ]}>
                {item.name} {item.symbol && `(${item.symbol})`}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, settings.darkTheme && styles.darkContainer]}>
      <View style={[styles.header, settings.darkTheme && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={[styles.backButton, settings.darkTheme && styles.darkText]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, settings.darkTheme && styles.darkText]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        <SectionHeader title="App Preferences" />
        <View style={[styles.section, settings.darkTheme && styles.darkSection]}>
          <SettingItem
            icon="🔔"
            title="Notifications"
            subtitle="Push notifications and alerts"
            rightComponent={
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting('notifications')}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              />
            }
          />
          <SettingItem
            icon="🔒"
            title="Biometric Login"
            subtitle="Use fingerprint or face ID"
            rightComponent={
              <Switch
                value={settings.biometric}
                onValueChange={() => toggleSetting('biometric')}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              />
            }
          />
          <SettingItem
            icon="🔄"
            title="Auto Sync"
            subtitle="Automatically sync data"
            rightComponent={
              <Switch
                value={settings.autoSync}
                onValueChange={() => toggleSetting('autoSync')}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              />
            }
          />
        </View>

        <SectionHeader title="Currency & Language" />
        <View style={[styles.section, settings.darkTheme && styles.darkSection]}>
          <SettingItem
            icon="💰"
            title="Currency"
            subtitle={currencies.find(c => c.code === settings.currency)?.name}
            onPress={() => setShowCurrencyModal(true)}
            rightComponent={<Text style={styles.arrow}>›</Text>}
          />
          <SettingItem
            icon="🌐"
            title="Language"
            subtitle={settings.language}
            onPress={() => setShowLanguageModal(true)}
            rightComponent={<Text style={styles.arrow}>›</Text>}
          />
        </View>

        <SectionHeader title="Theme" />
        <View style={[styles.section, settings.darkTheme && styles.darkSection]}>
          <SettingItem
            icon="🌙"
            title="Dark Mode"
            subtitle="Use dark theme"
            rightComponent={
              <Switch
                value={settings.darkTheme}
                onValueChange={() => toggleSetting('darkTheme')}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              />
            }
          />
        </View>

        <SectionHeader title="Data Usage" />
        <View style={[styles.section, settings.darkTheme && styles.darkSection]}>
          <SettingItem
            icon="📊"
            title="Data Usage"
            subtitle={`${dataUsage} this month`}
            onPress={resetDataUsage}
            rightComponent={<Text style={styles.arrow}>›</Text>}
          />
          <SettingItem
            icon="📱"
            title="Sync on WiFi Only"
            subtitle="Save mobile data"
            rightComponent={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              />
            }
          />
        </View>

        <SectionHeader title="Cache Management" />
        <View style={[styles.section, settings.darkTheme && styles.darkSection]}>
          <SettingItem
            icon="🗂️"
            title="Cache Size"
            subtitle={cacheSize}
            onPress={clearCache}
            rightComponent={<Text style={styles.clearText}>Clear</Text>}
          />
          <SettingItem
            icon="🔄"
            title="Auto Clear Cache"
            subtitle="Clear cache weekly"
            rightComponent={
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              />
            }
          />
        </View>

      </ScrollView>

      {renderModal(
        showCurrencyModal,
        () => setShowCurrencyModal(false),
        'Select Currency',
        currencies,
        settings.currency,
        (currency) => setSettings(prev => ({ ...prev, currency }))
      )}

      {renderModal(
        showLanguageModal,
        () => setShowLanguageModal(false),
        'Select Language',
        languages,
        settings.language,
        (language) => setSettings(prev => ({ ...prev, language: languages.find(l => l.code === language)?.name }))
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  darkHeader: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: Colors.light.text,
  },
  backButton: {
    fontSize: 24,
    color: Colors.light.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  darkText: {
    color: Colors.light.text,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.mutedText,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 5,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 10,
  },
  darkSection: {
    backgroundColor: '#1E1E1E',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: Colors.light.border,
  },
  clearText: {
    fontSize: 14,
    color: Colors.light.error,
    fontWeight: '600',
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
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  selectedModalItem: {
    backgroundColor: '#E3F2FD',
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  selectedModalItemText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  modalCancel: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: Colors.light.mutedText,
    fontWeight: '600',
  },
});

export default SettingsScreen;