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

const HelpScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I create a new pocket?',
      answer: 'Go to the Pockets screen, tap the "Create Pocket" button, enter a name and budget amount, then tap Create.'
    },
    {
      id: 2,
      question: 'How do I transfer money between pockets?',
      answer: 'On the Pockets screen, tap "Move Money", select source and destination pockets, enter amount, and confirm transfer.'
    },
    {
      id: 3,
      question: 'Why can\'t I see my bank transactions?',
      answer: 'Ensure your bank account is properly linked and you have granted necessary permissions. Try refreshing the transactions list.'
    },
    {
      id: 4,
      question: 'How do I set up budget alerts?',
      answer: 'Go to Settings > Notifications and enable budget alerts. You can customize alert thresholds in each pocket\'s settings.'
    },
    {
      id: 5,
      question: 'Is my financial data secure?',
      answer: 'Yes, we use bank-level encryption and never store your banking credentials. All data is encrypted and securely transmitted.'
    },
    {
      id: 6,
      question: 'How do I export my transaction history?',
      answer: 'Go to Transactions, tap the filter button, select your date range, then tap the export icon to download as CSV or PDF.'
    }
  ];

  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with MoMali',
      duration: '3:45',
      thumbnail: '🎬'
    },
    {
      id: 2,
      title: 'Setting Up Your First Pocket',
      duration: '2:30',
      thumbnail: '💰'
    },
    {
      id: 3,
      title: 'Understanding Your Financial Health',
      duration: '4:15',
      thumbnail: '📊'
    },
    {
      id: 4,
      title: 'Advanced Budgeting Tips',
      duration: '5:20',
      thumbnail: '🎯'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const openChat = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to contact us:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Live Chat', onPress: () => Alert.alert('Chat', 'Opening live chat...') },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@momali.co.za') }
      ]
    );
  };

  const openCommunity = () => {
    Linking.openURL('https://community.momali.co.za');
  };

  const playTutorial = (tutorial) => {
    Alert.alert('Video Tutorial', `Playing: ${tutorial.title}`);
  };

  const renderFAQ = (faq) => (
    <View key={faq.id} style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => toggleFAQ(faq.id)}
      >
        <Text style={styles.questionText}>{faq.question}</Text>
        <Text style={styles.expandIcon}>
          {expandedFAQ === faq.id ? '−' : '+'}
        </Text>
      </TouchableOpacity>
      {expandedFAQ === faq.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.answerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );

  const renderTutorial = (tutorial) => (
    <TouchableOpacity
      key={tutorial.id}
      style={styles.tutorialItem}
      onPress={() => playTutorial(tutorial)}
    >
      <View style={styles.tutorialThumbnail}>
        <Text style={styles.thumbnailIcon}>{tutorial.thumbnail}</Text>
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </View>
      <View style={styles.tutorialInfo}>
        <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
        <Text style={styles.tutorialDuration}>{tutorial.duration}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={openChat}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openCommunity}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Community</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {filteredFAQs.map(renderFAQ)}
            {filteredFAQs.length === 0 && (
              <Text style={styles.noResults}>
                No FAQs found matching "{searchQuery}"
              </Text>
            )}
          </View>
        </View>

        {/* Video Tutorials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video Tutorials</Text>
          <View style={styles.tutorialsContainer}>
            {tutorials.map(renderTutorial)}
          </View>
        </View>

        {/* Additional Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need More Help?</Text>
          <View style={styles.helpOptions}>
            <TouchableOpacity style={styles.helpOption} onPress={openChat}>
              <Text style={styles.helpIcon}>📞</Text>
              <View style={styles.helpText}>
                <Text style={styles.helpTitle}>Contact Support</Text>
                <Text style={styles.helpSubtitle}>Get help from our team</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.helpOption} onPress={openCommunity}>
              <Text style={styles.helpIcon}>🌐</Text>
              <View style={styles.helpText}>
                <Text style={styles.helpTitle}>Community Forum</Text>
                <Text style={styles.helpSubtitle}>Connect with other users</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.helpOption}>
              <Text style={styles.helpIcon}>📚</Text>
              <View style={styles.helpText}>
                <Text style={styles.helpTitle}>User Guide</Text>
                <Text style={styles.helpSubtitle}>Complete app documentation</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 24,
    color: '#2196F3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  searchIcon: {
    fontSize: 18,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  faqContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  expandIcon: {
    fontSize: 20,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  faqAnswer: {
    padding: 15,
    paddingTop: 0,
    backgroundColor: '#f8f8f8',
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noResults: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  tutorialsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  tutorialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tutorialThumbnail: {
    width: 60,
    height: 45,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  thumbnailIcon: {
    fontSize: 20,
  },
  playButton: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 10,
  },
  tutorialInfo: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  tutorialDuration: {
    fontSize: 12,
    color: '#666',
  },
  helpOptions: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  helpIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
  },
});

export default HelpScreen;