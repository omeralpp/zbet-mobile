import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type PropsWithChildren, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { typeScale } from "@/src/theme/typography";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
import { JinxAnimator } from "./JinxAnimator";
import { createJinxMotionState, jinxMotionReducer, sceneCopy, type JinxCandidate, type JinxMotionMode, type JinxScene } from "./jinx-motion";
import { StatisticalReadout } from "./StatisticalReadout";
import { labMotionStorageKey, prototypePalettes, type PrototypePalette } from "./prototype-theme";

type LabMode = "experience" | "scenes" | "findings";
type DemoRoute = "overview" | "live" | "match" | "super" | "toto" | "settings";
type DemoMatch = { key: string; home: string; away: string; league: string; minute: string; score: string; stars: number; selection: string | null; selectedPrice: string; currentPrice: string };

const matches: readonly DemoMatch[] = [
  { key: "demo-inter", home: "Inter Turku", away: "Gnistan", league: "Finlandiya · Veikkausliiga", minute: "78′", score: "2–1", stars: 4, selection: "Ev sahibi / beraberlik", selectedPrice: "1,42", currentPrice: "1,38" },
  { key: "demo-istanbul", home: "Gençlerbirliği", away: "İstanbul Başakşehir", league: "Türkiye · örnek lig", minute: "33′", score: "0–0", stars: 0, selection: null, selectedPrice: "—", currentPrice: "—" },
  { key: "demo-almeria", home: "R. Sociedad B", away: "Almeria", league: "İspanya · örnek lig", minute: "87′", score: "1–3", stars: 3, selection: "4,5 gol altı", selectedPrice: "1,20", currentPrice: "1,17" }
];
const journeyEvents = [
  { minute: "22′", kind: "Gol", title: "Inter Turku · 1–0", detail: "Skor kaydı. Bu olayın gelecekteki gol olasılığına etkisi hesaplanmadı." },
  { minute: "44′", kind: "Gol", title: "Gnistan · 1–1", detail: "İlk yarı skoru 1–1. Geçmiş olay; güncel durum üst başlıkta." },
  { minute: "67′", kind: "Super", title: "Kayıtlı seçim · 1–1", detail: "Ev sahibi / beraberlik, kayıt anındaki oran 1,42. Rating 4/5; kazanma olasılığı değildir." },
  { minute: "72′", kind: "Kart", title: "Inter Turku · kırmızı kart", detail: "Kartın dakikası kayıtlı. Bu örnekte ölçülmüş havuz etkisi yok." },
  { minute: "73′", kind: "Gol", title: "Inter Turku · 2–1", detail: "Son gol kaydı. Güncel dakika 78′; geçmiş olay ile güncel dakika ayrı." }
];
const routes: readonly [DemoRoute, string][] = [["overview", "Özet"], ["live", "Canlı"], ["match", "Maç"], ["super", "Super"], ["toto", "Toto"], ["settings", "Ayarlar"]];
const modeLabels: Record<JinxMotionMode, string> = { LIVE: "Canlı", CALM: "Sakin", OFF: "Hareketsiz" };
const PaletteContext = createContext<PrototypePalette>(prototypePalettes.dark);

function Copy({ children, kind = "body", muted = false, style, heading = false }: PropsWithChildren<{ kind?: "body" | "meta" | "moduleTitle" | "pageTitle" | "metric"; muted?: boolean; style?: StyleProp<TextStyle>; heading?: boolean }>) {
  const p = useContext(PaletteContext);
  return <Text accessibilityRole={heading ? "header" : undefined} style={[typeScale[kind], { color: muted ? p.muted : p.text }, style]}>{children}</Text>;
}
function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const p = useContext(PaletteContext);
  return <View style={[styles.card, { backgroundColor: p.surface, borderColor: p.border }, style]}>{children}</View>;
}
function Button({ children, onPress, selected, disabled = false, primary = false, label, tab = false, expanded, style }: PropsWithChildren<{ onPress: () => void; selected?: boolean; disabled?: boolean; primary?: boolean; label?: string; tab?: boolean; expanded?: boolean; style?: StyleProp<ViewStyle> }>) {
  const p = useContext(PaletteContext);
  const isSelected = selected ?? false;
  return <Pressable accessibilityRole={tab ? "tab" : "button"} accessibilityLabel={label}
    aria-selected={tab ? isSelected : undefined} aria-pressed={!tab && selected !== undefined && expanded === undefined ? selected : undefined}
    accessibilityState={{ selected: tab ? isSelected : selected, disabled, expanded }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, { borderColor: isSelected || primary ? p.accent : p.border, backgroundColor: isSelected || primary ? p.accent : p.soft, opacity: disabled ? .52 : pressed ? .76 : 1 }, style]}>
    <Text style={[typeScale.body, { color: isSelected || primary ? p.onAccent : p.text, fontWeight: "700", textAlign: "center" }]}>{children}</Text>
  </Pressable>;
}
function Tag({ children, caution = false }: PropsWithChildren<{ caution?: boolean }>) {
  const p = useContext(PaletteContext);
  return <View style={[styles.tag, { backgroundColor: caution ? p.warningSoft : p.accentSoft }]}><Text style={[typeScale.meta, { color: caution ? p.warning : p.accent }]}>{children}</Text></View>;
}
function Heading({ title, subtitle, trailing }: { title: string; subtitle?: string; trailing?: ReactNode }) {
  return <View style={styles.headingRow}><View style={styles.flex}><Copy kind="moduleTitle" heading>{title}</Copy>{subtitle ? <Copy muted style={styles.top4}>{subtitle}</Copy> : null}</View>{trailing}</View>;
}

/** Synthetic, isolated comparison surface. No API, model or live preference writes. */
export default function DesignLabScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  const sceneSize = wide ? 132 : width < 360 ? 62 : 84;
  const [dark, setDark] = useState(true);
  const p = dark ? prototypePalettes.dark : prototypePalettes.light;
  const [mode, setMode] = useState<LabMode>("experience");
  const [route, setRoute] = useState<DemoRoute>("overview");
  const [candidate, setCandidate] = useState<JinxCandidate>("orb");
  const [motionMode, setMotionMode] = useState<JinxMotionMode>("LIVE");
  const [preferenceReady, setPreferenceReady] = useState(false);
  const [preferenceError, setPreferenceError] = useState(false);
  const preferenceTouched = useRef(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const systemReduced = useReducedMotion();
  const [motion, dispatch] = useReducer(jinxMotionReducer, { matchKey: "demo-inter", revision: "r1" }, createJinxMotionState);
  const [search, setSearch] = useState("");
  const [starOnly, setStarOnly] = useState(false);
  const [pinned, setPinned] = useState<readonly string[]>([]);
  const [selectedKey, setSelectedKey] = useState(matches[0]!.key);
  const [selectedEvent, setSelectedEvent] = useState(2);
  const [asked, setAsked] = useState<"idle" | "thinking" | "ready">("idle");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [lastGoal, setLastGoal] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState("Bir sahne seç. İki aday aynı durum ve zamanlamayı kullanır.");
  const eventCounter = useRef(0);
  const revision = useRef(1);
  const answerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scroll = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const positions = useRef<Partial<Record<DemoRoute, number>>>({});
  const match = matches.find(item => item.key === selectedKey) ?? matches[0]!;

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(labMotionStorageKey).then(value => {
      if (mounted && !preferenceTouched.current && (value === "LIVE" || value === "CALM" || value === "OFF")) setMotionMode(value);
    }).catch(() => { if (mounted) setPreferenceError(true); }).finally(() => { if (mounted) setPreferenceReady(true); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!preferenceReady) return;
    let mounted = true;
    AsyncStorage.setItem(labMotionStorageKey, motionMode).then(() => { if (mounted) setPreferenceError(false); }).catch(() => { if (mounted) setPreferenceError(true); });
    return () => { mounted = false; };
  }, [motionMode, preferenceReady]);
  useEffect(() => () => { if (answerTimer.current) clearTimeout(answerTimer.current); }, []);
  useEffect(() => {
    if (motionMode !== "LIVE" || !motion.active || motion.blocked || motion.scene !== "idle" || reduced || systemReduced || (mode === "experience" && hidden)) return;
    const timer = setTimeout(() => dispatch({ type: "scene", scene: "idle" }), 12_000);
    return () => clearTimeout(timer);
  }, [hidden, mode, motion.active, motion.blocked, motion.scene, motion.sequence, motionMode, reduced, systemReduced]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => scroll.current?.scrollTo({ y: positions.current[route] ?? 0, animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [route]);

  const finish = useCallback((sequence: number) => dispatch({ type: "finish", sequence }), []);
  const navigate = (next: DemoRoute) => { positions.current[route] = scrollY.current; setRoute(next); };
  const changeMotion = (next: JinxMotionMode) => { preferenceTouched.current = true; setMotionMode(next); };
  const changeLabMode = (next: LabMode) => {
    if (next === "experience" && motion.context.matchKey !== selectedKey) {
      if (answerTimer.current) clearTimeout(answerTimer.current);
      setAsked("idle");
      dispatch({ type: "context", context: { matchKey: selectedKey, revision: "r1" } });
      setLastGoal(null);
    }
    setMode(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const chooseMatch = (item: DemoMatch) => {
    if (answerTimer.current) clearTimeout(answerTimer.current);
    setSelectedKey(item.key); setAsked("idle"); setEvidenceOpen(false); setSelectedEvent(2);
    dispatch({ type: "context", context: { matchKey: item.key, revision: "r1" } }); setLastGoal(null); navigate("match");
  };
  const ask = () => {
    const context = motion.context;
    setAsked("thinking"); dispatch({ type: "scene", scene: "thinking" });
    if (answerTimer.current) clearTimeout(answerTimer.current);
    answerTimer.current = setTimeout(() => { setAsked("ready"); dispatch({ type: "answer", context, verdict: "WAIT", current: true }); }, 1400);
  };
  const emitEvent = (kind: "GOAL" | "HALF_TIME" | "SCORE_CORRECTION", repeated = false) => {
    const eventId = repeated && lastGoal ? lastGoal : `${motion.context.matchKey}:${kind}:${++eventCounter.current}`;
    if (kind === "GOAL") setLastGoal(eventId);
    dispatch({ type: "event", context: motion.context, eventId, kind, verified: true });
    setActionNote(repeated ? "Aynı gol kimliği tekrar gönderildi. Sahne sıra no ve olay sayısı artmaz." : `Doğrulanmış sentetik olay: ${eventId}`);
  };
  const playScene = (scene: JinxScene) => {
    if (scene === "goal") emitEvent("GOAL");
    else if (scene === "halfTime") emitEvent("HALF_TIME");
    else if (scene === "answer") { dispatch({ type: "answer", context: motion.context, verdict: "WAIT", current: true }); setActionNote("Güncel örnek yanıt: WAIT. Yanıt hazır olması bahis onayı değildir."); }
    else if (scene === "cheer" || scene === "doubt") { dispatch({ type: "answer", context: motion.context, verdict: "WAIT", current: true, lean: scene === "cheer" ? "FAVORABLE" : "UNFAVORABLE" }); setActionNote(sceneCopy[scene].message); }
    else { dispatch({ type: "scene", scene }); setActionNote(sceneCopy[scene].message); }
  };
  const motionControls = <View style={styles.row}>{(["LIVE", "CALM", "OFF"] as const).map(value => <Button key={value} selected={motionMode === value} onPress={() => changeMotion(value)} label={`Laboratuvar hareketi: ${modeLabels[value]}`}>{modeLabels[value]}</Button>)}</View>;
  const avatar = (size: number, character = candidate) => <JinxAnimator candidate={character} state={motion} mode={motionMode} dark={dark} size={size} forceReducedMotion={reduced} onComplete={finish} />;
  const matchSummary = <View style={[styles.summaryBand, { backgroundColor: p.soft }]}>
    <View style={styles.headingRow}><View style={styles.flex}><Copy kind="meta" muted>{match.league}</Copy><Copy kind="moduleTitle" heading>{match.home} – {match.away}</Copy></View><Tag>{match.minute} · örnek</Tag></View>
    <View style={styles.scoreRow}><Copy style={styles.bigScore}>{match.score}</Copy><View style={styles.flex}><Copy muted>Gösterilen BTB seçimi</Copy><Copy style={styles.strong}>{match.selection ?? "Şu anda seçim yok"}</Copy><Copy kind="meta" muted>{match.stars ? `Rating ${match.stars}/5 · kazanma olasılığı değildir` : "Rating yok · sıfır olasılık anlamına gelmez"}</Copy></View></View>
    <View style={styles.priceRow}><View style={styles.flex}><Copy kind="metric">{match.selectedPrice}</Copy><Copy kind="meta" muted>Kayıt anındaki oran</Copy></View><View style={styles.flex}><Copy kind="metric">{match.currentPrice}</Copy><Copy kind="meta" muted>Güncel örnek oran</Copy></View></View>
  </View>;
  const jinxCard = <Card>
    <View style={styles.headingRow}><Tag caution>Jinx · bahis önerisi yok</Tag><Copy kind="meta" muted>Yalnız açık isteğinle</Copy></View>
    <View style={styles.jinxRow}>{!hidden ? avatar(78) : null}<View style={styles.jinxCopy}>
      <Copy style={styles.strong}>{asked === "thinking" ? "Gösterilen maça bakıyorum…" : asked === "ready" ? "Yorum hazır · değer kanıtı bekleniyor" : "Skoru ve seçimin koşulunu birlikte oku"}</Copy>
      <Copy muted>{asked === "ready" ? match.key === "demo-almeria" ? "Skor 1–3; bir gol daha 4,5 alt koşulunu bozar. Bu, oranının avantajlı olduğunu göstermez." : `Skor ${match.score}. Gösterilen seçim ${match.selection?.toLocaleLowerCase("tr-TR") ?? "yok"}. Maç olgusu, doğrulanmış ekonomik değer değildir.` : "Bu örnekte canlı servis çağrısı yapılmaz. Skor yorumu ile ekonomik öneri ayrı kalır."}</Copy>
    </View></View>
    <View style={styles.row}><Button primary onPress={ask} disabled={asked === "thinking" || !match.selection || !motion.active || motion.blocked}>{asked === "thinking" ? "Bakıyor…" : asked === "ready" ? "Yeniden sor · örnek" : "Jinx’e sor · örnek"}</Button><Button selected={evidenceOpen} expanded={evidenceOpen} onPress={() => setEvidenceOpen(value => !value)} label={evidenceOpen ? "Örnek veri açıklamasını gizle" : "Örnek veri açıklamasını göster"}>Veri açıklaması {evidenceOpen ? "−" : "+"}</Button></View>
    {evidenceOpen ? <Copy muted>Kaynak: sabit sentetik maç ve oranlar. Onaylı değer politikası, kalibre olasılık veya canlı ölçüm iddiası yok. Kaynak bulunurluğu güven yüzdesi değildir.</Copy> : null}
  </Card>;

  const matchCard = (item: DemoMatch) => <Card key={item.key}>
    <View style={styles.headingRow}><Copy kind="meta" muted>{item.league}</Copy><Tag>{item.minute}</Tag></View>
    <View style={styles.headingRow}><View style={styles.flex}><Copy style={styles.strong}>{item.home}</Copy><Copy style={styles.strong}>{item.away}</Copy></View><Copy kind="metric">{item.score}</Copy></View>
    <View style={[styles.selectionStrip, { backgroundColor: p.soft }]}><Copy kind="meta" muted>BTB seçimi</Copy><Copy>{item.selection ?? "Bu maçta gösterilen seçim yok"}</Copy>{item.selection ? <Copy kind="meta" muted>Güncel örnek oran {item.currentPrice} · rating {item.stars}/5</Copy> : null}</View>
    <View style={styles.row}><Button primary onPress={() => chooseMatch(item)} label={`${item.home} – ${item.away} maçını incele`}>Maçı incele →</Button><Button selected={pinned.includes(item.key)} onPress={() => setPinned(current => current.includes(item.key) ? current.filter(key => key !== item.key) : [...current, item.key])} label={`${item.home} maçını ${pinned.includes(item.key) ? "sabitlemekten vazgeç" : "sabitle"}`}>{pinned.includes(item.key) ? "Sabitlendi ✓" : "Sabitle"}</Button></View>
  </Card>;

  const needle = search.trim().toLocaleLowerCase("tr-TR");
  const scope = matches.filter(item => !starOnly || item.stars >= 4);
  const filtered = scope.filter(item => `${item.home} ${item.away} ${item.league}`.toLocaleLowerCase("tr-TR").includes(needle));
  const experience = <>
      <View style={styles.demoNav} accessibilityRole="tablist">{routes.map(([key, title]) => <Button key={key} tab selected={route === key} onPress={() => navigate(key)} style={styles.demoTab}>{title}</Button>)}</View>
      {route === "overview" ? <>
        <Heading title="Bugünün görünümü" subtitle="18 Ekim · 21:08 · sabit örnek an" />
        <View style={styles.metrics}>{[["3", "takipteki maç"], ["1", "4+ rating kapsamı"], ["1/2", "sonuçlanan örnek karar"]].map(([value, label]) => <Card key={label} style={styles.metric}><Copy kind="metric">{value}</Copy><Copy muted>{label}</Copy></Card>)}</View>
        <View style={[styles.columns, wide && styles.desktopColumns]}><View style={styles.column}><Heading title="Öne çıkan maç" subtitle="Önce skor, sonra seçim ve oran." />{matchCard(matches[0]!)}</View><View style={styles.column}>
          <Card><Heading title="Jinx sahada" subtitle="Açık istek, kısa açıklama, sakin veri sınırları." /><View style={styles.center}>{!hidden ? avatar(102) : <Copy muted>Karakter bu deneyimde gizli.</Copy>}</View><Button onPress={() => chooseMatch(matches[0]!)}>Örnek maçta Jinx’e sor →</Button></Card>
          <Card><Tag>Sonraki adım</Tag><Copy style={styles.strong}>Super kaydı ve Toto aynı şey değildir.</Copy><Copy muted>Karar geçmişini ya da programın ana tahmin/kapsama ayrımını aç.</Copy><View style={styles.row}><Button onPress={() => navigate("super")}>Super</Button><Button onPress={() => navigate("toto")}>Toto</Button></View></Card>
        </View></View>
      </> : null}
      {route === "live" ? <>
        <Heading title="Canlı maçlar" subtitle="Arama ve sabitleme bu örnek oturumda korunur." />
        <TextInput accessibilityLabel="Örnek maçlarda takım veya lig ara" placeholder="Takım veya lig ara…" placeholderTextColor={p.muted} value={search} onChangeText={setSearch} autoCorrect={false} autoCapitalize="none" style={[styles.search, { backgroundColor: p.surface, borderColor: p.border, color: p.text }]} />
        <View style={styles.row}><Button selected={!starOnly} onPress={() => setStarOnly(false)}>Tümü</Button><Button selected={starOnly} onPress={() => setStarOnly(true)}>4+ rating</Button>{search ? <Button onPress={() => setSearch("")}>Aramayı temizle</Button> : null}</View>
        <Copy muted>Bu kapsamda {scope.length} maç · aramada {filtered.length} sonuç · {pinned.length} sabit</Copy>
        {filtered.length ? <View style={[styles.matchGrid, wide && styles.desktopColumns]}>{filtered.map(item => <View key={item.key} style={styles.matchGridItem}>{matchCard(item)}</View>)}</View> : <Card><Copy kind="moduleTitle" heading>Eşleşen maç yok</Copy><Copy muted>Aramayı temizle veya yıldız kapsamını değiştir. Bu bir bağlantı hatası değil.</Copy><Button onPress={() => { setSearch(""); setStarOnly(false); }}>Tüm örnek maçları göster</Button></Card>}
      </> : null}
      {route === "match" ? <>
        <View style={styles.row}><Button onPress={() => navigate("live")}>← Listeye dön</Button><Tag>Arama ve filtreler korunur</Tag></View>
        {matchSummary}
        <View style={[styles.columns, wide && styles.desktopColumns]}><View style={styles.column}>{jinxCard}</View><View style={styles.column}>
          <Card><Heading title="Maçın izi" subtitle="Kaydedilmiş olaylar · gelecek gol olasılığı değil" />
            {match.key === "demo-inter" ? <><View style={[styles.eventLine, { backgroundColor: p.border }]} /><View style={styles.row}>{journeyEvents.map((event, index) => <Button key={event.minute} selected={selectedEvent === index} onPress={() => setSelectedEvent(index)} label={`${event.minute} ${event.kind} ayrıntısı`}>{event.minute} {event.kind}</Button>)}</View>
              <View style={[styles.eventDetail, { borderColor: p.accent, backgroundColor: p.soft }]}><Copy style={styles.strong}>{journeyEvents[selectedEvent]!.minute} · {journeyEvents[selectedEvent]!.title}</Copy><Copy muted>{journeyEvents[selectedEvent]!.detail}</Copy></View>
              <View style={styles.row}><Button disabled={selectedEvent === 0} onPress={() => setSelectedEvent(index => Math.max(0, index - 1))}>← Önceki olay</Button><Button disabled={selectedEvent === journeyEvents.length - 1} onPress={() => setSelectedEvent(index => Math.min(journeyEvents.length - 1, index + 1))}>Sonraki olay →</Button></View></> : <Copy muted>Bu örnek maç için olay geçmişi sağlanmadı. Geçmiş çizgisi üretilmedi.</Copy>}
          </Card><Card><Tag caution>Güncel veri sınırı</Tag><Copy muted>Bu prototip baskı, xG veya tarihsel pay üretmez. Eksik değerler sıfır ya da güven göstergesi olarak doldurulmaz.</Copy></Card>
        </View></View>
      </> : null}
      {route === "super" ? <>
        <Heading title="Super karar kaydı" subtitle="Maç tarihi 18 Ekim · sonuçlanan performans kohortu değil" />
        <Card><Heading title="Inter Turku – Gnistan" trailing={<Tag>Açık karar</Tag>} />
          <View style={[styles.band, { backgroundColor: p.soft }]}><Copy kind="meta" muted>KARAR ANI · 67′ · örnek</Copy><Copy kind="moduleTitle">1–1 · Ev sahibi / beraberlik</Copy><Copy>Kayıtlı oran 1,42 · rating 4/5</Copy><Copy muted>Rating, %80 kazanma olasılığı anlamına gelmez.</Copy></View>
          <View style={[styles.band, { backgroundColor: p.accentSoft }]}><Copy kind="meta" muted>GÜNCEL DURUM · 78′ · örnek</Copy><Copy kind="moduleTitle">2–1 · maç devam ediyor</Copy><Copy muted>Karar henüz sonuçlanmadı. Sonuç ve kâr üretilmedi.</Copy><Button onPress={() => chooseMatch(matches[0]!)}>Güncel örnek maça git →</Button></View>
          <Copy muted>Sonradan oluşan skor, karar anındaki bilgiye geri yazılmaz.</Copy>
        </Card><StatisticalReadout dark={dark} />
      </> : null}
      {route === "toto" ? <>
        <Heading title="Toto · açıklamalı kupon" subtitle="3 maçlık öğretici örnek · gerçek program veya tahmin değil" />
        <Card><View style={styles.metrics}><View style={styles.metric}><Copy kind="metric">12 kolon</Copy><Copy muted>2 × 3 × 2 kapsama</Copy></View><View style={styles.metric}><Copy kind="metric">120 TL</Copy><Copy muted>Bu örnekte 12 × 10 TL</Copy></View></View><Copy muted>10 TL yalnız sentetik örneğin kolon bedelidir; canlı maliyet birimi hakkında çıkarım yapılmaz.</Copy><Button selected={showResults} onPress={() => setShowResults(value => !value)}>{showResults ? "Örnek sonuçları gizle" : "Örnek sonuçları göster"}</Button></Card>
        {[
          { name: "Inter Turku – Gnistan", main: "1", coverage: "1 · 0", result: "0", label: "Yalnız kapsamda" },
          { name: "Gençlerbirliği – İstanbul Başakşehir", main: "2", coverage: "1 · 0 · 2", result: "2", label: "Ana tahmin isabeti" },
          { name: "R. Sociedad B – Almeria", main: "2", coverage: "0 · 2", result: "—", label: "Sonuç bekleniyor" }
        ].map((row, index) => <Card key={row.name}><Copy style={styles.strong}>{index + 1}. {row.name}</Copy><View style={styles.priceRow}><View style={styles.flex}><Copy kind="meta" muted>Ana tahmin</Copy><Copy kind="metric">{row.main}</Copy></View><View style={styles.flex}><Copy kind="meta" muted>Kupon kapsamı</Copy><Copy kind="metric">{row.coverage}</Copy></View><View style={styles.flex}><Copy kind="meta" muted>Gerçekleşen örnek</Copy><Copy kind="metric">{showResults ? row.result : "—"}</Copy></View></View><Tag>{showResults ? row.label : "Sonuçlar gizli"}</Tag></Card>)}
        <Card><Copy style={styles.strong}>{showResults ? "1 ana isabet · 1 yalnız kapsamda · 1 bekleyen" : "Sonuçlar gizli; performans özeti gösterilmiyor."}</Copy><Copy muted>Kapsama isabeti, bütün kuponun veya tek bir kolonun kazandığı anlamına gelmez. Burada ikramiye/getiri hesaplanmaz.</Copy></Card>
      </> : null}
      {route === "settings" ? <>
        <Heading title="Önizleme ayarları" subtitle="Canlı uygulamanın tercihleri değişmez." />
        <Card><Heading title="Jinx hareketi" subtitle="Yalnız laboratuvara ait anahtarda saklanır." />{motionControls}<Copy muted>{preferenceError ? "Tercih bu cihazda saklanamadı; mevcut oturumda uygulanır." : preferenceReady ? "Tercih bu cihazdaki laboratuvar için kaydediliyor." : "Kayıtlı laboratuvar tercihi okunuyor…"}</Copy><Button selected={hidden} onPress={() => setHidden(value => !value)}>{hidden ? "Deneyimde Jinx’i göster" : "Deneyimde Jinx’i gizle"}</Button><Copy kind="meta" muted>Gizleme yalnız Deneyim bölümünü etkiler. Sahne karşılaştırması açık kalır.</Copy></Card>
        <Card><Heading title="Görünüm" /><Button selected={!dark} onPress={() => setDark(value => !value)}>{dark ? "Açık önizlemeye geç" : "Koyu önizlemeye geç"}</Button><Copy muted>Bu anahtar uygulama temasını veya oturumu yeniden başlatmaz.</Copy></Card>
      </> : null}
    </>;

  const scenes = <>
    <Card style={styles.sceneWorkspace}>
      <View style={[styles.sceneWorkspaceBody, wide && styles.sceneWorkspaceDesktop]}>
        <View style={wide ? styles.sceneRail : styles.sceneMobileControls}>
          <Copy kind="meta" muted>Sahne seç · iki aday birlikte oynar</Copy>
          <ScrollView horizontal={!wide} nestedScrollEnabled showsVerticalScrollIndicator showsHorizontalScrollIndicator
            style={wide ? styles.sceneControlScroll : styles.sceneControlHorizontal}
            contentContainerStyle={wide ? styles.sceneControlColumn : styles.sceneControlRow} keyboardShouldPersistTaps="handled">
            {(Object.keys(sceneCopy) as JinxScene[]).map(scene => <Button key={scene} selected={motion.scene === scene} onPress={() => playScene(scene)} style={wide ? styles.sceneRailButton : undefined}>{sceneCopy[scene].label}</Button>)}
          </ScrollView>
        </View>
        <View style={[styles.sceneComparison, wide && styles.flex]}>{(["orb", "fox"] as const).map(character => <View key={character} style={[styles.sceneCandidate, { backgroundColor: p.soft, borderColor: p.border }]}>
          <Copy kind="moduleTitle" heading>{character === "orb" ? "A · Jinx" : "B · Tilki"}</Copy>
          <Copy kind="meta" muted>{character === "orb" ? "Futbol küresi" : "Saha kenarı"}</Copy>
          <View style={[styles.sceneStage, { minHeight: wide ? 190 : width < 360 ? 112 : 140 }]}>{avatar(sceneSize, character)}</View>
        </View>)}</View>
      </View>
      <View style={styles.headingRow}><Tag>{sceneCopy[motion.scene].label}</Tag><Copy kind="meta" muted>{motion.active ? "Ön planda" : "Arka plan simülasyonu"} · {modeLabels[motionMode]}</Copy></View>
      <Text accessibilityLiveRegion="polite" style={[typeScale.body, { color: p.text }]}>{motion.message}</Text>
    </Card>
    <Card><Heading title="Tekrar ve bağlam kontrolleri" subtitle="Olay tepkisi, bahis sonucu veya önerisi değildir." />
      <View style={styles.row}><Button disabled={!lastGoal} onPress={() => emitEvent("GOAL", true)}>Aynı golü tekrar gönder</Button><Button onPress={() => emitEvent("SCORE_CORRECTION")}>Skor düzeltmesi</Button>
        <Button onPress={() => { dispatch({ type: "answer", context: motion.context, verdict: "WAIT", current: false }); setActionNote("Güncel olmayan yanıt: yorum bekleme durumuna geçer."); }}>Eski yanıtı dene</Button>
        <Button onPress={() => { revision.current += 1; dispatch({ type: "context", context: { ...motion.context, revision: `r${revision.current}` } }); setActionNote("Aynı maçta yeni revizyon. Önceki olay kimlikleri korunur."); }}>Bağlamı yenile</Button>
        <Button onPress={() => { const next = motion.context.matchKey === "demo-inter" ? "demo-training" : "demo-inter"; dispatch({ type: "context", context: { matchKey: next, revision: "r1" } }); setLastGoal(null); setActionNote("Yeni örnek maç; önceki maçın sahnesi ve olay listesi taşınmadı."); }}>Yeni örnek maç</Button>
      </View>
      <Copy muted>{actionNote}</Copy><Copy kind="meta" muted>Sahne sıra no: {motion.sequence} · işlenen olay: {motion.seen.length} · bağlam: {motion.context.matchKey} / {motion.context.revision}</Copy>
    </Card>
    <Card><Heading title="Hareket ve kesilme" />{motionControls}<View style={styles.row}>
      <Button selected={reduced} onPress={() => setReduced(value => !value)}>{reduced ? "Azaltılmış hareket: açık" : "Azaltılmış hareketi dene"}</Button>
      <Button selected={!motion.active} onPress={() => dispatch({ type: "active", active: !motion.active })}>{motion.active ? "Arka plana al · simülasyon" : "Ön plana dön · simülasyon"}</Button>
      <Button selected={motion.blocked} onPress={() => dispatch({ type: "interaction", blocked: !motion.blocked })}>{motion.blocked ? "Etkileşim kilidini kaldır" : "Kullanıcı etkileşimi meşgul"}</Button>
    </View><Copy muted>Canlı modda seyrek kısa dinlenme hareketi var. Sakin mod hareketi azaltır; Hareketsiz döngüleri kapatır. Sistem azaltılmış hareket tercihi her zaman geçerlidir. Arka planda gelen olaylar sonradan kutlanmak üzere kuyruğa alınmaz.</Copy></Card>
  </>;

  return <PaletteContext.Provider value={p}><View style={[styles.root, { backgroundColor: p.background }]}>
    <View style={[styles.banner, { backgroundColor: p.warningSoft, borderColor: p.border }]}><Text style={[typeScale.body, { color: p.warning, fontWeight: "700" }]}>Tasarım önizlemesi · örnek veri</Text><Text style={[typeScale.meta, { color: p.warning }]}>Canlı maç, bahis önerisi veya yayın değildir.</Text></View>
    <ScrollView ref={scroll} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" scrollEventThrottle={32} onScroll={event => { scrollY.current = event.nativeEvent.contentOffset.y; }}>
      <View style={styles.content}>
        <View style={styles.headingRow}><View style={styles.flex}><Copy kind="pageTitle" heading>Tasarım laboratuvarı</Copy><Copy muted>Görevleri dene, karakterleri aynı koşulda karşılaştır.</Copy></View><Button onPress={() => setDark(value => !value)} label={dark ? "Açık önizleme temasına geç" : "Koyu önizleme temasına geç"}>{dark ? "Açık tema" : "Koyu tema"}</Button></View>
        <View accessibilityRole="tablist" style={styles.row}>{([["experience", "Deneyim"], ["scenes", "Jinx sahneleri"], ["findings", "Bulgular"]] as const).map(([key, label]) => <Button key={key} tab selected={mode === key} onPress={() => changeLabMode(key)}>{label}</Button>)}</View>
        {mode === "experience" ? <View style={[styles.candidateBar, { borderColor: p.border }]}><Copy muted>Önizlemede karakter</Copy><View style={styles.row}><Button selected={candidate === "orb"} onPress={() => setCandidate("orb")}>A · Jinx</Button><Button selected={candidate === "fox"} onPress={() => setCandidate("fox")}>B · Tilki</Button></View><Tag>{!motion.active ? "Arka plan simülasyonu" : reduced || systemReduced ? "Azaltılmış hareket" : modeLabels[motionMode]}</Tag><Copy kind="meta" muted>Bu geçiş nihai tasarım seçimi değildir.</Copy></View> : null}
        {mode === "experience" ? experience : mode === "scenes" ? scenes : <>
          <Heading title="İki bağımsız incelemeden" subtitle="Kaynak olguları ve test bekleyen riskler ayrı tutuldu." />
          {[
            ["01", "Okunabilirlik", "Kaynak hesabı: koyu tekrar dene düğmesi 3,63:1; açık üst etiket 4,26:1. Bu laboratuvarın kendi renkleri aktif temayı değiştirmez."],
            ["02", "Bağlamı koruma", "Kayıtlı oran/güncel oran ve karar anı/sonuç ayrı gösterilir. Arama kapsamı ile bulunan sonuç sayısı birlikte okunur."],
            ["03", "Kısmi hata ve erişim", "Kaynakta yardımcı KPI hatası Özet'i kapatabiliyor. Web dialog odağı ve tablo ilişkileri gerçek oturumda test bekliyor."],
            ["04", "Yüzde, neyin yüzdesi?", "Rating, tarihsel havuz payı ve baskı doğrulanmış kazanma olasılığı değildir. Eksik örneklem veya birim üretilmez."],
            ["05", "Keyif ayrı, güven ayrı", "Jinx selamlar, top oynar ve veri bekler. Karakter coşkusu ekonomik kanıtın veya WAIT kararının yerine geçmez."]
          ].map(([number, title, body]) => <Card key={number}><Tag>{number} · inceleme</Tag><Copy kind="moduleTitle" heading>{title}</Copy><Copy muted>{body}</Copy></Card>)}
          <StatisticalReadout dark={dark} />
          <Card><Tag caution>Doğrulama bekliyor</Tag><Copy style={styles.strong}>Fiziksel Android ve doğrulanmış web oturumu henüz incelenmedi.</Copy><Copy muted>Bağlı ADB cihazı yok. Web mevcut Access girişinde; açık oturum yok. TalkBack, klavye, büyük yazı, %200 zoom, çevrimdışı ve uzun liste görevleri kabul kanıtı bekliyor.</Copy><Copy muted>Bu ekran bir tasarım karşılaştırmasıdır; tüm uygulamaya geçiş veya koordineli Android/web yayını değildir.</Copy></Card>
        </>}
        <Copy kind="meta" muted style={styles.footer}>Yalnız yerel tasarım laboratuvarı · Android ve web için aynı içerik · Canlı veri çağrısı yok</Copy>
      </View>
    </ScrollView>
  </View></PaletteContext.Provider>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, banner: { paddingHorizontal: 20, paddingVertical: 10, gap: 2, borderBottomWidth: 1 },
  scroll: { padding: 16, paddingBottom: 60, alignItems: "center" }, content: { width: "100%", maxWidth: 1200, gap: 18 },
  flex: { flex: 1, minWidth: 0 }, card: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 14 },
  headingRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12 }, top4: { marginTop: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }, button: { minHeight: 48, minWidth: 48, borderWidth: 1, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 16, justifyContent: "center" },
  tag: { alignSelf: "flex-start", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 9 },
  candidateBar: { flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center", paddingBottom: 16, borderBottomWidth: 1 },
  demoNav: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, demoTab: { flexGrow: 1, flexBasis: 90 },
  columns: { gap: 18 }, desktopColumns: { flexDirection: "row", alignItems: "flex-start" }, column: { flex: 1, minWidth: 0, gap: 16 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, metric: { flex: 1, minWidth: 120 },
  center: { alignItems: "center", justifyContent: "center" }, strong: { fontWeight: "700" },
  search: { ...typeScale.body, minHeight: 52, borderWidth: 1, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16 },
  matchGrid: { flexWrap: "wrap", gap: 16 }, matchGridItem: { flexGrow: 1, flexBasis: 280, minWidth: 0 },
  selectionStrip: { borderRadius: 12, padding: 12, gap: 4 }, summaryBand: { padding: 18, borderRadius: 20, gap: 16 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 20 }, bigScore: { ...typeScale.display },
  priceRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 }, jinxRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 }, jinxCopy: { flex: 1, minWidth: 180, gap: 8 },
  eventLine: { height: 2, marginVertical: 5, width: "100%" }, eventDetail: { borderLeftWidth: 3, padding: 14, borderRadius: 8, gap: 8 },
  band: { padding: 16, borderRadius: 14, gap: 9 },
  sceneWorkspace: { padding: 14, gap: 10 }, sceneWorkspaceBody: { gap: 12 }, sceneWorkspaceDesktop: { flexDirection: "row", alignItems: "stretch" },
  sceneRail: { width: 200, gap: 8 }, sceneMobileControls: { gap: 6 }, sceneControlScroll: { maxHeight: 234 }, sceneControlHorizontal: { maxHeight: 62 },
  sceneControlColumn: { gap: 6, paddingRight: 8, paddingBottom: 4 }, sceneControlRow: { flexDirection: "row", gap: 8, paddingBottom: 6 }, sceneRailButton: { width: "100%" },
  sceneComparison: { flexDirection: "row", minWidth: 0, gap: 8 }, sceneCandidate: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 14, padding: 8, gap: 3 },
  sceneStage: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  footer: { paddingTop: 12, paddingBottom: 16, textAlign: "center" }
});
