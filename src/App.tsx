import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Tab = 'dashboard' | 'builds' | 'assistant' | 'settings';
type Platform = 'android' | 'ios' | 'all';

const BUILD_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_BUILD_WEBHOOK_URL ?? '';
const AI_BASE_URL = process.env.EXPO_PUBLIC_AI_BASE_URL ?? 'http://127.0.0.1:8080';

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [platform, setPlatform] = useState<Platform>('android');
  const [profile, setProfile] = useState<'preview' | 'production'>('preview');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('Ready for your next build command.');

  const endpointLabel = useMemo(() => {
    if (!BUILD_WEBHOOK_URL) return 'n8n webhook not configured';
    return 'n8n build trigger connected';
  }, []);

  async function requestBuild() {
    if (!BUILD_WEBHOOK_URL) {
      setNotice('Set EXPO_PUBLIC_N8N_BUILD_WEBHOOK_URL to connect builds.');
      return;
    }
    setBusy(true);
    setNotice(`Sending ${platform}/${profile} request to n8n…`);
    try {
      const response = await fetch(BUILD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, profile, source: 'control-panel' }),
      });
      if (!response.ok) throw new Error(`n8n returned ${response.status}`);
      setNotice('Build request accepted. n8n is handing it to GitHub Actions.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Build request failed.');
    } finally {
      setBusy(false);
    }
  }

  async function askLocalModel() {
    if (!prompt.trim()) return;
    setBusy(true);
    setAnswer('Thinking with the configured GGUF assistant…');
    try {
      const response = await fetch(`${AI_BASE_URL.replace(/\/$/, '')}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'local-gguf',
          messages: [
            { role: 'system', content: 'You are the Termux Expo Builder copilot. Give safe, concrete build and release steps.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        }),
      });
      if (!response.ok) throw new Error(`GGUF server returned ${response.status}`);
      const data = await response.json();
      setAnswer(data.choices?.[0]?.message?.content ?? 'The local model returned no text.');
    } catch (error) {
      setAnswer(`${error instanceof Error ? error.message : 'Assistant request failed.'}\n\nStart a llama.cpp server in Termux or set EXPO_PUBLIC_AI_BASE_URL to your local model endpoint.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>TERMUX EXPO BUILDER</Text>
            <Text style={styles.headerTitle}>AI release console</Text>
          </View>
          <View style={styles.statusPill}><View style={styles.statusDot} /><Text style={styles.statusText}>LOCAL-FIRST</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {tab === 'dashboard' && <Dashboard notice={notice} endpointLabel={endpointLabel} onBuild={() => setTab('builds')} onAssistant={() => setTab('assistant')} />}
          {tab === 'builds' && (
            <Builds platform={platform} setPlatform={setPlatform} profile={profile} setProfile={setProfile} busy={busy} notice={notice} onBuild={requestBuild} />
          )}
          {tab === 'assistant' && <Assistant prompt={prompt} setPrompt={setPrompt} answer={answer} busy={busy} onAsk={askLocalModel} />}
          {tab === 'settings' && <Settings aiBaseUrl={AI_BASE_URL} webhookConnected={Boolean(BUILD_WEBHOOK_URL)} />}
        </ScrollView>

        <View style={styles.tabBar}>
          <TabButton label="Home" icon="⌂" active={tab === 'dashboard'} onPress={() => setTab('dashboard')} />
          <TabButton label="Build" icon="▣" active={tab === 'builds'} onPress={() => setTab('builds')} />
          <TabButton label="AI" icon="✦" active={tab === 'assistant'} onPress={() => setTab('assistant')} />
          <TabButton label="Config" icon="⚙" active={tab === 'settings'} onPress={() => setTab('settings')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Dashboard({ notice, endpointLabel, onBuild, onAssistant }: { notice: string; endpointLabel: string; onBuild: () => void; onAssistant: () => void }) {
  return <>
    <Text style={styles.kicker}>ONE CODEBASE / FOUR CONTROL PLANES</Text>
    <Text style={styles.hero}>Build, think, ship.</Text>
    <Text style={styles.lede}>Manage APKs, OTA updates, store releases, and a local GGUF copilot from one phone-first workspace.</Text>
    <View style={styles.grid}>
      <Metric label="Android" value="APK ready" detail="EAS preview" />
      <Metric label="Web" value="Online" detail="Expo web target" />
      <Metric label="AI" value="GGUF bridge" detail="Termux / LAN" />
      <Metric label="Updates" value="2 channels" detail="Preview + production" />
    </View>
    <View style={styles.card}>
      <Text style={styles.cardLabel}>SYSTEM STATUS</Text>
      <Text style={styles.cardTitle}>{endpointLabel}</Text>
      <Text style={styles.cardBody}>{notice}</Text>
      <View style={styles.row}>
        <ActionButton title="Start a build" onPress={onBuild} />
        <ActionButton title="Ask the copilot" secondary onPress={onAssistant} />
      </View>
    </View>
    <View style={styles.card}>
      <Text style={styles.cardLabel}>AI MINDSET</Text>
      <Text style={styles.cardBody}>The assistant can reason about app changes, recommend whether an OTA update or native rebuild is needed, and prepare the exact Termux or Telegram command.</Text>
    </View>
  </>;
}

function Builds({ platform, setPlatform, profile, setProfile, busy, notice, onBuild }: { platform: Platform; setPlatform: (value: Platform) => void; profile: 'preview' | 'production'; setProfile: (value: 'preview' | 'production') => void; busy: boolean; notice: string; onBuild: () => void }) {
  return <>
    <Text style={styles.kicker}>RELEASE CONTROL</Text>
    <Text style={styles.sectionTitle}>Choose a target.</Text>
    <Text style={styles.lede}>Preview creates an installable APK. Production is for store-ready builds and controlled releases.</Text>
    <Text style={styles.fieldLabel}>PLATFORM</Text>
    <View style={styles.segmentRow}>{(['android', 'ios', 'all'] as Platform[]).map((item) => <Segment key={item} label={item.toUpperCase()} active={platform === item} onPress={() => setPlatform(item)} />)}</View>
    <Text style={styles.fieldLabel}>PROFILE</Text>
    <View style={styles.segmentRow}>{(['preview', 'production'] as const).map((item) => <Segment key={item} label={item.toUpperCase()} active={profile === item} onPress={() => setProfile(item)} />)}</View>
    <View style={styles.card}>
      <Text style={styles.cardLabel}>REQUEST</Text>
      <Text style={styles.cardTitle}>{platform} / {profile}</Text>
      <Text style={styles.cardBody}>The request goes to n8n, then GitHub Actions, then Expo EAS. Store submission stays separate so you remain in control.</Text>
      <ActionButton title={busy ? 'Sending…' : 'Queue build'} onPress={onBuild} disabled={busy} />
      {busy && <ActivityIndicator color="#79f2c0" style={styles.spinner} />}
      <Text style={styles.notice}>{notice}</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.cardLabel}>OTA UPDATE RULE</Text>
      <Text style={styles.cardBody}>Use an OTA update for JavaScript and UI changes. Create a new native build for permissions, native packages, SDK upgrades, or app identity changes.</Text>
    </View>
  </>;
}

function Assistant({ prompt, setPrompt, answer, busy, onAsk }: { prompt: string; setPrompt: (value: string) => void; answer: string; busy: boolean; onAsk: () => void }) {
  return <>
    <Text style={styles.kicker}>LOCAL AI COPILOT</Text>
    <Text style={styles.sectionTitle}>Ask the GGUF brain.</Text>
    <Text style={styles.lede}>This screen talks to an OpenAI-compatible llama.cpp server. The model stays in Termux or on your LAN; the APK stays lightweight.</Text>
    <TextInput value={prompt} onChangeText={setPrompt} placeholder="e.g. Should this change be an OTA update or a new APK?" placeholderTextColor="#687593" multiline style={styles.input} />
    <ActionButton title={busy ? 'Thinking…' : 'Ask local model'} onPress={onAsk} disabled={busy || !prompt.trim()} />
    {answer ? <View style={styles.answer}><Text style={styles.cardLabel}>COPILOT RESPONSE</Text><Text style={styles.answerText}>{answer}</Text></View> : <View style={styles.card}><Text style={styles.cardBody}>Try: “Prepare the exact Termux commands to make an Android preview APK and publish it to Telegram.”</Text></View>}
  </>;
}

function Settings({ aiBaseUrl, webhookConnected }: { aiBaseUrl: string; webhookConnected: boolean }) {
  return <>
    <Text style={styles.kicker}>RUNTIME CONFIGURATION</Text>
    <Text style={styles.sectionTitle}>Keep it yours.</Text>
    <Text style={styles.lede}>Secrets stay in n8n, Expo, GitHub, or Termux environment files. They are never bundled into the public app.</Text>
    <View style={styles.card}><Text style={styles.cardLabel}>AI ENDPOINT</Text><Text style={styles.cardTitle}>{aiBaseUrl}</Text><Text style={styles.cardBody}>Run llama.cpp with a GGUF model in Termux, or point this value at a LAN server.</Text></View>
    <View style={styles.card}><Text style={styles.cardLabel}>BUILD WEBHOOK</Text><Text style={styles.cardTitle}>{webhookConnected ? 'Connected' : 'Not configured'}</Text><Text style={styles.cardBody}>Set EXPO_PUBLIC_N8N_BUILD_WEBHOOK_URL when starting Expo to enable in-app build requests.</Text></View>
    <View style={styles.card}><Text style={styles.cardLabel}>SUPPORTED SURFACES</Text><Text style={styles.cardBody}>Android APK/AAB • iOS/TestFlight • Web • Termux CLI • Telegram bot • n8n • GitHub Actions • Expo EAS • GGUF local inference</Text></View>
  </>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text></View>; }
function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.segment, active && styles.segmentActive]}><Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text></Pressable>; }
function TabButton({ label, icon, active, onPress }: { label: string; icon: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.tab}><Text style={[styles.tabIcon, active && styles.tabActive]}>{icon}</Text><Text style={[styles.tabText, active && styles.tabActive]}>{label}</Text></Pressable>; }
function ActionButton({ title, secondary, disabled, onPress }: { title: string; secondary?: boolean; disabled?: boolean; onPress: () => void }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.buttonSecondary, disabled && styles.buttonDisabled]}><Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text></Pressable>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b1020' }, shell: { flex: 1, maxWidth: 900, width: '100%', alignSelf: 'center' }, header: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { color: '#79f2c0', fontSize: 11, fontWeight: '800', letterSpacing: 1.7 }, headerTitle: { color: '#f7f8ff', fontSize: 20, fontWeight: '800', marginTop: 4 }, statusPill: { borderColor: '#2c3859', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center' }, statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#79f2c0', marginRight: 6 }, statusText: { color: '#a8b1c7', fontSize: 10, fontWeight: '800' }, content: { padding: 24, paddingTop: 12, paddingBottom: 32 }, kicker: { color: '#79f2c0', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }, hero: { color: '#f7f8ff', fontSize: 42, lineHeight: 47, fontWeight: '800', marginTop: 12 }, sectionTitle: { color: '#f7f8ff', fontSize: 34, lineHeight: 40, fontWeight: '800', marginTop: 12 }, lede: { color: '#a8b1c7', fontSize: 16, lineHeight: 24, marginTop: 12, maxWidth: 680 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 26 }, metric: { backgroundColor: '#171e34', borderColor: '#2c3859', borderWidth: 1, borderRadius: 16, padding: 15, minWidth: 145, flexGrow: 1 }, metricLabel: { color: '#7e8aa7', fontSize: 11, fontWeight: '800' }, metricValue: { color: '#f7f8ff', fontSize: 17, fontWeight: '800', marginTop: 9 }, metricDetail: { color: '#79f2c0', fontSize: 11, marginTop: 4 }, card: { backgroundColor: '#171e34', borderColor: '#2c3859', borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 18 }, cardLabel: { color: '#79f2c0', fontSize: 11, letterSpacing: 1.2, fontWeight: '800' }, cardTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginTop: 9 }, cardBody: { color: '#b9c2d8', fontSize: 15, lineHeight: 23, marginTop: 9 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 }, button: { backgroundColor: '#79f2c0', borderRadius: 13, paddingHorizontal: 17, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 18, minHeight: 48 }, buttonSecondary: { backgroundColor: 'transparent', borderColor: '#79f2c0', borderWidth: 1 }, buttonDisabled: { opacity: 0.5 }, buttonText: { color: '#0b1020', fontSize: 14, fontWeight: '800' }, buttonTextSecondary: { color: '#79f2c0' }, tabBar: { borderTopColor: '#202a45', borderTopWidth: 1, backgroundColor: '#11182b', flexDirection: 'row', paddingBottom: 8, paddingTop: 8 }, tab: { flex: 1, alignItems: 'center', paddingVertical: 5 }, tabIcon: { color: '#687593', fontSize: 20 }, tabText: { color: '#687593', fontSize: 10, fontWeight: '700', marginTop: 3 }, tabActive: { color: '#79f2c0' }, fieldLabel: { color: '#7e8aa7', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 28, marginBottom: 9 }, segmentRow: { flexDirection: 'row', gap: 8 }, segment: { borderColor: '#2c3859', borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12 }, segmentActive: { backgroundColor: '#79f2c0', borderColor: '#79f2c0' }, segmentText: { color: '#a8b1c7', fontSize: 12, fontWeight: '800' }, segmentTextActive: { color: '#0b1020' }, spinner: { marginTop: 14 }, notice: { color: '#7e8aa7', fontSize: 12, lineHeight: 18, marginTop: 13 }, input: { minHeight: 120, borderColor: '#2c3859', borderWidth: 1, borderRadius: 16, backgroundColor: '#11182b', color: '#f7f8ff', padding: 16, marginTop: 24, fontSize: 15, textAlignVertical: 'top' }, answer: { backgroundColor: '#102a2b', borderColor: '#2d8d78', borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 18 }, answerText: { color: '#e9fff7', fontSize: 15, lineHeight: 24, marginTop: 12 },
});
