import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';

const popularBanks = [
  { name: 'FNB', tag: 'Popular', color: '#00529B', image: require('@/assets/images/Banks/Fnb.png') },
  {
    name: 'Standard Bank',
    tag: 'Popular',
    color: '#0A3D91',
    image: require('@/assets/images/Banks/StandardBank.jpeg'),
  },
  { name: 'Capitec', tag: 'BETA', color: '#E31E24', image: require('@/assets/images/Banks/Capitec.jpeg') },
  { name: 'TymeBank', tag: 'Popular', color: '#111827', image: require('@/assets/images/Banks/Tymebank.jpeg') },
  { name: 'Nedbank', tag: 'Popular', color: '#1F7A1F', image: require('@/assets/images/Banks/Nedbank.png') },
  { name: 'ABSA', tag: 'Popular', color: '#E60000', image: require('@/assets/images/Banks/Absa.jpeg') },
];

const providers = [
  { name: 'Investec', image: require('@/assets/images/Banks/Investec.png') },
  { name: 'Discovery Bank', image: require('@/assets/images/Banks/Discovery.png') },
  { name: 'African Bank', image: require('@/assets/images/Banks/Africanbank.jpeg') },
  { name: 'Bidvest Bank', image: require('@/assets/images/Banks/Bidvestbank.png') },
  { name: 'Bank Zero', image: require('@/assets/images/Banks/Bankzero.png') },
  { name: 'Sasfin', image: require('@/assets/images/Banks/Sasfin.jpeg') },
  { name: 'Old Mutual', image: require('@/assets/images/Banks/Oldmutual.jpeg') },
  { name: 'Allan Gray', image: require('@/assets/images/Banks/AllanGrey.png') },
  { name: 'EasyEquities', image: require('@/assets/images/Banks/EasyEquities.png') },
];

export default function BankProvidersModal() {
  const [query, setQuery] = useState('');

  const filteredPopular = useMemo(() => {
    if (!query.trim()) return popularBanks;
    const q = query.toLowerCase();
    return popularBanks.filter((b) => b.name.toLowerCase().includes(q));
  }, [query]);

  const filteredProviders = useMemo(() => {
    if (!query.trim()) return providers;
    const q = query.toLowerCase();
    return providers.filter((b) => b.name.toLowerCase().includes(q));
  }, [query]);

  function openBank(name: string) {
    router.push({ pathname: '/bank-connect', params: { bank: name } });
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Link Your Account</Text>
        <Text style={styles.sub}>Search for your bank or financial institution</Text>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your bank..."
            placeholderTextColor={Colors.light.mutedText}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>Popular Accounts</Text>
        <View style={styles.grid}>
          {filteredPopular.map((bank) => (
            <Pressable
              key={bank.name}
              style={styles.tile}
              accessibilityRole="button"
              onPress={() => openBank(bank.name)}
            >
            <View style={[styles.logoCircle, { backgroundColor: bank.color }]}>
              <Image source={bank.image} style={styles.logoImage} resizeMode="contain" />
            </View>
              <Text style={styles.tileName}>{bank.name}</Text>
              <Text style={styles.tileTag}>{bank.tag}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>All Service Providers</Text>
        <View style={styles.list}>
          {filteredProviders.map((bank) => (
            <Pressable
              key={bank.name}
              style={styles.listRow}
              accessibilityRole="button"
              onPress={() => openBank(bank.name)}
            >
            <View style={styles.listIcon}>
              <Image source={bank.image} style={styles.listImage} resizeMode="contain" />
            </View>
              <Text style={styles.listName}>{bank.name}</Text>
              <Text style={styles.chev}>▶</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  backRow: { alignSelf: 'flex-start' },
  backText: { color: Colors.light.primary, fontWeight: '700' },
  title: { fontSize: Typography.header, fontWeight: '800', color: Colors.light.text },
  sub: { color: Colors.light.mutedText },

  searchWrap: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  searchInput: { color: Colors.light.text, paddingVertical: Spacing.xs },

  sectionTitle: { marginTop: Spacing.sm, fontWeight: '700', color: Colors.light.text },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tile: {
    width: '47%',
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  logoCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: 28, height: 28 },
  tileName: { fontWeight: '700', color: Colors.light.text, textAlign: 'center' },
  tileTag: { color: Colors.light.mutedText, fontSize: Typography.small },

  list: { gap: Spacing.xs },
  listRow: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  listIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.light.border, alignItems: 'center', justifyContent: 'center' },
  listImage: { width: 22, height: 22 },
  listName: { flex: 1, color: Colors.light.text, fontWeight: '700' },
  chev: { color: Colors.light.mutedText, fontSize: 18 },
});
