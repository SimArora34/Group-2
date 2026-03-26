import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppIcon from "../../components/AppIcon";
import ClubCard from "../../components/ClubCard";
import ScreenHeader from "../../components/ScreenHeader";
import { Colors } from "../../constants/Colors";

type Club = {
  name: string;
  amount: string;
  status: string;
};

const PRIVATE_CLUBS: Club[] = [
  { name: "Toronto Savers", amount: "$3000 CAD", status: "Active" },
  { name: "Summer Trip", amount: "$1800 CAD", status: "Active" },
  { name: "Sweet Baking", amount: "$1800 CAD", status: "Active" },
];

const PUBLIC_CLUBS: Club[] = [
  { name: "Summer Trip", amount: "$3000 CAD", status: "Active" },
  { name: "Sweet Baking", amount: "$1800 CAD", status: "Active" },
];

type ActionButtonProps = {
  label: string;
  outline?: boolean;
  onPress: () => void;
};

function ActionButton({ label, outline = false, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.actionButton,
        outline ? styles.actionButtonOutline : styles.actionButtonFilled,
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          outline
            ? styles.actionButtonTextOutline
            : styles.actionButtonTextFilled,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const hasClubs = PRIVATE_CLUBS.length + PUBLIC_CLUBS.length > 0;

  useEffect(() => {
    Animated.spring(menuAnimation, {
      toValue: menuOpen ? 1 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.9,
    }).start();
  }, [menuAnimation, menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleCreateClub = () => {
    closeMenu();
    Alert.alert(
      "Create a savings club",
      "The create-club flow is the next screen to wire up.",
    );
  };

  const handleExploreClubs = () => {
    closeMenu();
    router.push("/(tabs)/clubs");
  };

  const menuStyle = {
    opacity: menuAnimation,
    transform: [
      {
        translateY: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      {
        translateX: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      {
        scale: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Dashboard" />

      <View style={styles.content}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            {hasClubs ? "Welcome back, Jamie" : "Welcome, Jamie"}
          </Text>

          {!hasClubs && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyLead}>Boost your savings!</Text>
              <Text style={styles.emptyCopy}>
                Create or join a savings club to start saving together.
              </Text>

              <ActionButton
                label="Create a new savings club"
                onPress={handleCreateClub}
              />
              <ActionButton
                label="Explore public savings clubs"
                outline
                onPress={handleExploreClubs}
              />
            </View>
          )}

          {!!PRIVATE_CLUBS.length && (
            <View style={styles.sectionBlock}>
              <Text style={styles.section}>Private Clubs</Text>
              {PRIVATE_CLUBS.map((club) => (
                <ClubCard
                  key={`private-${club.name}`}
                  name={club.name}
                  amount={club.amount}
                  status={club.status}
                />
              ))}
            </View>
          )}

          {!!PUBLIC_CLUBS.length && (
            <View style={styles.sectionBlock}>
              <Text style={styles.section}>Public Clubs</Text>
              {PUBLIC_CLUBS.map((club) => (
                <ClubCard
                  key={`public-${club.name}`}
                  name={club.name}
                  amount={club.amount}
                  status={club.status}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {menuOpen && (
          <Pressable style={styles.backdrop} onPress={closeMenu} />
        )}

        <Animated.View
          pointerEvents={menuOpen ? "auto" : "none"}
          style={[styles.fabMenu, menuStyle]}
        >
          <ActionButton
            label="Create a new savings club"
            onPress={handleCreateClub}
          />
          <ActionButton
            label="Explore public savings clubs"
            outline
            onPress={handleExploreClubs}
          />
        </Animated.View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.fab, menuOpen && styles.fabOpen]}
          onPress={() => setMenuOpen((current) => !current)}
        >
          <AppIcon
            name={menuOpen ? "close" : "add"}
            size={28}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F7F5",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 20,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  emptyLead: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 6,
  },
  emptyCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textMid,
    marginBottom: 16,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  section: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 12,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 10,
    minWidth: 230,
  },
  actionButtonFilled: {
    backgroundColor: "#2F9AA5",
  },
  actionButtonOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#78AEB6",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionButtonTextFilled: {
    color: Colors.white,
  },
  actionButtonTextOutline: {
    color: "#356D76",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  fabMenu: {
    position: "absolute",
    right: 88,
    bottom: 90,
    alignItems: "flex-end",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    backgroundColor: "#2F9AA5",
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  fabOpen: {
    backgroundColor: "#C74428",
  },
});
