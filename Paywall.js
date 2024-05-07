import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform, Pressable } from 'react-native';
import {
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getSubscriptions,
  requestSubscription,
} from 'react-native-iap';

const Paywall = ({ nextStep }) => {
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const purchaseUpdate = purchaseUpdatedListener(async (purchase) => {
      console.log(JSON.stringify(purchase, null, 2));

      const receipt = purchase.transactionReceipt;

      if (receipt) {
        try {
          const result = await finishTransaction({ purchase });
          console.log(result);
          if (result.code === 'OK') nextStep();
        } catch (error) {
          console.error('An error occurred:', error.message);
        }
      }
    });

    const purchaseError = purchaseErrorListener((error) =>
      console.error('Purchase error:', error.message)
    );

    fetchProducts();

    return () => {
      purchaseUpdate.remove();
      purchaseError.remove();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const _products = await getSubscriptions({
        skus: Platform.select({
          // ios: ['com.rniap.product10', 'com.rniap.product20'],
          android: ['iap_demo_annual_sub', 'iap_demo_month_sub'],
        }),
      });
      console.log(JSON.stringify(_products, null, 2));
      setSubscriptions(_products);
    } catch (error) {
      console.error(
        'Error occurred while fetching subscriptions',
        error.message
      );
    }
  };

  const makePurchase = async (_subscription) => {
    try {
      console.log(JSON.stringify(_subscription, null, 2));

      const sku = _subscription.productId;
      const offerToken =
        Platform.OS === 'android'
          ? _subscription.subscriptionOfferDetails[0]?.offerToken || null
          : null;

      await requestSubscription({
        sku,
        ...(offerToken && {
          subscriptionOffers: [{ sku, offerToken }],
        }),
      });
    } catch (error) {
      console.error('Error making purchase:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>All Access For Premium!</Text>
      <Text>1. Zero Ad</Text>
      <Text>2. All Vedio For Free</Text>
      <Text>3. Newest Feature</Text>

      {subscriptions.map((subscription) => (
        <Pressable
          key={subscription.productId}
          onPress={() => makePurchase(subscription)}
        >
          <View style={styles.row}>
            <Text>{subscription.name}</Text>
            <Text>{subscription.description}</Text>
            <Text>SUBSCRIPT</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 8,
    marginVertical: 16,
    padding: 8,
  },
  text: {
    fontSize: 16,
    marginEnd: 20,
  },
});

export default Paywall;
