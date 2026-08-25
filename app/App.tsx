import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { screenTitle } from './src/lib/appInfo';
import {
  isSearchable,
  searchAddress,
  type Candidate,
  type FetchLike,
  type SearchOutcome,
} from './src/lib/geocode';
import { cachedOutcomeFor, rememberOutcome, type SearchCache } from './src/lib/searchCache';

const NO_RESULTS_MESSAGE = 'No results found.';
const ERROR_MESSAGE = 'Search failed. Check your connection and try again.';
// ADR-0009 obligation 4: ODbL attribution, on the screen showing the results.
const ATTRIBUTION = '© OpenStreetMap contributors';

export default function App() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);
  // What the geocoder answered for the last query we sent: re-submitting
  // unchanged text must not hit the network again (ADR-0009 obligation 3 / AC3).
  // Errors are deliberately not held here — see `searchCache`.
  const [cache, setCache] = useState<SearchCache>(null);
  // What is on screen, which unlike the cache does include a failure.
  const [shown, setShown] = useState<SearchOutcome | undefined>(undefined);

  const onSubmit = useCallback(async () => {
    if (searching || !isSearchable(query)) return;
    const hit = cachedOutcomeFor(cache, query);
    if (hit !== undefined) {
      setShown(hit);
      setListVisible(true);
      return;
    }
    setSearching(true);
    setListVisible(true);
    // Cast: RN's global `fetch` is typed against the DOM `RequestInit`, while the
    // lib module deliberately declares the narrow slice it uses so it stays free of
    // React/Expo and DOM types (CLAUDE.md code style).
    const result = await searchAddress(query, fetch as unknown as FetchLike);
    setCache((current) => rememberOutcome(current, query, result));
    setShown(result);
    setSearching(false);
  }, [cache, query, searching]);

  const onPick = useCallback((candidate: Candidate) => {
    setSelected(candidate);
    setListVisible(false);
  }, []);

  const outcome = listVisible && !searching ? shown : undefined;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{screenTitle()}</Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={onSubmit}
        placeholder="Type an address"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Address"
      />
      <Pressable style={styles.button} onPress={onSubmit} accessibilityRole="button">
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>

      {searching && listVisible ? <ActivityIndicator style={styles.spinner} /> : null}

      {outcome?.kind === 'empty' ? <Text style={styles.message}>{NO_RESULTS_MESSAGE}</Text> : null}
      {outcome?.kind === 'error' ? <Text style={styles.message}>{ERROR_MESSAGE}</Text> : null}

      {outcome?.kind === 'results' ? (
        <FlatList
          style={styles.list}
          data={outcome.candidates}
          keyExtractor={(item, index) => `${index}-${item.label}`}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => onPick(item)} accessibilityRole="button">
              <Text style={styles.rowText}>{item.label}</Text>
            </Pressable>
          )}
        />
      ) : null}

      {selected ? (
        <View style={styles.selected}>
          <Text style={styles.selectedHeading}>Selected target</Text>
          <Text style={styles.selectedLabel}>{selected.label}</Text>
        </View>
      ) : null}

      <Text style={styles.attribution}>{ATTRIBUTION}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#1f6feb',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16 },
  spinner: { marginTop: 16 },
  message: { marginTop: 16, fontSize: 16 },
  // Shrinks so the attribution below it always fits; the FlatList scrolls its
  // own overflow. Results on screen without the licence line is the one state
  // ADR-0009 obligation 4 forbids.
  list: { marginTop: 16, flexGrow: 0, flexShrink: 1 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  rowText: { fontSize: 16 },
  selected: { marginTop: 16 },
  selectedHeading: { fontSize: 14, color: '#555' },
  selectedLabel: { fontSize: 18 },
  attribution: {
    marginTop: 'auto',
    marginBottom: 24,
    fontSize: 12,
    color: '#555',
    flexShrink: 0,
  },
});
