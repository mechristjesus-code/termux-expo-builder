import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>TERMUX + EXPO</Text>
        <Text style={styles.title}>Build once.{"\n"}Ship anywhere.</Text>
        <Text style={styles.subtitle}>
          A clean starting point for Android and iOS apps, designed to be edited from your phone.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your app starts here</Text>
          <Text style={styles.cardBody}>
            Replace this screen with your product. Run Expo Go for fast testing, then use EAS Build
            when you are ready for an installable release.
          </Text>
          <Pressable style={styles.button} onPress={() => undefined}>
            <Text style={styles.buttonText}>Start customizing</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Android APK</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.footerText}>iOS build</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.footerText}>GitHub Actions</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b1020' },
  container: { flex: 1, padding: 28, justifyContent: 'center' },
  eyebrow: { color: '#79f2c0', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#f7f8ff', fontSize: 44, lineHeight: 48, fontWeight: '800', marginTop: 14 },
  subtitle: { color: '#a8b1c7', fontSize: 17, lineHeight: 25, marginTop: 18, maxWidth: 420 },
  card: {
    backgroundColor: '#171e34', borderRadius: 24, padding: 22, marginTop: 34,
    borderWidth: 1, borderColor: '#2c3859',
  },
  cardTitle: { color: '#ffffff', fontSize: 21, fontWeight: '700' },
  cardBody: { color: '#b9c2d8', fontSize: 15, lineHeight: 23, marginTop: 10 },
  button: { backgroundColor: '#79f2c0', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#0b1020', fontSize: 15, fontWeight: '800' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, flexWrap: 'wrap' },
  footerText: { color: '#7e8aa7', fontSize: 12, fontWeight: '700' },
  dot: { color: '#79f2c0', marginHorizontal: 8 },
});
