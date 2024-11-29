import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Wallet = {
  network_name: string;
  address: string;
};

type HomeProps = {
  navigation: any;
};

const Home: React.FC<HomeProps> = ({navigation}) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        'https://sandbox-api.okto.tech/api/v1/wallet',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.status === 'success') {
        setWallets(data.data.wallets);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const createWallet = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        'https://sandbox-api.okto.tech/api/v1/wallet',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.status === 'success') {
        fetchWallets();
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Create Wallet" onPress={createWallet} />
      <Button
        title="View Portfolio"
        onPress={() => navigation.navigate('Portfolio')}
      />
      <Button
        title="Transfer Tokens"
        onPress={() => navigation.navigate('Transfer')}
      />

      <FlatList
        data={wallets}
        keyExtractor={item => item.address}
        renderItem={({item}) => (
          <View style={styles.walletItem}>
            <Text>Network: {item.network_name}</Text>
            <Text>Address: {item.address}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  walletItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Home;
