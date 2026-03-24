import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, outline }) => {
  return (
    <TouchableOpacity style={[styles.button, outline && styles.outline]}>
      <Text style={[styles.text, outline && styles.outlineText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2F6F6D',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center'
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2F6F6D'
  },
  text: {
    color: '#fff',
    fontWeight: 'bold'
  },
  outlineText: {
    color: '#2F6F6D'
  }
});