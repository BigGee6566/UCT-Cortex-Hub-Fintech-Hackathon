import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Colors } from '@/constants/theme';

const OpenFinanceManagerScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAccount, setExpandedAccount] = useState(null);

  const [connectedAccounts, setConnectedAccounts] = useState([
    {
      id: 1,
      bankName: 'Standard Bank',
      accountType: 'Cheque Account',
      accountNumber: '****1234',
      status: 'connected',
      lastSynced: '2024-01-15T14:30:00Z',
      logo: '🏦',
      color: '#0066CC',
      permissions: [
        { name: 'Account Balance', granted: true, required: true },
        { name: 'Transaction History', granted: true, required: true },
        { name: 'Account Details', granted: true, required: true },
        { name: 'Direct Debits', granted: true, required: false },
        { name: 'Standing Orders', granted: false, required: false }
      ]
    },
    {
      id: 2,
      bankName: 'FNB',
      accountType: 'Savings Account',
      accountNumber: '****5678',
      status: 'connected',
      lastSynced: '2024-01-15T12:15:00Z',
      logo: '🏛️',
      color: '#FF6B35',
      permissions: [
        { name: 'Account Balance', granted: true, required: true },
        { name: 'Transaction History', granted: true, required: true },
        { name: 'Account Details', granted: true, required: true },
        { name: 'Direct Debits', granted: false, required: false },
        { name: 'Standing Orders', granted: false, required: false }
      ]
    },
    {
      id: 3,
      bankName: 'Capitec',
      accountType: 'Credit Card',
      accountNumber: '****9012',
      status: 'error',
      lastSynced: '2024-01-14T09:45:00Z',
      logo: '💳',
      color: '#E31E24',
      permissions: [
        { name: 'Account Balance', granted: true, required: true },
        { name: 'Transaction History', granted: true, required: true },
        { name: 'Account Details', granted: true, required: true },
        { name: 'Direct Debits', granted: true, required: false },
        { name: 'Standing Orders', granted: true, required: false }
      ]
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return Colors.light.primary;
      case 'error': return Colors.light.error;
      case 'syncing': return Colors.light.secondary;
      default: return Colors.light.mutedText;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'error': return 'Connection Error';
      case 'syncing': return 'Syncing...';
      default: return 'Unknown';
    }
  };

  const formatLastSynced = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const handleRefreshData = async (accountId) => {
    setConnectedAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, status: 'syncing' }
        : account
    ));

    // Simulate API call
    setTimeout(() => {
      setConnectedAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { 
              ...account, 
              status: 'connected',
              lastSynced: new Date().toISOString()
            }
          : account
      ));
      Alert.alert('Success', 'Account data refreshed successfully');
    }, 2000);
  };

  const handleRevokeAccess = (account) => {
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to disconnect ${account.bankName} ${account.accountType}?\n\nThis will:\n• Stop automatic data syncing\n• Remove transaction history\n• Disable budget insights for this account`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: () => {
            setConnectedAccounts(prev => prev.filter(acc => acc.id !== account.id));
            Alert.alert('Disconnected', `${account.bankName} account has been disconnected.`);
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh all accounts
    setTimeout(() => {
      setConnectedAccounts(prev => prev.map(account => ({
        ...account,
        lastSynced: new Date().toISOString(),
        status: account.status === 'error' ? 'connected' : account.status
      })));
      setRefreshing(false);
    }, 1500);
  };

  const toggleAccountExpansion = (accountId) => {
    setExpandedAccount(expandedAccount === accountId ? null : accountId);
  };

  const renderPermissionBreakdown = (permissions) => (
    <View style={styles.permissionsContainer}>
      <Text style={styles.permissionsTitle}>Permissions</Text>
      {permissions.map((permission, index) => (
        <View key={index} style={styles.permissionItem}>
          <View style={styles.permissionLeft}>
            <View style={[
              styles.permissionDot,
              { backgroundColor: permission.granted ? Colors.light.primary : Colors.light.border }
            ]} />
            <Text style={styles.permissionName}>{permission.name}</Text>
          </View>
          <View style={styles.permissionBadges}>
            {permission.required && (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredBadgeText}>Required</Text>
              </View>
            )}
            <Text style={[
              styles.permissionStatus,
              { color: permission.granted ? Colors.light.primary : Colors.light.mutedText }
            ]}>
              {permission.granted ? 'Granted' : 'Not Granted'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAccountCard = (account) => {
    const isExpanded = expandedAccount === account.id;
    
    return (
      <View key={account.id} style={styles.accountCard}>
        <TouchableOpacity 
          style={styles.accountHeader}
          onPress={() => toggleAccountExpansion(account.id)}
        >
          <View style={styles.accountLeft}>
            <Text style={styles.accountLogo}>{account.logo}</Text>
            <View style={styles.accountInfo}>
              <Text style={styles.accountBank}>{account.bankName}</Text>
              <Text style={styles.accountType}>
                {account.accountType} {account.accountNumber}
              </Text>
              <Text style={styles.lastSynced}>
                Last synced: {formatLastSynced(account.lastSynced)}
              </Text>
            </View>
          </View>
          
          <View style={styles.accountRight}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(account.status) }
            ]}>
              <Text style={styles.statusText}>{getStatusText(account.status)}</Text>
            </View>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.accountDetails}>
            {/* Action Buttons */}
            <View style={styles.accountActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.refreshButton]}
                onPress={() => handleRefreshData(account.id)}
                disabled={account.status === 'syncing'}
              >
                <Text style={styles.refreshButtonText}>
                  {account.status === 'syncing' ? '🔄 Syncing...' : '🔄 Refresh Data'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.revokeButton]}
                onPress={() => handleRevokeAccess(account)}
              >
                <Text style={styles.revokeButtonText}>🚫 Revoke Access</Text>
              </TouchableOpacity>
            </View>

            {/* Permission Breakdown */}
            {renderPermissionBreakdown(account.permissions)}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Open Finance Manager</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Connected Accounts</Text>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{connectedAccounts.length}</Text>
              <Text style={styles.statLabel}>Total Accounts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue, 
                { color: Colors.light.primary }
              ]}>
                {connectedAccounts.filter(acc => acc.status === 'connected').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue, 
                { color: Colors.light.error }
              ]}>
                {connectedAccounts.filter(acc => acc.status === 'error').length}
              </Text>
              <Text style={styles.statLabel}>Issues</Text>
            </View>
          </View>
        </View>

        {/* Connected Accounts List */}
        <View style={styles.accountsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Connected Accounts</Text>
            <TouchableOpacity 
              style={styles.addAccountButton}
              onPress={() => navigation?.navigate('BankConnection')}
            >
              <Text style={styles.addAccountText}>+ Add Account</Text>
            </TouchableOpacity>
          </View>

          {connectedAccounts.length > 0 ? (
            connectedAccounts.map(renderAccountCard)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏦</Text>
              <Text style={styles.emptyTitle}>No Connected Accounts</Text>
              <Text style={styles.emptyDescription}>
                Connect your bank accounts to get personalized insights and automatic transaction tracking.
              </Text>
              <TouchableOpacity 
                style={styles.connectButton}
                onPress={() => navigation?.navigate('BankConnection')}
              >
                <Text style={styles.connectButtonText}>Connect Your First Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityTitle}>🔒 Your Data is Secure</Text>
          <Text style={styles.securityText}>
            • All connections use bank-grade encryption{'\n'}
            • We only access data you explicitly permit{'\n'}
            • You can revoke access at any time{'\n'}
            • We never store your banking credentials
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
  overviewCard: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  accountsSection: {
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  addAccountButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  addAccountText: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '600',
  },
  accountCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountLogo: {
    fontSize: 32,
    marginRight: 15,
  },
  accountInfo: {
    flex: 1,
  },
  accountBank: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  accountType: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginBottom: 4,
  },
  lastSynced: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    color: Colors.light.text,
    fontSize: 10,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  accountDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    padding: 15,
  },
  accountActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: Colors.light.primary,
  },
  refreshButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '600',
  },
  revokeButton: {
    backgroundColor: Colors.light.error,
  },
  revokeButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '600',
  },
  permissionsContainer: {
    backgroundColor: Colors.light.surfaceAlt,
    padding: 15,
    borderRadius: 8,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 10,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  permissionName: {
    fontSize: 14,
    color: Colors.light.text,
  },
  permissionBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requiredBadge: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  requiredBadgeText: {
    color: Colors.light.text,
    fontSize: 8,
    fontWeight: '600',
  },
  permissionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: Colors.light.card,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.mutedText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  connectButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '600',
  },
  securityNotice: {
    backgroundColor: '#E8F5E8',
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 18,
  },
});

export default OpenFinanceManagerScreen;