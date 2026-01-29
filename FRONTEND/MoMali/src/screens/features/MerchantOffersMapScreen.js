import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Linking
} from 'react-native';

const MerchantOffersMapScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  const [userLocation] = useState({ latitude: -26.2041, longitude: 28.0473 }); // Johannesburg

  const categories = ['All', 'Food', 'Shopping', 'Entertainment', 'Health', 'Services'];

  const merchants = [
    {
      id: 1,
      name: 'Woolworths',
      category: 'Shopping',
      latitude: -26.2000,
      longitude: 28.0500,
      distance: 1.2,
      offer: {
        title: '15% off groceries',
        description: 'Get 15% off your grocery shopping with MoMali card',
        validUntil: '2024-02-15',
        terms: 'Minimum spend R200. Valid on groceries only.',
        icon: '🛒'
      },
      address: '123 Main Street, Sandton',
      phone: '+27 11 123 4567'
    },
    {
      id: 2,
      name: 'Nandos',
      category: 'Food',
      latitude: -26.1980,
      longitude: 28.0520,
      distance: 0.8,
      offer: {
        title: 'Buy 1 Get 1 Free',
        description: 'Buy any full chicken and get another one free',
        validUntil: '2024-01-30',
        terms: 'Valid Monday to Wednesday only. Dine-in only.',
        icon: '🍗'
      },
      address: '456 Nelson Mandela Square',
      phone: '+27 11 234 5678'
    },
    {
      id: 3,
      name: 'Clicks',
      category: 'Health',
      latitude: -26.2060,
      longitude: 28.0450,
      distance: 2.1,
      offer: {
        title: '20% off vitamins',
        description: 'Save 20% on all vitamin and supplement purchases',
        validUntil: '2024-02-28',
        terms: 'Valid on selected brands only. Cannot be combined with other offers.',
        icon: '💊'
      },
      address: '789 Rivonia Road, Sandton',
      phone: '+27 11 345 6789'
    },
    {
      id: 4,
      name: 'Ster-Kinekor',
      category: 'Entertainment',
      latitude: -26.2020,
      longitude: 28.0480,
      distance: 1.5,
      offer: {
        title: '2 for 1 movie tickets',
        description: 'Buy one movie ticket and get the second one free',
        validUntil: '2024-01-25',
        terms: 'Valid Tuesday and Wednesday only. Standard seats only.',
        icon: '🎬'
      },
      address: '321 Sandton City Mall',
      phone: '+27 11 456 7890'
    },
    {
      id: 5,
      name: 'Mr Price',
      category: 'Shopping',
      latitude: -26.1990,
      longitude: 28.0510,
      distance: 1.0,
      offer: {
        title: '30% off clothing',
        description: 'Get 30% discount on all clothing items',
        validUntil: '2024-02-10',
        terms: 'Excludes sale items and accessories.',
        icon: '👕'
      },
      address: '654 Oxford Road, Rosebank',
      phone: '+27 11 567 8901'
    }
  ];

  const filteredMerchants = selectedCategory === 'All' 
    ? merchants 
    : merchants.filter(merchant => merchant.category === selectedCategory);

  const handleMarkerPress = (merchant) => {
    setSelectedMerchant(merchant);
    setShowOfferDetails(true);
  };

  const handleGetDirections = (merchant) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${merchant.latitude},${merchant.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps application');
    });
  };

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapText}>Interactive Map View</Text>
        <Text style={styles.mapSubtext}>
          {filteredMerchants.length} offers near you
        </Text>
        
        {/* Simulated Map Markers */}
        <View style={styles.markersContainer}>
          {filteredMerchants.slice(0, 3).map((merchant, index) => (
            <TouchableOpacity
              key={merchant.id}
              style={[
                styles.mapMarker,
                { 
                  top: 100 + (index * 30),
                  left: 50 + (index * 40)
                }
              ]}
              onPress={() => handleMarkerPress(merchant)}
            >
              <Text style={styles.markerIcon}>{merchant.offer.icon}</Text>
              <Text style={styles.markerDistance}>{merchant.distance}km</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCategoryFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
    >
      {categories.map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.filterButton,
            { backgroundColor: selectedCategory === category ? '#4CAF50' : '#f0f0f0' }
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[
            styles.filterText,
            { color: selectedCategory === category ? '#fff' : '#666' }
          ]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMerchantsList = () => (
    <View style={styles.merchantsList}>
      <Text style={styles.listTitle}>Nearby Offers ({filteredMerchants.length})</Text>
      {filteredMerchants.map(merchant => (
        <TouchableOpacity
          key={merchant.id}
          style={styles.merchantCard}
          onPress={() => handleMarkerPress(merchant)}
        >
          <View style={styles.merchantHeader}>
            <View style={styles.merchantLeft}>
              <Text style={styles.offerIcon}>{merchant.offer.icon}</Text>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>{merchant.name}</Text>
                <Text style={styles.offerTitle}>{merchant.offer.title}</Text>
              </View>
            </View>
            <View style={styles.merchantRight}>
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceText}>{merchant.distance}km</Text>
                <Text style={styles.categoryText}>{merchant.category}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOfferDetailsModal = () => (
    <Modal
      visible={showOfferDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowOfferDetails(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedMerchant && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedMerchant.name}</Text>
                <TouchableOpacity onPress={() => setShowOfferDetails(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.offerDetails}>
                <View style={styles.offerHeader}>
                  <Text style={styles.offerIconLarge}>{selectedMerchant.offer.icon}</Text>
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerTitleLarge}>{selectedMerchant.offer.title}</Text>
                    <Text style={styles.offerDescription}>{selectedMerchant.offer.description}</Text>
                  </View>
                </View>

                <View style={styles.offerMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Valid Until:</Text>
                    <Text style={styles.metaValue}>
                      {new Date(selectedMerchant.offer.validUntil).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Distance:</Text>
                    <Text style={styles.metaValue}>{selectedMerchant.distance}km away</Text>
                  </View>
                </View>

                <View style={styles.termsContainer}>
                  <Text style={styles.termsTitle}>Terms & Conditions:</Text>
                  <Text style={styles.termsText}>{selectedMerchant.offer.terms}</Text>
                </View>

                <View style={styles.merchantDetails}>
                  <Text style={styles.addressText}>📍 {selectedMerchant.address}</Text>
                  <Text style={styles.phoneText}>📞 {selectedMerchant.phone}</Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => handleGetDirections(selectedMerchant)}
                >
                  <Text style={styles.directionsButtonText}>🧭 Get Directions</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={() => {
                    setShowOfferDetails(false);
                    Alert.alert('Offer Claimed', 'Show this screen to the merchant to redeem your offer!');
                  }}
                >
                  <Text style={styles.claimButtonText}>Claim Offer</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Offers</Text>
        <TouchableOpacity>
          <Text style={styles.locationButton}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      {renderCategoryFilters()}

      {/* Map View */}
      {renderMapView()}

      {/* Merchants List */}
      <ScrollView style={styles.bottomSheet}>
        {renderMerchantsList()}
      </ScrollView>

      {/* Offer Details Modal */}
      {renderOfferDetailsModal()}
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
  locationButton: {
    fontSize: 20,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    position: 'relative',
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
  },
  markersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapMarker: {
    position: 'absolute',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markerIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  markerDistance: {
    fontSize: 8,
    color: '#666',
    fontWeight: '600',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  merchantsList: {
    padding: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  merchantCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  offerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  offerTitle: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  merchantRight: {
    alignItems: 'flex-end',
  },
  distanceContainer: {
    alignItems: 'flex-end',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  offerDetails: {
    marginBottom: 20,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  offerIconLarge: {
    fontSize: 40,
    marginRight: 15,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitleLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  offerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  termsContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  termsText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  merchantDetails: {
    gap: 5,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
  },
  phoneText: {
    fontSize: 12,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  claimButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MerchantOffersMapScreen;