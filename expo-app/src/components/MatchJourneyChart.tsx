import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polyline, Rect, Stop, Text as SvgText } from 'react-native-svg';
import type { LiveContext, MatchDetail, MatchJourney, MatchJourneyPoint, MatchPathContext } from '@/src/api/schemas';
import { colors, radii, semantic, spacing, typeScale } from '@/src/theme/theme';
import { SurfaceMaterial } from './SurfaceMaterial';
import { CaveatLine, OriginBadge } from './IntelligenceNotice';
import { journeyPointLabel } from './match-journey';
import { latestMatchPathSignal, matchAnalysisEvents, type MatchAnalysisEvent } from './match-analysis-events';
import { lowCohortNotice, normalityLabel, resolveMatchPathState, surpriseLabel } from './match-path-chart';
import { journeyMoments, journeyVertices, markerGroups, poolLeaders, pressureReading } from './journey-story';
import { derivePressureBalance } from '@/src/utils/pressure-balance';

const TOP=32, HEIGHT=150, BOTTOM=TOP+HEIGHT, LEFT=58, RIGHT=18;
const LANE_Y=214, PRESSURE_Y=279, CHART_HEIGHT=328;
// A single mark is 20 wide, so centres closer than this touch on the axis.
const MARKER_GAP=26;
const svgLabel={fontSize:11,fontWeight:'500',fontFamily:'sans-serif'} as const;
const bands=[{label:'Olağan',level:.85},{label:'Sıra dışı',level:.5},{label:'Sürpriz',level:.15}];

export function MatchJourneyChart({ context, match, journey, path, isError, isLoading, pathIsLoading }: {
  context: LiveContext | undefined; match: MatchDetail; journey: MatchJourney | undefined;
  path: MatchPathContext | undefined; isError: boolean; isLoading: boolean; pathIsLoading: boolean;
}) {
  const [width,setWidth]=useState(310);
  const [selectedKey,setSelectedKey]=useState<string | null>(null);
  const [activeEventKey,setActiveEventKey]=useState<string | null>(null);
  const [showRules,setShowRules]=useState(false);
  const [showAnalysis,setShowAnalysis]=useState(false);
  const retained=journey?.matchKey===match.key ? journey : undefined;
  const live=context?.matchKey && context.matchKey!==match.key ? undefined : context;
  const points=retained?.points ?? [];
  const drawn=points.filter(p=>p.level!==null && p.plotMinute!==null);
  const latest=drawn.at(-1);
  const selected=drawn.find(p=>p.key===selectedKey) ?? latest;
  const moments=journeyMoments(points,live);
  const activeMoment=moments.find(event=>event.key===activeEventKey);
  const referencePoint=points.find(p=>p.referenceChange && p.plotMinute!==null);
  const referenceMinute=referencePoint?.plotMinute ?? 45;
  const maxMinute=Math.max(90,...drawn.map(p=>p.plotMinute!),...moments.map(e=>e.minute ?? 0));
  const plotWidth=Math.max(100,width-LEFT-RIGHT);
  const x=(minute:number)=>LEFT+minute/maxMinute*plotWidth;
  const y=(level:number)=>TOP+(1-level)*HEIGHT;
  const linePoints=journeyVertices(points).map(v=>`${x(v.minute)},${y(v.level)}`);
  const joinMarks=drawn.filter((p,i)=>i>0&&!p.connects&&!p.referenceChange);
  const pool=retained?.pools.find(p=>p.key===selected?.poolKey);
  const leaders=poolLeaders(pool);
  const analysisPath=path?.matchKey && path.matchKey!==match.key ? undefined : path;
  const analysisEvents=matchAnalysisEvents(analysisPath,live);
  const latestPath=latestMatchPathSignal(analysisPath);
  const pathState=resolveMatchPathState(analysisPath,pathIsLoading);
  const pressure=derivePressureBalance(match.pressureSource==='CURRENT_MATCH'?match.totalPressure:null,match.pressureSource==='CURRENT_MATCH'?match.pressureDiff:null);
  const highlight=activeMoment ? activeMoment.point : selected;
  const currentTitle=activeMoment ? `${activeMoment.label} · ${activeMoment.title}` : selected?.level==null ? 'Maçın hikâyesi burada birikir' : selected.level>=.7 ? 'Havuz beklentisiyle uyumlu' : selected.level>=.3 ? 'Beklentiden uzaklaşıyor' : 'Havuzun sıra dışı yolu';
  const pickPoint=(point:MatchJourneyPoint)=>{setSelectedKey(point.key);setActiveEventKey(null);};
  const pickMoment=(key:string)=>{
    setActiveEventKey(key);
    const event=moments.find(e=>e.key===key);
    const nearest=event?.minute==null?undefined:drawn.reduce<MatchJourneyPoint|undefined>((best,p)=>!best||Math.abs(p.plotMinute!-event.minute!)<Math.abs(best.plotMinute!-event.minute!)?p:best,undefined);
    if(event?.point?.level!=null && event.point.plotMinute!==null) setSelectedKey(event.point.key);
    else if(nearest) setSelectedKey(nearest.key);
  };
  const selectAnalysis=(key:string)=>{
    setActiveEventKey(key);
    const event=analysisEvents.find(e=>e.key===key);
    if(!event) return;
    const minute=event.minute ?? (event.pathKind==='HALF_TIME'?referenceMinute:event.pathKind==='FULL_TIME'?maxMinute:null);
    const nearest=minute===null?undefined:drawn.reduce<MatchJourneyPoint|undefined>((best,p)=>!best||Math.abs(p.plotMinute!-minute)<Math.abs(best.plotMinute!-minute)?p:best,undefined);
    if(nearest) setSelectedKey(nearest.key);
  };
  // Every event keeps a touch target in the horizontal rail; marks that would
  // overlap are grouped and numbered, and never become the only way to select an
  // event.
  const markerX=(minute:number)=>Math.max(LEFT+14,Math.min(width-RIGHT-14,x(minute)));
  const groups=markerGroups(moments,markerX,MARKER_GAP);
  const capturedPressure=drawn.filter(p=>p.pressureAlignment!==null);
  const selectedIndex=selected?drawn.indexOf(selected):-1;
  return <View style={story.card} onLayout={event=>setWidth(Math.max(180,event.nativeEvent.layout.width-32))}>
    <SurfaceMaterial radius={radii.lg}/>
    <View style={story.topline}><Text style={story.eyebrow}>MAÇIN YOLU</Text><Text style={story.liveTag}>{match.status==='FINISHED'?'MAÇ TAMAMLANDI':match.status==='HALF_TIME'?'DEVRE ARASI':'MAÇ AKIŞI'}</Text></View>
    {retained?<OriginBadge origin={retained.origin}/>:null}
    <Text style={story.headline}>{currentTitle}</Text>
    <Text style={story.subtitle}>Skorun, havuzun ve baskının aynı zaman çizgisindeki hikâyesi.</Text>
    <View style={story.scoreRow}>
      <View style={story.team}><View style={[story.dot,{backgroundColor:colors.blue}]}/><Text numberOfLines={2} style={story.teamName}>{match.homeTeam}</Text></View>
      <View style={story.scorePill}><Text style={story.score}>{match.homeScore}–{match.awayScore}</Text><Text style={story.micro}>GÜNCEL SKOR</Text></View>
      <View style={[story.team,{justifyContent:'flex-end'}]}><Text numberOfLines={2} style={[story.teamName,{textAlign:'right'}]}>{match.awayTeam}</Text><View style={[story.dot,{backgroundColor:colors.bronze}]}/></View>
    </View>
    <View style={story.plotSurface}>
    <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${width} ${CHART_HEIGHT}`} accessibilityLabel="Maçın yolu. Üst bant olağan, alt bant sürpriz. Mavi çizgi kayıtlı havuz uyumunu gösterir, kazanma olasılığı değildir. Numaralar gol, kart ve havuz geçişidir. Alt şerit baskının beklentiyi destekleme yönüdür. Bir an seçmek için grafiğe veya olay düğmelerine dokunun.">
      <Defs><LinearGradient id="journeyFill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.blue} stopOpacity={.28}/><Stop offset="1" stopColor={colors.blue} stopOpacity={.02}/></LinearGradient></Defs>
      <Rect x={LEFT} y={y(.3)} width={plotWidth} height={HEIGHT*.3} fill={semantic.surprise} opacity={.07} rx={4}/>
      {bands.map(b=><G key={b.label}><Line x1={LEFT} x2={width-RIGHT} y1={y(b.level)} y2={y(b.level)} stroke={colors.borderSoft} strokeDasharray="2 5"/><SvgText x={LEFT-8} y={y(b.level)+4} textAnchor="end" fill={colors.textMuted} {...svgLabel}>{b.label}</SvgText></G>)}
      {[0,30,60,maxMinute].map(m=><G key={m}><Line x1={x(m)} x2={x(m)} y1={TOP} y2={BOTTOM} stroke={colors.borderSoft} opacity={.45}/><SvgText x={x(m)} y={240} textAnchor={m===0?'start':m===maxMinute?'end':'middle'} fill={colors.textMuted} {...svgLabel}>{Math.round(m)}′</SvgText></G>)}
      {linePoints.length>1?<>
        <Path d={`M ${linePoints.join(' L ')} L ${x(latest!.plotMinute!)} ${BOTTOM} L ${x(drawn[0]!.plotMinute!)} ${BOTTOM} Z`} fill="url(#journeyFill)"/>
        <Polyline points={linePoints.join(' ')} fill="none" stroke={colors.blue} strokeWidth={9} strokeOpacity={.08} strokeLinejoin="round"/>
        <Polyline points={linePoints.join(' ')} fill="none" stroke={colors.blue} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round"/>
      </>:null}
      {referencePoint?<G><Line x1={x(referenceMinute)} x2={x(referenceMinute)} y1={TOP-8} y2={BOTTOM+4} stroke={colors.bronze} strokeDasharray="3 4"/><SvgText x={x(referenceMinute)} y={TOP-16} textAnchor="middle" fill={colors.bronze} {...svgLabel}>Yeni havuz</SvgText></G>:null}
      {joinMarks.map(p=><Circle key={p.key} cx={x(p.plotMinute!)} cy={y(p.level!)} r={4} stroke={colors.blue} strokeWidth={2} fill={colors.backgroundElevated}/>)}
      {highlight?.level!=null && highlight.plotMinute!==null?<G><Line x1={x(highlight.plotMinute)} x2={x(highlight.plotMinute)} y1={TOP} y2={BOTTOM} stroke={colors.textMuted} strokeOpacity={.4}/><Circle cx={x(highlight.plotMinute)} cy={y(highlight.level)} r={9} fill={colors.blue} opacity={.2}/><Circle cx={x(highlight.plotMinute)} cy={y(highlight.level)} r={5} fill={colors.backgroundElevated} stroke={colors.text} strokeWidth={2}/></G>:null}
      <SvgText x={LEFT-8} y={LANE_Y+4} textAnchor="end" fill={colors.textMuted} {...svgLabel}>Olaylar</SvgText>
      <Line x1={LEFT} x2={width-RIGHT} y1={LANE_Y} y2={LANE_Y} stroke={colors.border}/>
      {groups.map(members=>{
        const lead=members[0]!;
        const cx=markerX(lead.minute!);
        const index=moments.indexOf(lead)+1;
        const markerLabel=members.length===1?String(index):`${index}+${members.length-1}`;
        const ink=members.some(member=>member.kind==='RED_CARD')?colors.red:lead.kind==='POOL_CHANGE'?colors.bronze:lead.side==='AWAY'?colors.bronze:colors.blue;
        const active=members.some(member=>member.key===activeEventKey);
        return <G key={lead.key}>{members.map(member=><Line key={`lead:${member.key}`} x1={x(member.minute!)} x2={cx} y1={BOTTOM+4} y2={LANE_Y-10} stroke={ink} opacity={.5}/>)}<Rect x={cx-(members.length>1?16:10)} y={LANE_Y-10} width={members.length>1?32:20} height={20} rx={10} fill={active?ink:colors.backgroundElevated} stroke={ink} strokeWidth={1.5}/><SvgText x={cx} y={LANE_Y+4} textAnchor="middle" fill={active?colors.background:colors.text} {...svgLabel}>{markerLabel}</SvgText></G>;
      })}
      <SvgText x={LEFT} y={263} fill={colors.textMuted} {...svgLabel}>Baskı → havuz beklentisi</SvgText>
      <Line x1={LEFT} x2={width-RIGHT} y1={PRESSURE_Y} y2={PRESSURE_Y} stroke={colors.border}/>
      {capturedPressure.map(p=><Line key={`pressure:${p.key}`} x1={x(p.plotMinute!)} x2={x(p.plotMinute!)} y1={PRESSURE_Y} y2={PRESSURE_Y-p.pressureAlignment!*14} stroke={p.pressureAlignment!>=0?colors.teal:colors.orange} strokeWidth={Math.max(2,Math.min(5,plotWidth/Math.max(1,capturedPressure.length)))} strokeLinecap="round"/>)}
      {!capturedPressure.length?<SvgText x={LEFT} y={298} fill={colors.textMuted} {...svgLabel}>Baskı geçmişi bekleniyor</SvgText>:<><SvgText x={LEFT} y={313} fill={colors.teal} {...svgLabel}>↑ Destekliyor</SvgText><SvgText x={width-RIGHT} y={313} textAnchor="end" fill={colors.orange} {...svgLabel}>↓ Karşı</SvgText></>}
      <Rect x={LEFT} y={TOP} width={plotWidth} height={HEIGHT} fill="transparent" onPress={event=>{
        const px=event.nativeEvent.locationX;
        const nearest=drawn.reduce<MatchJourneyPoint|undefined>((best,p)=>!best||Math.abs(x(p.plotMinute!)-px)<Math.abs(x(best.plotMinute!)-px)?p:best,undefined);
        if(nearest) pickPoint(nearest);
      }}/>
      {groups.map(members=><Circle key={`hit:${members[0]!.key}`} cx={markerX(members[0]!.minute!)} cy={LANE_Y} r={20} fill="transparent" onPress={()=>pickMoment(members[0]!.key)}/>)}
    </Svg>
    </View>
    <Text style={story.hint}>Çizgi: havuz uyumu, kazanma olasılığı değil. Bir ana dokun.</Text>
    {moments.length?<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={story.moments}>
      {moments.map((event,index)=><Pressable key={event.key} accessibilityRole="button" accessibilityState={{selected:activeEventKey===event.key}} accessibilityLabel={`${event.label}, ${event.title}, ${event.score??''}`} onPress={()=>pickMoment(event.key)} style={[story.moment,activeEventKey===event.key?story.momentActive:null]}>
        <Text style={[story.momentNumber,{color:event.kind==='RED_CARD'?colors.red:colors.bronze}]}>{String(index+1).padStart(2,'0')}</Text><View><Text style={story.momentTitle}>{event.label} · {event.title}</Text><Text style={story.momentScore}>{event.score??'—'}</Text></View>
      </Pressable>)}
    </ScrollView>:<Text style={story.hint}>{live?.timeline==null?'Gol ve kart akışı bekleniyor.':'Henüz gol, kart veya havuz geçişi yok.'}</Text>}
    {activeMoment?<View style={story.focus} accessibilityLiveRegion="polite">
      <Text style={story.eyebrow}>{activeMoment.label} · {activeMoment.title.toLocaleUpperCase('tr-TR')}</Text>
      <Text style={story.focusTitle}>{[activeMoment.side==='HOME'?match.homeTeam:activeMoment.side==='AWAY'?match.awayTeam:null,activeMoment.score].filter(Boolean).join(' · ')||activeMoment.title}</Text>
      {activeMoment.player?<Text style={story.subtitle}>{activeMoment.player}</Text>:null}
      <Text style={story.subtitle}>{activeMoment.kind==='POOL_CHANGE'?'Devre skoruna göre yeni bir havuz seçildi. Çizgideki basamak, referansın değişmesidir.':activeMoment.point?.eliminatedRatio!=null?`${activeMoment.point.beforeCount} uyumlu sonuçtan ${activeMoment.point.eliminatedCount} elendi; ${activeMoment.point.compatibleCount} kaldı. Bu, golün havuz etkisi; olay sürprizi yüzdesi değil.`:'Olayın zamanı kayıtlı. Bu olaya ait havuz etkisi ölçülmedi.'}</Text>
    </View>:selected?<View style={story.focus} accessibilityLiveRegion="polite">
      <View style={story.topline}><Text style={story.eyebrow}>{selected.elapsed||selected.plotMinute}′ · {selected.home??'—'}–{selected.away??'—'}</Text><Text style={story.micro}>{selected===latest?'SON KAYIT':'SEÇİLİ AN'}</Text></View>
      <Text style={story.focusTitle}>{journeyPointLabel(selected)}</Text><Text style={story.subtitle}>{pressureReading(selected)}</Text>
      {selected.eliminatedRatio!==null?<Text style={story.subtitle}>{selected.beforeCount} sonuçtan {selected.eliminatedCount} elendi · {selected.compatibleCount} uyumlu sonuç kaldı</Text>:null}
    </View>:<View style={story.focus}><Text style={story.subtitle}>{isLoading?'Maçın yolu yükleniyor…':match.status==='NOT_STARTED'?'Başlama düdüğünden sonra ilk kayıtla başlayacak.':'Bu maç için kullanılabilir geçmiş yok. Geçmişe ait çizgi üretilmedi.'}</Text></View>}
    {selected?<View style={story.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel="Önceki kayıt" disabled={selectedIndex<=0} style={[story.control,selectedIndex<=0?story.disabled:null]} onPress={()=>pickPoint(drawn[selectedIndex-1]!)}><Text style={story.controlText}>← Önceki</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Son kayda dön" style={story.control} onPress={()=>latest&&pickPoint(latest)}><Text style={story.controlText}>Son kayıt</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Sonraki kayıt" disabled={selectedIndex>=drawn.length-1} style={[story.control,selectedIndex>=drawn.length-1?story.disabled:null]} onPress={()=>pickPoint(drawn[selectedIndex+1]!)}><Text style={story.controlText}>Sonraki →</Text></Pressable>
    </View>:null}
    {pool && (!activeMoment || activeMoment.point?.poolKey===pool.key)?<View style={story.poolBox}>
      <View style={story.topline}><Text style={story.eyebrow}>{pool.phase===1?'DEVRE SKORU HAVUZU':'MAÇ SONU HAVUZU'}</Text><Text style={story.micro}>{pool.count} MAÇ</Text></View>
      <Text style={story.subtitle}>{pool.phase===2?`${pool.halfTimeScore} devre skorundan sonra · `:''}{activeMoment?'Seçili kaydın':'Grafikte seçili anın'} sabit referansı</Text>
      <View style={story.leaders}>{leaders.map(row=><View key={row.score} style={story.leader}><Text style={story.poolScore}>{row.score}</Text><View style={story.track}><View style={[story.fill,{width:`${Math.min(100,row.share*100)}%`}]}/></View><Text style={story.hint}>{row.count} maç · %{Math.round(row.share*100)}</Text></View>)}</View>
      <Text style={story.hint}>Havuzdaki en sık 3 skor · yüzdeler bu havuzdaki paydır</Text>
    </View>:null}
    {pressure.hasData?<View style={story.pressureBox}>
      <View style={story.topline}><Text style={story.eyebrow}>{match.status==='FINISHED'?'SON BASKI ÖLÇÜMÜ':'GÜNCEL BASKI'}</Text><Text style={story.micro}>ANLIK · GEÇMİŞ DEĞİL</Text></View>
      <Text style={story.focusTitle}>{pressure.direction==='BALANCED'?'İki taraf dengede':`${pressure.direction==='HOME'?match.homeTeam:match.awayTeam} daha baskılı`}</Text>
      <View style={story.pressureTrack}><View style={[story.pressureHalf,{alignItems:'flex-end'}]}><View style={{height:5,width:`${pressure.direction==='HOME'?pressure.magnitudeRatio*100:0}%`,backgroundColor:colors.blue}}/></View><View style={story.pressureZero}/><View style={story.pressureHalf}><View style={{height:5,width:`${pressure.direction==='AWAY'?pressure.magnitudeRatio*100:0}%`,backgroundColor:colors.bronze}}/></View></View>
      <View style={story.topline}><Text style={story.hint}>Ev sahibi</Text><Text style={story.hint}>Deplasman</Text></View>
    </View>:null}
    {isError?<Text style={story.hint}>Akış yenilenemedi. {drawn.length?'Son alınan kayıt gösteriliyor.':'Yeniden yüklemeyi deneyin.'}</Text>:null}
    {live?.freshness?.stale?<Text style={story.hint}>Gol ve kart akışı güncel olmayabilir.</Text>:null}
    <Pressable accessibilityRole="button" accessibilityState={{expanded:showAnalysis}} onPress={()=>setShowAnalysis(!showAnalysis)} style={story.disclosure}>
      <View style={{flex:1}}><Text style={story.controlText}>Havuz analizi</Text><Text style={story.hint}>{latestPath?`Son ölçüm · normallik %${Math.round(latestPath.stateNormality!*100)} · ${latestPath.cohortSize} benzer maç`:'Skor değerlendirmesi ve örneklem bilgisi'}</Text></View><Text style={story.controlText}>{showAnalysis?'−':'+'}</Text>
    </Pressable>
    {analysisPath?<OriginBadge origin={analysisPath.origin}/>:null}
    {latestPath?.belowReliableCohort?<Text style={story.hint}>Az örneklem · bu havuz değerlendirmesi henüz yeterli maçla desteklenmiyor.</Text>:null}
    {showAnalysis?<AnalysisEventRail activeKey={activeEventKey} awayTeam={match.awayTeam} homeTeam={match.homeTeam} events={analysisEvents} onSelect={selectAnalysis} path={analysisPath} state={pathState}/>:null}
    <Pressable accessibilityRole="button" accessibilityState={{expanded:showRules}} onPress={()=>setShowRules(!showRules)} style={story.disclosure}><Text style={story.hint}>{drawn.filter(p=>p.capturedAt!==null).length} kayıt · Nasıl okunur?</Text><Text style={story.controlText}>{showRules?'−':'+'}</Text></Pressable>
    {showRules?<Text style={story.subtitle}>Mavi çizgi maçın referans havuzuyla uyumunu gösteren sıralı bir ölçektir; kalibre olasılık değildir. İlk yarı devre skoru, ikinci yarı gerçekleşen devre skoruna göre maç sonu havuzu kullanılır. Yeni havuzdaki dikey basamak referans değişimidir. İçi boş noktalar ara veya düzeltme kayıtlarıdır; iki kayıt arasındaki çizgi görsel bağlantıdır, aradaki dakikalar ölçülmüş sayılmaz. Baskı şeridinde yukarı yön beklentiyi destekler, aşağı yön beklentiye karşıdır; bu renkler takım tarafı değildir. Ölçülmedi: eksik değerler sıfır olarak çizilmez. Golün elediği sonuçlar olay öncesi uyumlu havuzdan gelir; olay sürprizi ve durum normalliği farklı ölçümlerdir. Az örneklemli skor değerlendirmeleri kesin sonuç gibi okunmamalıdır. Kayıt başlangıcından önceki geçmiş üretilmez. Super kararları aşağıdaki ayrı akıştadır.</Text>:null}
  </View>;
}

const story=StyleSheet.create({
  card:{padding:16,borderRadius:radii.lg,gap:12,overflow:'hidden'},
  topline:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'},
  eyebrow:{...typeScale.eyebrow,color:colors.bronze},liveTag:{...typeScale.micro,color:colors.teal},micro:{...typeScale.micro,color:colors.textMuted},
  headline:{...typeScale.moduleTitle,fontSize:25,lineHeight:31,color:colors.text},subtitle:{...typeScale.label,color:colors.textMuted,lineHeight:19},
  scoreRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10},team:{flex:1,flexDirection:'row',alignItems:'center',gap:7},teamName:{...typeScale.label,color:colors.text,flexShrink:1,fontWeight:'700'},dot:{width:5,height:20,borderRadius:3},
  scorePill:{alignItems:'center',gap:3},score:{fontSize:28,fontWeight:'700',color:colors.text,fontVariant:['tabular-nums']},
  plotSurface:{backgroundColor:colors.backgroundElevated,borderRadius:16,marginHorizontal:-4,overflow:'hidden'},
  hint:{...typeScale.label,fontSize:11,color:colors.textMuted,lineHeight:16},moments:{gap:8,paddingVertical:3},moment:{minHeight:60,flexDirection:'row',gap:10,alignItems:'center',backgroundColor:colors.backgroundElevated,borderWidth:1,borderColor:colors.borderSoft,borderRadius:12,padding:12},momentActive:{borderColor:colors.blue},momentNumber:{fontSize:20,fontWeight:'700'},momentTitle:{...typeScale.label,color:colors.textMuted},momentScore:{...typeScale.bodyCompact,color:colors.text,fontWeight:'700'},
  focus:{backgroundColor:colors.backgroundElevated,borderLeftWidth:3,borderLeftColor:colors.blue,borderRadius:12,padding:14,gap:7},focusTitle:{...typeScale.bodyCompact,color:colors.text,fontWeight:'700',lineHeight:22},
  controls:{flexDirection:'row',justifyContent:'space-between',gap:4},control:{minHeight:44,justifyContent:'center',paddingHorizontal:6},controlText:{...typeScale.label,color:colors.blue,fontWeight:'700'},disabled:{opacity:.3},
  poolBox:{borderWidth:1,borderColor:colors.border,borderRadius:16,padding:12,gap:10},leaders:{flexDirection:'row',gap:12},leader:{flex:1,gap:6},poolScore:{fontSize:21,fontWeight:'700',color:colors.text},track:{height:4,borderRadius:2,backgroundColor:colors.borderSoft,overflow:'hidden'},fill:{height:4,backgroundColor:colors.bronze,borderRadius:2},
  pressureBox:{gap:10,paddingVertical:8},pressureTrack:{flexDirection:'row',alignItems:'center',gap:3},pressureHalf:{flex:1,height:5,backgroundColor:colors.borderSoft,overflow:'hidden',borderRadius:3},pressureZero:{width:2,height:11,backgroundColor:colors.textMuted},
  disclosure:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10,minHeight:48,borderTopWidth:1,borderTopColor:colors.borderSoft,paddingTop:10}
});
function AnalysisEventRail({ activeKey, awayTeam, events, homeTeam, onSelect, path, state }: {
  activeKey: string | null;
  awayTeam: string;
  events: MatchAnalysisEvent[];
  homeTeam: string;
  onSelect: (key: string) => void;
  path: MatchPathContext | undefined;
  state: ReturnType<typeof resolveMatchPathState>;
}) {
  return <View style={styles.eventSection}>
    <View style={styles.eventHeader}>
      <Text style={styles.eventTitle}>KIRMIZI KART & SÜRPRİZ OLAYLAR</Text>
      {path ? <OriginBadge origin={path.origin}/> : null}
    </View>
    {events.filter(event=>event.group==='EVENT').length ? events.filter(event=>event.group==='EVENT').map(event=>{
      const team=event.side==='HOME'?homeTeam:event.side==='AWAY'?awayTeam:null;
      const provisional=event.belowReliableCohort;
      // Surprise and normality were previously stacked as two bare percentages
      // in one right-aligned column. Readers subtract one from a hundred and
      // get the other - which holds by coincidence on some rows and fails on
      // others, because they are different measurements. Each now carries its
      // own name and only one of them is a headline.
      const normality=event.stateNormality===null
        ? `${normalityLabel} ölçülmedi`
        : `${normalityLabel} %${Math.round(event.stateNormality*100)}`;
      const provenance=[
        normality,
        event.cohortSize===null?null:`${event.cohortSize} benzer maç`,
        event.confidence===null?null:`yeterlilik %${Math.round(event.confidence*100)}`
      ].filter(Boolean).join(' · ');
      return <Pressable
        accessibilityLabel={[
          event.minuteLabel,
          event.label,
          team,
          event.player,
          event.eventSurprise===null?'olay sürprizi ölçülmedi':`olay sürprizi yüzde ${Math.round(event.eventSurprise*100)}`,
          event.stateNormality===null?'durum normalliği ölçülmedi':`durum normalliği yüzde ${Math.round(event.stateNormality*100)}`,
          event.cohortSize===null?null:`${event.cohortSize} benzer maç`,
          event.confidence===null?null:`örneklem yeterliliği yüzde ${Math.round(event.confidence*100)}`,
          provisional?'yetersiz örneklem':null
        ].filter(Boolean).join(', ')}
        accessibilityRole="button"
        key={event.key}
        onPress={()=>onSelect(event.key)}
        style={[styles.eventRow,activeKey===event.key?styles.eventRowActive:null]}
      >
        <View style={event.kind==='RED_CARD'?styles.eventRedCard:provisional?styles.eventSurpriseProvisional:styles.eventSurprise}/>
        <View style={styles.eventCopy}>
          <Text style={styles.eventName}>{[event.minuteLabel,event.label].filter(Boolean).join(' · ')}</Text>
          <Text style={styles.eventDetail}>{[team,event.player].filter(Boolean).join(' · ') || (event.kind==='RED_CARD'?'Takım/oyuncu bilgisi bekleniyor':'Match Path olayı')}</Text>
          <View style={styles.eventHeadline}>
            <Text style={provisional?styles.eventValueProvisional:styles.eventValue}>{event.eventSurprise===null?'—':`%${Math.round(event.eventSurprise*100)}`}</Text>
            <Text style={styles.eventValueUnit}>{event.eventSurprise===null?`${surpriseLabel} ölçülmedi`:'olay sürprizi'}</Text>
          </View>
          <Text style={styles.eventProvenance}>{provenance}</Text>
          {provisional?<Text style={styles.eventProvisionalChip}>YETERSİZ ÖRNEKLEM</Text>:null}
        </View>
      </Pressable>;
    }) : <Text style={styles.note}>{state==='LOADING'?'Sürpriz olay analizi yükleniyor…':state==='UNAVAILABLE'?'Sürpriz olay analizi şu anda kullanılamıyor; kayıtlı maç yolu devam ediyor.':'Gol ve kartların sürpriz ölçümü henüz yok. Kayıtlı olaylar yukarıdaki zaman çizgisinde; aşağıda devre ve maç sonu skorları değerlendiriliyor.'}</Text>}
    {events.some(event=>event.group==='PERIOD') ? <>
      <Text style={styles.eventTitle}>DEVRE VE MAÇ SONU SKOR DEĞERLENDİRMESİ</Text>
      {events.filter(event=>event.group==='PERIOD').map(event=>{
        const provisional=event.belowReliableCohort;
        const normality=event.stateNormality===null
          ? `${normalityLabel} ölçülmedi`
          : `${normalityLabel} %${Math.round(event.stateNormality*100)}`;
        const provenance=[
          normality,
          event.cohortSize===null?null:`${event.cohortSize} benzer maç`,
          event.confidence===null?null:`yeterlilik %${Math.round(event.confidence*100)}`
        ].filter(Boolean).join(' · ');
        const unit=event.pathKind==='FULL_TIME'?'maç sonu skoru sürprizi':'devre skoru sürprizi';
        return <Pressable
          accessibilityLabel={[event.label,`${unit} yüzde ${event.eventSurprise===null?'ölçülmedi':Math.round(event.eventSurprise*100)}`,provenance].filter(Boolean).join(', ')}
          accessibilityRole="button"
          key={event.key}
          onPress={()=>onSelect(event.key)}
          style={[styles.eventRow,activeKey===event.key?styles.eventRowActive:null]}
        >
          <View style={styles.eventPeriod}/>
          <View style={styles.eventCopy}>
            <Text style={styles.eventName}>{event.label}</Text>
            <Text style={styles.eventDetail}>Dönem sonu skoru · olay değil</Text>
            <View style={styles.eventHeadline}>
              <Text style={provisional?styles.eventValueProvisional:styles.eventValuePeriod}>{event.eventSurprise===null?'—':`%${Math.round(event.eventSurprise*100)}`}</Text>
              <Text style={styles.eventValueUnit}>{unit}</Text>
            </View>
            <Text style={styles.eventProvenance}>{provenance}</Text>
            {provisional?<Text style={styles.eventProvisionalChip}>YETERSİZ ÖRNEKLEM</Text>:null}
          </View>
        </Pressable>;
      })}
    </> : null}
    <CaveatLine text={lowCohortNotice(path)}/>
  </View>;
}
const styles=StyleSheet.create({
  card:{padding:spacing.lg,borderRadius:radii.lg,gap:spacing.sm,overflow:'hidden'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:spacing.sm},
  chart:{position:'relative'},
  title:{color:colors.text,...typeScale.moduleTitle},
  tag:{color:semantic.intelligence,...typeScale.eyebrow},
  pools:{flexDirection:'row',gap:spacing.md,paddingTop:spacing.sm},pool:{flex:1,gap:4},
  poolLabel:{color:colors.textSubtle,...typeScale.label},
  poolScore:{color:colors.text,...typeScale.metric},
  body:{color:colors.text,...typeScale.bodyCompact},
  note:{color:colors.textMuted,...typeScale.label,lineHeight:17},
  axisNote:{color:colors.textSubtle,...typeScale.label},
  provenance:{color:colors.textSubtle,...typeScale.label},
  signalSummary:{alignItems:'center',backgroundColor:colors.backgroundElevated,borderColor:colors.borderSoft,borderRadius:radii.md,borderWidth:1,flexDirection:'row',flexWrap:'wrap',gap:spacing.md,padding:spacing.md},
  signalMetric:{gap:2,minWidth:92},signalDivider:{alignSelf:'stretch',backgroundColor:colors.borderSoft,width:1},
  signalLabel:{color:colors.textSubtle,...typeScale.label},
  signalValue:{color:colors.text,...typeScale.metric},
  signalCaption:{color:colors.textMuted,flexBasis:'100%',...typeScale.label,lineHeight:16},
  legend:{flexDirection:'row',flexWrap:'wrap',gap:spacing.md},legendItem:{alignItems:'center',flexDirection:'row',gap:spacing.xs},
  journeyMark:{backgroundColor:semantic.intelligence,borderRadius:2,height:3,width:16},
  surpriseMark:{backgroundColor:colors.backgroundElevated,borderColor:semantic.surprise,borderRadius:6,borderWidth:2,height:11,width:11},
  provisionalMark:{backgroundColor:colors.backgroundElevated,borderColor:semantic.surprise,borderRadius:6,borderWidth:1,height:11,opacity:0.65,width:11},
  periodMark:{backgroundColor:colors.backgroundElevated,borderColor:colors.textMuted,borderWidth:2,height:10,transform:[{rotate:'45deg'}],width:10},
  joinMark:{backgroundColor:colors.backgroundElevated,borderColor:semantic.intelligence,borderRadius:5,borderWidth:2,height:9,width:9},
  redCardMark:{backgroundColor:semantic.negative,borderRadius:2,height:13,width:9},
  eventSection:{borderTopColor:colors.borderSoft,borderTopWidth:1,gap:spacing.sm,paddingTop:spacing.md},
  eventHeader:{alignItems:'center',flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,justifyContent:'space-between'},
  eventTitle:{color:colors.textSubtle,...typeScale.eyebrow},
  eventRow:{alignItems:'flex-start',backgroundColor:colors.backgroundElevated,borderColor:colors.borderSoft,borderRadius:radii.md,borderWidth:1,flexDirection:'row',gap:spacing.sm,padding:spacing.sm},
  eventRowActive:{borderColor:semantic.surprise},
  eventRedCard:{backgroundColor:semantic.negative,borderRadius:2,height:20,marginTop:2,width:14},
  eventSurprise:{backgroundColor:colors.backgroundElevated,borderColor:semantic.surprise,borderRadius:8,borderWidth:2,height:16,marginTop:2,width:16},
  eventSurpriseProvisional:{backgroundColor:colors.backgroundElevated,borderColor:semantic.surprise,borderRadius:8,borderWidth:1,height:16,marginTop:2,opacity:0.65,width:16},
  eventPeriod:{backgroundColor:colors.backgroundElevated,borderColor:colors.textMuted,borderWidth:2,height:13,marginLeft:2,marginTop:4,transform:[{rotate:'45deg'}],width:13},
  eventCopy:{flex:1,gap:3,minWidth:0},
  eventName:{color:colors.text,...typeScale.bodyCompact,fontWeight:'700'},
  eventDetail:{color:colors.textMuted,...typeScale.label},
  eventHeadline:{alignItems:'baseline',flexDirection:'row',gap:spacing.xs,paddingTop:2},
  eventValue:{color:semantic.surprise,...typeScale.metricCompact},
  eventValueProvisional:{color:colors.textMuted,...typeScale.metricCompact},
  eventValuePeriod:{color:colors.text,...typeScale.metricCompact},
  eventValueUnit:{color:colors.textMuted,...typeScale.label},
  eventProvenance:{color:colors.textSubtle,...typeScale.label,lineHeight:16},
  eventProvisionalChip:{alignSelf:'flex-start',backgroundColor:colors.surface,borderRadius:radii.sm,color:colors.textMuted,overflow:'hidden',paddingHorizontal:6,paddingVertical:2,...typeScale.micro},
  selection:{borderTopWidth:1,borderTopColor:colors.borderSoft,paddingTop:spacing.md,gap:spacing.sm},
  navigation:{flexDirection:'row',justifyContent:'space-between',gap:spacing.sm},
  link:{color:semantic.intelligence,...typeScale.bodyCompact,fontWeight:'700',paddingVertical:12}
});
