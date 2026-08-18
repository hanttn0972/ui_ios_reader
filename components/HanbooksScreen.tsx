import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Bookmark, BookOpen, Check, ChevronRight, FilePlus, Flame, Heart, MoreHorizontal, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react-native';

type TabName = 'home' | 'library' | 'lists' | 'settings';
type Book = { id: string; title: string; author: string; progress: number; color: string; status: 'Unread' | 'Reading' };

const initialBooks: Book[] = [
  { id: '1', title: 'The Silent Patient', author: 'Alex Michaelides', progress: 68, color: '#D8C6B4', status: 'Reading' },
  { id: '2', title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', progress: 23, color: '#B8C8C2', status: 'Reading' },
  { id: '3', title: 'The Secret History', author: 'Donna Tartt', progress: 0, color: '#C5B9AA', status: 'Unread' },
  { id: '4', title: 'The Creative Act', author: 'Rick Rubin', progress: 41, color: '#D8B49B', status: 'Reading' },
];

const storageKey = 'hanbooks-books';

export function HanbooksScreen({ activeTab }: { activeTab: TabName }) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readerBook, setReaderBook] = useState<Book | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Reading' | 'Unread'>('All');
  const [darkReader, setDarkReader] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) setBooks(JSON.parse(saved) as Book[]);
    }
  }, []);

  const saveBooks = (nextBooks: Book[]) => {
    setBooks(nextBooks);
    if (typeof localStorage !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(nextBooks));
  };

  const importBook = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.epub';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const title = file.name.replace(/\.epub$/i, '').replace(/[-_]/g, ' ');
      const imported: Book = { id: String(Date.now()), title, author: 'Imported book', progress: 0, color: '#AFC2D1', status: 'Unread' };
      saveBooks([imported, ...books]);
    };
    input.click();
  };

  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesQuery = `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All' || book.status === filter;
    return matchesQuery && matchesFilter;
  }), [books, filter, query]);

  const continueBook = books.find((book) => book.progress > 0) ?? books[0];

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topLine}>
          <View>
            <Text style={styles.brand}>HANBOOKS</Text>
            <Text style={styles.greeting}>{activeTab === 'home' ? 'Good evening, Alex' : activeTab[0].toUpperCase() + activeTab.slice(1)}</Text>
          </View>
          <Pressable style={styles.avatar}><Text style={styles.avatarText}>A</Text></Pressable>
        </View>

        {activeTab === 'home' && <HomeView book={continueBook} books={books} onRead={() => setReaderBook(continueBook)} onDetails={setSelectedBook} />}
        {activeTab === 'library' && <LibraryView books={filteredBooks} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onImport={importBook} onDetails={setSelectedBook} onRead={setReaderBook} />}
        {activeTab === 'lists' && <ListsView books={books} onDetails={setSelectedBook} />}
        {activeTab === 'settings' && <SettingsView darkReader={darkReader} setDarkReader={setDarkReader} fontSize={fontSize} setFontSize={setFontSize} />}
      </ScrollView>

      <Modal visible={Boolean(selectedBook)} transparent animationType="fade" onRequestClose={() => setSelectedBook(null)}>
        {selectedBook && <BookDetail book={selectedBook} onClose={() => setSelectedBook(null)} onRead={() => { setSelectedBook(null); setReaderBook(selectedBook); }} />}
      </Modal>
      <Modal visible={Boolean(readerBook)} animationType="slide" onRequestClose={() => setReaderBook(null)}>
        {readerBook && <Reader book={readerBook} dark={darkReader} fontSize={fontSize} onClose={() => setReaderBook(null)} onBookmark={() => {}} />}
      </Modal>
    </View>
  );
}

function HomeView({ book, books, onRead, onDetails }: { book: Book; books: Book[]; onRead: () => void; onDetails: (book: Book) => void }) {
  return <>
    <Text style={styles.sectionLabel}>YOUR READING SPACE</Text>
    <View style={styles.heroCard}>
      <View style={styles.heroCopy}>
        <View style={styles.pill}><Flame size={13} color="#191919" /><Text style={styles.pillText}>  4 day streak</Text></View>
        <Text style={styles.heroTitle}>A quiet place{`\n`}for good stories.</Text>
        <Text style={styles.heroSub}>Pick up where you left off.</Text>
        <Pressable style={styles.darkButton} onPress={onRead}><BookOpen size={16} color="#fff" /><Text style={styles.darkButtonText}>Continue reading</Text></Pressable>
      </View>
      <View style={styles.heroBook}><BookCover book={book} large /></View>
    </View>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Continue reading</Text><Pressable><Text style={styles.link}>See all</Text></Pressable></View>
    <Pressable style={styles.continueCard} onPress={onRead}>
      <BookCover book={book} />
      <View style={styles.continueInfo}><Text style={styles.bookTitle}>{book.title}</Text><Text style={styles.author}>{book.author}</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${book.progress}%` }]} /></View><Text style={styles.progressText}>{book.progress}% complete  ·  Chapter 8</Text></View><ChevronRight size={20} color="#777" />
    </Pressable>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your collection</Text><Pressable><Text style={styles.link}>{books.length} books</Text></Pressable></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalBooks}>{books.slice(0, 3).map((item) => <Pressable key={item.id} style={styles.miniBook} onPress={() => onDetails(item)}><BookCover book={item} /><Text style={styles.miniTitle} numberOfLines={1}>{item.title}</Text><Text style={styles.miniAuthor}>{item.author}</Text></Pressable>)}</ScrollView>
  </>;
}

function LibraryView({ books, query, setQuery, filter, setFilter, onImport, onDetails, onRead }: { books: Book[]; query: string; setQuery: (value: string) => void; filter: 'All' | 'Reading' | 'Unread'; setFilter: (value: 'All' | 'Reading' | 'Unread') => void; onImport: () => void; onDetails: (book: Book) => void; onRead: (book: Book) => void }) {
  return <>
    <View style={styles.libraryTop}><Text style={styles.pageTitle}>Your library</Text><Pressable style={styles.iconButton} onPress={onImport}><FilePlus size={20} color="#191919" /></Pressable></View>
    <Pressable style={styles.importButton} onPress={onImport}><FilePlus size={18} color="#191919" /><Text style={styles.importText}>Import an EPUB</Text><Text style={styles.importHint}>Offline reading</Text></Pressable>
    <View style={styles.searchBox}><Search size={18} color="#929292" /><TextInput value={query} onChangeText={setQuery} placeholder="Search your books" placeholderTextColor="#999" style={styles.searchInput} /><SlidersHorizontal size={18} color="#929292" /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{(['All', 'Reading', 'Unread'] as const).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterPill, filter === item && styles.filterPillActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</ScrollView>
    <View style={styles.libraryGrid}>{books.map((book) => <Pressable key={book.id} style={styles.libraryCard} onPress={() => onDetails(book)}><BookCover book={book} /><View style={styles.cardText}><Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text><Text style={styles.author}>{book.author}</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${book.progress}%` }]} /></View><Pressable onPress={() => onRead(book)}><Text style={styles.readLink}>{book.progress ? 'Continue' : 'Start reading'}  →</Text></Pressable></View></Pressable>)}</View>
    {books.length === 0 && <View style={styles.empty}><BookOpen size={32} color="#999" /><Text style={styles.emptyTitle}>No books found</Text><Text style={styles.emptyText}>Try another search or import an EPUB.</Text></View>}
  </>;
}

function ListsView({ books, onDetails }: { books: Book[]; onDetails: (book: Book) => void }) {
  return <><View style={styles.libraryTop}><Text style={styles.pageTitle}>Your lists</Text><Pressable style={styles.addList}><Text style={styles.addListText}>+ New list</Text></Pressable></View><Text style={styles.mutedIntro}>Make space for the stories you want to remember.</Text><View style={styles.listCard}><View style={[styles.listIcon, { backgroundColor: '#E7DDD0' }]}><Bookmark size={20} color="#624F3D" /></View><View style={styles.listCopy}><Text style={styles.listTitle}>Want to read</Text><Text style={styles.listMeta}>{books.filter((book) => book.status === 'Unread').length} books saved for later</Text></View><ChevronRight size={19} color="#888" /></View><View style={styles.listCard}><View style={[styles.listIcon, { backgroundColor: '#D8E5E0' }]}><Heart size={20} color="#496A5E" /></View><View style={styles.listCopy}><Text style={styles.listTitle}>Favorites</Text><Text style={styles.listMeta}>A personal collection</Text></View><ChevronRight size={19} color="#888" /></View><Text style={[styles.sectionLabel, { marginTop: 34 }]}>RECENTLY ADDED</Text>{books.slice(0, 3).map((book) => <Pressable key={book.id} style={styles.recentRow} onPress={() => onDetails(book)}><BookCover book={book} /><View style={styles.recentCopy}><Text style={styles.bookTitle}>{book.title}</Text><Text style={styles.author}>{book.author}</Text></View><MoreHorizontal size={20} color="#888" /></Pressable>)}</>;
}

function SettingsView({ darkReader, setDarkReader, fontSize, setFontSize }: { darkReader: boolean; setDarkReader: (value: boolean) => void; fontSize: number; setFontSize: (value: number) => void }) {
  return <><Text style={styles.pageTitle}>Settings</Text><Text style={styles.mutedIntro}>Make Hanbooks feel like your own quiet corner.</Text><Text style={styles.sectionLabel}>READING</Text><View style={styles.settingGroup}><SettingRow label="Dark reading theme" description="A softer screen for late nights" right={<Pressable style={[styles.toggle, darkReader && styles.toggleOn]} onPress={() => setDarkReader(!darkReader)}><View style={[styles.toggleKnob, darkReader && styles.toggleKnobOn]} /></Pressable>} /><SettingRow label="Text size" description={`${fontSize}px · Comfortable`} right={<View style={styles.stepper}><Pressable onPress={() => setFontSize(Math.max(15, fontSize - 1))}><Text style={styles.step}>−</Text></Pressable><Text style={styles.stepValue}>{fontSize}</Text><Pressable onPress={() => setFontSize(Math.min(24, fontSize + 1))}><Text style={styles.step}>+</Text></Pressable></View>} /><SettingRow label="Line spacing" description="Relaxed" right={<ChevronRight size={19} color="#999" />} last /></View><Text style={styles.sectionLabel}>STORAGE</Text><View style={styles.settingGroup}><SettingRow label="Offline library" description="Books are kept on this device" right={<Check size={19} color="#496A5E" />} /><SettingRow label="Manage storage" description="4 books · 18.4 MB" right={<ChevronRight size={19} color="#999" />} last /></View><View style={styles.version}><Sparkles size={15} color="#9A8B7A" /><Text style={styles.versionText}>Hanbooks · a slower way to read</Text></View></>;
}

function SettingRow({ label, description, right, last = false }: { label: string; description: string; right: React.ReactNode; last?: boolean }) { return <View style={[styles.settingRow, last && styles.settingRowLast]}><View><Text style={styles.settingLabel}>{label}</Text><Text style={styles.settingDescription}>{description}</Text></View>{right}</View>; }

function BookCover({ book, large = false }: { book: Book; large?: boolean }) { return <View style={[styles.cover, { backgroundColor: book.color }, large && styles.coverLarge]}><Text style={[styles.coverKicker, large && styles.coverKickerLarge]}>A NOVEL</Text><Text style={[styles.coverTitle, large && styles.coverTitleLarge]}>{book.title}</Text><View style={styles.coverLine} /><Text style={styles.coverAuthor}>{book.author}</Text></View>; }

function BookDetail({ book, onClose, onRead }: { book: Book; onClose: () => void; onRead: () => void }) { return <View style={styles.modalShade}><View style={styles.detailSheet}><Pressable style={styles.closeButton} onPress={onClose}><X size={20} color="#191919" /></Pressable><BookCover book={book} large /><Text style={styles.detailTitle}>{book.title}</Text><Text style={styles.detailAuthor}>{book.author}</Text><Text style={styles.detailDescription}>A thoughtful, atmospheric story to return to whenever you need a little more time with yourself.</Text><View style={styles.detailStats}><View><Text style={styles.statNumber}>{book.progress}%</Text><Text style={styles.statLabel}>Progress</Text></View><View><Text style={styles.statNumber}>8</Text><Text style={styles.statLabel}>Chapters</Text></View><View><Text style={styles.statNumber}>EPUB</Text><Text style={styles.statLabel}>Format</Text></View></View><Pressable style={styles.darkButtonFull} onPress={onRead}><BookOpen size={17} color="#fff" /><Text style={styles.darkButtonText}>{book.progress ? 'Continue reading' : 'Start reading'}</Text></Pressable></View></View>; }

function Reader({ book, dark, fontSize, onClose, onBookmark }: { book: Book; dark: boolean; fontSize: number; onClose: () => void; onBookmark: () => void }) { return <View style={[styles.reader, dark && styles.readerDark]}><View style={styles.readerHeader}><Pressable style={styles.readerIcon} onPress={onClose}><Text style={styles.backArrow}>‹</Text></Pressable><View style={styles.chapterPill}><Text style={[styles.chapterText, dark && styles.darkText]}>Chapter 8</Text></View><Pressable style={styles.readerIcon} onPress={onBookmark}><Bookmark size={19} color={dark ? '#F6F3EE' : '#191919'} /></Pressable></View><ScrollView contentContainerStyle={styles.readerContent}><Text style={[styles.readerKicker, dark && styles.darkMuted]}>THE SILENT PATIENT</Text><Text style={[styles.readerTitle, dark && styles.darkText, { fontSize: fontSize + 12 }]}>The room{`\n`}was quiet.</Text><Text style={[styles.readerBody, dark && styles.darkText, { fontSize }]}>{`The house had settled into its familiar silence. Outside, the last light slipped between the buildings and left a pale stripe across the floor.\n\nI had learned not to rush these moments. A good story asks for attention, but it also gives something back: a place to stand still, a small lamp in the dark.\n\nShe turned the page slowly. Somewhere beyond the window, the city was beginning its evening rhythm. Here, there was only the soft sound of paper and the feeling that the next sentence might change everything.`}</Text></ScrollView><View style={styles.readerFooter}><Text style={[styles.pageCount, dark && styles.darkMuted]}>24 / 86</Text><View style={styles.readerProgress}><View style={styles.readerProgressFill} /></View><Text style={[styles.pageCount, dark && styles.darkMuted]}>28%</Text></View></View>; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F8F6' },
  content: { padding: 24, paddingTop: 20, paddingBottom: 36, maxWidth: 760, width: '100%', alignSelf: 'center' },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  brand: { fontSize: 12, letterSpacing: 2.5, fontWeight: '700', color: '#777' },
  greeting: { fontSize: 14, color: '#555', marginTop: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#191919', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700' },
  sectionLabel: { fontSize: 10, letterSpacing: 1.5, color: '#9B9B9B', fontWeight: '700', marginBottom: 12 },
  heroCard: { minHeight: 270, backgroundColor: '#E6E6E3', borderRadius: 24, padding: 22, overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  heroCopy: { flex: 1, zIndex: 1 },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  pillText: { fontSize: 11, fontWeight: '600', color: '#333' },
  heroTitle: { fontSize: 30, lineHeight: 34, letterSpacing: -1, color: '#191919', fontWeight: '600', marginTop: 24 },
  heroSub: { fontSize: 13, color: '#727272', marginTop: 12 },
  darkButton: { backgroundColor: '#191919', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start', marginTop: 22 },
  darkButtonFull: { backgroundColor: '#191919', borderRadius: 25, paddingVertical: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  darkButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  heroBook: { alignSelf: 'flex-end', marginRight: -8, marginBottom: -8, transform: [{ rotate: '8deg' }] },
  cover: { width: 92, height: 128, borderRadius: 6, padding: 10, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.13, shadowRadius: 9, shadowOffset: { width: 2, height: 5 }, elevation: 3 },
  coverLarge: { width: 142, height: 196, padding: 14, alignSelf: 'center' },
  coverKicker: { fontSize: 6, letterSpacing: 1.5, color: '#4D4D4D', fontWeight: '700' },
  coverKickerLarge: { fontSize: 8 },
  coverTitle: { fontSize: 12, lineHeight: 14, color: '#252525', fontWeight: '700' },
  coverTitleLarge: { fontSize: 18, lineHeight: 21 },
  coverLine: { height: 1, backgroundColor: 'rgba(25,25,25,0.45)', width: '35%' },
  coverAuthor: { fontSize: 7, color: '#4D4D4D' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#191919', fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  link: { fontSize: 12, color: '#777' },
  continueCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 30, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  continueInfo: { flex: 1 },
  bookTitle: { fontSize: 14, lineHeight: 19, fontWeight: '600', color: '#222' },
  author: { color: '#8B8B8B', fontSize: 12, marginTop: 4 },
  progressTrack: { height: 4, borderRadius: 3, backgroundColor: '#E8E8E6', marginTop: 13, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6B8073', borderRadius: 3 },
  progressText: { color: '#999', fontSize: 10, marginTop: 6 },
  horizontalBooks: { gap: 16, paddingBottom: 10 },
  miniBook: { width: 106 },
  miniTitle: { color: '#333', fontSize: 12, fontWeight: '600', marginTop: 9 },
  miniAuthor: { color: '#999', fontSize: 10, marginTop: 3 },
  pageTitle: { fontSize: 32, lineHeight: 38, letterSpacing: -1.2, color: '#191919', fontWeight: '600', marginBottom: 8 },
  libraryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  iconButton: { height: 40, width: 40, borderRadius: 20, backgroundColor: '#E8E8E5', alignItems: 'center', justifyContent: 'center' },
  importButton: { backgroundColor: '#E8E8E5', borderRadius: 15, borderWidth: 1, borderColor: '#D8D8D4', borderStyle: 'dashed', padding: 15, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18 },
  importText: { fontSize: 13, fontWeight: '600', color: '#333' },
  importHint: { color: '#929292', fontSize: 11, marginLeft: 'auto' },
  searchBox: { height: 48, backgroundColor: '#FFF', borderRadius: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: '#EBEBE7' },
  searchInput: { flex: 1, color: '#222', fontSize: 14 },
  filters: { gap: 8, paddingVertical: 17 },
  filterPill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0DC' },
  filterPillActive: { backgroundColor: '#191919', borderColor: '#191919' },
  filterText: { fontSize: 12, color: '#888' },
  filterTextActive: { color: '#FFF', fontWeight: '600' },
  libraryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  libraryCard: { width: '47%', backgroundColor: '#FFF', borderRadius: 16, padding: 12, minHeight: 252 },
  cardText: { marginTop: 12 },
  readLink: { color: '#536B5E', fontSize: 11, fontWeight: '600', marginTop: 10 },
  empty: { alignItems: 'center', paddingTop: 50 },
  emptyTitle: { fontWeight: '600', fontSize: 16, marginTop: 14 },
  emptyText: { color: '#929292', fontSize: 13, marginTop: 5 },
  addList: { backgroundColor: '#191919', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  addListText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  mutedIntro: { color: '#878787', fontSize: 14, lineHeight: 21, marginBottom: 28 },
  listCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 10 },
  listIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  listCopy: { flex: 1 },
  listTitle: { fontSize: 15, color: '#222', fontWeight: '600' },
  listMeta: { color: '#929292', fontSize: 12, marginTop: 4 },
  recentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 10, gap: 13, marginBottom: 8 },
  recentCopy: { flex: 1 },
  settingGroup: { backgroundColor: '#FFF', borderRadius: 17, paddingHorizontal: 16, marginBottom: 28 },
  settingRow: { minHeight: 70, borderBottomColor: '#F0F0ED', borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingRowLast: { borderBottomWidth: 0 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#303030' },
  settingDescription: { fontSize: 11, color: '#999', marginTop: 4 },
  toggle: { width: 44, height: 26, borderRadius: 15, backgroundColor: '#D7D7D3', padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: '#6B8073' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  step: { fontSize: 23, color: '#777' },
  stepValue: { fontSize: 13, color: '#333', minWidth: 22, textAlign: 'center' },
  version: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  versionText: { color: '#A29A90', fontSize: 11 },
  modalShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  detailSheet: { backgroundColor: '#F8F8F6', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 32, minHeight: '73%' },
  closeButton: { position: 'absolute', right: 20, top: 18, zIndex: 2, width: 34, height: 34, borderRadius: 17, backgroundColor: '#E9E9E6', alignItems: 'center', justifyContent: 'center' },
  detailTitle: { textAlign: 'center', fontSize: 24, fontWeight: '600', color: '#191919', marginTop: 20 },
  detailAuthor: { textAlign: 'center', color: '#888', fontSize: 13, marginTop: 6 },
  detailDescription: { textAlign: 'center', color: '#777', fontSize: 13, lineHeight: 20, marginTop: 20 },
  detailStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFF', borderRadius: 15, padding: 16, marginTop: 22 },
  statNumber: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#333' },
  statLabel: { textAlign: 'center', color: '#999', fontSize: 10, marginTop: 5 },
  reader: { flex: 1, backgroundColor: '#F8F8F6', paddingHorizontal: 24, paddingTop: 20 },
  readerDark: { backgroundColor: '#20201F' },
  readerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 32, lineHeight: 33, color: '#191919', marginTop: -3 },
  chapterPill: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 18, paddingHorizontal: 15, paddingVertical: 9 },
  chapterText: { fontSize: 12, color: '#555' },
  readerContent: { paddingTop: 60, paddingBottom: 80, maxWidth: 650, width: '100%', alignSelf: 'center' },
  readerKicker: { color: '#8A8A87', fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 20 },
  readerTitle: { color: '#191919', fontWeight: '600', lineHeight: 42, letterSpacing: -1, marginBottom: 26 },
  readerBody: { color: '#454545', lineHeight: 30 },
  readerFooter: { position: 'absolute', bottom: 20, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', gap: 10 },
  readerProgress: { height: 3, flex: 1, backgroundColor: '#D9D9D4', borderRadius: 2 },
  readerProgressFill: { height: 3, width: '28%', backgroundColor: '#6B8073', borderRadius: 2 },
  pageCount: { fontSize: 10, color: '#888' },
  darkText: { color: '#F3F0E9' },
  darkMuted: { color: '#ABA89F' },
});
