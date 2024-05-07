import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Button, View, Text, Platform, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import {
  initConnection,
  endConnection,
  flushFailedPurchasesCachedAsPendingAndroid,
  getAvailablePurchases,
} from 'react-native-iap';
import Paywall from './Paywall.js';

export default function App() {
  const [currentPage, setCurrentPage] = useState('Home');

  useEffect(() => {
    const init = async () => {
      try {
        const result = await initConnection();
        if (Platform.OS === 'android') {
          flushFailedPurchasesCachedAsPendingAndroid();
        }
        console.log('success init connection.', result);
      } catch (error) {
        console.error('Error occurred during initilization', error.message);
      }
    };

    init();

    return () => {
      endConnection();
    };
  }, []);

  async function nextStep() {
    try {
      const availablePurchases = await getAvailablePurchases();
      console.log(JSON.stringify(availablePurchases, null, 2));
      if (!availablePurchases || !availablePurchases.length) {
        return setCurrentPage('Paywall');
      }

      if (
        availablePurchases[0].productId === 'iap_demo_month_sub' ||
        availablePurchases[0].productId === 'iap_demo_annual_sub'
      ) {
        return setCurrentPage('Premium');
      }

      Alert.alert("Opus~", "Something wrong");
    } catch (error) {
      errorLog({ message: 'handleGetAvailablePurchases', error });
    }
  }

  function pageRender() {
    if (currentPage == 'Home')
      return <Button title="Goto Premium" onPress={nextStep} />;

    if (currentPage == 'Paywall') return <Paywall nextStep={nextStep} />;

    if (currentPage == 'Premium')
      return <Text>Success! You have got All Access For Premium!</Text>;
  }

  return (
    <View style={styles.container}>
      {pageRender()}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
