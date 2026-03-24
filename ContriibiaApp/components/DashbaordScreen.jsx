import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import ClubCard from '../components/ClubCard';
import CustomButton from '../components/CustomButton';

const DashboardScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>

        <Text style={styles.title}>Welcome back, Jamie</Text>

        {/* Buttons */}
        <CustomButton title="Create a new savings club" />
        <CustomButton title="Explore public savings clubs" outline />

        {/* Private Clubs */}
        <Text style={styles.section}>Private Clubs</Text>
        <ClubCard name="Toronto Savers" amount="$3000 CAD" status="Active" />
        <ClubCard name="Summer Trip" amount="$1800 CAD" status="Active" />

        {/* Public Clubs */}
        <Text style={styles.section}>Public Clubs</Text>
        <ClubCard name="Sweet Baking" amount="$1800 CAD" status="Active" />

      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>

    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },
  section: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2F6F6D',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  }
});