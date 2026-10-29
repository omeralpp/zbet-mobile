import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { createJinxMotionState, jinxMotionReducer, resolveJinxRendererMotion, sceneCopy,
  type JinxMotionMode, type JinxMotionState } from "./jinx-motion";

type EffectSlot = { dependencies: readonly unknown[]; cleanup?: (() => void) | undefined };
type Element = { type: unknown; props: { children?: unknown; testID?: string } };

/** Execute the actual renderer's effects against deterministic RN animation/timer boundaries. */
function renderer() {
  const slots: unknown[] = [];
  const pending: { index: number; dependencies: readonly unknown[]; create: () => void | (() => void) }[] = [];
  const timers = new Map<number, { callback: () => void; delay: number }>();
  const animations: { type: string; running: boolean }[] = [];
  const listeners = new Set<(next: string) => void>();
  let cursor = 0, timerId = 0, reduced = false;
  const react = {
    useState(initial: unknown) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (value: unknown) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useRef(initial: unknown) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(create: () => void | (() => void), dependencies: readonly unknown[]) {
      const index = cursor++, previous = slots[index] as EffectSlot | undefined;
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        pending.push({ index, dependencies, create });
      }
    }
  };
  const animatedNode = () => ({ interpolate: () => animatedNode() });
  class Value {
    constructor(public value: number) {}
    setValue(value: number) { this.value = value; }
    stopAnimation() {}
    interpolate() { return animatedNode(); }
  }
  const animation = (type: string) => {
    const record = { type, running: false };
    return { start: () => { record.running = true; animations.push(record); }, stop: () => { record.running = false; } };
  };
  const jsx = (type: unknown, props: Element["props"]): Element => ({ type, props });
  const exports: Record<string, unknown> = {};
  const source = ts.transpileModule(readFileSync(new URL("./JinxAnimator.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  runInNewContext(source, {
    exports,
    require(name: string) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react-native") return {
        AppState: { currentState: "active", addEventListener: (_: string, listener: (next: string) => void) => {
          listeners.add(listener); return { remove: () => listeners.delete(listener) };
        } },
        Animated: { Value, add: animatedNode, multiply: animatedNode,
          timing: () => animation("scene"), spring: () => animation("micro"),
          sequence: () => animation("micro"), loop: () => animation("breath"), View: "Animated.View", Text: "Animated.Text" },
        Easing: { inOut: (value: unknown) => value, cubic: "cubic", ease: "ease" },
        Platform: { OS: "android" }, StyleSheet: { create: (value: unknown) => value }, Image: "Image", View: "View"
      };
      if (name === "@expo/vector-icons") return { MaterialCommunityIcons: "Icon" };
      if (name === "@/src/theme/typography") return { textFont: () => ({}) };
      if (name === "@/src/theme/use-reduced-motion") return { useReducedMotion: () => reduced };
      if (name === "./jinx-motion") return { resolveJinxRendererMotion, sceneCopy };
      if (name.endsWith(".png")) return name;
      throw new Error(`Unexpected renderer dependency: ${name}`);
    },
    setTimeout(callback: () => void, delay: number) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id: number) { timers.delete(id); },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 })
  });
  const component = exports.JinxAnimator as (props: { candidate: string; mode: JinxMotionMode; state: JinxMotionState;
    asleep?: boolean; forceReducedMotion?: boolean; onComplete?: (sequence: number) => void }) => Element;
  return {
    render(props: Parameters<typeof component>[0]) {
      cursor = 0;
      const tree = component(props);
      for (const effect of pending) (slots[effect.index] as EffectSlot | undefined)?.cleanup?.();
      for (const effect of pending) slots[effect.index] = { dependencies: effect.dependencies, cleanup: effect.create() };
      pending.length = 0;
      return tree;
    },
    background(active: boolean) { for (const listener of listeners) listener(active ? "active" : "background"); },
    reduced(value: boolean) { reduced = value; },
    timers,
    animations,
    unmount() { for (const slot of slots) (slot as EffectSlot | undefined)?.cleanup?.(); }
  };
}

function hasTestId(tree: unknown, testID: string): boolean {
  if (Array.isArray(tree)) return tree.some(child => hasTestId(child, testID));
  if (!tree || typeof tree !== "object") return false;
  const node = tree as Element;
  return node.props?.testID === testID || hasTestId(node.props?.children, testID);
}

const initial = () => createJinxMotionState({ matchKey: "navigation:/", revision: "navigation" });

test("actual renderer cancels menu loops and resumes fresh idle without a queued bob or spark", () => {
  const view = renderer();
  let state = initial();
  const render = () => view.render({ candidate: "orb", mode: "LIVE", state });
  assert.equal(hasTestId(render(), "jinx-spark"), false);
  assert.equal(view.animations.filter(item => item.running && item.type === "breath").length, 1);
  assert.equal(view.timers.size, 2);
  state = jinxMotionReducer(state, { type: "interaction", blocked: true });
  render();
  assert.equal(view.animations.some(item => item.running), false);
  assert.equal(view.timers.size, 0);
  state = jinxMotionReducer(state, { type: "interaction", blocked: false });
  render();
  assert.equal(view.animations.filter(item => item.type === "scene").length, 0);
  assert.ok([...view.timers.values()].some(timer => timer.delay >= 6000));
  view.unmount();
  assert.equal(view.timers.size, 0);
  assert.equal(view.animations.some(item => item.running), false);
});

test("actual renderer permits requested drag and guide scenes without idle ornament", () => {
  for (const scene of ["drag", "guide"] as const) {
    const view = renderer();
    const tree = view.render({ candidate: "orb", mode: "LIVE", state: { ...initial(), blocked: true, scene, sequence: 1 } });
    assert.equal(view.animations.filter(item => item.running && item.type === "scene").length, 1, scene);
    assert.equal(view.animations.some(item => item.type === "breath"), false, scene);
    assert.equal(view.timers.size, 0, scene);
    assert.equal(hasTestId(tree, "jinx-spark"), false, scene);
    view.unmount();
    assert.equal(view.animations.some(item => item.running), false, scene);
  }
});

test("actual renderer gives background, sleep, reduced motion and OFF priority, then recovers CALM", () => {
  const view = renderer();
  let state = { ...initial(), scene: "touch" as JinxMotionState["scene"], sequence: 1 };
  const onComplete = (sequence: number) => { state = jinxMotionReducer(state, { type: "finish", sequence }); };
  const render = (mode: JinxMotionMode = "LIVE", asleep = false, forceReducedMotion = false) =>
    view.render({ candidate: "orb", mode, state, asleep, forceReducedMotion, onComplete });
  render();
  view.background(false); render();
  assert.equal(state.scene, "idle");
  assert.equal(view.animations.some(item => item.running), false);
  assert.equal(view.timers.size, 0);
  view.background(true); render();
  for (const suspend of [() => render("OFF"), () => render("LIVE", true), () => render("LIVE", false, true),
    () => { view.reduced(true); render(); }]) {
    suspend();
    assert.equal(view.animations.some(item => item.running), false);
    assert.equal(view.timers.size, 0);
  }
  view.reduced(false); render("CALM");
  assert.equal(view.animations.filter(item => item.running && item.type === "breath").length, 1);
  assert.equal(view.timers.size, 1); // CALM blinks but never schedules an ambient micro-move.
  assert.equal(view.animations.filter(item => item.type === "scene").length, 1); // Interrupted touch did not replay.
  view.unmount();
});

test("renderer policy does not let guide/drag override accessibility, sleep or background", () => {
  for (const scene of ["drag", "guide"] as const) {
    const base = { mode: "LIVE" as const, reduceMotion: false, forceReducedMotion: false,
      foreground: true, asleep: false, state: { ...initial(), blocked: true, scene } };
    assert.equal(resolveJinxRendererMotion(base).enabled, true);
    for (const patch of [{ reduceMotion: true }, { forceReducedMotion: true }, { asleep: true },
      { foreground: false }, { mode: "OFF" as const }, { state: { ...base.state, active: false } }]) {
      const policy = resolveJinxRendererMotion({ ...base, ...patch });
      assert.equal(policy.enabled || policy.breathe || policy.ambient || policy.blink || policy.spark, false);
    }
  }
});
