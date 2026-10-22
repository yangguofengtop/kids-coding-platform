const app = document.querySelector('#app');
const STORAGE_KEY = 'zaowu-xingqiu-mvp-v1';
const freeTemplates = {
  game: { title: '我的小游戏', scene: 'studio', ageMode: 'older', palette: ['start', 'function', 'repeat', 'condition', 'attack', 'sound'], copy: '建立画面、设置规则，再让游戏回应玩家。' },
  story: { title: '我的互动故事', scene: 'cat', ageMode: 'young', palette: ['start', 'move', 'turn', 'color', 'sound'], copy: '让小猫走动、变色，讲出自己的故事。' },
  music: { title: '我的节奏实验', scene: 'beat', ageMode: 'middle', palette: ['start', 'repeat', 'sound'], copy: '排列节拍与声音，做一段自己的演出。' },
};

const ageModes = {
  young: { label: '入门', shortLabel: '故事模式', description: '用故事和动画开始创作', difficulty: '入门' },
  middle: { label: '初级', shortLabel: '任务模式', description: '用任务学会编程结构', difficulty: '初级' },
  older: { label: '中级', shortLabel: '项目模式', description: '把想法做成真实项目', difficulty: '中级' },
};

const ageCopy = {
  young: {
    eyebrow: '故事模式 · 创作乐园',
    mapTitle: '今天去哪里玩？',
    mapLead: '每次完成一个小故事，就学会一种让作品动起来的方法。',
    continueTitle: '小猫找朋友',
    continueCopy: '让小猫响应点击，走到朋友身边，做出一个有回应的小故事。',
    missionTitle: '小猫找朋友',
    missionCopy: '通过点击、动作和声音，让角色完成一个小故事。',
    skill: '事件和表达',
    goal: '让角色对操作做出回应',
  },
  middle: {
    eyebrow: '任务模式 · 游戏实验室',
    mapTitle: '我的冒险地图',
    mapLead: '从迷宫、音乐和宠物开始，把编程结构变成真的游戏规则。',
    continueTitle: '迷宫寻宝',
    continueCopy: '规划角色路线，遇到墙就换方向，找到藏在角落里的宝箱。',
    missionTitle: '迷宫寻宝',
    missionCopy: '让角色在迷宫中判断路线，找到宝箱并安全返回。',
    skill: '坐标和条件',
    goal: '让角色找到宝箱并避开墙壁',
  },
  older: {
    eyebrow: '项目模式 · 独立游戏工作室',
    mapTitle: '我的游戏工作室',
    mapLead: '从规则、状态和关卡结构出发，完成真正属于自己的小游戏原型。',
    continueTitle: '太空塔防',
    continueCopy: '设计敌人、炮塔和能量规则，让一套系统可以持续运行和调试。',
    missionTitle: '太空塔防',
    missionCopy: '设计敌人、炮塔和能量规则，让一套系统可以持续运行。',
    skill: '系统设计和调试',
    goal: '完成一个会自动防守的关卡',
  },
};

let missions = [
  { id: 'middle-maze', number: 1, title: '迷宫寻宝', skill: '坐标和条件', duration: '20 分钟', status: 'current', scene: 'maze', description: '规划角色路线，遇到墙就换方向，找到藏在角落里的宝箱。', difficulty: '进阶', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'move', 'condition', 'turn', 'turn-left'], requiredOrder: ['start', 'move', 'condition', 'turn', 'move', 'turn-left', 'move'], successFeedback: '角色先右转绕过墙壁，再左转走到宝箱旁边，你已经会用方向规划路线！', hint: '先移动并判断墙壁，右转绕开墙，再前进，最后左转走向宝箱。记住：场地边缘也算墙。', canvasTip: '墙壁和场地边缘都算“墙”：遇墙右转向下，绕过墙后左转向右。' },
  { id: 'middle-beat', number: 2, title: '节奏小鼓手', skill: '循环和事件', duration: '15 分钟', status: 'current', scene: 'beat', description: '让小鼓手重复敲击节拍，再用声音完成一段演奏。', difficulty: '进阶', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'repeat', 'sound'], requiredOrder: ['start', 'repeat', 'sound'], successFeedback: '小鼓手先打出重复节拍，再响起了鼓声！', hint: '先添加“重复执行”，再添加“播放声音”。', canvasTip: '先观察鼓槌重复敲击，再让节拍发出声音。' },
  { id: 'middle-pet', number: 3, title: '宠物的一天', skill: '变量和状态', duration: '25 分钟', status: 'next', scene: 'pet', description: '给小狗喂食并记录心情值，心情变好后让它摇尾巴、发出开心的声音。', difficulty: '进阶+', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'variable', 'condition', 'sound'], requiredOrder: ['start', 'variable', 'condition', 'sound'], successFeedback: '食盆装好了，心情值上升，小狗开心地摇尾巴回应你！', hint: '先喂食并记录心情，再判断心情是否变好，最后添加声音回应。', canvasTip: '心情从 48 变为 60 后，条件判断才会让小狗摇尾巴。' },
  { id: 'middle-signal', number: 4, title: '交通灯设计师', skill: '状态切换', duration: '25 分钟', status: 'locked', scene: 'signal', description: '让红绿灯按规则切换，车辆看到不同信号时作出动作。', difficulty: '进阶+', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'repeat', 'color', 'condition', 'move'], requiredOrder: ['start', 'repeat', 'color', 'condition', 'move'], successFeedback: '红灯变绿、判断可以通行后，车才驶过路口！', hint: '先让信号循环，再切换绿灯、判断信号，最后让车前进。', canvasTip: '红灯时车停在原地；绿灯亮起且判断通过后，车才出发。' },
];

const blockCatalog = {
  start: { label: '当点击开始', category: 'event', symbol: '◆' },
  move: { label: '向前移动', category: 'action', symbol: '↑' },
  condition: { label: '如果满足条件', category: 'condition', symbol: '?' },
  turn: { label: '向右转向', category: 'action', symbol: '↻' },
  'turn-left': { label: '向左转弯', category: 'action', symbol: '↶' },
  repeat: { label: '重复执行', category: 'control', symbol: '⟳' },
  sound: { label: '播放声音', category: 'sound', symbol: '♫' },
  variable: { label: '记录状态', category: 'data', symbol: '≡' },
  function: { label: '调用函数', category: 'control', symbol: 'ƒ' },
  color: { label: '改变颜色', category: 'action', symbol: '◈' },
  choice: { label: '如果玩家选择', category: 'condition', symbol: '?' },
  attack: { label: '炮塔发射', category: 'action', symbol: '✦' },
};

const starterProgram = [
  { type: 'start' },
  { type: 'move' },
];

const ageProfiles = {
  young: {
    missionId: 'young-cat',
    palette: ['start', 'move', 'turn', 'sound', 'color'],
    starterProgram: [{ type: 'start' }],
    missions: [
      { id: 'young-cat', number: 1, title: '小猫找朋友', skill: '互动故事', duration: '10 分钟', status: 'current', scene: 'cat', description: '点击小猫后，让它走到朋友身边，完成一个有回应的小故事。', goal: '让角色响应操作并找到朋友', difficulty: '入门', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'move'], requiredOrder: ['start', 'move'], successFeedback: '小猫收到你的指令，走到朋友身边啦！', hint: '先让故事开始，再添加“向前移动”。', canvasTip: '先发生事件，再让角色行动，故事就会开始。' },
      { id: 'young-magic', number: 2, title: '魔法变色屋', skill: '外观变化', duration: '10 分钟', status: 'next', scene: 'magic', description: '让房间在角色进入后变换颜色，做一个会变化的魔法场景。', goal: '让角色从门外走进房间，再让房间变色', difficulty: '入门+', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'move', 'color'], requiredOrder: ['start', 'move', 'color'], successFeedback: '小魔法师走进房间，房间也变成新的颜色啦！', hint: '先让角色从门外走进房间，最后添加“改变颜色”。', canvasTip: '先看角色跨过门口进入房间，再观察房间颜色发生变化。' },
      { id: 'young-beat', number: 3, title: '会唱歌的星星', skill: '声音表达', duration: '10 分钟', status: 'next', scene: 'star', description: '让星星从舞台边缘走到聚光灯下，变色后唱出声音，创作一段小表演。', goal: '让星星移动到舞台，再变色并唱歌', difficulty: '入门+', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'move', 'color', 'sound'], requiredOrder: ['start', 'move', 'color', 'sound'], successFeedback: '星星走到舞台中央，变亮后唱起歌啦！', hint: '按“移动到舞台 → 改变颜色 → 播放声音”的顺序搭建。', canvasTip: '先看星星走进聚光灯，再观察它变亮并唱歌。' },
      { id: 'young-showcase', number: 4, title: '我的互动绘本', skill: '综合创作', duration: '15 分钟', status: 'locked', scene: 'book', description: '翻开绘本，让小狐狸转向画面、改变书页颜色，最后讲出故事。', goal: '完成会翻页、变色和朗读的故事', difficulty: '入门+', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'move', 'turn', 'color', 'sound'], requiredOrder: ['start', 'move', 'turn', 'color', 'sound'], successFeedback: '绘本翻开了，小狐狸转向彩色书页并讲出了故事！', hint: '依次翻开绘本、转向书页、改变颜色，最后播放故事声音。', canvasTip: '观察翻页、转身、书页变色和朗读分别发生在哪一步。' },
    ],
  },
  middle: {
    missionId: 'middle-maze',
    palette: ['start', 'repeat', 'condition', 'move', 'turn', 'turn-left', 'sound', 'variable', 'color'],
    starterProgram: [{ type: 'start' }],
    missions,
  },
  older: {
    missionId: 'older-tower',
    palette: ['start', 'repeat', 'condition', 'move', 'turn', 'sound', 'variable', 'function', 'choice', 'attack', 'color'],
    starterProgram: [
      { type: 'start' },
      { type: 'repeat' },
      { type: 'move' },
      { type: 'condition' },
      { type: 'turn' },
    ],
    missions: [
      { id: 'older-tower', number: 1, title: '太空塔防', skill: '系统设计', duration: '30 分钟', status: 'current', scene: 'tower', description: '先记录炮塔能量，再循环扫描敌人，能量足够时发射。', goal: '完成一套按能量判断的防守规则', difficulty: '项目入门', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'variable', 'repeat', 'condition', 'attack'], requiredOrder: ['start', 'variable', 'repeat', 'condition', 'attack'], successFeedback: '炮塔确认能量后锁定敌人并发射，能量也随之减少！', hint: '先记录能量，再重复扫描、判断能量，最后发射。', canvasTip: '能量先准备好，扫描找到目标，判断通过后才允许开火。' },
      { id: 'older-dialogue', number: 2, title: '分支对话剧场', skill: '分支和状态', duration: '30 分钟', status: 'next', scene: 'dialogue', description: '让玩家在森林和海边之间选择，角色根据选择讲出不同结局。', goal: '让两个选择分别触发不同剧情', difficulty: '项目进阶', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'choice', 'condition', 'sound'], requiredOrder: ['start', 'choice', 'condition', 'sound'], successFeedback: '角色根据你的选择讲出了对应的冒险结局！', hint: '先在预览里选森林或海边，再读取选择、判断分支并播放回应。', canvasTip: '点击一个目的地，运行后比较森林与海边的不同结局。' },
      { id: 'older-editor', number: 3, title: '关卡编辑器', skill: '函数和数据', duration: '40 分钟', status: 'next', scene: 'editor', description: '用函数和数据记录关卡，让玩家自己摆放障碍物。', goal: '完成一个可以生成关卡的工具', difficulty: '项目进阶+', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'function', 'repeat', 'move', 'variable'], requiredOrder: ['start', 'function', 'repeat', 'move', 'variable'], successFeedback: '关卡可以被记录和生成了，你已经在制作自己的工具！', hint: '先调用关卡函数，再重复摆放，最后记录地图数据。', canvasTip: '工具型项目要先定义流程，再用数据保存用户的设计。' },
      { id: 'older-project', number: 4, title: '完成自己的小游戏', skill: '综合项目', duration: '45 分钟', status: 'locked', scene: 'studio', description: '先建立游戏画面，再启动循环、判断目标、命中目标并添加声音。', goal: '完成能运行并保存的小游戏原型', difficulty: '项目挑战', starterProgram: [{ type: 'start' }], requiredBlocks: ['start', 'function', 'repeat', 'condition', 'attack', 'sound'], requiredOrder: ['start', 'function', 'repeat', 'condition', 'attack', 'sound'], successFeedback: '画面、循环、判断、命中反馈和声音都运行起来了！', hint: '按建立画面、启动循环、判断目标、命中目标、播放声音的顺序搭建。', canvasTip: '观察游戏画面从建立到命中目标的每一步。' },
    ],
  },
};

const defaultState = {
  view: 'map',
  ageMode: 'middle',
  missionId: 'middle-maze',
  program: starterProgram,
  completedMissions: [],
  completedMissionsByMode: {
    young: [],
    middle: [],
    older: [],
  },
  programsByMode: {
    young: [{ type: 'start' }],
    middle: [{ type: 'start' }],
    older: ageProfiles.older.starterProgram,
  },
  programsByMission: {
    young: { 'young-cat': [{ type: 'start' }] },
    middle: { 'middle-maze': [{ type: 'start' }], 'middle-beat': [{ type: 'start' }] },
    older: { 'older-tower': [{ type: 'start' }] },
  },
  attempts: 0,
  hintsUsed: 0,
  lastRun: 'idle',
  runOutcome: null,
  runMode: null,
  runStep: null,
  runData: null,
  saved: false,
  savedAt: null,
  codeMode: false,
  catClicked: false,
  dialogueChoice: null,
  editorTiles: [],
  freeProjects: [],
  freeProjectId: null,
  recommendationOffset: 0,
  progressOpen: false,
  toast: '',
};

let state = loadState();
missions = missionsForAge(state.ageMode);
let toastTimer;
let runTimer;
let audioContext;

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || !Array.isArray(stored.program)) return structuredClone(defaultState);
    const nextState = { ...structuredClone(defaultState), ...stored };
    nextState.freeProjects = Array.isArray(stored.freeProjects)
      ? stored.freeProjects.filter((project) => project && freeTemplates[project.template] && Array.isArray(project.program)).map((project) => ({
          ...project,
          program: project.program.filter((block) => blockCatalog[block?.type] && freeTemplates[project.template].palette.includes(block.type)),
        }))
      : [];
    nextState.editorTiles = Array.isArray(stored.editorTiles)
      ? [...new Set(stored.editorTiles.filter((cell) => Number.isInteger(cell) && cell >= 0 && cell < 30))]
      : [];
    if (!ageProfiles[nextState.ageMode]) nextState.ageMode = 'middle';
    nextState.completedMissionsByMode = {
      ...structuredClone(defaultState.completedMissionsByMode),
      ...(stored.completedMissionsByMode || {}),
    };
    nextState.programsByMode = {
      ...structuredClone(defaultState.programsByMode),
      ...(stored.programsByMode || {}),
    };
    nextState.programsByMission = {
      young: { ...structuredClone(defaultState.programsByMission.young), ...(stored.programsByMission?.young || {}) },
      middle: { ...structuredClone(defaultState.programsByMission.middle), ...(stored.programsByMission?.middle || {}) },
      older: { ...structuredClone(defaultState.programsByMission.older), ...(stored.programsByMission?.older || {}) },
    };
    const ageMissionList = ageProfiles[nextState.ageMode].missions;
    if (!ageMissionList.some((mission) => mission.id === nextState.missionId)) {
      nextState.missionId = ageProfiles[nextState.ageMode].missionId;
    }
    const missionProgram = stored.programsByMission?.[nextState.ageMode]?.[nextState.missionId];
    const hasMissionStorage = Boolean(stored.programsByMission?.[nextState.ageMode]);
    const modeProgram = missionProgram || (hasMissionStorage ? stored.programsByMode?.[nextState.ageMode] : ageMissionList.find((mission) => mission.id === nextState.missionId)?.starterProgram);
    nextState.program = structuredClone(Array.isArray(modeProgram) ? modeProgram : stored.program);
    nextState.programsByMission[nextState.ageMode][nextState.missionId] = structuredClone(nextState.program);
    nextState.programsByMode[nextState.ageMode] = structuredClone(nextState.program);
    if (!stored.completedMissionsByMode && Array.isArray(stored.completedMissions)) {
      nextState.completedMissionsByMode.middle = structuredClone(stored.completedMissions);
    }
    const modeCompleted = nextState.completedMissionsByMode[nextState.ageMode];
    const validMissionIds = new Set(ageMissionList.map((mission) => mission.id));
    nextState.completedMissionsByMode[nextState.ageMode] = (Array.isArray(modeCompleted) ? modeCompleted : []).filter((id) => validMissionIds.has(id));
    nextState.completedMissions = structuredClone(nextState.completedMissionsByMode[nextState.ageMode]);
    const activeMissionIndex = ageMissionList.findIndex((mission) => mission.id === nextState.missionId);
    const activeMissionUnlocked = ageMissionList.slice(0, activeMissionIndex).every((mission) => nextState.completedMissions.includes(mission.id));
    if (!activeMissionUnlocked && !nextState.completedMissions.includes(nextState.missionId)) {
      const fallbackMission = ageMissionList.find((mission, index) => (
        !nextState.completedMissions.includes(mission.id)
        && ageMissionList.slice(0, index).every((previous) => nextState.completedMissions.includes(previous.id))
      )) || ageMissionList[0];
      nextState.missionId = fallbackMission.id;
      const fallbackProgram = stored.programsByMission?.[nextState.ageMode]?.[fallbackMission.id] || fallbackMission.starterProgram || ageProfiles[nextState.ageMode].starterProgram;
      nextState.program = structuredClone(fallbackProgram);
      nextState.programsByMission[nextState.ageMode][fallbackMission.id] = structuredClone(nextState.program);
      nextState.programsByMode[nextState.ageMode] = structuredClone(nextState.program);
    }
    if (nextState.lastRun === 'running') nextState.lastRun = 'idle';
    if (nextState.view === 'free-workbench' && nextState.freeProjects.some((project) => project.id === nextState.freeProjectId)) {
      nextState.program = structuredClone(nextState.freeProjects.find((project) => project.id === nextState.freeProjectId).program);
    } else {
      nextState.freeProjectId = null;
      if (nextState.view === 'free-workbench') nextState.view = 'create';
    }
    nextState.runMode = null;
    nextState.runOutcome = null;
    nextState.runStep = null;
    nextState.runData = ['success', 'almost', 'needs'].includes(nextState.lastRun)
      ? nextState.view === 'free-workbench'
        ? simulateFreeProgram(nextState.program, nextState.freeProjects.find((project) => project.id === nextState.freeProjectId))
        : simulateProgram(nextState.program, nextState.ageMode, nextState.missionId, nextState.dialogueChoice)
      : null;
    return nextState;
  } catch {
    return structuredClone(defaultState);
  }
}

function persist() {
  if (state.view === 'free-workbench' && activeFreeProject()) {
    const project = activeFreeProject();
    project.program = structuredClone(state.program);
    project.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, toast: '' }));
    return;
  }
  const modePrograms = state.programsByMission?.[state.ageMode] || {};
  state.programsByMission = {
    ...(state.programsByMission || {}),
    [state.ageMode]: {
      ...modePrograms,
      [state.missionId]: structuredClone(state.program),
    },
  };
  state.programsByMode = {
    ...(state.programsByMode || {}),
    [state.ageMode]: structuredClone(state.program),
  };
  state.completedMissionsByMode = {
    ...(state.completedMissionsByMode || {}),
    [state.ageMode]: structuredClone(state.completedMissions || []),
  };
  state.completedMissions = structuredClone(completedMissionsForAge());
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, toast: '' }));
}

function notify(message) {
  state.toast = message;
  persist();
  render();
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    state.toast = '';
    render();
  }, 2600);
}

function missionForAge(ageMode = state.ageMode, missionId = state.missionId) {
  const currentMissions = missionsForAge(ageMode);
  return currentMissions.find((mission) => mission.id === missionId) || currentMissions[0];
}

function currentMission() {
  if (state.view === 'free-workbench' && activeFreeProject()) return freeMission(activeFreeProject());
  return missionForAge();
}

function activeFreeProject() {
  return state.freeProjects.find((project) => project.id === state.freeProjectId);
}

function freeMission(project) {
  const template = freeTemplates[project.template];
  return { id: project.id, title: project.title, scene: template.scene, description: template.copy, skill: '自由创作' };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function mode() {
  return ageModes[state.ageMode] || ageModes.middle;
}

function copy() {
  return ageCopy[state.ageMode] || ageCopy.middle;
}

function blockItem(type, mission = currentMission()) {
  const item = blockCatalog[type] || blockCatalog.move;
  const labels = {
    cat: { move: '走到朋友身边', condition: '如果朋友在附近' },
    magic: { move: '走进房间', condition: '如果已经进屋' },
    star: { move: '移动到舞台', color: '点亮星星', sound: '唱出旋律', condition: '如果颜色已改变' },
    book: { move: '翻开绘本', turn: '转向书页', color: '给书页上色', sound: '讲出故事', condition: '如果故事页已打开' },
    maze: { move: '沿路线前进', condition: '如果前方有墙', turn: '向右转弯', 'turn-left': '向左转弯' },
    beat: { repeat: '重复敲鼓', sound: '播放鼓声', condition: '如果节拍准备好' },
    pet: { condition: '如果心情变好了', variable: '喂食并记录心情' },
    signal: { move: '车辆前进', condition: '如果现在是绿灯' },
    tower: { condition: '如果能量足够', variable: '记录能量值' },
    dialogue: { choice: '读取目的地', condition: '根据目的地判断' },
    editor: { condition: '如果还有下一个格子', function: '调用关卡函数' },
    studio: { condition: '如果关卡准备好', function: '建立游戏画面', repeat: '启动游戏循环', attack: '命中目标', sound: '播放胜利音效' },
  };
  const label = labels[mission?.scene]?.[type];
  return label ? { ...item, label } : item;
}

function missionCopy() {
  const currentMissionData = currentMission();
  const currentCopy = copy();
  const middleGoals = {
    'middle-maze': '绕过墙壁走到宝箱旁边',
    'middle-beat': '让鼓槌重复敲击并播放鼓声',
    'middle-pet': '喂食后记录心情，让小狗开心回应',
    'middle-signal': '红灯停车，绿灯判断通过后开车',
  };
  return {
    ...currentCopy,
    continueTitle: currentMissionData.title,
    continueCopy: currentMissionData.description,
    missionTitle: currentMissionData.title,
    missionCopy: currentMissionData.description,
    skill: currentMissionData.skill,
    goal: currentMissionData.goal || middleGoals[currentMissionData.id] || currentCopy.goal,
  };
}

function profile() {
  return ageProfiles[state.ageMode] || ageProfiles.middle;
}

function missionsForAge(ageMode = state.ageMode) {
  return (ageProfiles[ageMode] || ageProfiles.middle).missions;
}

function recommendedMissions(ageMode = state.ageMode) {
  const list = missionsForAge(ageMode);
  if (!list.length) return [];
  const offset = ((state.recommendationOffset || 0) % list.length + list.length) % list.length;
  return list.slice(offset).concat(list.slice(0, offset)).slice(0, Math.min(3, list.length));
}

function currentMissionProgress() {
  const mission = currentMission();
  if (state.completedMissions.includes(mission.id) || state.lastRun === 'success') return 100;
  const requiredCount = Math.max((mission.requiredOrder || mission.requiredBlocks || ['start', 'move']).length, 1);
  const programCount = new Set(state.program.map((block) => block.type)).size;
  return Math.min(92, Math.max(0, Math.round((programCount / requiredCount) * 100)));
}

function nextMissionForCurrent() {
  const index = missions.findIndex((mission) => mission.id === state.missionId);
  return index >= 0 ? missions[index + 1] || null : null;
}

function completedMissionsForAge(ageMode = state.ageMode) {
  const completed = state.completedMissionsByMode?.[ageMode];
  return Array.isArray(completed) ? completed : [];
}

function isMissionUnlocked(id, ageMode = state.ageMode) {
  const ageMissions = missionsForAge(ageMode);
  const missionIndex = ageMissions.findIndex((mission) => mission.id === id);
  if (missionIndex < 0) return false;
  const completed = completedMissionsForAge(ageMode);
  return ageMissions.slice(0, missionIndex).every((mission) => completed.includes(mission.id));
}

function missionRouteState(mission) {
  if (state.completedMissions.includes(mission.id)) return { className: 'done', label: '已完成' };
  if (!isMissionUnlocked(mission.id)) return { className: 'locked', label: '未解锁' };
  if (mission.id === state.missionId) return { className: 'current', label: '进行中' };
  return { className: 'next', label: '下一站' };
}

function missionMeta(mission) {
  if (!isMissionUnlocked(mission.id) && !state.completedMissions.includes(mission.id)) {
    return `完成前 ${mission.number - 1} 个任务后解锁`;
  }
  return `${mission.skill} · ${mission.difficulty} · ${mission.duration}`;
}

function icon(symbol, label = '') {
  return `<span class="ui-symbol" aria-hidden="true">${symbol}</span>${label ? `<span>${label}</span>` : ''}`;
}

function render() {
  const previousStage = app.querySelector('.preview-stage');
  const previousScene = previousStage?.className.match(/scene-([\w-]+)/)?.[0];
  const movingParts = ['.cat-hero', '.wizard-kid', '.star-singer', '.book-fox', '.maze-explorer', '.scene-car', '.scene-enemy.one', '.scene-editor-cursor'];
  const previousPositions = new Map(movingParts.map((selector) => [selector, previousStage?.querySelector(selector)?.getBoundingClientRect()]));
  app.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}
      <div class="app-layout">
        ${renderSidebar()}
        <main class="content">
          <div class="content-inner">
            ${renderView()}
          </div>
        </main>
      </div>
      ${state.toast ? `<div class="toast" role="status" aria-live="polite">${state.toast}</div>` : ''}
    </div>
  `;
  hydrateAgeContent();
  const nextStage = app.querySelector('.preview-stage');
  if (nextStage && previousScene && nextStage.classList.contains(previousScene) &&
      state.lastRun === 'running' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    movingParts.forEach((selector) => {
      const before = previousPositions.get(selector);
      const part = nextStage.querySelector(selector);
      if (!before || !part) return;
      const after = part.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (Math.abs(dx) + Math.abs(dy) < 2) return;
      part.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0px 0px' }], {
        duration: 560,
        easing: 'ease-in-out',
      });
    });
  }
}

function hydrateAgeContent() {
  const taskList = app.querySelector('.task-list');
  if (taskList) {
    const ageMissions = recommendedMissions();
    const completed = completedMissionsForAge();
    taskList.innerHTML = ageMissions.slice(0, 3).map((item, index) => {
      const unlocked = isMissionUnlocked(item.id) || completed.includes(item.id);
      return `<div class="task-row ${unlocked ? '' : 'locked'}"><div class="task-main"><span class="task-icon ${index === 1 ? 'blue' : index === 2 ? 'coral' : ''}">${item.number}</span><div><strong>${item.title}</strong><span>${missionMeta(item)}</span></div></div><button class="task-action" data-mission="${item.id}" ${unlocked ? '' : 'disabled'}>${completed.includes(item.id) ? '再玩一次' : unlocked ? '开始' : '待解锁'}</button></div>`;
    }).join('');
  }

  const palette = app.querySelector('.palette');
  if (palette) palette.innerHTML = renderPalette();
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">造</div>
        <div class="brand-copy"><strong>造物星球</strong><span>${mode().description}</span></div>
      </div>
      <div class="topbar-actions">
        <div class="mode-switch" aria-label="选择年龄模式">
          ${Object.entries(ageModes).map(([key, value]) => `<button class="${state.ageMode === key ? 'active' : ''}" data-age="${key}">${value.label}</button>`).join('')}
        </div>
        <div class="profile-chip"><span>创意造物屋</span><span class="avatar">造</span></div>
      </div>
    </header>
  `;
}

function renderSidebar() {
  const ageMissions = missionsForAge();
  const completed = completedMissionsForAge();
  const progress = Math.round((completed.length / ageMissions.length) * 100);
  const nav = [
    ['map', '◎', '任务地图'],
    ['works', '◇', '我的作品'],
    ['create', '+', '自由创作'],
    ['parent', '▤', '家长周报'],
  ];
  return `
    <aside class="sidebar">
      <div class="sidebar-label">我的星球</div>
      <nav class="nav-list" aria-label="主导航">
        ${nav.map(([view, symbol, label]) => `<button class="nav-item ${state.view === view ? 'active' : ''}" data-view="${view}">${icon(symbol, label)}</button>`).join('')}
      </nav>
      <div class="side-progress">
      <div class="side-progress-title">当前进度</div>
        <strong>${completed.length} 个任务</strong>
        <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="side-progress-meta"><span>${mode().shortLabel}</span><span>${completed.length}/${ageMissions.length}</span></div>
      </div>
    </aside>
  `;
}

function renderView() {
  if (state.view === 'mission') return renderMission();
  if (state.view === 'workbench') return renderWorkbench();
  if (state.view === 'free-workbench') return renderFreeWorkbench();
  if (state.view === 'works') return renderWorks();
  if (state.view === 'parent') return renderParent();
  if (state.view === 'create') return renderCreate();
  return renderMap();
}

function renderMap() {
  const mission = currentMission();
  const currentCopy = missionCopy();
  const recentMissions = missionsForAge().slice(0, 2);
  const taskMissions = recommendedMissions();
  const progress = currentMissionProgress();
  const progressDetail = state.progressOpen ? renderProgressDetail() : '';
  return `
    <div class="eyebrow">${currentCopy.eyebrow}</div>
    <div class="page-heading">
      <div><h1>${currentCopy.mapTitle}</h1><p>${currentCopy.mapLead}</p></div>
      <div class="heading-side"><strong>${mode().difficulty}</strong>${state.completedMissions.length}/${missions.length} 已完成任务</div>
    </div>
    <section class="continue-panel">
      <div class="continue-copy">
        <div class="eyebrow">继续挑战 · ${mission.skill}</div>
        <h2>${currentCopy.continueTitle}</h2>
        <p>${currentCopy.continueCopy}</p>
        <div class="continue-meta"><span>预计 <b>${mission.duration}</b></span><span>本关能力 <b>${currentCopy.skill}</b></span></div>
        <div class="progress-row"><span>任务进度</span><strong>${progress}%</strong></div>
        <div class="progress-track large"><div class="progress-fill" style="width:${progress}%"></div></div>
        <button class="primary-button" data-action="continue">${icon('▶', '继续编程')}</button>
      </div>
      <div class="space-art scene-${mission.scene || 'space'}" aria-label="${mission.title}预览">${renderPreviewScene(mission, '今日任务')}</div>
    </section>
    <section class="section">
      <div class="section-heading"><h2>本周成长路线</h2><button class="text-button" data-action="${state.progressOpen ? 'hide-progress' : 'show-progress'}">${state.progressOpen ? '收起主题进度' : '查看主题进度'}</button></div>
      <div class="route">
        ${missions.map((item) => {
          const routeState = missionRouteState(item);
          const locked = routeState.className === 'locked';
          return `<button class="route-node ${routeState.className}" data-mission="${item.id}" ${locked ? 'disabled' : ''}><span class="route-number">${locked ? '锁' : item.number}</span><span class="route-status">${routeState.label}</span><h3>${item.title}</h3><p>${locked ? `完成前 ${item.number - 1} 个任务后解锁` : `${item.skill} · ${item.difficulty}`}</p></button>`;
        }).join('')}
      </div>
    </section>
    ${progressDetail}
    <section class="section two-column">
      <div>
        <div class="section-heading"><h2>推荐任务</h2><button class="text-button" data-action="shuffle">换一批</button></div>
        <div class="task-list" data-age-task-list>${taskMissions.map((item, index) => `<div class="task-row"><div class="task-main"><span class="task-icon ${index === 1 ? 'blue' : index === 2 ? 'coral' : ''}">${item.number}</span><div><strong>${item.title}</strong><span>${missionMeta(item)}</span></div></div><button class="task-action" data-mission="${item.id}" ${isMissionUnlocked(item.id) || state.completedMissions.includes(item.id) ? '' : 'disabled'}>开始</button></div>`).join('')}</div>
      </div>
      <div>
        <div class="section-heading"><h2>最近作品</h2><button class="text-button" data-view="works">全部作品</button></div>
        <div class="work-list">${recentMissions.map((item) => renderWorkRow(item.title, `${item.skill} · ${item.difficulty}`, state.completedMissions.includes(item.id) ? '已完成' : '草稿', item)).join('')}</div>
      </div>
    </section>
  `;
}

function renderProgressDetail() {
  return `<section class="topic-progress"><div class="section-heading"><h2>主题进度</h2><span>${state.completedMissions.length}/${missions.length} 个任务已完成</span></div><div class="topic-progress-list">${missions.map((item) => { const completed = state.completedMissions.includes(item.id); const active = item.id === state.missionId && !completed; const percent = completed ? 100 : active ? currentMissionProgress() : 0; return `<div class="topic-progress-row"><div><strong>${item.title}</strong><span>${completed ? '已完成' : active ? '正在学习' : isMissionUnlocked(item.id) ? '已解锁' : '待解锁'}</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><b>${percent}%</b></div>`; }).join('')}</div></section>`;
}

function renderMission() {
  const mission = currentMission();
  const currentCopy = missionCopy();
  const lessonCopy = mission.canvasTip || `${mission.skill}会决定这个作品怎样回应玩家。`;
  const bonusCopy = state.ageMode === 'young'
    ? '新的角色、声音或背景。'
    : state.ageMode === 'older'
      ? '新的关卡、变量或函数。'
      : '新的角色、规则或第二个关卡。';
  return `
    <div class="eyebrow">任务准备 · ${mode().shortLabel}</div>
    <div class="page-heading"><div><h1>${currentCopy.missionTitle}</h1><p>开始前先知道目标，完成后知道自己成长了什么。</p></div><div class="heading-side"><strong>${mission.difficulty || mode().difficulty}</strong>第 ${mission.number}/4 个任务</div></div>
    <section class="mission-shell">
      <div class="subhead"><span><button data-action="back-map">← 返回任务地图</button> / ${mission.skill}</span><strong>自动保存已开启</strong></div>
      <div class="mission-content">
        <section class="mission-visual"><div class="space-art scene-${mission.scene || 'space'}">${renderPreviewScene(mission, '任务预览')}</div><div class="mission-text"><div class="eyebrow">创作主题 · 任务 ${mission.number}</div><h2>${currentCopy.missionTitle}</h2><p>${currentCopy.missionCopy}</p></div></section>
        <section class="mission-side"><div class="eyebrow">本关主要能力</div><h3>${currentCopy.skill}</h3><p>${lessonCopy}</p><div class="goal-row"><span class="goal-check">✓</span><div><strong>完成目标</strong><span>${currentCopy.goal}</span></div></div><div class="goal-row"><span class="goal-check">◷</span><div><strong>预计时间</strong><span>${mission.duration}，可随时保存</span></div></div><div class="goal-row"><span class="goal-check">✓</span><div><strong>你需要做到</strong><span>${mission.hint}</span></div></div><button class="primary-button" data-action="start-mission">开始编程 ${icon('→')}</button><div class="bonus">完成后可以自由添加：${bonusCopy}</div></section>
      </div>
      <div class="feedback-grid"><div class="feedback-item"><strong>✓ 完成任务</strong><p>${mission.successFeedback}</p></div><div class="feedback-item"><strong>! 还差一步</strong><p>${mission.hint}</p></div><div class="feedback-item"><strong>↻ 重新尝试</strong><p>可以回到任意步骤修改，看看作品会发生什么变化。</p></div></div>
    </section>
  `;
}

function ageFeedback(fallback, analysis) {
  const mission = currentMission();
  if (!analysis) return fallback;
  if (analysis.reason === 'complete') {
    return ['任务完成', mission.successFeedback || fallback[1], 'success'];
  }
  if (analysis.reason === 'missing-choice' && mission.scene === 'dialogue' && state.program.some((block) => block.type === 'choice')) {
    return ['先选目的地', '点击预览里的“森林”或“海边”，再运行程序。', 'needs'];
  }
  if (analysis.reason === 'wrong-order') {
    const order = (mission.requiredOrder || []).map((type) => blockItem(type, mission).label || type).join(' → ');
    if (mission.scene === 'maze') {
      return ['撞到墙啦', `角色需要按“${order}”行动：先走到墙前，再判断，最后转弯。`, 'needs'];
    }
    const title = state.ageMode === 'young' ? '顺序再排一排' : '顺序需要调整';
    return [title, `请按“${order}”的顺序排列积木。`, 'needs'];
  }
  if (analysis.missingType) {
    const missingLabel = blockItem(analysis.missingType, mission).label || '需要的积木';
    const title = analysis.missingType === 'move' ? '还缺一个动作' : '再试一步';
    return [title, `这个任务还需要“${missingLabel}”，添加后再运行看看。`, analysis.missingType === 'move' ? 'needs' : 'almost'];
  }
  return fallback;
}

function renderWorkbench() {
  const mission = currentMission();
  const nextMission = nextMissionForCurrent();
  const currentCopy = missionCopy();
  const analysis = programAnalysis();
  const hasCondition = analysis.hasCondition;
  let feedback = state.lastRun === 'success'
    ? ['任务完成', mission.successFeedback || '你的作品完成了。', 'success']
    : state.lastRun === 'running'
      ? ['程序运行中', `《${mission.title}》正在执行你的积木，观察场景如何变化。`, 'running']
    : state.lastRun === 'almost'
      ? ['再试一步', '作品已经开始变化了，再补上任务要求的积木。', 'almost']
    : state.lastRun === 'needs'
        ? analysis.reason === 'wrong-order'
          ? ['顺序需要调整', '请按照任务提示从上到下排列积木。', 'needs']
          : analysis.reason === 'missing-move'
            ? ['还缺一个动作', '先添加一个动作积木，让作品开始执行。', 'needs']
            : ['需要调整', '回到积木区检查执行顺序和任务目标。', 'needs']
        : ['程序观察', mission.canvasTip || (hasCondition ? `试着点击运行，观察${mission.title}如何根据条件做出变化。` : '先从积木库添加一个动作，再试着运行程序。'), 'idle'];
  if (['success', 'almost', 'needs'].includes(state.lastRun)) feedback = ageFeedback(feedback, analysis);
  const stageState = ['running', 'success', 'almost', 'needs'].includes(state.lastRun) ? state.lastRun : 'idle';
  const stageClasses = stageState;
  const currentBlock = state.lastRun === 'running' && state.runStep !== null ? state.program[state.runStep] : null;
  const currentBlockLabel = currentBlock ? blockItem(currentBlock.type, mission).label : '';
  const runtimeStyle = state.runData ? runtimeStageStyle() : '';
  const autoRunning = state.lastRun === 'running' && state.runMode === 'auto';
  const runDisabled = autoRunning ? 'disabled' : '';
  const stageLabel = {
    idle: '准备开始',
    running: currentBlockLabel ? `执行：${currentBlockLabel}` : '作品执行中',
    success: state.ageMode === 'young' ? '动画完成' : state.ageMode === 'older' ? '项目通过' : '任务完成',
    almost: '还差一步',
    needs: state.ageMode === 'young' ? '再试一次' : '需要调整',
  }[stageState];
  const runLabel = state.lastRun === 'running' ? (state.runMode === 'step' ? '继续运行' : '运行中') : '运行';
  const runIcon = autoRunning ? '◌' : '▶';
  return `
    <div class="eyebrow">核心页面 · 编程工作台</div>
    <div class="page-heading"><div><h1>${currentCopy.missionTitle}</h1><p>${currentCopy.missionCopy}把想法变成可以玩的结果。</p></div><div class="heading-side"><strong>${mission.difficulty || mode().difficulty}</strong>任务难度</div></div>
    <section class="workbench-shell">
      <div class="workbench-header"><div class="workbench-title"><strong>${mission.title} / ${currentCopy.skill}</strong><span>本关目标：${currentCopy.goal}</span></div><div class="workbench-actions"><button data-action="save-work">${icon('↓', '保存')}</button><button class="run" data-action="run" ${runDisabled}>${icon(runIcon, runLabel)}</button><button data-action="hint">${icon('?', '提示')}</button></div></div>
      <div class="stepper"><div class="step active"><b>1</b>看目标</div><div class="step active"><b>2</b>搭积木</div><div class="step ${state.lastRun !== 'idle' ? 'active' : ''}"><b>3</b>运行</div><div class="step ${['success', 'almost', 'needs'].includes(state.lastRun) ? 'active' : ''}"><b>4</b>检查结果</div><div class="step ${state.lastRun === 'success' && state.saved ? 'active' : ''}"><b>5</b>保存</div></div>
      <div class="workbench-grid">
        <aside class="palette">${renderPalette()}</aside>
        <section class="canvas"><div class="canvas-bar"><span>我的程序</span><div class="view-toggle"><button class="${!state.codeMode ? 'active' : ''}" data-action="blocks">积木</button><button class="${state.codeMode ? 'active' : ''}" data-action="code">代码</button></div></div>${state.codeMode ? renderCodeView() : renderProgram()}<div class="canvas-tip"><span class="tip-symbol">!</span><span>${mission.canvasTip || (hasCondition ? `把条件判断放在动作附近，观察${mission.title}如何做出选择。` : '先从积木库添加一个动作，再试着运行程序。')}</span></div></section>
        <aside class="preview-panel"><div class="panel-heading">运行结果 <span>实时预览</span></div><div class="preview-panel-inner"><div><div class="preview-stage scene-${mission.scene || 'space'} ${stageClasses}" style="${runtimeStyle}" aria-live="polite"><span class="stage-status"><i></i>${stageLabel}</span>${renderPreviewScene(mission, stageLabel)}</div><div class="stage-toolbar"><button data-action="run" ${runDisabled}>${icon(runIcon, runLabel)}</button><button data-action="reset-program">${icon('↻', '重置')}</button><button data-action="step" ${autoRunning ? 'disabled' : ''}>${icon('→', '单步')}</button></div>${renderExecutionOrder()}</div><div class="feedback-box"><h4><span class="status-dot ${feedback[2]}"></span>${feedback[0]}</h4><p>${feedback[1]}</p>${state.lastRun === 'success' && nextMission ? `<button class="next-mission-button" data-next-mission="${nextMission.id}">${icon('→', `进入下一关：${nextMission.title}`)}</button>` : ''}<div class="status-line"><span class="status-dot"></span>已自动保存 · 可随时退出</div></div></div></aside>
      </div>
      <div class="workbench-footer"><span>本关能力：<strong>${mission.skill}</strong></span><span>尝试 ${state.attempts} 次 · 提示 ${state.hintsUsed} 次</span></div>
    </section>
  `;
}

function renderProgram() {
  const mission = currentMission();
  return `<div class="program" data-drop-zone="program">${state.program.map((block, index) => { const item = blockItem(block.type, mission); const executing = state.lastRun === 'running' && state.runStep === index ? ' executing' : ''; const current = state.lastRun === 'running' && state.runStep === index ? ' current-step' : ''; const completed = state.lastRun === 'running' && state.runStep !== null && index < state.runStep ? ' completed-step' : ''; return `<div class="program-block ${item.category}${executing}${current}${completed}" draggable="true" data-program-index="${index}">${icon(item.symbol, item.label)}<button class="remove-block" aria-label="删除${item.label}" data-remove-index="${index}">×</button></div>`; }).join('')}<div class="drop-hint">把新的积木拖到这里继续</div></div>`;
}

function renderCodeView() {
  const lines = [];
  const openBlocks = [];
  let indentLevel = 0;
  const scene = currentMission().scene || 'space';
  const conditionCode = {
    cat: 'friendIsNearby()',
    magic: 'enteredRoom()',
    star: 'colorChanged()',
    book: 'storyPageIsOpen()',
    maze: 'frontIsWall()',
    beat: 'beatIsReady()',
    pet: 'mood < 50',
    signal: 'light === "green"',
    tower: 'energy > 0',
    dialogue: 'choice === "A"',
    editor: 'hasNextTile()',
    studio: 'levelIsReady()',
  }[scene] || 'hasTarget()';
  const moveCode = {
    cat: 'walkToFriend();',
    magic: 'enterRoom();',
    maze: 'moveForward();',
    signal: 'carMove();',
  }[scene] || 'moveForward();';
  const soundCode = scene === 'beat' ? 'playSound("drum");' : 'playSound("signal");';
  const variableCode = scene === 'pet' ? 'mood = mood + 10;' : scene === 'tower' ? 'energy = energy - 1;' : 'state = state + 1;';
  const functionCode = scene === 'editor' ? 'buildLevel();' : scene === 'studio' ? 'publishGame();' : 'runScene();';
  const addLine = (line, level = indentLevel) => {
    lines.push(`${'  '.repeat(level)}${line}`);
  };
  const closeBlocks = () => {
    while (openBlocks.length > 0) {
      indentLevel -= 1;
      const blockType = openBlocks.pop();
      addLine(blockType === 'condition' ? '}' : '});', indentLevel);
    }
  };

  state.program.forEach((block) => {
    if (block.type === 'start') {
      closeBlocks();
      addLine('whenGameStarts(() => {');
      openBlocks.push('start');
      indentLevel = 1;
      return;
    }
    if (block.type === 'move') {
      addLine(moveCode);
      return;
    }
    if (block.type === 'condition') {
      addLine(`if (${conditionCode}) {`);
      openBlocks.push('condition');
      indentLevel += 1;
      return;
    }
    if (block.type === 'turn') {
      addLine('turnRight();');
      return;
    }
    if (block.type === 'repeat') {
      addLine('repeat(() => {');
      openBlocks.push('repeat');
      indentLevel += 1;
      return;
    }
    if (block.type === 'sound') {
      addLine(soundCode);
      return;
    }
    if (block.type === 'variable') {
      addLine(variableCode);
      return;
    }
    if (block.type === 'function') {
      addLine(functionCode);
      return;
    }
    if (block.type === 'color') {
      addLine('changeColor();');
      return;
    }
    if (block.type === 'choice') {
      addLine('choice = askPlayer();');
      return;
    }
    if (block.type === 'attack') {
      addLine('fireCannon();');
      return;
    }
    addLine('// new block');
  });

  closeBlocks();
  const code = lines.join('\n');
  return `<pre class="program code-program"><code>${code || '// 从积木库添加一个动作'}</code></pre>`;
}

function renderExecutionOrder() {
  const mission = currentMission();
  return `<div class="execution-order ${state.lastRun === 'running' ? 'running' : ''}" aria-label="程序执行顺序"><div class="execution-heading">执行顺序 <span>从上到下</span></div><ol class="execution-list">${state.program.map((block, index) => { const item = blockItem(block.type, mission); const current = state.lastRun === 'running' && state.runStep === index ? ' current-step' : ''; const completed = state.lastRun === 'running' && state.runStep !== null && index < state.runStep ? ' completed-step' : ''; return `<li class="execution-item ${item.category}${current}${completed}"><b>${index + 1}</b><span>${item.label}</span></li>`; }).join('')}</ol></div>`;
}

function runtimeStageStyle() {
  const data = state.runData;
  if (!data) return '';
  return `--actor-left:${data.actorLeft}%;--actor-top:${data.actorTop}%;--actor-scale:${data.actorScale};--actor-angle:${data.actorAngle}deg;--room-color:${data.roomColor};--beat-scale:${data.beatScale};--pet-mood:${data.petMood};--car-right:${data.carRight}%;--traffic-color:${data.trafficColor};--enemy-left:${data.enemyLeft}%;--laser-opacity:${data.laser ? 1 : 0};--editor-progress:${data.editorProgress};--studio-progress:${data.studioProgress};--rocket-left:${data.rocketLeft}%;--rocket-top:${data.rocketTop}%;--rocket-scale:${data.rocketScale};--rocket-angle:${data.rocketAngle}deg;--asteroid-left:${data.asteroidLeft}%;--asteroid-top:${data.asteroidTop}%;--asteroid-scale:${data.asteroidScale};--asteroid-angle:${data.asteroidAngle}deg;--asteroid-right:${data.asteroidRight}%;`;
}

function renderPreviewScene(mission, stageLabel) {
  const scene = mission.scene || 'space';
  const activePreview = ['workbench', 'free-workbench'].includes(state.view) && mission.id === currentMission().id;
  const data = activePreview && state.runData?.scene === scene ? state.runData : createRunData(mission);
  if (scene === 'dialogue' && !data.choiceMade && !state.runData) data.selectedChoice = state.dialogueChoice;
  const towerInteractive = state.view === 'workbench' && mission.id === state.missionId;
  const towerEnergy = towerInteractive && !data.variableTracked ? '待记录' : data.towerEnergy;
  const towerEnergyPercent = towerInteractive && !data.variableTracked ? 0 : Math.max(0, Math.round((data.towerEnergy / 80) * 100));
  const toonFace = `<span class="toon-face"><i class="toon-eye left"></i><i class="toon-eye right"></i><i class="toon-nose"></i><i class="toon-smile"></i><i class="toon-cheek left"></i><i class="toon-cheek right"></i></span>`;
  const catClicked = Boolean(data.catClicked || (mission.id === state.missionId && state.catClicked));
  const catAction = mission.id === state.missionId ? 'role="button" tabindex="0" data-action="cat-click" aria-label="点击小猫"' : '';
  const catActor = `<span class="hero-character cat-hero ${catClicked ? 'is-clicked' : ''} ${data.colorChanged ? 'is-colored' : ''}" ${catAction}><span class="cat-face"><i class="cat-eye left"></i><i class="cat-eye right"></i><i class="cat-nose"></i><i class="cat-mouth"></i><i class="cat-whiskers"></i></span><span class="cat-chest"></span><span class="cat-paw left"></span><span class="cat-paw right"></span><span class="cat-tail"></span></span>`;
  const friend = `<span class="scene-friend ${data.friendNear ? 'is-near' : ''}"><span class="friend-ear left"></span><span class="friend-ear right"></span><span class="friend-face"><i></i><i></i></span><span class="friend-body"></span></span>`;
  const editorCells = Array.from({ length: 30 }, (_, cell) => {
    const selected = state.editorTiles.includes(cell);
    const label = `第 ${Math.floor(cell / 5) + 1} 行第 ${cell % 5 + 1} 列障碍`;
    return state.view === 'workbench' && mission.id === state.missionId
      ? `<button type="button" class="editor-cell ${selected ? 'is-selected' : ''}" data-action="editor-cell" data-cell="${cell}" aria-label="${label}" aria-pressed="${selected}" title="${label}"></button>`
      : `<span class="editor-cell ${selected ? 'is-selected' : ''}"></span>`;
  }).join('');
  const scenes = {
    cat: `<span class="scene-cloud one"></span><span class="scene-cloud two"></span><span class="scene-ground"></span>${catActor}${friend}<span class="scene-heart ${data.friendNear ? 'is-active' : ''}">♥</span><span class="scene-sign ${catClicked ? 'is-active' : ''}">${['create', 'free-workbench'].includes(state.view) || mission.id?.startsWith('free-') ? data.soundPlayed ? '喵！故事继续' : data.friendNear ? '找到朋友啦！' : '小猫的故事' : catClicked ? '我看见你啦！运行程序吧' : '点一下小猫'}</span><span class="scene-note ${data.soundPlayed ? 'is-active' : ''}">♪</span>`,
    magic: `<span class="magic-moon"></span><span class="magic-room ${data.moved ? 'is-entered' : ''} ${data.colorChanged ? 'is-changed' : ''}"><i class="magic-door"></i><i class="magic-window"></i><i class="magic-shelf"></i></span><span class="wizard-kid hero-character ${data.moved ? 'is-inside' : ''} ${data.colorChanged ? 'is-casting' : ''}"><span class="wizard-hat"></span>${toonFace}<span class="wizard-body"></span><span class="wizard-hand"></span></span><span class="magic-wand"><i></i></span><span class="magic-cauldron ${data.colorChanged ? 'is-glowing' : ''}"></span><span class="magic-spark one">✦</span><span class="magic-spark two">✦</span>`,
    star: `<span class="stage-curtain left"></span><span class="stage-curtain right"></span><span class="scene-stage"></span><span class="star-spotlight"></span><span class="star-singer ${data.moved ? 'is-on-stage' : ''} ${data.colorChanged ? 'is-bright' : ''} ${data.soundPlayed ? 'is-singing' : ''}"><span class="star-body">★</span><span class="star-face"><i></i><i></i><b></b></span><span class="star-arm left"></span><span class="star-arm right"></span></span><span class="stage-microphone"></span><span class="scene-note one ${data.soundPlayed ? 'is-active' : ''}">♪</span><span class="scene-note two ${data.soundPlayed ? 'is-active' : ''}">♫</span>`,
    book: `<span class="book-table"></span><span class="book-spread ${data.moved ? 'is-open' : ''} ${data.colorChanged ? 'is-colored' : ''}"><i class="book-page left"></i><i class="book-page right"></i><i class="book-star">✦</i></span><span class="book-fox hero-character ${data.turned ? 'is-facing-page' : ''}"><span class="fox-ear left"></span><span class="fox-ear right"></span>${toonFace}<span class="fox-body"></span><span class="fox-tail"></span></span><span class="scene-speech">${data.soundPlayed ? '故事开始啦！' : data.colorChanged ? '彩色书页！' : data.moved ? '翻开啦！' : '翻开绘本吧'}</span><span class="scene-note ${data.soundPlayed ? 'is-active' : ''}">♪</span>`,
    maze: `<span class="maze-bush one"></span><span class="maze-bush two"></span><span class="scene-maze-walls"></span><span class="maze-route route-start"></span><span class="maze-route route-down"></span><span class="maze-route route-goal"></span><span class="maze-explorer hero-character ${data.conditionMet ? 'is-thinking' : ''}"><span class="explorer-hat"></span>${toonFace}<span class="explorer-body"></span><span class="explorer-pack"></span></span><span class="treasure-chest ${data.leftTurned ? 'is-found' : ''}"><i></i><b>✦</b></span><span class="maze-goal ${data.leftTurned ? 'is-active' : ''}">${data.leftTurned ? '找到宝箱啦！' : '沿黄线绕墙到宝箱'}</span>`,
    beat: `<span class="music-light one"></span><span class="music-light two"></span><span class="beat-bear ${data.repeated ? 'is-playing' : ''}"><span class="bear-ear left"></span><span class="bear-ear right"></span>${toonFace}<span class="bear-body"></span><span class="drum-stick left"></span><span class="drum-stick right"></span></span><span class="scene-drum"><i></i></span><span class="scene-note one ${data.soundPlayed ? 'is-active' : ''}">♪</span><span class="scene-note two ${data.soundPlayed ? 'is-active' : ''}">♫</span>`,
    pet: `<span class="pet-rug"></span><span class="pet-puppy ${data.conditionMet ? 'is-happy' : ''}"><span class="puppy-ear left"></span><span class="puppy-ear right"></span>${toonFace}<span class="puppy-body"></span><span class="puppy-tail"></span></span><span class="scene-bowl ${data.variableTracked ? 'is-filled' : ''}"><i></i></span><span class="pet-ball"></span><span class="scene-heart ${data.soundPlayed ? 'is-active' : ''}">♥</span><span class="scene-state">心情 ${data.variableTracked ? data.petMood : '待记录'}</span>`,
    signal: `<span class="city-cloud"></span><span class="city-tree"></span><span class="scene-road"></span><span class="crossing-kid"><span class="kid-hat"></span>${toonFace}<span class="kid-body"></span></span><span class="scene-traffic ${data.colorChanged ? 'is-green' : ''} ${data.conditionMet ? 'is-approved' : ''}"><i class="light red"></i><i class="light yellow"></i><i class="light green"></i></span><span class="scene-car ${data.moved ? 'is-driving' : ''}"><span class="car-window"></span><span class="car-face"><i></i><i></i><b></b></span><span class="car-wheel left"></span><span class="car-wheel right"></span></span>`,
    tower: `<span class="space-planet"></span><span class="tower-orbit one"></span><span class="tower-orbit two"></span><span class="scene-grid"></span><span class="tower-radar ${data.repeated ? 'is-active' : ''}"><i></i></span><span class="tower-base"><i></i></span><span class="robot-tower scene-tower ${data.repeated ? 'is-scanning' : ''} ${data.attacked ? 'is-firing' : ''}"><span class="robot-antenna"></span><span class="robot-head"><i></i><i></i><b></b></span><span class="robot-body"><i></i></span></span><span class="tower-muzzle ${data.laser ? 'is-firing' : ''}"></span><span class="scene-laser ${data.laser ? 'is-active' : ''}"></span><span class="tower-shot ${data.laser ? 'is-active' : ''}"></span><span class="tower-impact ${data.attacked ? 'is-active' : ''}">✦</span><span class="scene-enemy one ${data.attacked ? 'is-hit' : ''}"><i></i><i></i><b></b></span><span class="scene-enemy two"><i></i><i></i><b></b></span><span class="tower-hud">${data.laser ? '正在发射' : data.attacked ? '目标已命中' : data.repeated ? '正在扫描敌人' : '守护能源核心'}</span><span class="scene-energy"><b>能量</b><strong>${towerEnergy}</strong><i><em style="width:${towerEnergyPercent}%"></em></i></span>`,
    dialogue: `<span class="dialogue-destination ${data.conditionMet ? data.selectedChoice : ''}"></span><span class="theater-curtain left"></span><span class="theater-curtain right"></span><span class="theater-floor"></span><span class="dialogue-hero ${data.soundPlayed ? 'is-talking' : ''}"><span class="hero-hair"></span>${toonFace}<span class="dialogue-body"></span></span><span class="dialogue-friend"><span class="friend-hair"></span>${toonFace}<span class="dialogue-body"></span></span><span class="scene-dialogue-box">${data.soundPlayed && data.conditionMet ? data.selectedChoice === 'forest' ? '森林探险开始啦！' : '海边探险开始啦！' : data.choiceMade ? '准备前往' + (data.selectedChoice === 'forest' ? '森林' : '海边') : '你想去哪里冒险？'}</span><button class="scene-choice one ${data.selectedChoice === 'forest' ? 'is-selected' : ''}" data-action="dialogue-choice" data-choice="forest" aria-pressed="${data.selectedChoice === 'forest'}">森林</button><button class="scene-choice two ${data.selectedChoice === 'beach' ? 'is-selected' : ''}" data-action="dialogue-choice" data-choice="beach" aria-pressed="${data.selectedChoice === 'beach'}">海边</button>`,
    editor: `<span class="workshop-wall"></span><span class="scene-editor-grid"></span><span class="editor-cell-grid">${editorCells}</span><span class="builder-bot ${data.functionCalled ? 'is-building' : ''}"><span class="bot-antenna"></span><span class="bot-head"><i></i><i></i><b></b></span><span class="bot-body"></span><span class="bot-arm"></span></span><span class="editor-tile one ${data.moved ? 'is-placed' : ''}"></span><span class="editor-tile two ${data.moved ? 'is-placed' : ''}"></span><span class="scene-editor-cursor">＋</span><span class="scene-editor-chip">${data.variableTracked ? '关卡已保存' : data.functionCalled ? '正在搭建' : state.editorTiles.length ? `已摆 ${state.editorTiles.length} 块` : '空白关卡'}</span>`,
    studio: `<span class="studio-lamp"></span><span class="scene-studio-screen ${data.functionCalled ? 'is-created' : ''} ${data.repeated ? 'is-running' : ''} ${data.attacked ? 'is-hit' : ''}"><i class="screen-cloud"></i><i class="screen-hero"></i><i class="screen-goal"></i></span><span class="studio-kid ${data.soundPlayed ? 'is-ready' : ''}"><span class="studio-hair"></span>${toonFace}<span class="studio-body"></span><span class="studio-arm"></span></span><span class="scene-studio-controller"><i></i><b></b></span><span class="scene-studio-title">${data.soundPlayed ? '游戏完成！' : data.attacked ? '命中目标！' : data.conditionMet ? '目标已锁定' : data.repeated ? '游戏运行中' : data.functionCalled ? '画面已建立' : '我的游戏世界'}</span><span class="scene-note ${data.soundPlayed ? 'is-active' : ''}">♪</span>`,
  };
  return `${scenes[scene] || `<span class="space-background"></span><span class="rocket"></span><span class="asteroid"></span><span class="star-shape one"></span><span class="star-shape two"></span>`}<span class="art-label">${stageLabel}</span>`;
}

function createRunData(mission = currentMission()) {
  return {
    scene: mission?.scene || 'space',
    actorLeft: mission?.scene === 'star' ? 17 : 22,
    actorTop: mission?.scene === 'star' ? 55 : 57,
    actorScale: .82,
    actorAngle: 0,
    roomColor: '#3a2845',
    beatScale: 1,
    petMood: 48,
    towerEnergy: 80,
    selectedChoice: null,
    carRight: 19,
    trafficColor: '#ff9677',
    enemyLeft: 76,
    laser: false,
    editorProgress: 0,
    studioProgress: 0,
    
    rocketLeft: 14,
    rocketTop: 62,
    rocketScale: .62,
    rocketAngle: 22,
    asteroidLeft: 82,
    asteroidTop: 25,
    asteroidScale: .58,
    asteroidAngle: 18,
    asteroidRight: 6,
    started: false,
    moved: false,
    conditionMet: false,
    turned: false,
    repeated: false,
    collision: false,
    leftTurned: false,
    movedAfterTurn: false,
    frontBlocked: false,
    soundPlayed: false,
    variableTracked: false,
    functionCalled: false,
    colorChanged: false,
    choiceMade: false,
    attacked: false,
    catClicked: false,
    friendNear: false,
  };
}

function mazeFrontIsBlocked(data) {
  if (!data?.started) return false;

  const direction = ((data.actorAngle % 360) + 360) % 360;
  const atBoundary = direction === 0
    ? data.actorLeft >= 68
    : direction === 90
        ? data.actorTop >= 72
      : direction === 180
        ? data.actorLeft <= 19
        : data.actorTop <= 24;
  const atWall = data.actorLeft === 43 && data.actorTop === 63 && direction === 0;
  return atBoundary || atWall;
}

function prepareSceneSound() {
  if (!state.program.some((block) => block.type === 'sound')) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
}

function playSceneSound(scene) {
  if (!audioContext || audioContext.state !== 'running') return;
  const notes = scene === 'beat' ? [180, 180, 260, 180]
    : scene === 'star' ? [523, 659, 784, 1047]
      : [392, 494, 587];
  const startAt = audioContext.currentTime;
  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const at = startAt + index * .16;
    oscillator.type = scene === 'beat' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(.12, at + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, at + .14);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(at);
    oscillator.stop(at + .15);
  });
}

function applyExecutionStep(block, data = state.runData, ageMode = state.ageMode, playAudio = false) {
  if (!data) return;
  const scene = data.scene || currentMission().scene || 'space';
  if (block.type === 'start') {
    data.started = true;
    data.actorLeft = scene === 'maze' ? 19 : scene === 'magic' ? 4 : scene === 'star' ? 17 : scene === 'book' ? 27 : 22;
    data.actorTop = scene === 'maze' ? 61 : scene === 'magic' ? 55 : scene === 'star' ? 55 : scene === 'book' ? 51 : 57;
    data.rocketLeft = 14;
    data.rocketTop = 62;
    return;
  }
  if (block.type === 'move') {
    if (!data.started) data.collision = true;
    if (scene === 'signal') {
      if (!data.conditionMet) {
        data.collision = true;
        return;
      }
      data.moved = true;
      data.carRight = 62;
      return;
    }
    data.moved = true;
    if (scene === 'maze') {
      if (data.leftTurned) {
        data.actorLeft = 68;
        data.actorTop = 72;
        data.actorAngle = 0;
      } else if (data.turned) {
        data.actorLeft = 43;
        data.actorTop = 72;
        data.actorAngle = 90;
        data.movedAfterTurn = true;
      } else {
        data.actorLeft = 43;
        data.actorTop = 63;
        data.actorAngle = 0;
      }
      return;
    }
    if (scene === 'cat') data.friendNear = true;
    data.actorLeft = Math.min(data.actorLeft + (scene === 'cat' ? 24 : scene === 'maze' ? 27 : 20), 76);
    data.actorTop = Math.max(data.actorTop - (scene === 'maze' ? 7 : 4), 28);
    if (scene === 'magic') {
      data.actorLeft = 50;
      data.actorTop = 50;
    }
    if (scene === 'star') {
      data.actorLeft = 57;
      data.actorTop = 35;
    }
    data.actorAngle = scene === 'cat' ? 8 : scene === 'maze' ? 4 : 0;
    data.carRight = Math.max(data.carRight - 18, 5);
    data.enemyLeft = Math.max(data.enemyLeft - 10, 38);
    data.editorProgress = Math.min(data.editorProgress + .3, 1);
    data.studioProgress = Math.min(data.studioProgress + .25, 1);
    data.rocketLeft = Math.min(data.rocketLeft + 17, 51);
    data.rocketTop = Math.max(data.rocketTop - 8, 38);
    data.rocketScale = .72;
    data.rocketAngle = 32;
    data.asteroidLeft = Math.max(data.asteroidLeft - 7, 66);
    data.asteroidTop += 4;
    data.asteroidScale = .7;
    data.asteroidAngle += 58;
    return;
  }
  if (block.type === 'condition') {
    if (scene === 'maze') data.frontBlocked = mazeFrontIsBlocked(data);
    data.conditionMet = data.started && (
      scene === 'maze' ? data.frontBlocked
        : scene === 'tower' ? data.variableTracked && data.repeated && data.towerEnergy > 0
        : scene === 'signal' ? data.colorChanged
          : scene === 'pet' ? data.variableTracked && data.petMood >= 60
            : scene === 'dialogue' ? data.choiceMade
              : scene === 'studio' ? data.functionCalled && data.repeated
                : data.moved
    );
    data.asteroidLeft = Math.max(data.asteroidLeft - 7, 59);
    data.asteroidTop += 4;
    data.asteroidScale = .82;
    data.asteroidAngle += 58;
    data.enemyLeft = Math.max(data.enemyLeft - 6, 34);
    if (scene === 'maze' && !data.moved) data.collision = true;
    return;
  }
  if (block.type === 'turn') {
    if (scene === 'maze') {
      if (!data.conditionMet) {
        data.collision = true;
        data.actorAngle = -8;
        return;
      }
      data.turned = true;
      data.actorLeft = 43;
      data.actorTop = 63;
      data.actorAngle = 90;
      return;
    }
    if (scene === 'book') {
      if (!data.moved) {
        data.collision = true;
        return;
      }
      data.turned = true;
      data.actorAngle = 18;
      return;
    }
    if (ageMode === 'young') {
      data.turned = true;
      data.actorLeft = Math.min(data.actorLeft + 12, 76);
      data.actorTop = Math.max(data.actorTop - 10, 22);
      data.actorAngle = 48;
      data.rocketLeft = Math.min(data.rocketLeft + 12, 76);
      data.rocketTop = Math.max(data.rocketTop - 10, 22);
      data.rocketScale = .78;
      data.rocketAngle = 48;
      return;
    }
    if (!data.conditionMet) {
      data.collision = true;
      data.rocketLeft = Math.min(data.rocketLeft + 6, 55);
      data.rocketTop += 3;
      data.rocketAngle = 34;
      return;
    }
    data.turned = true;
    data.actorLeft = Math.min(data.actorLeft + 21, 76);
    data.actorTop = Math.max(data.actorTop - 18, 22);
    data.actorAngle = 54;
    data.rocketLeft = Math.min(data.rocketLeft + 21, 76);
    data.rocketTop = Math.max(data.rocketTop - 18, 22);
    data.rocketScale = .84;
    data.rocketAngle = 54;
    data.asteroidLeft = Math.max(data.asteroidLeft - 7, 45);
    data.asteroidTop += 8;
    data.asteroidScale = .9;
    data.asteroidAngle += 55;
    return;
  }
  if (block.type === 'turn-left') {
    if (scene === 'maze') {
      if (!data.turned || !data.movedAfterTurn) {
        data.collision = true;
        data.actorAngle = 8;
        return;
      }
      data.actorLeft = 43;
      data.actorTop = 72;
      data.leftTurned = true;
      data.actorAngle = 0;
      return;
    }
    data.leftTurned = true;
    data.actorAngle = -48;
    return;
  }
  if (block.type === 'repeat') {
    data.repeated = true;
    data.beatScale = Math.min(data.beatScale + .14, 1.5);
    data.enemyLeft = Math.max(data.enemyLeft - 8, 30);
    if (scene !== 'signal') data.carRight = Math.max(data.carRight - 6, 5);
    data.editorProgress = Math.min(data.editorProgress + .22, 1);
    data.studioProgress = Math.min(data.studioProgress + .2, 1);
    data.asteroidLeft = Math.max(data.asteroidLeft - 3, 42);
    data.asteroidTop += 3;
    return;
  }
  if (block.type === 'sound') {
    if (scene === 'dialogue' && !data.selectedChoice) return;
    if ((scene === 'star' && !data.colorChanged) || (scene === 'dialogue' && !data.conditionMet) || (scene === 'pet' && !data.conditionMet)) {
      data.collision = true;
      return;
    }
    data.soundPlayed = true;
    data.beatScale = Math.min(data.beatScale + .1, 1.5);
    if (playAudio) playSceneSound(scene);
  }
  if (block.type === 'variable') {
    data.variableTracked = true;
    data.petMood = Math.min(data.petMood + 12, 100);
  }
  if (block.type === 'function') {
    data.functionCalled = true;
    data.editorProgress = Math.min(data.editorProgress + .4, 1);
    data.studioProgress = Math.min(data.studioProgress + .4, 1);
  }
  if (block.type === 'color') {
    data.colorChanged = true;
    data.roomColor = '#365543';
    data.trafficColor = '#6dd69f';
  }
  if (block.type === 'choice') {
    data.choiceMade = Boolean(data.selectedChoice);
  }
  if (block.type === 'attack') {
    if ((scene === 'tower' || scene === 'studio') && !data.conditionMet) {
      data.collision = true;
      return;
    }
    data.attacked = true;
    data.laser = true;
    if (scene === 'tower') data.towerEnergy -= 1;
  }
}

function simulateProgram(program = state.program, ageMode = state.ageMode, missionId = null, selectedChoice = null) {
  const mission = missionForAge(ageMode, missionId || (ageMode === state.ageMode ? state.missionId : ageProfiles[ageMode].missionId));
  const data = createRunData(mission);
  data.selectedChoice = selectedChoice;
  program.forEach((block) => applyExecutionStep(block, data, ageMode));
  return data;
}

function renderWorks() {
  const status = state.lastRun === 'success' ? '刚刚完成' : state.saved ? '已保存 · 今天' : '草稿 · 今天';
  const workItems = missionsForAge();
  return `
    <div class="eyebrow">作品空间 · ${mode().shortLabel}</div>
    <div class="page-heading"><div><h1>我的作品</h1><p>每一次尝试都会留下版本，作品会慢慢长成你想要的样子。</p></div><button class="primary-button" data-view="create">${icon('+', '自由创作')}</button></div>
    <section class="works-shell"><div class="subhead"><strong>自由作品</strong><span>${state.freeProjects.length} 个作品 · 保存在这台设备</span></div><div class="works-grid">${state.freeProjects.length ? state.freeProjects.map((project) => { const template = freeTemplates[project.template]; return `<article class="project-card"><div class="project-cover scene-${template.scene}">${renderPreviewScene(freeMission(project), '自由作品')}</div><strong>${escapeHtml(project.title)}</strong><span>${template.title} · ${project.program.length} 块积木</span><div class="project-actions"><button data-free-project="${escapeHtml(project.id)}">继续创作</button></div></article>`; }).join('') : '<p class="empty-works">还没有自由作品，从一个创作起点开始吧。</p>'}</div></section>
    <section class="works-shell"><div class="subhead"><strong>当前主题作品</strong><span>${workItems.length} 个任务原型 · 默认仅家庭可见</span></div><div class="works-grid">${workItems.map((item) => { const unlocked = isMissionUnlocked(item.id) || state.completedMissions.includes(item.id); return `<article class="project-card ${unlocked ? '' : 'locked'}"><div class="project-cover scene-${item.scene || 'space'}">${renderPreviewScene(item, '作品')}</div><strong>${item.title}</strong><span>${unlocked ? `${item.skill} · ${item.difficulty}` : `完成前 ${item.number - 1} 个任务后解锁`}</span><div class="project-actions"><button data-mission="${item.id}">${unlocked ? '继续编辑' : '查看解锁条件'}</button><button data-action="save-work" ${unlocked ? '' : 'disabled'}>保存版本</button></div></article>`; }).join('')}</div></section>
  `;
}

function renderLegacyParent() {
  const attempts = Math.max(state.attempts, 1);
  return `
    <div class="eyebrow">家庭空间 · 学习周报</div>
    <div class="page-heading"><div><h1>小宇的学习周报</h1><p>这周完成了 2 个作品，也开始尝试自己调试程序。</p></div><div class="heading-side"><strong>8.19 – 8.25</strong>本周记录</div></div>
    <section class="parent-shell"><div class="parent-top"><div><h2>看见成长，不只看分数</h2><p>报告记录作品、能力和尝试过程，帮助家长更好地陪伴。</p></div><button class="secondary-button" data-view="map">查看孩子端</button></div><div class="metrics"><div class="metric"><div class="metric-label">创作时长</div><div class="metric-value">45 分钟</div><div class="metric-note">比上周多 12 分钟</div></div><div class="metric"><div class="metric-label">完成作品</div><div class="metric-value">${state.saved ? 3 : 2} 个</div><div class="metric-note">都已保存</div></div><div class="metric"><div class="metric-label">新掌握能力</div><div class="metric-value">2 个</div><div class="metric-note">循环 · 条件判断</div></div></div><div class="parent-columns"><div><div class="section-heading"><h2>能力成长</h2><span class="text-button">主题：太空守护者</span></div><div class="growth-row"><div class="growth-label"><strong>顺序执行</strong><span>已掌握</span></div><div class="growth-bar"><i style="width:100%"></i></div></div><div class="growth-row"><div class="growth-label"><strong>循环</strong><span>能独立使用</span></div><div class="growth-bar"><i class="blue" style="width:82%"></i></div></div><div class="growth-row"><div class="growth-label"><strong>条件判断</strong><span>正在练习</span></div><div class="growth-bar"><i class="yellow" style="width:${state.lastRun === 'success' ? 100 : 48}%"></i></div></div><div class="activity"><div class="section-heading"><h2>最近学习记录</h2><span class="text-button">尝试 ${attempts} 次</span></div><div class="activity-row"><time>今天</time><div><strong>继续制作《躲避陨石》</strong><span>尝试了 ${attempts} 次，${state.lastRun === 'success' ? '完成了碰撞判断' : '正在练习碰撞判断'}</span></div><small>${state.lastRun === 'success' ? '已完成' : '进行中'}</small></div><div class="activity-row"><time>周五</time><div><strong>完成《小猫迷宫》</strong><span>使用了循环，独立完成</span></div><small>已完成</small></div><div class="activity-row"><time>周三</time><div><strong>开始《声音剧场》</strong><span>查看了 1 次提示</span></div><small>已保存</small></div></div></div><aside><div class="section-heading"><h2>本周建议</h2></div><div class="advice"><strong>关注调试过程，不必急着给答案</strong><p>小宇在条件判断任务中进行了 ${attempts} 次尝试，说明正在主动排查问题。可以问：“你觉得飞船在哪一步遇到了问题？”</p></div><div class="settings"><div class="section-heading"><h2>家庭设置</h2></div><div class="setting-row"><span>每日使用时长</span><span>30 分钟</span></div><div class="setting-row"><span>作品可见范围</span><span>仅家庭可见</span></div><div class="setting-row"><span>允许导出作品</span><span>已开启</span></div></div></aside></div></section>
  `;
}

function renderParent() {
  const attempts = state.attempts;
  const mission = currentMission();
  const completed = state.completedMissions.length;
  const total = missions.length;
  const recent = missions.filter((item) => state.completedMissions.includes(item.id) || item.id === state.missionId).slice(-3).reverse();
  const programProgress = currentMissionProgress();
  const structureCount = new Set(state.program.map((block) => block.type)).size;
  const structureProgress = Math.min(100, Math.round((structureCount / Math.max((mission.requiredBlocks || ['start', 'move']).length, 1)) * 100));
  const advice = state.lastRun === 'needs'
    ? `可以和孩子一起检查《${mission.title}》的执行顺序：${mission.canvasTip || mission.hint}`
    : state.lastRun === 'success'
      ? `《${mission.title}》已经完成，可以鼓励孩子给作品再加一个自己的规则。`
      : `当前正在练习《${mission.title}》，可以让孩子先说出每块积木会带来什么变化。`;
  return `
    <div class="eyebrow">家庭空间 · 创作成长报告</div>
    <div class="page-heading"><div><h1>创作成长报告</h1><p>这里展示当前模式中的真实任务、尝试和作品记录。</p></div><div class="heading-side"><strong>${mode().label}</strong>当前模式</div></div>
    <section class="parent-shell">
      <div class="parent-top"><div><h2>看见成长，不只看分数</h2><p>报告只展示当前设备中真实记录的任务、尝试和自由作品。</p></div><button class="secondary-button" data-view="map">查看孩子端</button></div>
      <div class="metrics"><div class="metric"><div class="metric-label">完成任务</div><div class="metric-value">${completed} 个</div><div class="metric-note">当前模式共 ${total} 个任务</div></div><div class="metric"><div class="metric-label">自由作品</div><div class="metric-value">${state.freeProjects.length} 个</div><div class="metric-note">已保存在本设备</div></div><div class="metric"><div class="metric-label">程序尝试</div><div class="metric-value">${attempts} 次</div><div class="metric-note">运行任务时累计记录</div></div></div>
      <div class="parent-columns"><div><div class="section-heading"><h2>能力成长</h2><span class="text-button">当前主题：${mission.title}</span></div><div class="growth-row"><div class="growth-label"><strong>当前任务进度</strong><span>${programProgress}%</span></div><div class="growth-bar"><i style="width:${programProgress}%"></i></div></div><div class="growth-row"><div class="growth-label"><strong>程序结构</strong><span>${structureCount} 种积木</span></div><div class="growth-bar"><i class="blue" style="width:${structureProgress}%"></i></div></div><div class="growth-row"><div class="growth-label"><strong>任务完成率</strong><span>${completed}/${total}</span></div><div class="growth-bar"><i class="yellow" style="width:${total ? Math.round((completed / total) * 100) : 0}%"></i></div></div><div class="activity"><div class="section-heading"><h2>最近学习记录</h2><span class="text-button">${attempts} 次尝试</span></div>${recent.length ? recent.map((item, index) => `<div class="activity-row"><time>${index === 0 ? '当前' : '已完成'}</time><div><strong>${item.title}</strong><span>${item.description}</span></div><small>${state.completedMissions.includes(item.id) ? '已完成' : '进行中'}</small></div>`).join('') : '<div class="activity-row"><time>当前</time><div><strong>还没有任务记录</strong><span>开始一个任务后，这里会显示真实的学习记录。</span></div><small>待开始</small></div>'}</div></div><aside><div class="section-heading"><h2>本次建议</h2></div><div class="advice"><strong>围绕作品提问，让孩子解释规则</strong><p>${advice}</p></div><div class="settings"><div class="section-heading"><h2>家庭设置</h2></div><div class="setting-row"><span>每日使用时长</span><span>未记录</span></div><div class="setting-row"><span>作品可见范围</span><span>仅家庭可见</span></div><div class="setting-row"><span>允许导出作品</span><span>已开启</span></div></div></aside></div>
    </section>
  `;
}

function renderCreate() {
  const createItems = [
    { key: 'game', title: '小游戏' },
    { key: 'story', title: '互动故事' },
    { key: 'music', title: '节奏实验' },
  ];
  return `
    <div class="eyebrow">自由创作 · 没有标准答案</div>
    <div class="page-heading"><div><h1>从一个想法开始</h1><p>选择一个起点，做一个属于自己的互动作品。</p></div><button class="secondary-button" data-view="map">返回任务地图</button></div>
    <section class="works-shell"><div class="subhead"><strong>选择创作起点</strong><span>可以随时保存为作品</span></div><div class="works-grid">${createItems.map((item) => { const template = freeTemplates[item.key]; return `<button class="project-card" data-action="start-free" data-template="${item.key}" style="text-align:left"><div class="project-cover scene-${template.scene}">${renderPreviewScene({ scene: template.scene }, '创作')}</div><strong>${item.title}</strong><span>${template.copy}</span></button>`; }).join('')}</div></section>
  `;
}

function freeRunFeedback() {
  if (state.lastRun === 'running') return ['正在运行', '正在按积木顺序播放作品。', 'running'];
  if (state.lastRun === 'idle') return ['准备创作', '添加积木，点击运行查看作品。', 'idle'];
  if (!state.runData?.started) return ['还没开始', '先添加“当点击开始”积木。', 'needs'];
  if (state.runData.collision) return ['动作未生效', '有积木的前置条件未满足，试试调整顺序。', 'needs'];
  const flags = [
    ['moved', '角色移动了'], ['functionCalled', '画面建立了'], ['repeated', '节奏开始了'],
    ['conditionMet', '条件成立了'], ['attacked', '命中目标了'], ['colorChanged', '颜色改变了'],
    ['soundPlayed', '声音播放了'], ['turned', '角色转向了'],
  ];
  const effects = flags.filter(([flag]) => state.runData[flag]).map(([, label]) => label);
  return ['运行完成', effects.length ? effects.join('，') + '。' : '程序已启动，继续添加动作让作品发生变化。', 'success'];
}

function renderFreeWorkbench() {
  const project = activeFreeProject();
  if (!project) return renderCreate();
  const template = freeTemplates[project.template];
  const feedback = freeRunFeedback();
  const mission = freeMission(project);
  const autoRunning = state.lastRun === 'running' && state.runMode === 'auto';
  const runLabel = autoRunning ? '运行中' : '运行';
  const stageLabel = state.lastRun === 'running' && state.runStep !== null
    ? `执行：${blockItem(state.program[state.runStep].type, mission).label}` : feedback[0];
  return `
    <div class="eyebrow">自由创作 · ${template.title}</div>
    <div class="page-heading"><div><h1>${escapeHtml(project.title)}</h1><p>${template.copy}</p></div><button class="secondary-button" data-view="works">返回我的作品</button></div>
    <section class="workbench-shell free-workbench">
      <div class="workbench-header"><div class="workbench-title"><label for="free-title">作品名称</label><input id="free-title" class="free-title-input" maxlength="40" value="${escapeHtml(project.title)}" aria-label="作品名称"><span>没有固定答案，积木会按从上到下的顺序执行。</span></div><div class="workbench-actions"><button data-action="save-work">${icon('↓', '保存')}</button><button class="run" data-action="run" ${autoRunning ? 'disabled' : ''}>${icon('▶', runLabel)}</button></div></div>
      <div class="workbench-grid">
        <aside class="palette">${renderPalette()}</aside>
        <section class="canvas"><div class="canvas-bar"><span>我的程序</span><div class="view-toggle"><button class="${!state.codeMode ? 'active' : ''}" data-action="blocks">积木</button><button class="${state.codeMode ? 'active' : ''}" data-action="code">代码</button></div></div>${state.codeMode ? renderCodeView() : renderProgram()}<div class="canvas-tip"><span class="tip-symbol">!</span><span>点击左侧积木添加；拖动积木可以调整顺序。</span></div></section>
        <aside class="preview-panel"><div class="panel-heading">作品预览 <span>按顺序运行</span></div><div class="preview-panel-inner"><div><div class="preview-stage scene-${template.scene} ${state.lastRun}" style="${state.runData ? runtimeStageStyle() : ''}" aria-live="polite"><span class="stage-status"><i></i>${stageLabel}</span>${renderPreviewScene(mission, stageLabel)}</div><div class="stage-toolbar"><button data-action="run" ${autoRunning ? 'disabled' : ''}>${icon('▶', runLabel)}</button><button data-action="reset-program">${icon('↻', '重置')}</button><button data-action="step" ${autoRunning ? 'disabled' : ''}>${icon('→', '单步')}</button></div>${renderExecutionOrder()}</div><div class="feedback-box"><h4><span class="status-dot ${feedback[2]}"></span>${feedback[0]}</h4><p>${feedback[1]}</p><div class="status-line"><span class="status-dot"></span>已自动保存 · 可随时退出</div></div></div></aside>
      </div>
    </section>`;
}

function renderWorkRow(title, meta, status, item = {}) {
  return `<div class="work-row"><div class="work-thumb scene-${item.scene || 'space'}">${item.scene ? renderPreviewScene(item, '作品') : '<span class="rocket"></span>'}</div><div class="work-info"><strong>${title}</strong><span>${meta}</span></div><span class="work-state">${status}</span></div>`;
}

function renderPalette() {
  const available = new Set(state.view === 'free-workbench' && activeFreeProject() ? freeTemplates[activeFreeProject().template].palette : profile().palette);
  const groups = [
    ['事件', ['start']],
    ['控制', ['repeat', 'condition']],
    ['动作', ['move', 'turn', 'turn-left']],
    ['声音', ['sound']],
    ['数据', ['variable']],
    ['自定义', ['function']],
    ['游戏', ['choice', 'attack', 'color']],
  ];
  return `<div class="panel-heading">积木库 <span>点击或拖入</span></div>${groups.map(([label, types]) => {
    const blocks = types.filter((type) => available.has(type));
    if (!blocks.length) return '';
    return `<div class="palette-group">${label}</div>${blocks.map((type) => {
      const item = blockItem(type);
      return `<button class="palette-block ${item.category}" draggable="true" data-add-block="${type}">${icon(item.symbol, item.label)}</button>`;
    }).join('')}`;
  }).join('')}`;
}

function selectMission(id) {
  const mission = missions.find((item) => item.id === id);
  if (!mission) return;
  if (!isMissionUnlocked(id) && !state.completedMissions.includes(id)) {
    notify(`完成前 ${mission.number - 1} 个任务后，就能解锁“${mission.title}”。`);
    return;
  }
  persist();
  state.freeProjectId = null;
  state.missionId = id;
  const savedProgram = state.programsByMission?.[state.ageMode]?.[id];
  state.program = structuredClone(Array.isArray(savedProgram) ? savedProgram : mission.starterProgram || profile().starterProgram);
  state.lastRun = 'idle';
  state.runOutcome = null;
  state.runMode = null;
  state.runStep = null;
  state.runData = null;
  state.catClicked = false;
  state.view = 'mission';
  persist();
  render();
}

function selectNextMission(id) {
  const previousMission = state.missionId;
  selectMission(id);
  if (state.missionId === id && previousMission !== id) {
    state.view = 'workbench';
    persist();
    render();
  }
}

function switchAgeMode(nextAge) {
  if (!ageProfiles[nextAge] || nextAge === state.ageMode) return;
  window.clearTimeout(runTimer);
  persist();
  state.freeProjectId = null;
  if (state.view === 'free-workbench') state.view = 'create';
  state.ageMode = nextAge;
  missions = missionsForAge(nextAge);
  state.recommendationOffset = 0;
  state.missionId = ageProfiles[nextAge].missionId;
  const nextMission = missionForAge(nextAge, state.missionId);
  const savedMissionProgram = state.programsByMission?.[nextAge]?.[nextMission.id];
  const savedModeProgram = state.programsByMode?.[nextAge];
  state.program = structuredClone(Array.isArray(savedMissionProgram) ? savedMissionProgram : Array.isArray(savedModeProgram) ? savedModeProgram : nextMission.starterProgram || ageProfiles[nextAge].starterProgram);
  state.completedMissions = structuredClone(completedMissionsForAge(nextAge));
  state.lastRun = 'idle';
  state.runOutcome = null;
  state.runMode = null;
  state.runStep = null;
  state.runData = null;
  state.catClicked = false;
  persist();
  render();
}

function addBlock(type) {
  if (!blockCatalog[type]) return;
  if (state.view === 'free-workbench' && !freeTemplates[activeFreeProject()?.template]?.palette.includes(type)) return;
  window.clearTimeout(runTimer);
  state.program.push({ type });
  state.lastRun = 'idle';
  state.runOutcome = null;
  state.runMode = null;
  state.runStep = null;
  state.runData = null;
  persist();
  render();
}

function analyzeProgramData(program, data, ageMode = state.ageMode, missionId = state.missionId) {
  const safeData = data || createRunData();
  const types = program.map((block) => block.type);
  const mission = missionForAge(ageMode, missionId);
  const defaultRequired = ageMode === 'young'
    ? ['start', 'move']
    : ageMode === 'older'
      ? ['start', 'repeat', 'move', 'condition', 'turn']
      : ['start', 'move', 'condition', 'turn'];
  const requiredBlocks = mission.requiredBlocks || defaultRequired;
  const requiredOrder = mission.requiredOrder || requiredBlocks;
  const runtimeFlags = {
    start: safeData.started,
    move: safeData.moved,
    repeat: safeData.repeated,
    condition: safeData.conditionMet,
    turn: safeData.turned,
    'turn-left': safeData.leftTurned,
    sound: safeData.soundPlayed,
    variable: safeData.variableTracked,
    function: safeData.functionCalled,
    color: safeData.colorChanged,
    choice: safeData.choiceMade,
    attack: safeData.attacked,
  };
  const result = {
    hasMove: types.includes('move'),
    hasCondition: types.includes('condition'),
    hasTurn: types.includes('turn'),
    hasRepeat: types.includes('repeat'),
    collision: Boolean(safeData.collision),
    missingType: null,
  };
  const missingType = requiredBlocks.find((type) => !types.includes(type));
  if (safeData.collision) return { ...result, outcome: 'needs', reason: 'wrong-order' };
  if (missingType) {
    return {
      ...result,
      outcome: ['start', 'move'].includes(missingType) ? 'needs' : 'almost',
      reason: `missing-${missingType}`,
      missingType,
    };
  }
  let orderIndex = -1;
  const wrongOrder = requiredOrder.some((type) => {
    orderIndex = types.indexOf(type, orderIndex + 1);
    return orderIndex === -1;
  });
  if (wrongOrder) return { ...result, outcome: 'needs', reason: 'wrong-order' };
  const unmetType = requiredBlocks.find((type) => !runtimeFlags[type]);
  if (unmetType) {
    return {
      ...result,
      outcome: ['start', 'move'].includes(unmetType) ? 'needs' : 'almost',
      reason: `missing-${unmetType}`,
      missingType: unmetType,
    };
  }
  return { ...result, outcome: 'success', reason: 'complete' };
}

function programAnalysis() {
  return analyzeProgramData(state.program, simulateProgram(state.program, state.ageMode, state.missionId, state.dialogueChoice));
}

function simulateFreeProgram(program, project) {
  const data = createRunData(freeMission(project));
  program.forEach((block) => applyExecutionStep(block, data, freeTemplates[project.template].ageMode));
  return data;
}

function openFreeProject(id) {
  const project = state.freeProjects.find((item) => item.id === id);
  if (!project) return;
  window.clearTimeout(runTimer);
  persist();
  state.freeProjectId = id;
  state.program = structuredClone(project.program);
  state.view = 'free-workbench';
  state.lastRun = 'idle';
  state.runData = null;
  state.runStep = null;
  state.runMode = null;
  state.codeMode = false;
  persist();
  render();
}

function createFreeProject(template) {
  if (!freeTemplates[template]) return;
  persist();
  const project = {
    id: `free-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    template,
    title: freeTemplates[template].title,
    program: [{ type: 'start' }],
    updatedAt: new Date().toISOString(),
  };
  state.freeProjects.unshift(project);
  openFreeProject(project.id);
}

function leaveFreeWorkbench(view) {
  window.clearTimeout(runTimer);
  persist();
  state.freeProjectId = null;
  state.program = structuredClone(state.programsByMission[state.ageMode][state.missionId] || currentMission().starterProgram || profile().starterProgram);
  state.lastRun = 'idle';
  state.runData = null;
  state.runStep = null;
  state.runMode = null;
  state.view = view;
  persist();
  render();
}

function beginRun(runMode, countAttempt = true) {
  window.clearTimeout(runTimer);
  if (countAttempt) state.attempts += 1;
  state.lastRun = 'running';
  state.runOutcome = null;
  state.runMode = runMode;
  state.runStep = state.program.length ? 0 : null;
  state.runData = createRunData(currentMission());
  state.runData.catClicked = state.catClicked;
  state.runData.selectedChoice = state.dialogueChoice;
  persist();
  render();
}

function runProgram() {
  prepareSceneSound();
  if (state.lastRun === 'running') {
    if (state.runMode !== 'step') return;
    state.runMode = 'auto';
    persist();
    render();
    runTimer = window.setTimeout(advanceExecution, 360);
    return;
  }
  beginRun('auto');
  if (state.program.length) {
    runTimer = window.setTimeout(advanceExecution, 360);
  } else {
    finishRun();
  }
}

function advanceExecution() {
  if (state.lastRun !== 'running' || state.runMode !== 'auto') return;
  const index = state.runStep;
  const block = index === null ? null : state.program[index];
  if (!block) {
    finishRun();
    return;
  }
  applyExecutionStep(block, state.runData, state.view === 'free-workbench' ? freeTemplates[activeFreeProject().template].ageMode : state.ageMode, true);
  persist();
  render();
  if (index === state.program.length - 1) {
    runTimer = window.setTimeout(finishRun, 700);
    return;
  }
  state.runStep += 1;
  persist();
  runTimer = window.setTimeout(advanceExecution, 700);
}

function stepProgram() {
  prepareSceneSound();
  if (state.lastRun === 'running' && state.runMode === 'auto') {
    notify('程序正在自动运行，请等它完成后再使用单步。');
    return;
  }
  if (state.lastRun !== 'running') beginRun('step');
  window.clearTimeout(runTimer);
  const index = state.runStep;
  const block = index === null ? null : state.program[index];
  if (!block) {
    finishRun();
    return;
  }
  applyExecutionStep(block, state.runData, state.view === 'free-workbench' ? freeTemplates[activeFreeProject().template].ageMode : state.ageMode, true);
  if (index === state.program.length - 1) {
    state.runStep = null;
  } else {
    state.runStep += 1;
  }
  persist();
  render();
  if (index === state.program.length - 1) runTimer = window.setTimeout(finishRun, 700);
}

function finishRun() {
  if (state.lastRun !== 'running') return;
  window.clearTimeout(runTimer);
  const data = state.runData || createRunData(currentMission());
  if (state.view === 'free-workbench') {
    state.runData = data;
    state.runStep = null;
    state.lastRun = data.started && !data.collision ? 'success' : 'needs';
    state.runMode = null;
    persist();
    render();
    return;
  }
  const analysis = analyzeProgramData(state.program, data);
  const outcome = analysis.outcome;
  state.runData = data;
  state.runStep = null;
  state.lastRun = outcome;
  state.runOutcome = null;
  state.runMode = null;
  let unlockedMission = null;
  if (outcome === 'success') {
    state.saved = true;
    state.savedAt = new Date().toISOString();
    if (!state.completedMissions.includes(state.missionId)) {
      state.completedMissions.push(state.missionId);
      const currentIndex = missions.findIndex((mission) => mission.id === state.missionId);
      unlockedMission = missions[currentIndex + 1] || null;
    }
  }
  persist();
  const feedback = ageFeedback(['程序结果', '回到积木区检查执行顺序。', outcome === 'success' ? 'success' : 'needs'], analysis);
  const unlockCopy = unlockedMission ? ` 下一关“${unlockedMission.title}”已解锁。` : '';
  notify(feedback[0] === '任务完成' ? `${feedback[0]}！${feedback[1]}${unlockCopy}` : feedback[1]);
}

function resetProgram() {
  window.clearTimeout(runTimer);
  state.program = state.view === 'free-workbench' ? [{ type: 'start' }] : structuredClone(currentMission().starterProgram || profile().starterProgram);
  state.lastRun = 'idle';
  state.runOutcome = null;
  state.runMode = null;
  state.runStep = null;
  state.runData = null;
  state.catClicked = false;
  persist();
  notify('程序已回到最初状态，可以重新尝试。');
}

function reorderProgram(sourceIndex, targetIndex) {
  if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0 || sourceIndex >= state.program.length) return;
  window.clearTimeout(runTimer);
  const [movedBlock] = state.program.splice(sourceIndex, 1);
  const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  state.program.splice(Math.min(insertIndex, state.program.length), 0, movedBlock);
  state.lastRun = 'idle';
  state.runOutcome = null;
  state.runMode = null;
  state.runStep = null;
  state.runData = null;
  persist();
  render();
}

function handleClick(event) {
  const target = event.target.closest('[data-view], [data-age], [data-mission], [data-next-mission], [data-free-project], [data-action], [data-add-block], [data-remove-index]');
  if (!target) return;
  if (target.dataset.age) {
    switchAgeMode(target.dataset.age);
    return;
  }
  if (target.dataset.view) {
    if (state.view === 'free-workbench') {
      leaveFreeWorkbench(target.dataset.view);
      return;
    }
    state.view = target.dataset.view;
    persist();
    render();
    return;
  }
  if (target.dataset.mission) {
    selectMission(target.dataset.mission);
    return;
  }
  if (target.dataset.nextMission) {
    selectNextMission(target.dataset.nextMission);
    return;
  }
  if (target.dataset.freeProject) {
    openFreeProject(target.dataset.freeProject);
    return;
  }
  if (target.dataset.removeIndex !== undefined) {
    window.clearTimeout(runTimer);
    state.program.splice(Number(target.dataset.removeIndex), 1);
    state.lastRun = 'idle';
    state.runOutcome = null;
    state.runMode = null;
    state.runStep = null;
    state.runData = null;
    persist();
    render();
    return;
  }
  if (target.dataset.addBlock) {
    addBlock(target.dataset.addBlock);
    return;
  }
  const action = target.dataset.action;
  if (!action) return;
  if (action === 'editor-cell') {
    if (currentMission().scene !== 'editor' || state.lastRun === 'running') return;
    const cell = Number(target.dataset.cell);
    if (!Number.isInteger(cell) || cell < 0 || cell >= 30) return;
    state.editorTiles = state.editorTiles.includes(cell)
      ? state.editorTiles.filter((selected) => selected !== cell)
      : [...state.editorTiles, cell];
    persist();
    render();
  } else if (action === 'dialogue-choice') {
    if (currentMission().scene !== 'dialogue' || state.lastRun === 'running') return;
    state.dialogueChoice = target.dataset.choice;
    state.lastRun = 'idle';
    state.runData = null;
    persist();
    render();
  } else if (action === 'cat-click') {
    if (currentMission().scene !== 'cat') return;
    state.catClicked = true;
    if (state.runData?.scene === 'cat') state.runData.catClicked = true;
    persist();
    render();
    notify('小猫看见你啦！现在运行程序，让它走到朋友身边。');
  } else if (action === 'continue' || action === 'start-mission') {
    state.view = 'workbench';
    persist();
    render();
  } else if (action === 'back-map') {
    state.view = 'map';
    persist();
    render();
  } else if (action === 'run') {
    runProgram();
  } else if (action === 'reset-program') {
    resetProgram();
  } else if (action === 'hint') {
    state.hintsUsed += 1;
    notify(currentMission().hint || '观察执行顺序，再试着修改一个积木。');
  } else if (action === 'save-work') {
    if (state.view === 'free-workbench') {
      persist();
      notify('自由作品已保存到“我的作品”。');
      return;
    }
    state.saved = true;
    state.savedAt = new Date().toISOString();
    persist();
    notify('作品已保存到“我的作品”。');
  } else if (action === 'code') {
    state.codeMode = true;
    persist();
    render();
  } else if (action === 'blocks') {
    state.codeMode = false;
    persist();
    render();
  } else if (action === 'step') {
    stepProgram();
  } else if (action === 'shuffle') {
    state.recommendationOffset = (state.recommendationOffset + 1) % Math.max(missions.length, 1);
    persist();
    render();
  } else if (action === 'show-progress') {
    state.progressOpen = true;
    persist();
    render();
  } else if (action === 'hide-progress') {
    state.progressOpen = false;
    persist();
    render();
  } else if (action === 'start-free') {
    createFreeProject(target.dataset.template);
  } else if (action === 'open-work') {
    notify('作品预览将在下一步打开。');
  } else if (action === 'duplicate-work') {
    notify('已创建一个新的作品草稿。');
  } else if (action === 'export-work') {
    notify('作品展示页已准备好，导出前需要家长确认。');
  }
}

app.addEventListener('change', (event) => {
  if (event.target.id !== 'free-title' || state.view !== 'free-workbench') return;
  const project = activeFreeProject();
  if (!project) return;
  project.title = event.target.value.trim().slice(0, 40) || freeTemplates[project.template].title;
  persist();
  render();
});
app.addEventListener('input', (event) => {
  if (event.target.id !== 'free-title' || state.view !== 'free-workbench') return;
  const project = activeFreeProject();
  if (!project) return;
  project.title = event.target.value.trim().slice(0, 40) || freeTemplates[project.template].title;
  app.querySelector('.page-heading h1').textContent = project.title;
  persist();
});

app.addEventListener('click', handleClick);
app.addEventListener('keydown', (event) => {
  const cat = event.target.closest('[data-action="cat-click"]');
  if (!cat || !['Enter', ' '].includes(event.key)) return;
  event.preventDefault();
  cat.click();
});
app.addEventListener('dragstart', (event) => {
  const programBlock = event.target.closest('[data-program-index]');
  if (programBlock) {
    programBlock.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-program-index', programBlock.dataset.programIndex);
    return;
  }
  const block = event.target.closest('[data-add-block]');
  if (block) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', block.dataset.addBlock);
  }
});
app.addEventListener('dragover', (event) => {
  if (event.target.closest('[data-drop-zone="program"]')) {
    event.preventDefault();
    event.target.closest('[data-drop-zone="program"]').classList.add('drag-over');
    event.dataTransfer.dropEffect = event.dataTransfer.types.includes('application/x-program-index') ? 'move' : 'copy';
  }
});
app.addEventListener('dragleave', (event) => {
  const zone = event.target.closest('[data-drop-zone="program"]');
  if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove('drag-over');
});
app.addEventListener('drop', (event) => {
  const zone = event.target.closest('[data-drop-zone="program"]');
  if (!zone) return;
  event.preventDefault();
  zone.classList.remove('drag-over');
  const sourceValue = event.dataTransfer.getData('application/x-program-index');
  if (sourceValue !== '') {
    const targetBlock = event.target.closest('[data-program-index]');
    reorderProgram(Number(sourceValue), targetBlock ? Number(targetBlock.dataset.programIndex) : state.program.length);
    return;
  }
  addBlock(event.dataTransfer.getData('text/plain'));
});
app.addEventListener('dragend', (event) => {
  event.target.closest('[data-program-index]')?.classList.remove('dragging');
  app.querySelector('[data-drop-zone="program"]')?.classList.remove('drag-over');
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {
    // The app remains usable when service worker registration is unavailable.
  });
}

render();
