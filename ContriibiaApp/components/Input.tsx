import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  multiline?: boolean;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  required,
  containerStyle,
  multiline,
}: InputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputWrap, !editable && styles.inputDisabled]}>
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          placeholder={placeholder || 'Text example'}
          placeholderTextColor={Colors.textPlaceholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible((v) => !v)} style={styles.eyeButton}>
            <Text style={styles.eyeIcon}>{visible ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 6,
    fontWeight: '500',
  },
  required: {
    color: Colors.error,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    height: 48,
  },
  inputDisabled: {
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
});
