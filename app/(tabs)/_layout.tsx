import { Tabs } from 'expo-router';
import { BookOpen, Home, List, Settings } from 'lucide-react-native';

const INK = '#191919';
const MUTED = '#929292';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: INK,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          height: 82,
          paddingTop: 10,
          paddingBottom: 16,
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderTopColor: '#E5E5E5',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="library" options={{ title: 'Library', tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="lists" options={{ title: 'Lists', tabBarIcon: ({ color, size }) => <List color={color} size={size} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} strokeWidth={1.8} /> }} />
    </Tabs>
  );
}
