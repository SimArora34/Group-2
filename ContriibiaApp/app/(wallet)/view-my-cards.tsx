import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppIcon from '../../components/AppIcon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { deleteCard, getCards } from '../../src/services/cardService';
import { Card } from '../../src/types';

const CARD_GRADIENTS = ['#A855F7', '#EC4899', '#6366F1'];
const CARD_BGRADS = ['#F59E0B', '#EA580C', '#16A34A'];

function CardItem({
  card,
  index,
  onEdit,
  onDelete,
}: {
  card: Card;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const bg = card.type === 'personal'
    ? CARD_GRADIENTS[index % CARD_GRADIENTS.length]
    : CARD_BGRADS[index % CARD_BGRADS.length];

  return (
    <View style={[styles.cardItem, { backgroundColor: bg }]}>
      <View style={styles.cardItemTop}>
        <View>
          <Text style={styles.cardItemHolder}>Card holder  {card.holder_name}</Text>
          <Text style={styles.cardItemNumber}>•••• •••• •••• {card.last4}</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuOpen((v) => !v)} style={styles.menuBtn}>
          <AppIcon name="ellipsis-vertical" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardItemBottom} />

      <View style={styles.cardItemFooter}>
        <View>
          <Text style={styles.cardItemFooterLabel}>Cardholder Name</Text>
          <Text style={styles.cardItemFooterVal}>{card.holder_name.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.cardItemFooterLabel}>Expired Date</Text>
          <Text style={styles.cardItemFooterVal}>{card.expiry}</Text>
        </View>
      </View>

      {menuOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuOpen(false); onEdit(); }}
          >
            <AppIcon name="create-outline" size={16} color={Colors.textDark} />
            <Text style={styles.dropdownText}>Edit Card</Text>
          </TouchableOpacity>
          <View style={styles.dropdownDivider} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuOpen(false); onDelete(); }}
          >
            <AppIcon name="trash-outline" size={16} color={Colors.error} />
            <Text style={[styles.dropdownText, { color: Colors.error }]}>Delete Card</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function ViewMyCardsScreen() {
  const [cards, setCards] = useState<Card[]>([]);

  useFocusEffect(
    useCallback(() => {
      getCards().then((res) => {
        if (res.success && res.data) setCards(res.data);
      });
    }, []),
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to remove this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCard(id);
            setCards((prev) => prev.filter((c) => c.id !== id));
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <TouchableOpacity
          style={styles.addRow}
          onPress={() => router.push('/(wallet)/add-new-card' as any)}
        >
          <Text style={styles.addRowText}>Add a new card</Text>
          <View style={styles.addIcon}>
            <AppIcon name="add" size={20} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        <Text style={styles.hint}>Click on each card to see details or edit</Text>

        {cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            onEdit={() =>
              router.push({
                pathname: '/(wallet)/add-new-card' as any,
                params: {
                  editId: card.id,
                  editName: card.holder_name,
                  editExpiry: card.expiry,
                },
              })
            }
            onDelete={() => handleDelete(card.id)}
          />
        ))}

        {cards.length === 0 && (
          <View style={styles.emptyWrap}>
            <AppIcon name="card-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No cards added yet</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 16 },

  addRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  addRowText: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  addIcon: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  hint: { fontSize: 12, color: Colors.textLight },

  // Card item
  cardItem: {
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  cardItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardItemHolder: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  cardItemNumber: { color: Colors.white, fontSize: 15, fontWeight: '600', letterSpacing: 1 },
  menuBtn: { padding: 4 },
  cardItemBottom: {},
  cardItemBalance: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  cardItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardItemFooterLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  cardItemFooterVal: { color: Colors.white, fontSize: 12, fontWeight: '600' },

  // Dropdown menu
  dropdown: {
    position: 'absolute',
    right: 18,
    top: 44,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
    overflow: 'hidden',
    minWidth: 140,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  dropdownText: { fontSize: 14, fontWeight: '500', color: Colors.textDark },
  dropdownDivider: { height: 1, backgroundColor: Colors.borderLight },

  emptyWrap: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textLight },
});
