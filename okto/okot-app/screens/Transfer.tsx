import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';

const Transfer: React.FC = () => {
  const [network, setNetwork] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');

  const handleTransfer = () => {
    if (!network || !tokenAddress || !amount || !recipient) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    Alert.alert(
      'Transfer Initiated',
      `Network: ${network}\nToken Address: ${tokenAddress}\nAmount: ${amount}\nRecipient: ${recipient}`,
    );

    setNetwork('');
    setTokenAddress('');
    setAmount('');
    setRecipient('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfer Tokens</Text>

      <TextInput
        style={styles.input}
        placeholder="Network Name (e.g., Ethereum, Polygon)"
        value={network}
        onChangeText={setNetwork}
      />
      <TextInput
        style={styles.input}
        placeholder="Token Address"
        value={tokenAddress}
        onChangeText={setTokenAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Recipient Address"
        value={recipient}
        onChangeText={setRecipient}
      />

      <Button title="Transfer" onPress={handleTransfer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
});

export default Transfer;
