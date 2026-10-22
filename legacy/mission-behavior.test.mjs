// 旧版回归测试留档；当前测试入口在 tests/。
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(resolve(import.meta.dirname, './app.js'), 'utf8');

function createApp(storedState = null) {
  const storage = new Map(storedState ? [['zaowu-xingqiu-mvp-v1', JSON.stringify(storedState)]] : []);
  const app = {
    innerHTML: '',
    querySelector: () => null,
    addEventListener: () => {},
  };
  const context = vm.createContext({
    document: { querySelector: () => app },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    navigator: {},
    window: { setTimeout, clearTimeout },
    requestAnimationFrame: (callback) => callback(),
    structuredClone,
  });
  vm.runInContext(source, context);
  return {
    evaluate: (expression) => vm.runInContext(expression, context),
    storage,
  };
}

test('all mission recipes reach their required outcome', () => {
  const app = createApp();
  for (const age of ['young', 'middle', 'older']) {
    const missions = app.evaluate(`missionsForAge('${age}')`);
    for (const mission of missions) {
      const program = mission.requiredOrder.map((type) => ({ type }));
      const choice = mission.scene === 'dialogue' ? 'forest' : null;
      const data = app.evaluate(`simulateProgram(${JSON.stringify(program)}, '${age}', '${mission.id}', ${JSON.stringify(choice)})`);
      const result = app.evaluate(`analyzeProgramData(${JSON.stringify(program)}, ${JSON.stringify(data)}, '${age}', '${mission.id}')`);
      assert.equal(result.outcome, 'success', mission.title);
    }
  }
});

test('free creation saves independently and reopens without changing mission progress', () => {
  const app = createApp();
  const missionProgram = app.evaluate('JSON.stringify(state.program)');
  app.evaluate("createFreeProject('story')");
  app.evaluate("addBlock('move')");
  app.evaluate("addBlock('sound')");
  const projectId = app.evaluate('state.freeProjectId');
  assert.equal(app.evaluate('state.view'), 'free-workbench');
  assert.equal(app.evaluate('state.program.length'), 3);
  app.evaluate("leaveFreeWorkbench('works')");
  assert.equal(app.evaluate('JSON.stringify(state.program)'), missionProgram);
  assert.equal(app.evaluate('state.completedMissions.length'), 0);
  app.evaluate(`openFreeProject('${projectId}')`);
  assert.equal(app.evaluate('state.program.map((block) => block.type).join(",")'), 'start,move,sound');
  const reloaded = createApp(JSON.parse(app.storage.get('zaowu-xingqiu-mvp-v1')));
  assert.equal(reloaded.evaluate('state.view'), 'free-workbench');
  assert.equal(reloaded.evaluate('state.program.map((block) => block.type).join(",")'), 'start,move,sound');
  assert.equal(reloaded.evaluate('JSON.stringify(state.programsByMission.middle["middle-maze"])'), missionProgram);
});

test('free run reports actual effects without unlocking a mission', () => {
  const app = createApp();
  app.evaluate("createFreeProject('music')");
  app.evaluate("addBlock('repeat')");
  app.evaluate("addBlock('sound')");
  app.evaluate("beginRun('step')");
  app.evaluate('state.program.forEach((block) => applyExecutionStep(block, state.runData, freeTemplates.music.ageMode))');
  app.evaluate('finishRun()');
  assert.equal(app.evaluate('state.lastRun'), 'success');
  assert.equal(app.evaluate('state.runData.soundPlayed'), true);
  assert.match(app.evaluate('freeRunFeedback()[1]'), /声音播放了/);
  assert.equal(app.evaluate('state.completedMissions.length'), 0);
});

test('free game can execute its own rule sequence', () => {
  const app = createApp();
  app.evaluate("createFreeProject('game')");
  for (const type of ['function', 'repeat', 'condition', 'attack', 'sound']) {
    app.evaluate(`addBlock('${type}')`);
  }
  app.evaluate("beginRun('step')");
  app.evaluate('state.program.forEach((block) => applyExecutionStep(block, state.runData, freeTemplates.game.ageMode))');
  app.evaluate('finishRun()');
  assert.equal(app.evaluate('state.lastRun'), 'success');
  assert.equal(app.evaluate('state.runData.attacked'), true);
  assert.equal(app.evaluate('state.completedMissions.length'), 0);
});

test('map recommendations rotate and progress uses real state', () => {
  const app = createApp();
  const first = app.evaluate("recommendedMissions('middle').map((mission) => mission.id).join(',')");
  app.evaluate('state.recommendationOffset = 1');
  const second = app.evaluate("recommendedMissions('middle').map((mission) => mission.id).join(',')");
  assert.notEqual(first, second);
  const map = app.evaluate('renderMap()');
  assert.match(map, /查看主题进度/);
  assert.doesNotMatch(map, /42%|68%/);
});

test('completed mission offers direct entry to the next workbench', () => {
  const app = createApp();
  app.evaluate("state.completedMissions = ['middle-maze']; state.completedMissionsByMode.middle = ['middle-maze']; persist(); selectNextMission('middle-beat')");
  assert.equal(app.evaluate('state.missionId'), 'middle-beat');
  assert.equal(app.evaluate('state.view'), 'workbench');
});

test('tower previews show a designed energy state outside the workbench', () => {
  const app = createApp();
  app.evaluate("state.ageMode = 'older'; state.missionId = 'older-tower'; missions = missionsForAge('older'); state.view = 'map'");
  const map = app.evaluate('renderMap()');
  assert.match(map, /<strong>80<\/strong>/);
  assert.doesNotMatch(map, /能量待记录/);
  const preview = app.evaluate("renderPreviewScene(missionForAge('older', 'older-tower'), '任务预览')");
  assert.match(preview, /tower-shot/);
  assert.match(preview, /tower-muzzle/);
});

test('parent report reflects stored attempts and works', () => {
  const app = createApp();
  app.evaluate("state.attempts = 7; state.freeProjects = [{ id: 'free-1', template: 'story', title: '故事', program: [{ type: 'start' }] }]");
  const report = app.evaluate('renderParent()');
  assert.match(report, /程序尝试.*7 次/);
  assert.match(report, /自由作品.*1 个/);
  assert.doesNotMatch(report, /45 分钟|比上周多/);
  assert.doesNotMatch(report, /查看亲子讨论建议|parent-advice/);
});

test('traffic stays stopped until the green-light condition passes', () => {
  const app = createApp();
  const program = ['start', 'repeat', 'color', 'condition', 'move'];
  const beforeGreen = app.evaluate(`simulateProgram(${JSON.stringify(program.slice(0, 2).map((type) => ({ type })))}, 'middle', 'middle-signal')`);
  const afterGreen = app.evaluate(`simulateProgram(${JSON.stringify(program.map((type) => ({ type })))}, 'middle', 'middle-signal')`);
  const redMove = app.evaluate(`simulateProgram([{type:'start'},{type:'move'}], 'middle', 'middle-signal')`);
  assert.equal(beforeGreen.carRight, 19);
  assert.equal(afterGreen.carRight, 62);
  assert.equal(redMove.collision, true);
});

test('the star moves before it lights up and sings', () => {
  const app = createApp();
  const stage = (types) => app.evaluate(`simulateProgram(${JSON.stringify(types.map((type) => ({ type })))}, 'young', 'young-beat')`);
  assert.equal(stage(['start']).actorLeft, 17);
  assert.equal(stage(['start']).actorTop, 55);
  assert.equal(stage(['start', 'move']).actorLeft, 57);
  assert.equal(stage(['start', 'move']).actorTop, 35);
  assert.equal(stage(['start', 'move']).colorChanged, false);
  assert.equal(stage(['start', 'move', 'color']).soundPlayed, false);
  assert.equal(stage(['start', 'move', 'color', 'sound']).soundPlayed, true);
});

test('tower consumes energy after a valid shot', () => {
  const app = createApp();
  const stages = (types) => app.evaluate(`simulateProgram(${JSON.stringify(types.map((type) => ({ type })))}, 'older', 'older-tower')`);
  assert.equal(stages(['start', 'variable']).towerEnergy, 80);
  assert.equal(stages(['start', 'variable', 'repeat', 'condition']).conditionMet, true);
  assert.equal(stages(['start', 'variable', 'repeat', 'condition', 'attack']).towerEnergy, 79);
  assert.equal(stages(['start', 'attack']).collision, true);
});

test('dialogue needs a real selection and the studio can finish', () => {
  const app = createApp();
  const dialogue = ['start', 'choice', 'condition', 'sound'].map((type) => ({ type }));
  const noChoice = app.evaluate(`simulateProgram(${JSON.stringify(dialogue)}, 'older', 'older-dialogue')`);
  const withChoice = app.evaluate(`simulateProgram(${JSON.stringify(dialogue)}, 'older', 'older-dialogue', 'beach')`);
  const noChoiceResult = app.evaluate(`analyzeProgramData(${JSON.stringify(dialogue)}, ${JSON.stringify(noChoice)}, 'older', 'older-dialogue')`);
  assert.equal(noChoiceResult.outcome, 'almost');
  assert.equal(withChoice.selectedChoice, 'beach');
  assert.equal(withChoice.conditionMet, true);
  const studio = app.evaluate("simulateProgram([{type:'start'},{type:'function'},{type:'repeat'},{type:'condition'},{type:'attack'},{type:'sound'}], 'older', 'older-project')");
  assert.equal(studio.conditionMet, true);
  assert.equal(studio.attacked, true);
});

test('a completed task survives a reload with its saved program', () => {
  const saved = {
    ageMode: 'young',
    missionId: 'young-beat',
    completedMissionsByMode: { young: ['young-cat', 'young-magic', 'young-beat'], middle: [], older: [] },
    programsByMission: {
      young: { 'young-beat': ['start', 'move', 'color', 'sound'].map((type) => ({ type })) },
      middle: {},
      older: {},
    },
    program: ['start', 'move', 'color', 'sound'].map((type) => ({ type })),
    lastRun: 'success',
  };
  const app = createApp(saved);
  assert.equal(app.evaluate('state.missionId'), 'young-beat');
  assert.equal(app.evaluate('state.lastRun'), 'success');
  assert.equal(app.evaluate('state.runData.soundPlayed'), true);
});

test('editor obstacles survive reload without invalid cells', () => {
  const saved = {
    ageMode: 'older',
    missionId: 'older-editor',
    completedMissionsByMode: { young: [], middle: [], older: ['older-tower', 'older-dialogue'] },
    program: [{ type: 'start' }],
    editorTiles: [11, 11, -1, 30, '4'],
  };
  const app = createApp(saved);
  assert.equal(JSON.stringify(app.evaluate('state.editorTiles')), '[11]');
  assert.equal(app.evaluate("renderPreviewScene(missionForAge('older', 'older-editor'), '预览').includes('aria-pressed=\"true\"')"), false);
  app.evaluate("state.view = 'workbench'; state.ageMode = 'older'; state.missionId = 'older-editor'");
  assert.equal(app.evaluate("renderPreviewScene(missionForAge('older', 'older-editor'), '预览').includes('data-cell=\"11\" aria-label=\"第 3 行第 2 列障碍\" aria-pressed=\"true\"')"), true);
});
