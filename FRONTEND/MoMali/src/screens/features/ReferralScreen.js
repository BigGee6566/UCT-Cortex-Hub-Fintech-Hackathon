import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  Share,
  Linking
} from 'react-native';
import { Colors } from '@/constants/theme';

const ReferralScreen = ({ navigation }) => {
  const [showTerms, setShowTerms] = useState(false);
  
  const referralCode = 'MOMALI2024JD';
  const totalEarned = 750;
  const pendingRewards = 200;
  const completedReferrals = 5;

  const invitedFriends = [
    { id: 1, name: 'Sarah M.', status: 'completed', reward: 150, joinDate: '2024-01-10' },
    { id: 2, name: 'Mike K.', status: 'completed', reward: 150, joinDate: '2024-01-08' },
    { id: 3, name: 'Lisa P.', status: 'pending', reward: 100, joinDate: '2024-01-15' },
    { id: 4, name: 'John D.', status: 'pending', reward: 100, joinDate: '2024-01-12' },
    { id: 5, name: 'Emma W.', status: 'completed', reward: 150, joinDate: '2024-01-05' }
  ];

  const rewardMilestones = [
    { friends: 1, reward: 100, status: 'completed' },
    { friends: 3, reward: 300, status: 'completed' },
    { friends: 5, reward: 500, status: 'completed' },
    { friends: 10, reward: 1000, status: 'pending' },
    { friends: 20, reward: 2500, status: 'locked' }
  ];

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async (platform) => {
    const message = `Hey! I'm using MoMali to manage my finances and it's amazing! 💰\n\nJoin me and we both get R150 when you sign up with my code: ${referralCode}\n\nDownload the app: https://momali.app`;

    try {
      switch (platform) {
        case 'whatsapp':
          const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
          await Linking.openURL(whatsappUrl);
          break;
        case 'sms':
          const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
          await Linking.openURL(smsUrl);
          break;
        case 'general':
          await Share.share({ message });
          break;
        default:
          await Share.share({ message });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open sharing option');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return Colors.light.primary;
      case 'pending': return Colors.light.secondary;
      case 'locked': return Colors.light.border;
      default: return Colors.light.mutedText;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Reward Earned';
      case 'pending': return 'Pending Signup';
      case 'locked': return 'Locked';
      default: return status;
    }
  };

  const renderReferralCode = () => (
    <View style={styles.codeSection}>
      <Text style={styles.sectionTitle}>Your Referral Code</Text>
      <View style={styles.codeContainer}>
        <Text style={styles.referralCode}>{referralCode}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
          <Text style={styles.copyButtonText}>📋 Copy</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.codeDescription}>
        Share this code with friends and earn R150 for each successful referral!
      </Text>
    </View>
  );

  const renderShareOptions = () => (
    <View style={styles.shareSection}>
      <Text style={styles.sectionTitle}>Share with Friends</Text>
      <View style={styles.shareButtons}>
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: '#25D366' }]}
          onPress={() => handleShare('whatsapp')}
        >
          <Text style={styles.shareIcon}>📱</Text>
          <Text style={styles.shareText}>WhatsApp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: '#007AFF' }]}
          onPress={() => handleShare('sms')}
        >
          <Text style={styles.shareIcon}>💬</Text>
          <Text style={styles.shareText}>SMS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: Colors.light.mutedText }]}
          onPress={() => handleShare('general')}
        >
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareText}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRewardTracker = () => (
    <View style={styles.rewardSection}>
      <Text style={styles.sectionTitle}>Reward Tracker</Text>
      
      <View style={styles.rewardSummary}>
        <View style={styles.rewardSummaryItem}>
          <Text style={styles.rewardValue}>R{totalEarned}</Text>
          <Text style={styles.rewardLabel}>Total Earned</Text>
        </View>
        <View style={styles.rewardSummaryItem}>
          <Text style={styles.rewardValue}>R{pendingRewards}</Text>
          <Text style={styles.rewardLabel}>Pending</Text>
        </View>
        <View style={styles.rewardSummaryItem}>
          <Text style={styles.rewardValue}>{completedReferrals}</Text>
          <Text style={styles.rewardLabel}>Successful Referrals</Text>
        </View>
      </View>

      <Text style={styles.milestonesTitle}>Reward Milestones</Text>
      {rewardMilestones.map((milestone, index) => (
        <View key={index} style={styles.milestoneItem}>
          <View style={styles.milestoneLeft}>
            <View style={[
              styles.milestoneIcon,
              { backgroundColor: getStatusColor(milestone.status) }
            ]}>
              <Text style={styles.milestoneIconText}>
                {milestone.status === 'completed' ? '✓' : milestone.friends}
              </Text>
            </View>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneText}>
                Refer {milestone.friends} friend{milestone.friends > 1 ? 's' : ''}
              </Text>
              <Text style={styles.milestoneReward}>Earn R{milestone.reward}</Text>
            </View>
          </View>
          <View style={[
            styles.milestoneStatus,
            { backgroundColor: getStatusColor(milestone.status) }
          ]}>
            <Text style={styles.milestoneStatusText}>
              {getStatusText(milestone.status)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderInvitedFriends = () => (
    <View style={styles.friendsSection}>
      <Text style={styles.sectionTitle}>Invited Friends ({invitedFriends.length})</Text>
      {invitedFriends.map(friend => (
        <View key={friend.id} style={styles.friendItem}>
          <View style={styles.friendLeft}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendInitial}>{friend.name.charAt(0)}</Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendDate}>
                Joined {new Date(friend.joinDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.friendRight}>
            <Text style={styles.friendReward}>R{friend.reward}</Text>
            <View style={[
              styles.friendStatus,
              { backgroundColor: getStatusColor(friend.status) }
            ]}>
              <Text style={styles.friendStatusText}>
                {getStatusText(friend.status)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTermsAndConditions = () => (
    <View style={styles.termsSection}>
      <TouchableOpacity 
        style={styles.termsHeader}
        onPress={() => setShowTerms(!showTerms)}
      >
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={styles.termsArrow}>{showTerms ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {showTerms && (
        <View style={styles.termsContent}>
          <Text style={styles.termsText}>
            • Referral rewards are credited after your friend completes their first transaction{'\n'}
            • Both you and your friend must be new MoMali users{'\n'}
            • Rewards are processed within 7 business days{'\n'}
            • Maximum of 20 referrals per user per calendar year{'\n'}
            • MoMali reserves the right to modify or terminate this program{'\n'}
            • Fraudulent referrals will result in account suspension{'\n'}
            • Rewards cannot be transferred or exchanged for cash{'\n'}
            • Standard MoMali terms and conditions apply
          </Text>
        </View>
      )}
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
          <Text style={styles.headerTitle}>Refer Friends</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>🎁</Text>
          <Text style={styles.heroTitle}>Earn R150 per Friend!</Text>
          <Text style={styles.heroDescription}>
            Invite your friends to MoMali and you both get rewarded when they join and make their first transaction.
          </Text>
        </View>

        {/* Referral Code Display */}
        {renderReferralCode()}

        {/* Share Options */}
        {renderShareOptions()}

        {/* Reward Tracker */}
        {renderRewardTracker()}

        {/* Invited Friends List */}
        {renderInvitedFriends()}

        {/* Terms & Conditions */}
        {renderTermsAndConditions()}
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
  heroSection: {
    backgroundColor: Colors.light.card,
    padding: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 14,
    color: Colors.light.mutedText,
    textAlign: 'center',
    lineHeight: 20,
  },
  codeSection: {
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
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceAlt,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  referralCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '600',
  },
  codeDescription: {
    fontSize: 12,
    color: Colors.light.mutedText,
    textAlign: 'center',
  },
  shareSection: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  shareIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  shareText: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '600',
  },
  rewardSection: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  rewardSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  rewardSummaryItem: {
    alignItems: 'center',
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  milestonesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 15,
  },
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  milestoneIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneIconText: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2,
  },
  milestoneReward: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  milestoneStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  milestoneStatusText: {
    color: Colors.light.text,
    fontSize: 10,
    fontWeight: '600',
  },
  friendsSection: {
    backgroundColor: Colors.light.card,
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendInitial: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  friendDate: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  friendRight: {
    alignItems: 'flex-end',
  },
  friendReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  friendStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  friendStatusText: {
    color: Colors.light.text,
    fontSize: 8,
    fontWeight: '600',
  },
  termsSection: {
    backgroundColor: Colors.light.card,
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
  },
  termsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  termsArrow: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  termsContent: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.mutedText,
    lineHeight: 18,
  },
});

export default ReferralScreen;