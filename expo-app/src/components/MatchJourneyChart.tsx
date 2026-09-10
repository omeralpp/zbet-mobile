import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";
import type {
  LiveContext,
  MatchDetail,
  MatchJourney,
  MatchJourneyPoint,
  MatchPathContext
} from "@/src/api/schemas";
import { colors, radii, semantic, spacing } from "@/src/theme/theme";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { CaveatLine, OriginBadge } from "./IntelligenceNotice";
import { journeyPointLabel, retainedJourneyRuns } from "./match-journey";
import {
  latestMatchPathSignal,
  matchAnalysisEvents,
  type MatchAnalysisEvent
} from "./match-analysis-events";
import {
  cohortNarrowingSummary,
  lowCohortNotice,
  resolveMatchPathState
} from "./match-path-chart";

export function MatchJourneyChart({ context, match, journey, path, isError, isLoading, pathIsLoading }: {
  context: LiveContext | undefined;
  match: MatchDetail;
  journey: MatchJourney | undefined;
  path: MatchPathContext | undefined;
  isError: boolean;
  isLoading: boolean;
  pathIsLoading: boolean;
}) {
  const [width, setWidth] = useState(310);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const points = journey?.matchKey === match.key ? journey.points : [];
  const selected = points.find(p => p.key === selectedKey) ?? points.at(-1);
  const runs = retainedJourneyRuns(points);
  const latest = points.at(-1);
  const analysisEvents = matchAnalysisEvents(path, context);
  const maxMinute = Math.max(
    90,
    ...points.map(p => p.plotMinute ?? 0),
    ...analysisEvents.map(event => event.minute ?? 0)
  );
  const x = (m: number) => 18 + m / maxMinute * (width - 36);
  const y = (v: number) => 40 + (1 - v) * 170;
  const selectPoint = (p: MatchJourneyPoint) => setSelectedKey(p.key);
  const firstPool = journey?.pools.find(p=>p.phase===1);
  const currentPool = journey?.pools.find(p=>p.key === latest?.poolKey);
  const chosenPool = journey?.pools.find(p=>p.key === selected?.poolKey);
  const latestPath = latestMatchPathSignal(path);
  const pathState = resolveMatchPathState(path, pathIsLoading);
  const boundary = points.find(p=>p.referenceChange && p.level!==null);
  const priorBoundary = boundary ? points[points.indexOf(boundary)-1] : undefined;
  return <View style={styles.card} onLayout={event=>setWidth(Math.max(240,event.nativeEvent.layout.width-spacing.lg*2))}>
    <SurfaceMaterial radius={radii.lg}/>
    <View style={styles.header}><Text style={styles.title}>Maçın yolu</Text><Text style={styles.tag}>KAYITLI + ANALİTİK</Text></View>
    {journey ? <OriginBadge origin={journey.origin}/> : null}
    <View style={styles.pools}>
      <View style={styles.pool}><Text style={styles.note}>İLK YARI HAVUZU</Text><Text style={styles.poolScore}>{firstPool?.modes.join(" / ") ?? "—"}</Text><Text style={styles.note}>{firstPool ? `${firstPool.count} benzer maç` : "Havuz kaydı bekleniyor"}</Text></View>
      <View style={styles.pool}><Text style={styles.note}>{currentPool?.phase===2 ? `DEVRE ${currentPool.halfTimeScore} SONRASI` : "GÜNCEL SKOR"}</Text><Text style={styles.poolScore}>{currentPool?.phase===2 ? currentPool.modes.join(" / ") : `${match.homeScore}-${match.awayScore}`}</Text><Text style={styles.note}>{currentPool?.phase===2 ? `${currentPool.count} benzer maç` : "İkinci yarı havuzu devrede seçilir"}</Text></View>
    </View>
    {latestPath ? <View style={styles.signalSummary}>
      <View style={styles.signalMetric}>
        <Text style={styles.signalLabel}>GÜNCEL NORMALLİK</Text>
        <Text style={styles.signalValue}>%{Math.round(latestPath.stateNormality! * 100)}</Text>
      </View>
      <View style={styles.signalDivider}/>
      <View style={styles.signalMetric}>
        <Text style={styles.signalLabel}>BENZER MAÇ</Text>
        <Text style={styles.signalValue}>{latestPath.cohortSize}</Text>
      </View>
      <Text style={styles.signalCaption}>{cohortNarrowingSummary(path)}</Text>
    </View> : null}
    <View style={styles.chart}>
    <Svg width="100%" height={280} viewBox={`0 0 ${width} 280`} accessibilityLabel="Kalıcı maç yolu. Yatay eksen dakika; üst olağan, alt sürpriz. Kırmızı kareler kırmızı kartları, mor halkalar ölçülmüş sürpriz olayları gösterir.">
      <SvgText x={18} y={20} fill={colors.textMuted} fontSize={11}>Olağan ↑</SvgText>
      {[.85,.5,.15].map((v,i)=><G key={v}><Line x1={18} x2={width-18} y1={y(v)} y2={y(v)} stroke={colors.borderSoft}/>{i>0?<SvgText x={20} y={y(v)-7} fill={colors.textMuted} fontSize={11}>{i===1?'Sıra dışı':'Sürpriz ↓'}</SvgText>:null}</G>)}
      <Line x1={x(45)} x2={x(45)} y1={30} y2={224} stroke={colors.textSubtle} strokeDasharray="3 5"/>
      {runs.map((run,index)=><Polyline key={index} points={run.map(p=>`${x(p.plotMinute!)},${y(p.level!)}`).join(' ')} fill="none" stroke={semantic.intelligence} strokeWidth={3} strokeLinejoin="round"/>)}
      {boundary?.connects && priorBoundary?.level!==null && priorBoundary?.plotMinute!==null && priorBoundary ? <Line x1={x(priorBoundary.plotMinute)} y1={y(priorBoundary.level)} x2={x(boundary.plotMinute!)} y2={y(boundary.level!)} stroke={semantic.intelligence} strokeDasharray="2 4"/>:null}
      {points.filter(p=>p.level!==null&&p.plotMinute!==null).map(p=><Circle key={p.key} cx={x(p.plotMinute!)} cy={y(p.level!)} r={2} fill={semantic.intelligence}/>)}
      {analysisEvents.filter(event=>event.minute!==null).map(event=>{
        const markerY=event.stateNormality===null ? 218 : y(event.stateNormality);
        return <G key={event.key}>
          <Line x1={x(event.minute!)} x2={x(event.minute!)} y1={markerY} y2={224} stroke={event.kind==='RED_CARD'?semantic.negative:semantic.surprise} strokeDasharray="2 4" strokeOpacity={0.7}/>
          {event.kind==='RED_CARD'
            ? <Rect x={x(event.minute!)-5} y={markerY-7} width={10} height={14} rx={2} fill={semantic.negative}/>
            : <Circle
                cx={x(event.minute!)}
                cy={markerY}
                fill={colors.backgroundElevated}
                r={5+(event.eventSurprise ?? 0)*2}
                stroke={semantic.surprise}
                strokeWidth={2}
              />}
        </G>;
      })}
      {[0,30,60,90].map(m=><SvgText key={m} x={x(m)} y={244} textAnchor={m===0?'start':m===90?'end':'middle'} fill={colors.textMuted} fontSize={11}>{m}′</SvgText>)}
      <SvgText x={x(45)} y={264} textAnchor="middle" fill={colors.textMuted} fontSize={11}>Devre · yeni havuz</SvgText>
      {selected?.level!==null && selected?.plotMinute!==null && selected ? <Circle cx={x(selected.plotMinute)} cy={y(selected.level)} r={6.5} fill={colors.surface} stroke={colors.text} strokeWidth={2}/>:null}
      <Rect x={0} y={24} width={width} height={206} fill="transparent" onPress={event=>{
        const px=event.nativeEvent.locationX;
        const visible=points.filter(p=>p.plotMinute!==null && p.level!==null);
        const nearest=visible.reduce<MatchJourneyPoint | undefined>((best,p)=>!best||Math.abs(x(p.plotMinute!)-px)<Math.abs(x(best.plotMinute!)-px)?p:best,undefined);
        if(nearest)selectPoint(nearest);
      }}/>
    </Svg>
    </View>
    <View style={styles.legend}>
      <View style={styles.legendItem}><View style={styles.journeyMark}/><Text style={styles.note}>Maç yolu</Text></View>
      <View style={styles.legendItem}><View style={styles.surpriseMark}/><Text style={styles.note}>Sürpriz olay</Text></View>
      <View style={styles.legendItem}><View style={styles.redCardMark}/><Text style={styles.note}>Kırmızı kart</Text></View>
    </View>
    <AnalysisEventRail
      awayTeam={match.awayTeam}
      events={analysisEvents}
      homeTeam={match.homeTeam}
      path={path}
      state={pathState}
    />
    {isError ? <Text style={styles.note}>Akış yenilenemedi. {points.length ? "Son alınan kayıt gösteriliyor." : "Skor ve Super akışı aşağıda devam ediyor."}</Text> : null}
    {!points.some(p=>p.level!==null) ? <Text style={styles.note}>{isLoading ? "Maç akışı yükleniyor…" : match.status==='NOT_STARTED' ? "Başlama düdüğüyle gelen ilk job kaydı çizgiyi başlatır." : "Bu maçın kullanılabilir job geçmişi yok; geçmişe ait eğri üretilmedi."}</Text> : <Text style={styles.note}>{points.filter(p=>p.level!==null&&p.capturedAt!==null).length} kayıt · ekran kapalıyken de kaydedilir{points.find(p=>p.level!==null)?.minute!==0 ? " · kayıt başlangıcından itibaren" : ""}</Text>}
    {selected ? <View style={styles.selection} accessibilityLiveRegion="polite">
      <Text style={styles.body}>{selected.elapsed || '—'}′ · {selected.home ?? '—'}-{selected.away ?? '—'} · {journeyPointLabel(selected)}</Text>
      {selected.eliminatedRatio!==null ? <Text style={styles.note}>{selected.beforeCount} olası maçtan {selected.eliminatedCount} elendi (%{Math.round(selected.eliminatedRatio*100)}); {selected.compatibleCount} uyumlu kaldı.</Text>:null}
      {chosenPool ? <Text style={styles.note}>{chosenPool.phase===1?'İlk yarı':'Maç sonu'} için önde: {chosenPool.modes.join(' / ')} · {chosenPool.count} maçlık sabit havuz</Text>:null}
      <View style={styles.navigation}><Pressable accessibilityRole="button" accessibilityLabel="Önceki job kaydı" disabled={points.indexOf(selected)<=0} onPress={()=>selectPoint(points[Math.max(0,points.indexOf(selected)-1)]!)}><Text style={styles.link}>← Önceki kayıt</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Sonraki job kaydı" disabled={points.indexOf(selected)>=points.length-1} onPress={()=>selectPoint(points[Math.min(points.length-1,points.indexOf(selected)+1)]!)}><Text style={styles.link}>Sonraki kayıt →</Text></Pressable></View>
    </View>:null}
    <Pressable accessibilityRole="button" accessibilityState={{expanded:showRules}} onPress={()=>setShowRules(!showRules)}><Text style={styles.link}>Okuma kuralları {showRules?'−':'+'}</Text></Pressable>
    {showRules?<Text style={styles.note}>Her başarılı maç güncellemesi kalıcı kaydedilir. İlk yarı devre skoru havuzunu, ikinci yarı gerçekleşen devre skoruna göre maç sonu havuzunu kullanır. Baskı hafif eğilim yaratır; gol etkisi olay öncesi uyumlu havuzdan hesaplanır. Skor düzeltmesi veya eksik güncellemeler çizgide ara oluşturur. Devrede kesikli geçiş yeni referansı gösterir. Mor olay sürprizi ve durum normalliği Match Path sözleşmesinden gelir; kohort küçülmesinden türetilmez. Ölçek kalibre edilmiş olasılık değildir ve Super seçimini değiştirmez. Eski maçların kaydedilmemiş dakikaları geri üretilemez. Skor ve Super yıldızları aşağıdaki ayrı akıştadır.</Text>:null}
  </View>;
}

function AnalysisEventRail({ awayTeam, events, homeTeam, path, state }: {
  awayTeam: string;
  events: MatchAnalysisEvent[];
  homeTeam: string;
  path: MatchPathContext | undefined;
  state: ReturnType<typeof resolveMatchPathState>;
}) {
  return <View style={styles.eventSection}>
    <View style={styles.eventHeader}>
      <Text style={styles.eventTitle}>KIRMIZI KART & SÜRPRİZ OLAYLAR</Text>
      {path ? <OriginBadge origin={path.origin}/> : null}
    </View>
    {events.length ? events.map(event=>{
      const team=event.side==='HOME'?homeTeam:event.side==='AWAY'?awayTeam:null;
      return <View
        accessibilityLabel={[
          event.minuteLabel,
          event.label,
          team,
          event.player,
          event.eventSurprise===null?'olay sürprizi ölçülmedi':`olay sürprizi yüzde ${Math.round(event.eventSurprise*100)}`,
          event.stateNormality===null?'durum normalliği ölçülmedi':`durum normalliği yüzde ${Math.round(event.stateNormality*100)}`,
          event.cohortSize===null?null:`${event.cohortSize} benzer maç`,
          event.confidence===null?null:`örneklem yeterliliği yüzde ${Math.round(event.confidence*100)}`
        ].filter(Boolean).join(', ')}
        accessible
        key={event.key}
        style={styles.eventRow}
      >
        <View style={event.kind==='RED_CARD'?styles.eventRedCard:styles.eventSurprise}/>
        <View style={styles.eventCopy}>
          <Text style={styles.eventName}>{[event.minuteLabel,event.label].filter(Boolean).join(' · ')}</Text>
          <Text style={styles.eventDetail}>{[team,event.player].filter(Boolean).join(' · ') || (event.kind==='RED_CARD'?'Takım/oyuncu bilgisi bekleniyor':'Match Path olayı')}</Text>
        </View>
        <View style={styles.eventMetrics}>
          <Text style={styles.eventPrimary}>{event.eventSurprise===null?'ÖLÇÜLMEDİ':`%${Math.round(event.eventSurprise*100)} SÜRPRİZ`}</Text>
          <Text style={styles.eventSecondary}>{event.stateNormality===null?'Normallik yok':`%${Math.round(event.stateNormality*100)} normal`} {event.cohortSize===null?'':`· ${event.cohortSize} maç`} {event.confidence===null?'':`· %${Math.round(event.confidence*100)} yeterlilik`}</Text>
        </View>
      </View>;
    }) : <Text style={styles.note}>{state==='LOADING'?'Sürpriz olay analizi yükleniyor…':state==='UNAVAILABLE'?'Sürpriz olay analizi şu anda kullanılamıyor; kayıtlı maç yolu devam ediyor.':'Henüz kırmızı kart veya ölçülmüş sürpriz olay yok.'}</Text>}
    <CaveatLine text={lowCohortNotice(path)}/>
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
  signalSummary:{alignItems:'center',backgroundColor:colors.backgroundElevated,borderColor:colors.borderSoft,borderRadius:radii.md,borderWidth:1,flexDirection:'row',flexWrap:'wrap',gap:spacing.md,padding:spacing.md},
  signalMetric:{gap:2,minWidth:92},signalDivider:{alignSelf:'stretch',backgroundColor:colors.borderSoft,width:1},
  signalLabel:{color:colors.textSubtle,fontSize:9,fontWeight:'700'},signalValue:{color:colors.text,fontSize:18,fontWeight:'800'},
  signalCaption:{color:colors.textMuted,flexBasis:'100%',fontSize:11,lineHeight:16},
  legend:{flexDirection:'row',flexWrap:'wrap',gap:spacing.md},legendItem:{alignItems:'center',flexDirection:'row',gap:spacing.xs},
  journeyMark:{backgroundColor:semantic.intelligence,borderRadius:2,height:3,width:16},
  surpriseMark:{backgroundColor:colors.backgroundElevated,borderColor:semantic.surprise,borderRadius:6,borderWidth:2,height:11,width:11},
  redCardMark:{backgroundColor:semantic.negative,borderRadius:2,height:13,width:9},
  eventSection:{borderTopColor:colors.borderSoft,borderTopWidth:1,gap:spacing.sm,paddingTop:spacing.md},
  eventHeader:{alignItems:'center',flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,justifyContent:'space-between'},
  eventTitle:{color:colors.textSubtle,fontSize:10,fontWeight:'800',letterSpacing:0.4},
  eventRow:{alignItems:'center',backgroundColor:colors.backgroundElevated,borderColor:colors.borderSoft,borderRadius:radii.md,borderWidth:1,flexDirection:'row',gap:spacing.sm,padding:spacing.sm},
  eventRedCard:{backgroundColor:semantic.negative,borderRadius:2,height:20,width:14},
  eventSurprise:{backgroundColor:colors.backgroundElevated,borderColor:semantic.surprise,borderRadius:8,borderWidth:2,height:16,width:16},
  eventCopy:{flex:1,gap:2,minWidth:0},eventName:{color:colors.text,fontSize:12,fontWeight:'800'},eventDetail:{color:colors.textMuted,fontSize:10},
  eventMetrics:{alignItems:'flex-end',gap:2},eventPrimary:{color:semantic.surprise,fontSize:10,fontWeight:'800'},eventSecondary:{color:colors.textSubtle,fontSize:9},
  selection:{borderTopWidth:1,borderTopColor:colors.borderSoft,paddingTop:spacing.md,gap:spacing.sm},
  navigation:{flexDirection:'row',justifyContent:'space-between',gap:spacing.sm},
  link:{color:semantic.intelligence,fontSize:12,fontWeight:'700',paddingVertical:12}
});
