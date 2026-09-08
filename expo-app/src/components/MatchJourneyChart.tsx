import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";
import type { MatchDetail, MatchJourney, MatchJourneyPoint, SuperLog } from "@/src/api/schemas";
import { colors, radii, semantic, spacing } from "@/src/theme/theme";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { OriginBadge } from "./IntelligenceNotice";
import { journeyPointLabel, retainedJourneyRuns } from "./match-journey";

export function MatchJourneyChart({ match, journey, logs, isError, isLoading, onDecisionPress }: {
  match: MatchDetail; journey: MatchJourney | undefined; logs: SuperLog[];
  isError: boolean; isLoading: boolean; onDecisionPress: (log: SuperLog) => void;
}) {
  const [width, setWidth] = useState(310);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const points = journey?.matchKey === match.key ? journey.points : [];
  const selected = points.find(p => p.key === selectedKey) ?? points.at(-1);
  const runs = retainedJourneyRuns(points);
  const latest = points.at(-1);
  const maxMinute = Math.max(90, ...points.map(p => p.plotMinute ?? 0));
  const x = (m: number) => 18 + m / maxMinute * (width - 36);
  const y = (v: number) => 40 + (1 - v) * 170;
  const selectPoint = (p: MatchJourneyPoint) => setSelectedKey(p.key);
  const firstPool = journey?.pools.find(p=>p.phase===1);
  const currentPool = journey?.pools.find(p=>p.key === latest?.poolKey);
  const chosenPool = journey?.pools.find(p=>p.key === selected?.poolKey);
  const goalPoints = points.filter(p=>p.kind==='GOAL' && p.plotMinute!==null && p.level!==null);
  // Decision timestamps select an actually recorded point. No nearest-minute
  // guess is presented as a retained decision-time state.
  const decisions = logs.filter(log=>log.matchKey === match.key && log.elapsed >= 0 && log.elapsed <= 150).map(log=>{
    const at = Date.parse(log.createdAt);
    const point = points.findLast(p=>p.capturedAt && Date.parse(p.capturedAt)<=at && at-Date.parse(p.capturedAt)<=120_000 && p.minute===log.elapsed && p.level!==null);
    return {log,point};
  });
  const boundary = points.find(p=>p.referenceChange && p.level!==null);
  const priorBoundary = boundary ? points[points.indexOf(boundary)-1] : undefined;
  return <View style={styles.card} onLayout={event=>setWidth(Math.max(240,event.nativeEvent.layout.width-spacing.lg*2))}>
    <SurfaceMaterial radius={radii.lg}/>
    <View style={styles.header}><Text style={styles.title}>Maçın yolu</Text><Text style={styles.tag}>KAYITLI AKIŞ</Text></View>
    {journey ? <OriginBadge origin={journey.origin}/> : null}
    <View style={styles.pools}>
      <View style={styles.pool}><Text style={styles.note}>İLK YARI HAVUZU</Text><Text style={styles.poolScore}>{firstPool?.modes.join(" / ") ?? "—"}</Text><Text style={styles.note}>{firstPool ? `${firstPool.count} benzer maç` : "Havuz kaydı bekleniyor"}</Text></View>
      <View style={styles.pool}><Text style={styles.note}>{currentPool?.phase===2 ? `DEVRE ${currentPool.halfTimeScore} SONRASI` : "GÜNCEL SKOR"}</Text><Text style={styles.poolScore}>{currentPool?.phase===2 ? currentPool.modes.join(" / ") : `${match.homeScore}-${match.awayScore}`}</Text><Text style={styles.note}>{currentPool?.phase===2 ? `${currentPool.count} benzer maç` : "İkinci yarı havuzu devrede seçilir"}</Text></View>
    </View>
    <View style={styles.chart}>
    <Svg width="100%" height={280} viewBox={`0 0 ${width} 280`} accessibilityLabel="Kalıcı maç akışı. Yatay eksen dakika; üst olağan, alt sürpriz. Her nokta bir job güncellemesidir.">
      <SvgText x={18} y={20} fill={colors.textMuted} fontSize={11}>Olağan ↑</SvgText>
      {[.85,.5,.15].map((v,i)=><G key={v}><Line x1={18} x2={width-18} y1={y(v)} y2={y(v)} stroke={colors.borderSoft}/>{i>0?<SvgText x={20} y={y(v)-7} fill={colors.textMuted} fontSize={11}>{i===1?'Sıra dışı':'Sürpriz ↓'}</SvgText>:null}</G>)}
      <Line x1={x(45)} x2={x(45)} y1={30} y2={224} stroke={colors.textSubtle} strokeDasharray="3 5"/>
      {runs.map((run,index)=><Polyline key={index} points={run.map(p=>`${x(p.plotMinute!)},${y(p.level!)}`).join(' ')} fill="none" stroke={semantic.intelligence} strokeWidth={3} strokeLinejoin="round"/>)}
      {boundary?.connects && priorBoundary?.level!==null && priorBoundary?.plotMinute!==null && priorBoundary ? <Line x1={x(priorBoundary.plotMinute)} y1={y(priorBoundary.level)} x2={x(boundary.plotMinute!)} y2={y(boundary.level!)} stroke={semantic.intelligence} strokeDasharray="2 4"/>:null}
      {points.filter(p=>p.level!==null&&p.plotMinute!==null).map(p=><Circle key={p.key} cx={x(p.plotMinute!)} cy={y(p.level!)} r={2} fill={semantic.intelligence}/>)}
      {goalPoints.map(p=><Circle key={`goal-${p.key}`} cx={x(p.plotMinute!)} cy={y(p.level!)} r={5} fill={colors.surface} stroke={semantic.positive} strokeWidth={2}/>)}
      {[0,30,60,90].map(m=><SvgText key={m} x={x(m)} y={244} textAnchor={m===0?'start':m===90?'end':'middle'} fill={colors.textMuted} fontSize={11}>{m}′</SvgText>)}
      <SvgText x={x(45)} y={264} textAnchor="middle" fill={colors.textMuted} fontSize={11}>Devre · yeni havuz</SvgText>
      {selected?.level!==null && selected?.plotMinute!==null && selected ? <Circle cx={x(selected.plotMinute)} cy={y(selected.level)} r={6.5} fill={colors.surface} stroke={colors.text} strokeWidth={2}/>:null}
      <Rect x={0} y={24} width={width} height={206} fill="transparent" onPress={event=>{
        const px=event.nativeEvent.locationX;
        const visible=points.filter(p=>p.plotMinute!==null && p.level!==null);
        const nearest=visible.reduce<MatchJourneyPoint | undefined>((best,p)=>!best||Math.abs(x(p.plotMinute!)-px)<Math.abs(x(best.plotMinute!)-px)?p:best,undefined);
        if(nearest)selectPoint(nearest);
      }}/>
      {decisions.map(({log,point},i)=><SvgText key={log.key} x={x(point?.plotMinute ?? log.elapsed)} y={point ? y(point.level!)-12 : 223-(i%2)*12} fontSize={15} fill={semantic.warning} textAnchor="middle" onPress={()=>onDecisionPress(log)}>★</SvgText>)}
    </Svg>
    </View>
    <Text style={styles.note}>Mavi: maçın yolu · ○ Gol · ★ Super · Nokta: job kaydı</Text>
    {isError ? <Text style={styles.note}>Akış yenilenemedi. {points.length ? "Son alınan kayıt gösteriliyor." : "Skor ve Super akışı aşağıda devam ediyor."}</Text> : null}
    {!points.some(p=>p.level!==null) ? <Text style={styles.note}>{isLoading ? "Maç akışı yükleniyor…" : match.status==='NOT_STARTED' ? "Başlama düdüğüyle gelen ilk job kaydı çizgiyi başlatır." : "Bu maçın kullanılabilir job geçmişi yok; geçmişe ait eğri üretilmedi."}</Text> : <Text style={styles.note}>{points.filter(p=>p.level!==null&&p.capturedAt!==null).length} kayıt · ekran kapalıyken de kaydedilir{points.find(p=>p.level!==null)?.minute!==0 ? " · kayıt başlangıcından itibaren" : ""}</Text>}
    {selected ? <View style={styles.selection} accessibilityLiveRegion="polite">
      <Text style={styles.body}>{selected.elapsed || '—'}′ · {selected.home ?? '—'}-{selected.away ?? '—'} · {journeyPointLabel(selected)}</Text>
      {selected.eliminatedRatio!==null ? <Text style={styles.note}>{selected.beforeCount} olası maçtan {selected.eliminatedCount} elendi (%{Math.round(selected.eliminatedRatio*100)}); {selected.compatibleCount} uyumlu kaldı.</Text>:null}
      {chosenPool ? <Text style={styles.note}>{chosenPool.phase===1?'İlk yarı':'Maç sonu'} için önde: {chosenPool.modes.join(' / ')} · {chosenPool.count} maçlık sabit havuz</Text>:null}
      <View style={styles.navigation}><Pressable accessibilityRole="button" accessibilityLabel="Önceki job kaydı" disabled={points.indexOf(selected)<=0} onPress={()=>selectPoint(points[Math.max(0,points.indexOf(selected)-1)]!)}><Text style={styles.link}>← Önceki kayıt</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Sonraki job kaydı" disabled={points.indexOf(selected)>=points.length-1} onPress={()=>selectPoint(points[Math.min(points.length-1,points.indexOf(selected)+1)]!)}><Text style={styles.link}>Sonraki kayıt →</Text></Pressable></View>
    </View>:null}
    <Pressable accessibilityRole="button" accessibilityState={{expanded:showRules}} onPress={()=>setShowRules(!showRules)}><Text style={styles.link}>Okuma kuralları {showRules?'−':'+'}</Text></Pressable>
    {showRules?<Text style={styles.note}>Her başarılı maç güncellemesi kalıcı kaydedilir. İlk yarı devre skoru havuzunu, ikinci yarı gerçekleşen devre skoruna göre maç sonu havuzunu kullanır. Baskı hafif eğilim yaratır; gol etkisi olay öncesi uyumlu havuzdan hesaplanır. Skor düzeltmesi veya eksik güncellemeler çizgide ara oluşturur. Devrede kesikli geçiş yeni referansı gösterir. Ölçek kalibre edilmiş olasılık değildir ve Super seçimini değiştirmez. Eski maçların kaydedilmemiş dakikaları geri üretilemez. Yüksekliği bilinmeyen Super yıldızları alt olay sırasındadır.</Text>:null}
  </View>;
}
const styles=StyleSheet.create({
  card:{padding:spacing.lg,borderRadius:radii.lg,gap:spacing.sm,overflow:'hidden'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  chart:{position:'relative'},
  title:{color:colors.text,fontSize:16,fontWeight:'800'},tag:{color:semantic.intelligence,fontSize:10,fontWeight:'700'},
  pools:{flexDirection:'row',gap:spacing.md,paddingTop:spacing.sm},pool:{flex:1,gap:4},
  poolScore:{color:colors.text,fontSize:18,fontWeight:'700'},
  body:{color:colors.text,fontSize:12,lineHeight:18},note:{color:colors.textMuted,fontSize:11,lineHeight:17},
  selection:{borderTopWidth:1,borderTopColor:colors.borderSoft,paddingTop:spacing.md,gap:spacing.sm},
  navigation:{flexDirection:'row',justifyContent:'space-between',gap:spacing.sm},
  link:{color:semantic.intelligence,fontSize:12,fontWeight:'700',paddingVertical:12}
});
