import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { ReactNode, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../components/Logo";
import { Colors } from "../constants/Colors";
import { signOut } from "../src/services/authService";

type Screen =
  | "main"
  | "payment-methods"
  | "contact"
  | "learn-more"
  | "learn-cycle"
  | "learn-cash-advance"
  | "learn-wallet"
  | "learn-credit-score"
  | "learn-security-policy";

function SettingsRow({
  label,
  onPress,
  icon,
  danger,
  right,
}: {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {right ??
          (onPress ? (
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={Colors.textLight}
            />
          ) : null)}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingsHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack}>
        <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerIcons}>
        <MaterialIcons
          name="chat-bubble-outline"
          size={22}
          color={Colors.textDark}
        />
        <MaterialIcons
          name="notifications-none"
          size={22}
          color={Colors.textDark}
        />
      </View>
    </View>
  );
}

function LearnMoreInfoCard({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <View style={styles.learnCard}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggle}
        style={[styles.learnCardFooter, expanded && styles.learnCardHeader]}
      >
        <Text style={styles.learnCardFooterText}>{title}</Text>
        <View style={styles.learnDot}>
          <MaterialIcons
            name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={16}
            color={Colors.white}
          />
        </View>
      </TouchableOpacity>
      {expanded && <View style={styles.learnCardBody}>{children}</View>}
    </View>
  );
}

export default function SettingsScreen() {
  const [subScreen, setSubScreen] = useState<Screen>("main");
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    privateClub: true,
    publicClub: false,
    addMoney: true,
    withdraw: false,
    contributionPayouts: false,
    businessPayments: false,
  });

  const toggleCard = (key: string) => {
    setExpandedCards((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  if (subScreen === "learn-more") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <SettingsHeader title="Learn More" onBack={() => setSubScreen("main")} />

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.learnIntro}>
            <Logo size="large" />
          </View>

          <Text style={styles.learnIntroTitle}>Discover Our System</Text>

          <View style={styles.card}>
            <SettingsRow
              label="1. Group Contribution Cycle"
              onPress={() => setSubScreen("learn-cycle")}
            />
            <View style={styles.divider} />
            <SettingsRow
              label="2. Cash Advance"
              onPress={() => setSubScreen("learn-cash-advance")}
            />
            <View style={styles.divider} />
            <SettingsRow
              label="3. App Wallet"
              onPress={() => setSubScreen("learn-wallet")}
            />
            <View style={styles.divider} />
            <SettingsRow
              label="4. Credit Score"
              onPress={() => setSubScreen("learn-credit-score")}
            />
            <View style={styles.divider} />
            <SettingsRow
              label="5. Security Policy"
              onPress={() => setSubScreen("learn-security-policy")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (subScreen === "learn-cycle") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <SettingsHeader
          title="Learn More"
          onBack={() => setSubScreen("learn-more")}
        />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.learnScreenTitle}>Group Contribution Cycle</Text>

          <View style={styles.learnSection}>
            <Text style={styles.learnStep}>1. Private Clubs</Text>
            <Text style={styles.learnBody}>
              Ideal for people who prefer privacy or know each other.
            </Text>
            <LearnMoreInfoCard
              title="How it works"
              expanded={!!expandedCards.privateClub}
              onToggle={() => toggleCard("privateClub")}
            >
              <View style={styles.learnBulletGroup}>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>Create a Group:</Text>{" "}
                    The creator sets the group name, contribution amount,
                    frequency, number of members, and cycle length.
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>
                      Invite & Approve:
                    </Text>{" "}
                    Invite others through the app or a shared link. The creator
                    approves each new member.
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>Start the Cycle:</Text>{" "}
                    All members must click “start” to begin the cycle together.
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>
                      Flexible Management:
                    </Text>{" "}
                    Creators can pause, edit, or end the group. Members can
                    request to pause, subject to approval.
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>
                      Secure & Private:
                    </Text>{" "}
                    All transactions and chats are encrypted for privacy and
                    safety.
                  </Text>
                </View>
              </View>
            </LearnMoreInfoCard>
          </View>

          <View style={styles.learnSection}>
            <Text style={styles.learnStep}>2. Public Club</Text>
            <Text style={styles.learnBody}>
              Open to everyone and great for expanding your financial network.
            </Text>
            <LearnMoreInfoCard
              title="How it works"
              expanded={!!expandedCards.publicClub}
              onToggle={() => toggleCard("publicClub")}
            >
              <View style={styles.learnBulletGroup}>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>Explore & Join:</Text>{" "}
                    Browse public groups on the explore page. See the start
                    date, contribution amount, and frequency.
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>
                      Join Instantly:
                    </Text>{" "}
                    Click an invite link, agree to the terms, and you’re in.
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>Waiting List:</Text> If
                    a group is full, you can join a waiting list. You’ll be
                    added when the next cycle starts.
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>
                      Contributions & Payouts:
                    </Text>{" "}
                    The system handles all contributions and payouts on
                    schedule. No changes or exits allowed once a cycle starts to
                    ensure fairness.
                  </Text>
                </View>
              </View>
            </LearnMoreInfoCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (subScreen === "learn-cash-advance") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <SettingsHeader
          title="Learn More"
          onBack={() => setSubScreen("learn-more")}
        />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.learnScreenTitle}>Cash Advance</Text>

          <Text style={styles.learnBody}>
            The Cash Advance feature lets members access part of their upcoming
            payout early, offering support during unexpected financial needs.
          </Text>

          <Text style={styles.learnHeading}>Eligibility:</Text>
          <Text style={styles.learnBullet}>• Upcoming payout must be over $250</Text>
          <Text style={styles.learnBullet}>
            • Your turn must still be pending
          </Text>

          <Text style={styles.learnHeading}>How to Apply:</Text>
          <Text style={styles.learnBullet}>
            • Apply through the app by entering the desired amount
          </Text>
          <Text style={styles.learnBullet}>
            • Approval amount is reviewed based on eligibility
          </Text>

          <Text style={styles.learnHeading}>Approval & Access:</Text>
          <Text style={styles.learnBullet}>
            • If approved, members receive a confirmation
          </Text>
          <Text style={styles.learnBullet}>
            • Funds are deposited directly into the app wallet
          </Text>

          <Text style={styles.learnHeading}>Transparency:</Text>
          <Text style={styles.learnBullet}>
            • Eligibility criteria are always visible in the app
          </Text>
          <Text style={styles.learnBullet}>
            • The advance is automatically deducted from the next payout
          </Text>

          <Text style={styles.learnHeading}>Tracking:</Text>
          <Text style={styles.learnBullet}>
            • Members can view their cash advance history, including request
            dates, amounts, and repayment status
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (subScreen === "learn-wallet") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <SettingsHeader
          title="Learn More"
          onBack={() => setSubScreen("learn-more")}
        />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.learnScreenTitle}>App Wallet</Text>

          <View style={styles.learnSection}>
            <Text style={styles.learnStep}>1. Add Money</Text>
            <LearnMoreInfoCard
              title="How it works"
              expanded={!!expandedCards.addMoney}
              onToggle={() => toggleCard("addMoney")}
            >
              <View style={styles.learnBulletGroup}>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <View style={styles.learnBulletNested}>
                    <Text style={styles.learnBulletText}>
                      <Text style={styles.learnBulletLead}>Using:</Text>
                    </Text>
                    <Text style={styles.learnSubBullet}>
                      • Credit/Debit Cards (Visa, Mastercard)
                    </Text>
                    <Text style={styles.learnSubBullet}>• Bank Transfers</Text>
                    <Text style={styles.learnSubBullet}>• Other Wallets</Text>
                  </View>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <View style={styles.learnBulletNested}>
                    <Text style={styles.learnBulletText}>
                      <Text style={styles.learnBulletLead}>Steps:</Text>
                    </Text>
                    <Text style={styles.learnSubBullet}>
                      a. Select or add a funding source
                    </Text>
                    <Text style={styles.learnSubBullet}>
                      b. Enter the amount
                    </Text>
                    <Text style={styles.learnSubBullet}>
                      c. Review fees and confirm using PIN or biometrics
                    </Text>
                    <Text style={styles.learnSubBullet}>
                      d. Get a confirmation message
                    </Text>
                  </View>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>Auto Load:</Text> Set
                    up auto-load to top up your wallet automatically when it
                    drops below a set amount.
                  </Text>
                </View>
              </View>
            </LearnMoreInfoCard>
          </View>

          <View style={styles.learnSection}>
            <Text style={styles.learnStep}>2. Withdraw</Text>
            <LearnMoreInfoCard
              title="How it works"
              expanded={!!expandedCards.withdraw}
              onToggle={() => toggleCard("withdraw")}
            >
              <View style={styles.learnBulletGroup}>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <View style={styles.learnBulletNested}>
                    <Text style={styles.learnBulletText}>
                      <Text style={styles.learnBulletLead}>Using:</Text>
                    </Text>
                    <Text style={styles.learnSubBullet}>• Bank Transfers</Text>
                    <Text style={styles.learnSubBullet}>• E-transfer</Text>
                  </View>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <View style={styles.learnBulletNested}>
                    <Text style={styles.learnBulletText}>
                      <Text style={styles.learnBulletLead}>Steps:</Text>
                    </Text>
                    <Text style={styles.learnSubBullet}>
                      a. Select a funding source
                    </Text>
                    <Text style={styles.learnSubBullet}>
                      b. Enter the amount
                    </Text>
                    <Text style={styles.learnSubBullet}>
                      c. Review fees and confirm using PIN or biometrics
                    </Text>
                    <Text style={styles.learnSubBullet}>
                      d. Get a confirmation message
                    </Text>
                  </View>
                </View>
              </View>
            </LearnMoreInfoCard>
          </View>

          <View style={styles.learnSection}>
            <Text style={styles.learnStep}>3. Contribution Payouts</Text>
            <LearnMoreInfoCard
              title="How it works"
              expanded={!!expandedCards.contributionPayouts}
              onToggle={() => toggleCard("contributionPayouts")}
            >
              <View style={styles.learnBulletGroup}>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>Contributions:</Text>{" "}
                    Wallet is auto-debited based on group settings.
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>Payouts:</Text> Funds
                    are auto-credited during your turn.
                  </Text>
                </View>
              </View>
            </LearnMoreInfoCard>
          </View>

          <View style={styles.learnSection}>
            <Text style={styles.learnStep}>4. Business Payments</Text>
            <LearnMoreInfoCard
              title="How it works"
              expanded={!!expandedCards.businessPayments}
              onToggle={() => toggleCard("businessPayments")}
            >
              <View style={styles.learnBulletGroup}>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>
                      Invoice Generator:
                    </Text>{" "}
                    Create and send invoices
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>
                      QR Code Payment:
                    </Text>{" "}
                    Customers can pay by scanning
                  </Text>
                </View>
                <View style={styles.learnBulletRow}>
                  <Text style={styles.learnBulletDot}>•</Text>
                  <Text style={styles.learnBulletText}>
                    <Text style={styles.learnBulletLead}>Track Payments:</Text>{" "}
                    View history, check status of paid/unpaid invoices
                  </Text>
                </View>
              </View>
            </LearnMoreInfoCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (subScreen === "learn-credit-score") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <SettingsHeader
          title="Learn More"
          onBack={() => setSubScreen("learn-more")}
        />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.learnScreenTitle}>Credit Score</Text>
          <Text style={styles.learnBody}>Text</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (subScreen === "learn-security-policy") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <SettingsHeader
          title="Learn More"
          onBack={() => setSubScreen("learn-more")}
        />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.learnScreenTitle}>Security Policy</Text>
          <Text style={styles.learnBody}>Text</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── PAYMENT METHODS SUB-SCREEN ────────────────────────────────
  if (subScreen === "payment-methods") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <SettingsHeader title="Settings" onBack={() => setSubScreen("main")} />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.paymentDesc}>
            The payment method you choose will be used to automatically make
            your contributions for all your clubs, and to receive your payout
            when it's your turn.
          </Text>

          <SectionHeader title="Pay By External Methods" />
          <View style={styles.card}>
            <SettingsRow
              label="Credit / Debit Card"
              right={<View style={styles.redDot} />}
            />
            <View style={styles.divider} />
            <SettingsRow
              label="Bank Account Details"
              right={<View style={styles.redDot} />}
            />
          </View>

          <SectionHeader title="Pay By App Wallet" />
          <View style={styles.card}>
            <SettingsRow
              label="App Wallets"
              right={<View style={styles.redDot} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── CONTACT INFORMATION SUB-SCREEN ───────────────────────────
  if (subScreen === "contact") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <SettingsHeader title="Settings" onBack={() => setSubScreen("main")} />

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.contactTitle}>Contact Information</Text>

          <View style={styles.card}>
            <View style={styles.contactRow}>
              <MaterialIcons name="phone" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>123-456-7890</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactRow}>
              <MaterialIcons name="email" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>abcdef@email.com</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── MAIN SETTINGS SCREEN ─────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerIcons}>
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color={Colors.textDark}
          />
          <MaterialIcons
            name="notifications-none"
            size={22}
            color={Colors.textDark}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={styles.card}>
          <SettingsRow
            label="Manage app notifications"
            right={
              <Switch
                value={notificationsOn}
                onValueChange={setNotificationsOn}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />
        </View>

        {/* Payment information */}
        <SectionHeader title="Payment information" />
        <View style={styles.card}>
          <SettingsRow
            label="Manage Billing Address"
            onPress={() => router.push("/billing-address")}
          />
          <View style={styles.divider} />
          <SettingsRow
            label="Club Payment Methods"
            onPress={() => setSubScreen("payment-methods")}
          />
        </View>

        {/* Privacy and security */}
        <SectionHeader title="Privacy and security" />
        <View style={styles.card}>
          <SettingsRow
            label="Change password"
            onPress={() => router.push("/(auth)/set-password")}
          />
        </View>

        {/* Help */}
        <SectionHeader title="Help" />
        <View style={styles.card}>
          <SettingsRow
            label="Learn More"
            onPress={() => setSubScreen("learn-more")}
          />
          <View style={styles.divider} />
          <SettingsRow
            label="Contact us"
            onPress={() => setSubScreen("contact")}
          />
        </View>

        {/* Switch Accounts */}
        <SectionHeader title="Switch Accounts" />
        <View style={styles.card}>
          <SettingsRow
            label="Add an account"
            onPress={() => Alert.alert('Coming Soon', 'Multi-account support is coming in a future update.')}
            icon={
              <MaterialIcons
                name="add-circle-outline"
                size={18}
                color={Colors.primary}
              />
            }
            right={
              <MaterialIcons
                name="add-circle-outline"
                size={20}
                color={Colors.primary}
              />
            }
          />
          <View style={styles.divider} />
          {["Account A", "Account B", "Account C"].map((acct, i) => (
            <View key={acct}>
              {i > 0 && <View style={styles.divider} />}
              <SettingsRow label={acct} onPress={() => Alert.alert('Coming Soon', 'Account switching is coming in a future update.')} />
            </View>
          ))}
        </View>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          Contriibia is authorized by FINTRAC to carry out money services
          business operations. By using this service, you confirm your agreement
          of our terms and conditions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: "700", color: Colors.textDark },
  headerIcons: { flexDirection: "row", gap: 10 },

  scroll: { padding: 20, gap: 8, paddingBottom: 40 },

  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textDark,
    marginTop: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: { marginRight: 10 },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.textDark },
  rowLabelDanger: { color: Colors.error },
  rowRight: { alignItems: "flex-end" },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },

  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.error,
  },

  paymentDesc: {
    fontSize: 13,
    color: Colors.textMid,
    lineHeight: 19,
    marginBottom: 8,
  },

  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contactText: { fontSize: 15, color: Colors.textDark },
  learnIntro: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 12,
  },
  learnIntroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 12,
  },
  learnScreenTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textDark,
    textAlign: "center",
    marginBottom: 14,
  },
  learnSection: {
    marginBottom: 18,
  },
  learnStep: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 6,
  },
  learnBody: {
    fontSize: 13,
    color: Colors.textMid,
    lineHeight: 19,
    marginBottom: 10,
  },
  learnHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 2,
    marginBottom: 4,
  },
  learnBullet: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textMid,
    marginBottom: 2,
  },
  learnCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  learnCardFooter: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: 12,
  },
  learnCardHeader: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  learnCardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
  },
  learnCardFooterText: {
    fontSize: 13,
    color: Colors.textDark,
    fontWeight: "500",
  },
  learnDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF8D8D",
    alignItems: "center",
    justifyContent: "center",
  },
  learnBulletGroup: {
    gap: 12,
  },
  learnBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  learnBulletDot: {
    fontSize: 13,
    lineHeight: 20,
    color: "#69A9B1",
    marginTop: 1,
  },
  learnBulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
    color: Colors.textDark,
  },
  learnBulletLead: {
    color: "#2F8C99",
    fontWeight: "700",
  },
  learnBulletNested: {
    flex: 1,
  },
  learnSubBullet: {
    fontSize: 12,
    lineHeight: 20,
    color: Colors.textDark,
    paddingLeft: 12,
  },

  logoutButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: "700" },

  legal: {
    fontSize: 11,
    color: Colors.textLight,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 8,
  },
});
