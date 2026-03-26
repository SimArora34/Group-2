import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SelectModal({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: SelectModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      {/* Outer: tapping the backdrop closes the modal */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Inner: tapping inside the sheet does NOT close it */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, item === value && styles.optionSelected]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.optionText,
                    item === value && styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {item === value && (
                  <MaterialIcons
                    name="check"
                    size={18}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 24,
    overflow: "hidden",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textDark,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  list: { flexGrow: 1, flexShrink: 1 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionSelected: { backgroundColor: Colors.primaryLight },
  optionText: { fontSize: 16, color: Colors.textDark },
  optionTextSelected: { color: Colors.primary, fontWeight: "700" },
});
