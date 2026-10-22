import assert from "node:assert/strict";
import { test } from "node:test";
import { isReactive } from "vue";
import { createStudio } from "../src/composables/createStudio.js";
import { STORAGE_KEY, freeTemplates } from "../src/data/catalog.js";
import { renderPreviewScene } from "../src/scenes/renderScene.js";

function createApp(saved = null) {
  const values = new Map(saved ? [[STORAGE_KEY, JSON.stringify(saved)]] : []);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const timers = { setTimeout: () => 1, clearTimeout: () => {} };
  return { ...createStudio({ storage, timers }), storage };
}
const blocks = (types) => types.map((type) => ({ type }));

test("全部 12 个任务的方案达到目标", () => {
  const app = createApp();
  assert.equal(isReactive(app.state), true);
  for (const mode of ["young", "middle", "older"]) {
    for (const mission of app.missionsForAge(mode)) {
      const program = blocks(mission.requiredOrder);
      const data = app.simulateProgram(
        program,
        mode,
        mission.id,
        mission.scene === "dialogue" ? "forest" : null,
      );
      assert.equal(
        app.analyzeProgramData(program, data, mode, mission.id).outcome,
        "success",
        mission.title,
      );
    }
  }
});
test("自由创作保存和重开时不覆盖任务程序或进度", () => {
  const app = createApp();
  const original = JSON.stringify(app.state.program);
  app.createFreeProject("story");
  app.addBlock("move");
  app.addBlock("sound");
  const id = app.state.freeProjectId;
  app.leaveFreeWorkbench("works");
  assert.equal(JSON.stringify(app.state.program), original);
  assert.equal(app.state.completedMissions.length, 0);
  app.openFreeProject(id);
  const restored = createApp(JSON.parse(app.storage.getItem(STORAGE_KEY)));
  assert.equal(restored.state.view, "free-workbench");
  assert.deepEqual(
    restored.state.program.map((block) => block.type),
    ["start", "move", "sound"],
  );
  assert.equal(
    JSON.stringify(restored.state.programsByMission.middle["middle-maze"]),
    original,
  );
});
test("自由音乐执行真实效果，且不解锁任务", () => {
  const app = createApp();
  app.createFreeProject("music");
  app.addBlock("repeat");
  app.addBlock("sound");
  app.beginRun("step");
  app.state.program.forEach((block) =>
    app.applyExecutionStep(
      block,
      app.state.runData,
      freeTemplates.music.ageMode,
    ),
  );
  app.finishRun();
  assert.equal(app.state.lastRun, "success");
  assert.match(app.freeRunFeedback()[1], /声音播放了/);
  assert.equal(app.state.completedMissions.length, 0);
});
test("自由游戏执行自己的规则", () => {
  const app = createApp();
  app.createFreeProject("game");
  ["function", "repeat", "condition", "attack", "sound"].forEach(app.addBlock);
  app.beginRun("step");
  app.state.program.forEach((block) =>
    app.applyExecutionStep(block, app.state.runData, "older"),
  );
  app.finishRun();
  assert.equal(app.state.lastRun, "success");
  assert.equal(app.state.runData.attacked, true);
  assert.equal(app.state.completedMissions.length, 0);
});
test("推荐任务轮换，主题进度开关生效", () => {
  const app = createApp();
  const before = app.recommendedMissions().map((mission) => mission.id);
  app.handleAction("shuffle");
  assert.notDeepEqual(
    app.recommendedMissions().map((mission) => mission.id),
    before,
  );
  app.handleAction("show-progress");
  assert.equal(app.state.progressOpen, true);
  app.handleAction("hide-progress");
  assert.equal(app.state.progressOpen, false);
});
test("完成后直接进入下一关工作台", () => {
  const app = createApp();
  app.state.completedMissions = ["middle-maze"];
  app.persist();
  app.selectNextMission("middle-beat");
  assert.equal(app.state.missionId, "middle-beat");
  assert.equal(app.state.view, "workbench");
});
test("塔防封面有初始能量和射击画稿", () => {
  const app = createApp();
  app.switchAgeMode("older");
  const scene = renderPreviewScene(app.currentMission(), "预览", app);
  assert.match(scene, /<strong>80<\/strong>/);
  assert.doesNotMatch(scene, /待记录/);
  assert.match(scene, /tower-shot/);
  assert.match(scene, /tower-muzzle/);
});
test("红灯不能前进，绿灯通过判断后可通行", () => {
  const app = createApp();
  assert.equal(
    app.simulateProgram(blocks(["start", "repeat"]), "middle", "middle-signal")
      .carRight,
    19,
  );
  assert.equal(
    app.simulateProgram(
      blocks(["start", "repeat", "color", "condition", "move"]),
      "middle",
      "middle-signal",
    ).carRight,
    62,
  );
  assert.equal(
    app.simulateProgram(blocks(["start", "move"]), "middle", "middle-signal")
      .collision,
    true,
  );
});
test("星星先从舞台外移动，然后变色和唱歌", () => {
  const app = createApp();
  const stage = (types) =>
    app.simulateProgram(blocks(types), "young", "young-beat");
  assert.equal(stage(["start"]).actorLeft, 17);
  assert.equal(stage(["start"]).actorTop, 55);
  assert.equal(stage(["start", "move"]).actorLeft, 57);
  assert.equal(stage(["start", "move"]).actorTop, 35);
  assert.equal(stage(["start", "move"]).colorChanged, false);
  assert.equal(stage(["start", "move", "color"]).soundPlayed, false);
  assert.equal(stage(["start", "move", "color", "sound"]).soundPlayed, true);
});
test("塔防在前置条件成立后射击并消耗能量", () => {
  const app = createApp();
  const stage = (types) =>
    app.simulateProgram(blocks(types), "older", "older-tower");
  assert.equal(stage(["start", "variable"]).towerEnergy, 80);
  assert.equal(
    stage(["start", "variable", "repeat", "condition"]).conditionMet,
    true,
  );
  assert.equal(
    stage(["start", "variable", "repeat", "condition", "attack"]).towerEnergy,
    79,
  );
  assert.equal(stage(["start", "attack"]).collision, true);
});
test("分支对话读取真实选择，综合游戏能完成", () => {
  const app = createApp();
  const program = blocks(["start", "choice", "condition", "sound"]);
  const data = app.simulateProgram(program, "older", "older-dialogue");
  assert.equal(
    app.analyzeProgramData(program, data, "older", "older-dialogue").outcome,
    "almost",
  );
  assert.equal(
    app.simulateProgram(program, "older", "older-dialogue", "beach")
      .selectedChoice,
    "beach",
  );
  assert.equal(
    app.simulateProgram(
      blocks(["start", "function", "repeat", "condition", "attack", "sound"]),
      "older",
      "older-project",
    ).attacked,
    true,
  );
});
test("兼容旧版数据键，完成的任务和程序在刷新后保留", () => {
  const program = blocks(["start", "move", "color", "sound"]);
  const app = createApp({
    ageMode: "young",
    missionId: "young-beat",
    view: "workbench",
    completedMissionsByMode: {
      young: ["young-cat", "young-magic", "young-beat"],
      middle: [],
      older: [],
    },
    programsByMission: {
      young: { "young-beat": program },
      middle: {},
      older: {},
    },
    program,
    lastRun: "success",
  });
  assert.equal(app.state.missionId, "young-beat");
  assert.equal(app.state.lastRun, "success");
  assert.equal(app.state.runData.soundPlayed, true);
});
test("关卡编辑器过滤非法数据并恢复障碍", () => {
  const app = createApp({
    ageMode: "older",
    missionId: "older-editor",
    completedMissionsByMode: {
      young: [],
      middle: [],
      older: ["older-tower", "older-dialogue"],
    },
    program: [{ type: "start" }],
    editorTiles: [11, 11, -1, 30, "4"],
  });
  assert.deepEqual([...app.state.editorTiles], [11]);
  app.state.view = "workbench";
  assert.match(
    renderPreviewScene(app.currentMission(), "预览", app),
    /data-cell="11" aria-label="第 3 行第 2 列障碍" aria-pressed="true"/,
  );
});
test("响应式嵌套数据可以安全复制、删除、排序和持久化", () => {
  const app = createApp();
  app.state.program = blocks(["start", "move", "turn"]);
  app.persist();
  app.reorderProgram(2, 1);
  app.removeBlock(2);
  assert.deepEqual(
    app.state.program.map((block) => block.type),
    ["start", "turn"],
  );
  const restored = createApp(JSON.parse(app.storage.getItem(STORAGE_KEY)));
  assert.deepEqual(
    restored.state.program.map((block) => block.type),
    ["start", "turn"],
  );
});
test("示例代码包含完整括号和左转语句", () => {
  const app = createApp();
  app.state.program = blocks(["start", "repeat", "condition", "turn-left"]);
  const code = app.programCode();
  assert.match(code, /turnLeft\(\);/);
  assert.equal(
    [...code].filter((char) => char === "{").length,
    [...code].filter((char) => char === "}").length,
  );
});
test("离开正在运行的任务会停止执行", () => {
  const app = createApp();
  app.state.view = "workbench";
  app.beginRun("auto");
  app.navigate("map");
  app.advanceExecution();
  assert.equal(app.state.view, "map");
  assert.equal(app.state.lastRun, "idle");
  assert.equal(app.state.runData, null);
});
