import React, { createContext, useContext, useState } from 'react';
import { Modal } from 'react-native';

// Import all screens
import FinancialHealthScreen from '../screens/features/FinancialHealthScreen';
import ReferralScreen from '../screens/features/ReferralScreen';
import MerchantOffersMapScreen from '../screens/features/MerchantOffersMapScreen';
import BankConnectionScreen from '../screens/features/BankConnectionScreen';
import OpenFinanceManagerScreen from '../screens/features/OpenFinanceManagerScreen';
import BillsScreen from '../screens/features/BillsScreen';
import TransactionDetailScreen from '../screens/features/TransactionDetailScreen';
import PocketsScreen from '../screens/main/PocketsScreen';
import RewardsScreen from '../screens/main/RewardsScreen';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    return {
      navigate: (screenName, params) => {
        console.log(`Navigate to ${screenName}`, params);
      }
    };
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState(null);
  const [screenParams, setScreenParams] = useState(null);

  const navigate = (screenName, params = null) => {
    setScreenParams(params);
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    setCurrentScreen(null);
    setScreenParams(null);
  };

  const renderScreen = () => {
    const screenProps = { navigation: { navigate, goBack }, route: { params: screenParams } };
    
    switch (currentScreen) {
      case 'FinancialHealth':
        return <FinancialHealthScreen {...screenProps} />;
      case 'Referral':
        return <ReferralScreen {...screenProps} />;
      case 'MerchantOffers':
        return <MerchantOffersMapScreen {...screenProps} />;
      case 'BankConnection':
        return <BankConnectionScreen {...screenProps} />;
      case 'OpenFinanceManager':
        return <OpenFinanceManagerScreen {...screenProps} />;
      case 'Bills':
        return <BillsScreen {...screenProps} />;
      case 'TransactionDetail':
        return <TransactionDetailScreen {...screenProps} />;
      case 'Pockets':
        return <PocketsScreen {...screenProps} />;
      case 'Rewards':
        return <RewardsScreen {...screenProps} />;
      default:
        return null;
    }
  };

  return (
    <NavigationContext.Provider value={{ navigate, goBack }}>
      {children}
      <Modal
        visible={currentScreen !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={goBack}
      >
        {renderScreen()}
      </Modal>
    </NavigationContext.Provider>
  );
};