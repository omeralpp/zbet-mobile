import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type PointerEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polyline, Rect, Stop, Text as SvgText } from 'react-native-svg';
import type { LiveContext, MatchDetail, MatchJourney, MatchJourneyPoint, MatchPathContext, SuperLog } from '@/src/api/schemas';
import { colors, fontFamilies, radii, semantic, spacing, typeScale, textFont, numericFont } from '@/src/theme/theme';
import { SurfaceMaterial } from './SurfaceMaterial';
import { JourneyInspector } from './JourneyInspector';
import { adjacentInspectorMoment } from './journey-inspector';
import { CaveatLine, OriginBadge } from './IntelligenceNotice';
import { goalModeEffectText, journeyPointLabel } from './match-journey';
import { latestMatchPathSignal, matchAnalysisEvents, type MatchAnalysisEvent } from './match-analysis-events';
import { lowCohortNotice, normalityLabel, resolveMatchPathState, surpriseLabel } from './match-path-chart';
import { journeyAndSuperMoments, journeyMomentEffect, journeyVertices, markerGroups, poolLeaders, pressureReading } from './journey-story';
import { pressureHeadline, pressureLeader } from './pressure-chart';
import { capturedIntervalPressure } from '@/src/utils/recent-pressure';
import { JourneyEventGlyph, JourneyEventIcon, journeyEventColor, journeySvgAccessibility } from './JourneyEventIcon';
import { journeyDragIntent, journeyTouch, momentGroupLead, momentGroupSymbols, nearestJourneyPoint, nearestMomentGroup } from './journey-interaction';

// TOP leaves a full text line above the plot for the "Yeni havuz" label: at 20
// its glyphs started above the SVG's top edge and were clipped (owner, 2026-10-18).
const TOP=32, HEIGHT=92, BOTTOM=TOP+HEIGHT, LEFT=58, RIGHT=22;
// The pressure strip moved to its own Baskı grafiği module (NXT-OBS-175).
const LANE_Y=170, CHART_HEIGHT=216;
/** Baseline of a label written above the plot; keeps 12px glyphs inside the SVG. */
const journeyTopLabelY=TOP-12;
const MARKER_GAP=journeyTouch.markerGap;
const EMPTY_POINTS: MatchJourneyPoint[]=[];
const EMPTY_DECISIONS: readonly SuperLog[]=[];
const LEGEND_KINDS=['GOAL','RED_CARD','SUPER','POOL_CHANGE','CORRECTION'] as const;
const LEGEND_LABELS: Record<(typeof LEGEND_KINDS)[number],string>={GOAL:'Gol',RED_CARD:'Kart',SUPER:'Super',POOL_CHANGE:'Yeni havuz',CORRECTION:'Düzeltme'};
const svgLabel={fontSize:12,fontWeight:'500',fontFamily:fontFamilies.text} as const;
const bands=[{label:'Olağan',level:.85},{label:'Sıra dışı',level:.5},{label:'Sürpriz',level:.15}];
type WebScrollNode={parentElement:WebScrollNode|null;scrollTop:number;scrollLeft:number;scrollHeight:number;clientHeight:number;focus?:(options?:{preventScroll:boolean})=>void;scrollTo:(options:{top:number;left:number;behavior:'instant';x:number;y:number;animated:false})=>void};

function useJourneyInspector() {
  const [inspectorOpen,setInspectorOpen]=useState(false);
  const scrubArea=useRef<View>(null);
  const inspectorTrigger=useRef<View>(null);
  const savedScroll=useRef<{node:WebScrollNode;top:number;left:number}[]>([]);
  const openInspector=useCallback(()=>{
    if(Platform.OS==='web'){
      savedScroll.current=[];
      for(let node=(scrubArea.current as unknown as WebScrollNode|null)?.parentElement;node;node=node.parentElement){
        if(node.scrollHeight>node.clientHeight)savedScroll.current.push({node,top:node.scrollTop,left:node.scrollLeft});
      }
      // RN Web restores the previously focused element when a Modal closes.
      // Give it a meaningful trigger without moving the parent page.
      (inspectorTrigger.current as unknown as WebScrollNode|null)?.focus?.({preventScroll:true});
    }
    setInspectorOpen(true);
  },[]);
  const restoreInspectorPosition=useCallback(()=>{
    if(Platform.OS==='web'){
      (inspectorTrigger.current as unknown as WebScrollNode|null)?.focus?.({preventScroll:true});
      // RN Web ScrollView decorates its DOM node with the native x/y scrollTo
      // shape; ordinary DOM ancestors use top/left. Both restore immediately.
      for(const {node,top,left} of savedScroll.current)node.scrollTo({top,left,behavior:'instant',x:left,y:top,animated:false});
      savedScroll.current=[];
    }
  },[]);
  return {inspectorOpen,setInspectorOpen,scrubArea,inspectorTrigger,openInspector,restoreInspectorPosition};
}

export function MatchJourneyChart({ context, match, journey, path, isError, isLoading, pathIsLoading, decisions=EMPTY_DECISIONS, onDecisionPress }: {
  context: LiveContext | undefined; match: MatchDetail; journey: MatchJourney | undefined;
  path: MatchPathContext | undefined; isError: boolean; isLoading: boolean; pathIsLoading: boolean;
  /** Recorded Super decisions for this match, drawn as star marks on the event lane. */
  decisions?: readonly SuperLog[]; onDecisionPress?: (decisionKey: string) => void;
}) {
  const [width,setWidth]=useState(310);
  const {inspectorOpen,setInspectorOpen,scrubArea,inspectorTrigger,openInspector,restoreInspectorPosition}=useJourneyInspector();
  const inspectorRail=useRef<ScrollView>(null);
  const [selectedKey,setSelectedKey]=useState<string | null>(null);
  const [activeEventKey,setActiveEventKey]=useState<string | null>(null);
  const [isScrubbing,setIsScrubbing]=useState(false);
  const touchStartX=useSharedValue(0);
  const touchStartY=useSharedValue(0);
  const panActive=useSharedValue(false);
  const [showRules,setShowRules]=useState(false);
  const [showAnalysis,setShowAnalysis]=useState(false);
  const retained=journey?.matchKey===match.key ? journey : undefined;
  const live=context?.matchKey && context.matchKey!==match.key ? undefined : context;
  const points=retained?.points ?? EMPTY_POINTS;
  const drawn=useMemo(()=>points.filter(p=>p.level!==null && p.plotMinute!==null),[points]);
  const latest=drawn.at(-1);
  const selected=drawn.find(p=>p.key===selectedKey) ?? latest;
  const moments=useMemo(()=>journeyAndSuperMoments(points,live,decisions),[points,live,decisions]);
  const activeMoment=moments.find(event=>event.key===activeEventKey);
  const referencePoint=points.find(p=>p.referenceChange && p.plotMinute!==null);
  const referenceMinute=referencePoint?.plotMinute ?? 45;
  const maxMinute=Math.max(90,...drawn.map(p=>p.plotMinute!),...moments.map(e=>e.minute ?? 0));
  const plotWidth=Math.max(100,width-LEFT-RIGHT);
  const x=useCallback((minute:number)=>LEFT+minute/maxMinute*plotWidth,[maxMinute,plotWidth]);
  const y=(level:number)=>TOP+(1-level)*HEIGHT;
  const linePoints=journeyVertices(points).map(v=>`${x(v.minute)},${y(v.level)}`);
  const joinMarks=drawn.filter((p,i)=>i>0&&!p.connects&&!p.referenceChange);
  const pool=retained?.pools.find(p=>p.key===selected?.poolKey);
  const leaders=poolLeaders(pool);
  const analysisPath=path?.matchKey && path.matchKey!==match.key ? undefined : path;
  const analysisEvents=matchAnalysisEvents(analysisPath,live);
  const latestPath=latestMatchPathSignal(analysisPath);
  const pathState=resolveMatchPathState(analysisPath,pathIsLoading);
  const capturedRecent=capturedIntervalPressure(selected?.decisionContext,selected?.capturedAt ?? null);
  const selectedPressure=selected?.decisionContext?.recentPressure;
  // NXT-OBS-176: the selected record's pressure as the two sides' shares.
  const selectedBalance=capturedRecent.measured&&selectedPressure?.home!=null&&selectedPressure.away!=null
    ? pressureHeadline(pressureLeader(selectedPressure.home,selectedPressure.away),match) : null;
  const highlight=activeMoment ? activeMoment.point : selected;
  // The headline describes the latest state and keeps its height during a drag.
  // The selected historical minute/score has its own persistent readout.
  const currentTitle=latest?.level==null ? match.status==='FINISHED'?'Olaylar ve maç özeti':'Maçın hikâyesi burada birikir' : latest.level>=.7 ? 'Havuz beklentisiyle uyumlu' : latest.level>=.3 ? 'Beklentiden uzaklaşıyor' : 'Havuzun sıra dışı yolu';
  const markerX=useCallback((minute:number)=>Math.max(LEFT+24,Math.min(width-RIGHT-24,x(minute))),[width,x]);
  const groups=useMemo(()=>markerGroups(moments,markerX,MARKER_GAP),[moments,markerX]);
  const laneY=drawn.length?LANE_Y:52;
  const chartHeight=drawn.length?CHART_HEIGHT:132;
  const cursorMinute=activeMoment ? activeMoment.minute : selected?.plotMinute ?? null;
  const selectedLabel=activeMoment ? `${activeMoment.label} · ${activeMoment.title}${activeMoment.score?` · ${activeMoment.score}`:''}` : selected ? `${selected.elapsed||selected.plotMinute}′ · ${selected.home??'—'}–${selected.away??'—'}` : 'Yol kaydı yok';
  const captureLabel=activeMoment?.kind==='GOAL'?(activeMoment.point?`Grafik kaydı: ${activeMoment.point.elapsed||activeMoment.point.plotMinute}′ · ${activeMoment.point.home??'—'}–${activeMoment.point.away??'—'}`:'Bu olayla eşleşen grafik kaydı yok.'):null;
  const spokenSelection=[selectedLabel,captureLabel].filter(Boolean).join('. ');
  const pickPoint=useCallback((point:MatchJourneyPoint)=>{setSelectedKey(point.key);setActiveEventKey(null);},[]);
  const returnToLatest=useCallback(()=>{setSelectedKey(null);setActiveEventKey(null);},[]);
  const pickMoment=useCallback((key:string)=>{
    setActiveEventKey(key);
    const event=moments.find(e=>e.key===key);
    const nearest=event?.minute==null?undefined:nearestJourneyPoint(drawn,x(event.minute),x);
    if(event?.point?.level!=null && event.point.plotMinute!==null) setSelectedKey(event.point.key);
    else if(nearest) setSelectedKey(nearest.key);
  },[moments,drawn,x]);
  const previousMomentKey=adjacentInspectorMoment(moments,activeEventKey,selected?.plotMinute ?? null,-1)?.key;
  const nextMomentKey=adjacentInspectorMoment(moments,activeEventKey,selected?.plotMinute ?? null,1)?.key;
  const goPrevious=()=>{if(previousMomentKey)pickMoment(previousMomentKey);};
  const goNext=()=>{if(nextMomentKey)pickMoment(nextMomentKey);};
  const closeInspector=useCallback(()=>setInspectorOpen(false),[setInspectorOpen]);
  const selectAnalysis=(key:string)=>{
    setActiveEventKey(key);
    const event=analysisEvents.find(e=>e.key===key);
    if(!event) return;
    const minute=event.minute ?? (event.pathKind==='HALF_TIME'?referenceMinute:event.pathKind==='FULL_TIME'?maxMinute:null);
    const nearest=minute===null?undefined:drawn.reduce<MatchJourneyPoint|undefined>((best,p)=>!best||Math.abs(p.plotMinute!-minute)<Math.abs(best.plotMinute!-minute)?p:best,undefined);
    if(nearest) setSelectedKey(nearest.key);
  };
  const selectFromPlot=useCallback((px:number,eventLane:boolean,drag:boolean)=>{
    if(eventLane){
      const group=nearestMomentGroup(groups,px,markerX,drag?Infinity:journeyTouch.eventHitRadius);
      const event=group?momentGroupLead(group):undefined;
      if(event){pickMoment(event.key);if(!drag)openInspector();return;}
    }
    const point=nearestJourneyPoint(drawn,px,x);
    if(point){pickPoint(point);if(!drag)openInspector();}
  },[drawn,groups,markerX,pickMoment,pickPoint,x,openInspector]);
  // Gesture objects stay stable across selection updates. Local gesture x is
  // measured in the same View as the SVG, avoiding child-relative tap offsets.
  const plotGesture=useMemo(()=>{
    // Native gesture state must change synchronously on the UI runtime. Only
    // React selection updates cross back to RN; JS activation silently fails.
    const pan=Gesture.Pan().manualActivation(true).maxPointers(1)
      .onTouchesDown(event=>{'worklet';const touch=event.changedTouches[0];if(touch){touchStartX.set(touch.x);touchStartY.set(touch.y);panActive.set(false);}})
      .onTouchesMove((event,manager)=>{
        'worklet';
        if(event.numberOfTouches!==1){manager.fail();return;}
        if(panActive.get())return;
        const touch=event.allTouches[0];if(!touch){manager.fail();return;}
        const intent=journeyDragIntent(touch.x-touchStartX.get(),touch.y-touchStartY.get());
        if(intent==='SCROLL')manager.fail();
        else if(intent==='SCRUB'){panActive.set(true);manager.activate();}
      })
      .onTouchesUp((_event,manager)=>{'worklet';if(!panActive.get())manager.fail();})
      .onTouchesCancelled((_event,manager)=>{'worklet';manager.fail();})
      .onStart(event=>{'worklet';scheduleOnRN(setIsScrubbing,true);scheduleOnRN(selectFromPlot,event.x,Math.abs(touchStartY.get()-laneY)<=24,true);})
      .onUpdate(event=>{'worklet';scheduleOnRN(selectFromPlot,event.x,Math.abs(touchStartY.get()-laneY)<=24,true);})
      .onEnd((event,success)=>{'worklet';if(success)scheduleOnRN(selectFromPlot,event.x,Math.abs(touchStartY.get()-laneY)<=24,true);})
      .onFinalize(()=>{'worklet';panActive.set(false);scheduleOnRN(setIsScrubbing,false);});
    const tap=Gesture.Tap().maxDistance(8).runOnJS(true).onEnd((event,success)=>{
      // Keyboard/screen-reader activation already has an explicit target; a
      // synthesized zero-coordinate click must not select the opening sample.
      if(success&&event.x>=LEFT&&event.x<=width-RIGHT&&event.y>=TOP-14&&event.y<=chartHeight)
        selectFromPlot(event.x,Math.abs(event.y-laneY)<=24,false);
    });
    return Gesture.Exclusive(pan,tap);
  },[laneY,chartHeight,width,selectFromPlot,panActive,touchStartX,touchStartY]);
  // Desktop web: a mouse hovering over the plot reads the nearest journey point
  // like a scrub, without a button held. Event markers stay click-only so
  // passing over them never opens an event. At most one update per 32 ms.
  const lastHoverAt=useRef(0);
  const hoverProps=Platform.OS==='web'?{
    onPointerMove:(event:PointerEvent)=>{
      if(event.nativeEvent.pointerType!=='mouse'||isScrubbing)return;
      const now=Date.now();
      if(now-lastHoverAt.current<32)return;
      lastHoverAt.current=now;
      const node=scrubArea.current as unknown as {getBoundingClientRect?:()=>{left:number}}|null;
      const rect=node?.getBoundingClientRect?.();
      if(rect)selectFromPlot(event.nativeEvent.clientX-rect.left,false,true);
    }
  }:{};
  const selectedIndex=selected?drawn.indexOf(selected):-1;
  const revealInspectorEvent=useCallback(()=>{
    const index=moments.findIndex(event=>event.key===activeEventKey);
    if(inspectorOpen&&index>=0)inspectorRail.current?.scrollTo({x:Math.max(0,index*164-12),animated:false});
  },[inspectorOpen,activeEventKey,moments]);
  useEffect(revealInspectorEvent,[revealInspectorEvent]);
  return <View style={story.card}>
    <SurfaceMaterial radius={radii.lg}/>
    <View style={story.topline}><Text style={story.eyebrow}>MAÇIN YOLU</Text><Text style={story.liveTag}>{match.status==='FINISHED'?'MAÇ TAMAMLANDI':match.status==='HALF_TIME'?'DEVRE ARASI':'MAÇ AKIŞI'}</Text></View>
    {retained?<OriginBadge origin={retained.origin}/>:null}
    <Text style={story.subtitle}>{currentTitle}</Text>
    <View style={story.plotSurface} onLayout={event=>setWidth(Math.max(180,event.nativeEvent.layout.width))}>
    <View style={story.plotReadout}>
      <View style={story.plotReadoutCopy} accessible accessibilityRole={drawn.length?'adjustable':'text'}
        accessibilityLabel={`Maçın yolu, ${activeMoment?'seçili olay':selected?'seçili kayıt':'yol geçmişi'}, ${spokenSelection}. Yatay sürükleyerek gezin. Dikey hareket sayfayı kaydırır.`}
        accessibilityValue={drawn.length?{min:0,max:drawn.length-1,now:Math.max(0,selectedIndex),text:spokenSelection}:undefined}
        aria-valuemin={drawn.length?0:undefined} aria-valuemax={drawn.length?drawn.length-1:undefined}
        aria-valuenow={drawn.length?Math.max(0,selectedIndex):undefined} aria-valuetext={spokenSelection}
        accessibilityActions={drawn.length?[{name:'increment',label:'Sonraki kayıt'},{name:'decrement',label:'Önceki kayıt'}]:undefined}
        onAccessibilityAction={event=>{
          const next=Math.max(0,Math.min(drawn.length-1,selectedIndex+(event.nativeEvent.actionName==='increment'?1:-1)));
          if(drawn[next])pickPoint(drawn[next]!);
        }}>
        <Text style={story.micro}>{isScrubbing?'GRAFİKTE GEZİNİYORSUN':activeMoment?'SEÇİLİ OLAY':!selected?'YOL GEÇMİŞİ':selected===latest?'SON KAYIT':'SEÇİLİ AN'}</Text>
        <Text numberOfLines={2} style={story.readoutValue}>{selectedLabel}</Text>
        {captureLabel?<Text style={story.hint}>{captureLabel}</Text>:null}
      </View>
      {latest?<Pressable accessibilityRole="button" accessibilityLabel="Son kayda dön" onPress={returnToLatest} style={story.latestButton}><Text style={story.controlText}>Son kayıt ↗</Text></Pressable>:null}
    </View>
    <GestureDetector gesture={plotGesture} touchAction="pan-y">
    <View collapsable={false} ref={scrubArea} style={{height:chartHeight}} testID="journey-scrub-area" {...hoverProps}>
    <Svg width="100%" height={chartHeight} viewBox={`0 0 ${width} ${chartHeight}`} {...journeySvgAccessibility}>
      <Defs><LinearGradient id="journeyFill" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.blue} stopOpacity={.28}/><Stop offset="1" stopColor={colors.blue} stopOpacity={.02}/></LinearGradient></Defs>
      {drawn.length?<Rect x={LEFT} y={y(.3)} width={plotWidth} height={HEIGHT*.3} fill={semantic.surprise} opacity={.07} rx={4}/>:null}
      {drawn.length?bands.map(b=><G key={b.label}><Line x1={LEFT} x2={width-RIGHT} y1={y(b.level)} y2={y(b.level)} stroke={colors.borderSoft} strokeDasharray="2 5"/><SvgText x={LEFT-8} y={y(b.level)+4} textAnchor="end" fill={colors.textMuted} {...svgLabel}>{b.label}</SvgText></G>):<SvgText x={width/2} y={20} textAnchor="middle" fill={colors.textMuted} {...svgLabel}>Yol kaydı yok · olaylar zaman çizgisinde</SvgText>}
      {[0,30,60,maxMinute].map(m=><G key={m}>{drawn.length?<Line x1={x(m)} x2={x(m)} y1={TOP} y2={BOTTOM} stroke={colors.borderSoft} opacity={.45}/>:null}<SvgText x={x(m)} y={laneY+36} textAnchor={m===0?'start':m===maxMinute?'end':'middle'} fill={colors.textMuted} {...svgLabel}>{Math.round(m)}′</SvgText></G>)}
      {linePoints.length>1?<>
        <Path d={`M ${linePoints.join(' L ')} L ${x(latest!.plotMinute!)} ${BOTTOM} L ${x(drawn[0]!.plotMinute!)} ${BOTTOM} Z`} fill="url(#journeyFill)"/>
        <Polyline points={linePoints.join(' ')} fill="none" stroke={colors.blue} strokeWidth={9} strokeOpacity={.08} strokeLinejoin="round"/>
        <Polyline points={linePoints.join(' ')} fill="none" stroke={colors.blue} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round"/>
      </>:null}
      {referencePoint&&drawn.length?<G><Line x1={x(referenceMinute)} x2={x(referenceMinute)} y1={TOP-8} y2={BOTTOM+4} stroke={colors.bronze} strokeDasharray="3 4"/><SvgText x={Math.max(LEFT+30,Math.min(width-RIGHT-30,x(referenceMinute)))} y={journeyTopLabelY} textAnchor="middle" fill={colors.bronze} {...svgLabel}>Yeni havuz</SvgText></G>:null}
      {joinMarks.map(p=><Circle key={p.key} cx={x(p.plotMinute!)} cy={y(p.level!)} r={4} stroke={colors.blue} strokeWidth={2} fill={colors.backgroundElevated}/>)}
      {cursorMinute!==null?<Line x1={x(cursorMinute)} x2={x(cursorMinute)} y1={drawn.length?TOP:32} y2={laneY+19} stroke={colors.text} strokeOpacity={isScrubbing?.8:.5} strokeWidth={1.5} strokeDasharray="3 3"/>:null}
      {highlight?.level!=null && highlight.plotMinute!==null?<G><Circle cx={x(highlight.plotMinute)} cy={y(highlight.level)} r={10} fill={colors.blue} opacity={.2}/><Circle cx={x(highlight.plotMinute)} cy={y(highlight.level)} r={5} fill={colors.backgroundElevated} stroke={colors.text} strokeWidth={2}/></G>:null}
      <SvgText x={LEFT-8} y={laneY+4} textAnchor="end" fill={colors.textMuted} {...svgLabel}>Olaylar</SvgText>
      <Line x1={LEFT} x2={width-RIGHT} y1={laneY} y2={laneY} stroke={colors.border}/>
      {groups.map(members=>{
        const lead=members[0]!;
        const cx=markerX(lead.minute!);
        const symbol=momentGroupLead(members)!;
        const ink=journeyEventColor(symbol);
        const active=members.some(member=>member.key===activeEventKey);
        const symbols=momentGroupSymbols(members);
        const symbolWidth=symbols.length===3?12:18, symbolScale=symbolWidth/24;
        return <G key={lead.key}>{drawn.length?members.map(member=><Line key={`lead:${member.key}`} x1={x(member.minute!)} x2={cx} y1={BOTTOM+4} y2={laneY-17} stroke={journeyEventColor(member)} opacity={.35}/>):null}<Rect x={cx-20} y={laneY-17} width={40} height={34} rx={12} fill={colors.backgroundElevated} stroke={active?colors.text:ink} strokeWidth={active?2:1}/>{symbols.map((event,index)=><G key={event.key} transform={symbols.length>1?`translate(${cx-symbols.length*symbolWidth/2+index*symbolWidth},${laneY-symbolWidth/2}) scale(${symbolScale})`:`translate(${cx-12},${laneY-12})`}><JourneyEventGlyph kind={event.kind} color={journeyEventColor(event)}/></G>)}{members.length>1?<G><Circle cx={cx+15} cy={laneY-16} r={9} fill={ink}/><SvgText x={cx+15} y={laneY-12} textAnchor="middle" fill={colors.background} {...svgLabel}>{members.length>9?'9+':members.length}</SvgText></G>:null}</G>;
      })}
    </Svg>
    {/* Physical input belongs to the one gesture canvas. These overlay buttons
        retain keyboard/screen-reader actions without firing an origin tap after
        a drag that started on a marker. */}
    {groups.map(members=><Pressable key={`hit:${members[0]!.key}`} accessible pointerEvents="none" accessibilityRole="button"
      accessibilityLabel={members.length>1?`${members.length} olay. ${members.map(event=>`${event.label}, ${event.title}`).join('; ')}. Olayları ayrı ayrı aç.`:`${members[0]!.label}, ${members[0]!.title}`}
      accessibilityState={{selected:members.some(event=>event.key===activeEventKey)}}
      accessibilityActions={[{name:'activate',label:'Olayı aç'}]}
      onAccessibilityTap={()=>{pickMoment(momentGroupLead(members)!.key);openInspector();}}
      onAccessibilityAction={event=>{if(event.nativeEvent.actionName==='activate'){pickMoment(momentGroupLead(members)!.key);openInspector();}}}
      onPress={()=>{pickMoment(momentGroupLead(members)!.key);openInspector();}}
      style={[story.markerHit,{left:markerX(members[0]!.minute!)-24,top:laneY-24}]}/>) }
    </View>
    </GestureDetector>
    </View>
    <Text numberOfLines={2} accessibilityLiveRegion="polite" style={story.inlineSummary}>
      {activeMoment?journeyMomentEffect(activeMoment):selected?journeyPointLabel(selected):isLoading?'Maçın yolu yükleniyor…':'Bu maç için kullanılabilir geçmiş yok.'}
    </Text>
    <Pressable ref={inspectorTrigger} accessibilityRole="button" accessibilityLabel="Seçili anın ayrıntısını aç" onPress={openInspector} style={story.inspectButton}>
      <Text style={story.controlText}>Seçili anı incele</Text>
    </Pressable>
    <JourneyInspector visible={inspectorOpen} onClose={closeInspector} onDismiss={restoreInspectorPosition}
      previous={previousMomentKey?goPrevious:undefined} next={nextMomentKey?goNext:undefined}
      selectionKey={activeEventKey ?? selected?.key ?? null}
      positionLabel={activeMoment?`${moments.indexOf(activeMoment)+1} / ${moments.length} olay`:'Grafik kaydı'}>
            {moments.length?<ScrollView ref={inspectorRail} onContentSizeChange={revealInspectorEvent} horizontal scrollEnabled={Platform.OS==='web'} showsHorizontalScrollIndicator={false} contentContainerStyle={story.moments}>
              {moments.map(event=><Pressable key={event.key} accessibilityRole="button" accessibilityState={{selected:activeEventKey===event.key}} accessibilityLabel={`${event.label}, ${event.title}, ${event.score??''}`} onPress={()=>pickMoment(event.key)} style={[story.moment,activeEventKey===event.key?story.momentActive:null]}>
                <JourneyEventIcon event={event}/><View style={{flex:1}}><Text numberOfLines={2} style={story.momentTitle}>{event.label} · {event.title}</Text>{event.kind==='SUPER'?<Text accessibilityLabel={`${event.stars??1} yıldız`} style={[story.momentScore,story.superStars]}>{'★'.repeat(event.stars??1)}</Text>:<Text style={story.momentScore}>{event.score??''}</Text>}</View>
              </Pressable>)}
            </ScrollView>:null}
    {activeMoment?<View style={story.focus} accessibilityLiveRegion="polite">
      <Text style={story.eyebrow}>{activeMoment.label} · {activeMoment.title.toLocaleUpperCase('tr-TR')}</Text>
      <Text style={story.focusTitle}>{[activeMoment.side==='HOME'?match.homeTeam:activeMoment.side==='AWAY'?match.awayTeam:null,activeMoment.score].filter(Boolean).join(' · ')||activeMoment.title}</Text>
      {activeMoment.player?<Text style={story.subtitle}>{activeMoment.player}</Text>:null}
      <Text style={story.subtitle}>{journeyMomentEffect(activeMoment)}</Text>
      {activeMoment.kind==='GOAL'?<Text style={story.subtitle}>{goalModeEffectText(activeMoment.point)}</Text>:null}
      {activeMoment.kind==='SUPER'&&activeMoment.superKey&&onDecisionPress?<Pressable accessibilityRole="button" accessibilityHint="Super karar detayını açar" onPress={()=>{setInspectorOpen(false);onDecisionPress(activeMoment.superKey!);}} style={story.focusAction}><Text style={story.controlText}>Super kararını aç ›</Text></Pressable>:null}
    </View>:selected?<View style={story.focus} accessibilityLiveRegion="polite">
      <View style={story.topline}><Text style={story.eyebrow}>{selected.elapsed||selected.plotMinute}′ · {selected.home??'—'}–{selected.away??'—'}</Text><Text style={story.micro}>{selected===latest?'SON KAYIT':'SEÇİLİ AN'}</Text></View>
      <Text style={story.focusTitle}>{journeyPointLabel(selected)}</Text><Text style={story.subtitle}>{pressureReading(selected)}</Text>
      {selectedBalance ? <Text style={story.subtitle}>Baskı: {selectedBalance}</Text> : null}
      {selected.eliminatedRatio!==null?<Text style={story.subtitle}>{selected.beforeCount} sonuçtan {selected.eliminatedCount} elendi · {selected.compatibleCount} uyumlu sonuç kaldı</Text>:null}
      {selected.kind==='GOAL'?<Text style={story.subtitle}>{goalModeEffectText(selected)}</Text>:null}
    </View>:<View style={story.focus}><Text style={story.subtitle}>{isLoading?'Maçın yolu yükleniyor…':match.status==='NOT_STARTED'?'Başlama düdüğünden sonra ilk kayıtla başlayacak.':'Bu maç için kullanılabilir geçmiş yok. Geçmişe ait çizgi üretilmedi.'}</Text></View>}
    {selected&&!activeMoment?<View style={story.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel="Önceki kayıt" disabled={selectedIndex<=0} style={[story.control,selectedIndex<=0?story.disabled:null]} onPress={()=>pickPoint(drawn[selectedIndex-1]!)}><Text style={story.controlText}>← Önceki</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Son kayda dön" style={story.control} onPress={returnToLatest}><Text style={story.controlText}>Son kayıt</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Sonraki kayıt" disabled={selectedIndex>=drawn.length-1} style={[story.control,selectedIndex>=drawn.length-1?story.disabled:null]} onPress={()=>pickPoint(drawn[selectedIndex+1]!)}><Text style={story.controlText}>Sonraki →</Text></Pressable>
    </View>:null}
    {pool && (!activeMoment || activeMoment.point?.poolKey===pool.key)?<View style={story.poolBox}>
      <View style={story.topline}><Text style={story.eyebrow}>{pool.phase===1?'DEVRE SKORU HAVUZU':'MAÇ SONU HAVUZU'}</Text><Text style={story.micro}>{pool.count} MAÇ</Text></View>
      {pool.phase===2?<Text style={story.subtitle}>İY {pool.halfTimeScore} sonrası</Text>:null}
      <View style={story.leaders}>{leaders.map(row=><View key={row.score} style={story.leader}><Text style={story.poolScore}>{row.score}</Text><View style={story.track}><View style={[story.fill,{width:`${Math.min(100,row.share*100)}%`}]}/></View><Text style={story.hint}>{row.count} maç · %{Math.round(row.share*100)}</Text></View>)}</View>
    </View>:null}
    {isError?<Text style={story.hint}>Akış yenilenemedi. {drawn.length?'Son alınan kayıt gösteriliyor.':'Yeniden yüklemeyi deneyin.'}</Text>:null}
    {live?.freshness?.stale?<Text style={story.hint}>Gol ve kart akışı güncel olmayabilir.</Text>:null}
    <Pressable accessibilityRole="button" accessibilityState={{expanded:showAnalysis}} onPress={()=>setShowAnalysis(!showAnalysis)} style={story.disclosure}>
      <View style={{flex:1}}><Text style={story.controlText}>Havuz analizi</Text><Text style={story.hint}>{latestPath?`Son ölçüm · normallik %${Math.round(latestPath.stateNormality!*100)} · ${latestPath.cohortSize} benzer maç`:'Skor değerlendirmesi ve örneklem bilgisi'}</Text></View><Text style={story.controlText}>{showAnalysis?'−':'+'}</Text>
    </Pressable>
    {analysisPath?<OriginBadge origin={analysisPath.origin}/>:null}
    {latestPath?.belowReliableCohort?<Text style={story.hint}>Az örneklem</Text>:null}
    {showAnalysis?<AnalysisEventRail activeKey={activeEventKey} awayTeam={match.awayTeam} homeTeam={match.homeTeam} events={analysisEvents} onSelect={selectAnalysis} path={analysisPath} state={pathState}/>:null}
    <Pressable accessibilityRole="button" accessibilityState={{expanded:showRules}} onPress={()=>setShowRules(!showRules)} style={story.disclosure}><Text style={story.hint}>{drawn.filter(p=>p.capturedAt!==null).length} kayıt · Nasıl okunur?</Text><Text style={story.controlText}>{showRules?'−':'+'}</Text></Pressable>
    {showRules?<Text style={story.subtitle}>Mavi çizgi maçın havuzla uyumunu gösterir. İlk yarıda devre skoru, ikinci yarıda devre skoruna göre maç sonu havuzu kullanılır; dikey basamak havuz değişimidir. İçi boş noktalar ara veya düzeltme kayıtlarıdır. Altın yıldızlar BTB’nin Super kayıtlarıdır.</Text>:null}
            {showRules?<View style={{gap:8}}>    <Text style={story.gestureHint}>↔ Parmağını grafikte sürükle · ↑↓ Sayfayı kaydır</Text>
    <View style={story.eventLegend}>{LEGEND_KINDS.map(kind=><View key={kind} style={story.legendItem}><Svg width={18} height={18} viewBox="0 0 24 24" {...journeySvgAccessibility}><JourneyEventGlyph kind={kind} color={kind==='RED_CARD'?colors.red:kind==='SUPER'?colors.gold:colors.textMuted}/></Svg><Text style={story.hint}>{LEGEND_LABELS[kind]}</Text></View>)}</View>
    <Text style={story.hint}>Rozet: gruplanan olay sayısı.</Text>
</View>:null}
    </JourneyInspector>
  </View>;
}

const story=StyleSheet.create({
  inlineSummary:{...textFont('400'), fontSize:13,lineHeight:19,color:colors.textMuted},
  inspectButton:{minHeight:48,gap:4,justifyContent:'center'},
  inspectorBackdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.55)',paddingHorizontal:12},
  inspector:{width:'100%',maxWidth:640,alignSelf:'center',backgroundColor:colors.backgroundElevated,borderRadius:20,borderWidth:1,borderColor:colors.border,paddingHorizontal:16},
  inspectorHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  inspectorContent:{gap:12,paddingBottom:16},
  card:{padding:16,borderRadius:radii.lg,gap:12,overflow:'hidden'},
  topline:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'},
  eyebrow:{...typeScale.eyebrow,color:colors.bronze},liveTag:{...typeScale.micro,color:colors.teal},micro:{...typeScale.micro,color:colors.textMuted},
  headline:{...typeScale.moduleTitle,fontSize:20,lineHeight:26,color:colors.text},subtitle:{...typeScale.label,color:colors.textMuted,lineHeight:19},
  scoreRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:6},team:{flex:1,flexDirection:'row',alignItems:'center',gap:7},teamName:{...typeScale.label,color:colors.text,flexShrink:1,fontWeight:'700'},dot:{width:5,height:20,borderRadius:3},
  scorePill:{alignItems:'center',gap:3},score:{...numericFont('700'), fontSize:28,color:colors.text,fontVariant:['tabular-nums']},
  plotSurface:{backgroundColor:colors.backgroundElevated,borderRadius:16,marginHorizontal:-4,overflow:'hidden'},
  plotReadout:{minHeight:56,paddingHorizontal:12,paddingVertical:8,flexDirection:'row',alignItems:'center',gap:8,borderBottomColor:colors.borderSoft,borderBottomWidth:1},
  plotReadoutCopy:{flex:1,minWidth:0,gap:3},readoutValue:{...numericFont('700'), fontSize:13,lineHeight:18,color:colors.text,fontVariant:['tabular-nums']},
  latestButton:{minHeight:48,justifyContent:'center',paddingHorizontal:6},markerHit:{position:'absolute',width:48,height:48},
  gestureHint:{...typeScale.label,color:colors.text,lineHeight:18},eventLegend:{flexDirection:'row',flexWrap:'wrap',gap:12},legendItem:{flexDirection:'row',alignItems:'center',gap:4},
  groupChoices:{gap:6},groupChoice:{flexDirection:'row',alignItems:'center',gap:8,minHeight:48,padding:10,borderColor:colors.borderSoft,borderWidth:1,borderRadius:10,backgroundColor:colors.backgroundElevated},groupChoiceText:{...typeScale.label,color:colors.text,flex:1,lineHeight:18},
  hint:{...typeScale.label,fontSize:11,color:colors.textMuted,lineHeight:16},moments:{gap:8,paddingVertical:3},moment:{width:156,minHeight:56,flexDirection:'row',gap:10,alignItems:'center',backgroundColor:colors.backgroundElevated,borderWidth:1,borderColor:colors.borderSoft,borderRadius:12,padding:12},momentActive:{borderColor:colors.blue},momentTitle:{...typeScale.label,color:colors.textMuted},momentScore:{...typeScale.bodyCompact,color:colors.text,fontWeight:'700'},superStars:{color:colors.gold,letterSpacing:1},
  focusAction:{minHeight:48,justifyContent:'center',alignSelf:'flex-start'},
  focus:{backgroundColor:colors.backgroundElevated,borderLeftWidth:3,borderLeftColor:colors.blue,borderRadius:12,padding:14,gap:7},focusTitle:{...typeScale.bodyCompact,color:colors.text,fontWeight:'700',lineHeight:22},
  controls:{flexDirection:'row',justifyContent:'space-between',gap:4},control:{flex:1,minHeight:48,alignItems:'center',justifyContent:'center',paddingHorizontal:6},controlText:{...typeScale.label,color:colors.blue,fontWeight:'700'},disabled:{opacity:.3},
  poolBox:{borderWidth:1,borderColor:colors.border,borderRadius:16,padding:12,gap:10},leaders:{flexDirection:'row',gap:12},leader:{flex:1,gap:6},poolScore:{...numericFont('700'), fontSize:21,color:colors.text},track:{height:4,borderRadius:2,backgroundColor:colors.borderSoft,overflow:'hidden'},fill:{height:4,backgroundColor:colors.bronze,borderRadius:2},
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
