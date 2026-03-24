import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ClubCard = ({ name, amount, status }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.amount}>Contribution: {amount}</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

export default ClubCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16
  },
  amount: {
    marginTop: 5
  },
  status: {
    color: 'green',
    marginTop: 5
  }
});