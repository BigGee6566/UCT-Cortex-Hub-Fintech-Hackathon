import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';

const RewardsScreen = () => {
  const [rewardsBalance] = useState(1250);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const earningsBreakdown = [
    { source: 'Savings Goals', points: 450, color: '#4CAF50' },
    { source: 'Budget Adherence', points: 320, color: '#2196F3' },
    { source: 'Weekly Challenges', points: 280, color: '#FF9800' },
    { source: 'Referrals', points: 200, color: '#9C27B0' }
  ];

  const activeOffers = [
    {
      id: 1,
      title: 'Save R500 This Week',
      description: 'Earn 100 points by staying under budget',
      points: 100,
      progress: 65,
      color: '#4CAF50',
      icon: '💰'
    },
    {
      id: 2,
      title: 'Use 3 Different Pockets',
      description: 'Diversify your spending across pockets',
      points: 50,
      progress: 33,
      color: '#2196F3',
      icon: '📊'
    },
    {
      id: 3,
      title: 'Complete Budget Review',
      description: 'Review and update your monthly budget',
      points: 75,
      progress: 0,
      color: '#FF9800',
      icon: '📋'
    }
  ];

  const rewardHistory = [
    { id: 1, title: 'Weekly Savings Goal', points: 100, date: '2024-01-15', type: 'earned' },
    { id: 2, title: 'Coffee Voucher Redeemed', points: -200, date: '2024-01-14', type: 'redeemed' },
    { id: 3, title: 'Budget Challenge', points: 75, date: '2024-01-12', type: 'earned' },
    { id: 4, title: 'Referral Bonus', points: 150, date: '2024-01-10', type: 'earned' },
    { id: 5, title: 'Movie Ticket Redeemed', points: -300, date: '2024-01-08', type: 'redeemed' }
  ];

  const weeklyChallenges = [
    {
      id: 1,
      title: 'Spend Less Than R300 on Food',
      description: 'Keep your food expenses under R300 this week',
      progress: 75,
      reward: 80,
      daysLeft: 3,
      status: 'active'
    },
    {
      id: 2,
      title: 'No Impulse Purchases',
      description: 'Avoid unplanned purchases for 7 days',
      progress: 100,
      reward: 120,
      daysLeft: 0,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Use Public Transport',
      description: 'Take public transport instead of ride-sharing',
      progress: 40,
      reward: 60,
      daysLeft: 5,
      status: 'active'
    }
  ];

  const redeemOptions = [
    { id: 1, title: 'R10 Airtime', points: 100, icon: '📱' },
    { id: 2, title: 'Coffee Voucher', points: 200, icon: '☕' },
    { id: 3, title: 'Movie Ticket', points: 300, icon: '🎬' },
    { id: 4, title: 'R50 Shopping Voucher', points: 500, icon: '🛍️' }
  ];

  const handleRedeem = (item) => {
    if (rewardsBalance >= item.points) {
      Alert.alert(
        'Redeem Reward',
        `Redeem ${item.title} for ${item.points} points?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Redeem', 
            onPress: () => Alert.alert('Success', `${item.title} redeemed successfully!`)
          }
        ]
      );
    } else {
      Alert.alert('Insufficient Points', `You need ${item.points - rewardsBalance} more points to redeem this reward.`);
    }
  };

  const renderOfferCard = ({ item }) => (
    <TouchableOpacity style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Text style={styles.offerIcon}>{item.icon}</Text>
        <View style={styles.offerPoints}>
          <Text style={styles.offerPointsText}>{item.points}pts</Text>
        </View>
      </View>
      <Text style={styles.offerTitle}>{item.title}</Text>
      <Text style={styles.offerDescription}>{item.description}</Text>
      <View style={styles.offerProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${item.progress}%`,
                backgroundColor: item.color
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <View style={[
          styles.historyIcon,
          { backgroundColor: item.type === 'earned' ? '#E8F5E8' : '#FFE8E8' }
        ]}>
          <Text style={styles.historyIconText}>
            {item.type === 'earned' ? '💰' : '🎁'}
          </Text>
        </View>
        <View style={styles.historyDetails}>
          <Text style={styles.historyTitle}>{item.title}</Text>
          <Text style={styles.historyDate}>{item.date}</Text>
        </View>
      </View>
      <Text style={[
        styles.historyPoints,
        { color: item.type === 'earned' ? '#4CAF50' : '#FF5722' }
      ]}>
        {item.points > 0 ? '+' : ''}{item.points}
      </Text>
    </View>
  );

  const renderChallengeCard = (challenge) => (
    <View key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <View style={[
          styles.challengeStatus,
          { backgroundColor: challenge.status === 'completed' ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.challengeStatusText}>
            {challenge.status === 'completed' ? 'Completed' : `${challenge.daysLeft}d left`}
          </Text>
        </View>
      </View>
      <Text style={styles.challengeDescription}>{challenge.description}</Text>
      <View style={styles.challengeProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${challenge.progress}%`,
                backgroundColor: challenge.status === 'completed' ? '#4CAF50' : '#FF9800'
              }
            ]} 
          />
        </View>
        <Text style={styles.challengeReward}>{challenge.reward} pts</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rewards</Text>
        </View>

        {/* Rewards Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Your Rewards Balance</Text>
          <Text style={styles.balanceAmount}>{rewardsBalance}</Text>
          <Text style={styles.balanceSubtext}>points available</Text>
          
          <TouchableOpacity style={styles.redeemButton}>
            <Text style={styles.redeemButtonText}>🎁 Redeem Rewards</Text>
          </TouchableOpacity>
        </View>

        {/* Breakdown of Earnings */}
        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          {earningsBreakdown.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                <Text style={styles.breakdownSource}>{item.source}</Text>
              </View>
              <Text style={styles.breakdownPoints}>{item.points} pts</Text>
            </View>
          ))}
        </View>

        {/* Active Offers Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Offers</Text>
          <FlatList
            data={activeOffers}
            renderItem={renderOfferCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersContainer}
          />
        </View>

        {/* Weekly Challenges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Challenges</Text>
          {weeklyChallenges.map(renderChallengeCard)}
        </View>

        {/* Redeem Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redeem Points</Text>
          <View style={styles.redeemGrid}>
            {redeemOptions.map(option => (
              <TouchableOpacity 
                key={option.id}
                style={styles.redeemOption}
                onPress={() => handleRedeem(option)}
              >
                <Text style={styles.redeemIcon}>{option.icon}</Text>
                <Text style={styles.redeemTitle}>{option.title}</Text>
                <Text style={styles.redeemPoints}>{option.points} pts</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reward History List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.historyContainer}>
            {rewardHistory.slice(0, 5).map(item => (
              <View key={item.id}>
                {renderHistoryItem({ item })}
              </View>
            ))}
          </View>
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
  balanceCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  redeemButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownCard: {
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
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  breakdownSource: {
    fontSize: 16,
    color: '#333',
  },
  breakdownPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  offersContainer: {
    paddingRight: 15,
  },
  offerCard: {
    backgroundColor: '#fff',
    width: 200,
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  offerIcon: {
    fontSize: 24,
  },
  offerPoints: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offerPointsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  offerDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  offerProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  challengeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  challengeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  challengeStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeReward: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  redeemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  redeemOption: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  redeemIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  redeemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  redeemPoints: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  historyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIconText: {
    fontSize: 16,
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  historyPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RewardsScreen;