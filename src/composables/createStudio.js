import { reactive } from "vue";
import {
  STORAGE_KEY,
  freeTemplates,
  ageModes,
  ageCopy,
  blockCatalog,
  ageProfiles,
  defaultState,
} from "../data/catalog.js";

// 所有状态均为可持久化的 JSON 数据，转换后可以安全复制 Vue 响应式对象。
const clone = (value) => JSON.parse(JSON.stringify(value));

export function createStudio({
  storage = globalThis.localStorage,
  timers = globalThis.window || globalThis,
} = {}) {
  let state = reactive(loadState());
  let missions = missionsForAge(state.ageMode);
  let toastTimer;
  let runTimer;
  let audioContext;

  function loadState() {
    try {
      const stored = JSON.parse(storage.getItem(STORAGE_KEY));
      if (!stored || !Array.isArray(stored.program)) return clone(defaultState);
      const nextState = { ...clone(defaultState), ...stored };
      nextState.freeProjects = Array.isArray(stored.freeProjects)
        ? stored.freeProjects
            .filter(
              (project) =>
                project &&
                freeTemplates[project.template] &&
                Array.isArray(project.program),
            )
            .map((project) => ({
              ...project,
              program: project.program.filter(
                (block) =>
                  blockCatalog[block?.type] &&
                  freeTemplates[project.template].palette.includes(block.type),
              ),
            }))
        : [];
      nextState.editorTiles = Array.isArray(stored.editorTiles)
        ? [
            ...new Set(
              stored.editorTiles.filter(
                (cell) => Number.isInteger(cell) && cell >= 0 && cell < 30,
              ),
            ),
          ]
        : [];
      if (!ageProfiles[nextState.ageMode]) nextState.ageMode = "middle";
      nextState.completedMissionsByMode = {
        ...clone(defaultState.completedMissionsByMode),
        ...(stored.completedMissionsByMode || {}),
      };
      nextState.programsByMode = {
        ...clone(defaultState.programsByMode),
        ...(stored.programsByMode || {}),
      };
      nextState.programsByMission = {
        young: {
          ...clone(defaultState.programsByMission.young),
          ...(stored.programsByMission?.young || {}),
        },
        middle: {
          ...clone(defaultState.programsByMission.middle),
          ...(stored.programsByMission?.middle || {}),
        },
        older: {
          ...clone(defaultState.programsByMission.older),
          ...(stored.programsByMission?.older || {}),
        },
      };
      const ageMissionList = ageProfiles[nextState.ageMode].missions;
      if (
        !ageMissionList.some((mission) => mission.id === nextState.missionId)
      ) {
        nextState.missionId = ageProfiles[nextState.ageMode].missionId;
      }
      const missionProgram =
        stored.programsByMission?.[nextState.ageMode]?.[nextState.missionId];
      const hasMissionStorage = Boolean(
        stored.programsByMission?.[nextState.ageMode],
      );
      const modeProgram =
        missionProgram ||
        (hasMissionStorage
          ? stored.programsByMode?.[nextState.ageMode]
          : ageMissionList.find((mission) => mission.id === nextState.missionId)
              ?.starterProgram);
      nextState.program = clone(
        Array.isArray(modeProgram) ? modeProgram : stored.program,
      );
      nextState.programsByMission[nextState.ageMode][nextState.missionId] =
        clone(nextState.program);
      nextState.programsByMode[nextState.ageMode] = clone(nextState.program);
      if (
        !stored.completedMissionsByMode &&
        Array.isArray(stored.completedMissions)
      ) {
        nextState.completedMissionsByMode.middle = clone(
          stored.completedMissions,
        );
      }
      const modeCompleted =
        nextState.completedMissionsByMode[nextState.ageMode];
      const validMissionIds = new Set(
        ageMissionList.map((mission) => mission.id),
      );
      nextState.completedMissionsByMode[nextState.ageMode] = (
        Array.isArray(modeCompleted) ? modeCompleted : []
      ).filter((id) => validMissionIds.has(id));
      nextState.completedMissions = clone(
        nextState.completedMissionsByMode[nextState.ageMode],
      );
      const activeMissionIndex = ageMissionList.findIndex(
        (mission) => mission.id === nextState.missionId,
      );
      const activeMissionUnlocked = ageMissionList
        .slice(0, activeMissionIndex)
        .every((mission) => nextState.completedMissions.includes(mission.id));
      if (
        !activeMissionUnlocked &&
        !nextState.completedMissions.includes(nextState.missionId)
      ) {
        const fallbackMission =
          ageMissionList.find(
            (mission, index) =>
              !nextState.completedMissions.includes(mission.id) &&
              ageMissionList
                .slice(0, index)
                .every((previous) =>
                  nextState.completedMissions.includes(previous.id),
                ),
          ) || ageMissionList[0];
        nextState.missionId = fallbackMission.id;
        const fallbackProgram =
          stored.programsByMission?.[nextState.ageMode]?.[fallbackMission.id] ||
          fallbackMission.starterProgram ||
          ageProfiles[nextState.ageMode].starterProgram;
        nextState.program = clone(fallbackProgram);
        nextState.programsByMission[nextState.ageMode][fallbackMission.id] =
          clone(nextState.program);
        nextState.programsByMode[nextState.ageMode] = clone(nextState.program);
      }
      if (nextState.lastRun === "running") nextState.lastRun = "idle";
      if (
        nextState.view === "free-workbench" &&
        nextState.freeProjects.some(
          (project) => project.id === nextState.freeProjectId,
        )
      ) {
        nextState.program = clone(
          nextState.freeProjects.find(
            (project) => project.id === nextState.freeProjectId,
          ).program,
        );
      } else {
        nextState.freeProjectId = null;
        if (nextState.view === "free-workbench") nextState.view = "create";
      }
      nextState.runMode = null;
      nextState.runOutcome = null;
      nextState.runStep = null;
      nextState.runData = ["success", "almost", "needs"].includes(
        nextState.lastRun,
      )
        ? nextState.view === "free-workbench"
          ? simulateFreeProgram(
              nextState.program,
              nextState.freeProjects.find(
                (project) => project.id === nextState.freeProjectId,
              ),
            )
          : simulateProgram(
              nextState.program,
              nextState.ageMode,
              nextState.missionId,
              nextState.dialogueChoice,
            )
        : null;
      return nextState;
    } catch {
      return clone(defaultState);
    }
  }

  function persist() {
    if (state.view === "free-workbench" && activeFreeProject()) {
      const project = activeFreeProject();
      project.program = clone(state.program);
      project.updatedAt = new Date().toISOString();
      storage.setItem(STORAGE_KEY, JSON.stringify({ ...state, toast: "" }));
      return;
    }
    const modePrograms = state.programsByMission?.[state.ageMode] || {};
    state.programsByMission = {
      ...(state.programsByMission || {}),
      [state.ageMode]: {
        ...modePrograms,
        [state.missionId]: clone(state.program),
      },
    };
    state.programsByMode = {
      ...(state.programsByMode || {}),
      [state.ageMode]: clone(state.program),
    };
    state.completedMissionsByMode = {
      ...(state.completedMissionsByMode || {}),
      [state.ageMode]: clone(state.completedMissions || []),
    };
    state.completedMissions = clone(completedMissionsForAge());
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...state, toast: "" }));
  }

  function notify(message) {
    state.toast = message;
    persist();

    timers.clearTimeout(toastTimer);
    toastTimer = timers.setTimeout(() => {
      state.toast = "";
    }, 2600);
  }

  function missionForAge(ageMode = state.ageMode, missionId = state.missionId) {
    const currentMissions = missionsForAge(ageMode);
    return (
      currentMissions.find((mission) => mission.id === missionId) ||
      currentMissions[0]
    );
  }

  function currentMission() {
    if (state.view === "free-workbench" && activeFreeProject())
      return freeMission(activeFreeProject());
    return missionForAge();
  }

  function activeFreeProject() {
    return state.freeProjects.find(
      (project) => project.id === state.freeProjectId,
    );
  }

  function freeMission(project) {
    const template = freeTemplates[project.template];
    return {
      id: project.id,
      title: project.title,
      scene: template.scene,
      description: template.copy,
      skill: "自由创作",
    };
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
      cat: { move: "走到朋友身边", condition: "如果朋友在附近" },
      magic: { move: "走进房间", condition: "如果已经进屋" },
      star: {
        move: "移动到舞台",
        color: "点亮星星",
        sound: "唱出旋律",
        condition: "如果颜色已改变",
      },
      book: {
        move: "翻开绘本",
        turn: "转向书页",
        color: "给书页上色",
        sound: "讲出故事",
        condition: "如果故事页已打开",
      },
      maze: {
        move: "沿路线前进",
        condition: "如果前方有墙",
        turn: "向右转弯",
        "turn-left": "向左转弯",
      },
      beat: {
        repeat: "重复敲鼓",
        sound: "播放鼓声",
        condition: "如果节拍准备好",
      },
      pet: { condition: "如果心情变好了", variable: "喂食并记录心情" },
      signal: { move: "车辆前进", condition: "如果现在是绿灯" },
      tower: { condition: "如果能量足够", variable: "记录能量值" },
      dialogue: { choice: "读取目的地", condition: "根据目的地判断" },
      editor: { condition: "如果还有下一个格子", function: "调用关卡函数" },
      studio: {
        condition: "如果关卡准备好",
        function: "建立游戏画面",
        repeat: "启动游戏循环",
        attack: "命中目标",
        sound: "播放胜利音效",
      },
    };
    const label = labels[mission?.scene]?.[type];
    return label ? { ...item, label } : item;
  }

  function missionCopy() {
    const currentMissionData = currentMission();
    const currentCopy = copy();
    const middleGoals = {
      "middle-maze": "绕过墙壁走到宝箱旁边",
      "middle-beat": "让鼓槌重复敲击并播放鼓声",
      "middle-pet": "喂食后记录心情，让小狗开心回应",
      "middle-signal": "红灯停车，绿灯判断通过后开车",
    };
    return {
      ...currentCopy,
      continueTitle: currentMissionData.title,
      continueCopy: currentMissionData.description,
      missionTitle: currentMissionData.title,
      missionCopy: currentMissionData.description,
      skill: currentMissionData.skill,
      goal:
        currentMissionData.goal ||
        middleGoals[currentMissionData.id] ||
        currentCopy.goal,
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
    const offset =
      (((state.recommendationOffset || 0) % list.length) + list.length) %
      list.length;
    return list
      .slice(offset)
      .concat(list.slice(0, offset))
      .slice(0, Math.min(3, list.length));
  }

  function currentMissionProgress() {
    const mission = currentMission();
    if (
      state.completedMissions.includes(mission.id) ||
      state.lastRun === "success"
    )
      return 100;
    const requiredCount = Math.max(
      (mission.requiredOrder || mission.requiredBlocks || ["start", "move"])
        .length,
      1,
    );
    const programCount = new Set(state.program.map((block) => block.type)).size;
    return Math.min(
      92,
      Math.max(0, Math.round((programCount / requiredCount) * 100)),
    );
  }

  function nextMissionForCurrent() {
    const index = missions.findIndex(
      (mission) => mission.id === state.missionId,
    );
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
    return ageMissions
      .slice(0, missionIndex)
      .every((mission) => completed.includes(mission.id));
  }

  function missionRouteState(mission) {
    if (state.completedMissions.includes(mission.id))
      return { className: "done", label: "已完成" };
    if (!isMissionUnlocked(mission.id))
      return { className: "locked", label: "未解锁" };
    if (mission.id === state.missionId)
      return { className: "current", label: "进行中" };
    return { className: "next", label: "下一站" };
  }

  function missionMeta(mission) {
    if (
      !isMissionUnlocked(mission.id) &&
      !state.completedMissions.includes(mission.id)
    ) {
      return `完成前 ${mission.number - 1} 个任务后解锁`;
    }
    return `${mission.skill} · ${mission.difficulty} · ${mission.duration}`;
  }

  function ageFeedback(fallback, analysis) {
    const mission = currentMission();
    if (!analysis) return fallback;
    if (analysis.reason === "complete") {
      return ["任务完成", mission.successFeedback || fallback[1], "success"];
    }
    if (
      analysis.reason === "missing-choice" &&
      mission.scene === "dialogue" &&
      state.program.some((block) => block.type === "choice")
    ) {
      return [
        "先选目的地",
        "点击预览里的“森林”或“海边”，再运行程序。",
        "needs",
      ];
    }
    if (analysis.reason === "wrong-order") {
      const order = (mission.requiredOrder || [])
        .map((type) => blockItem(type, mission).label || type)
        .join(" → ");
      if (mission.scene === "maze") {
        return [
          "撞到墙啦",
          `角色需要按“${order}”行动：先走到墙前，再判断，最后转弯。`,
          "needs",
        ];
      }
      const title = state.ageMode === "young" ? "顺序再排一排" : "顺序需要调整";
      return [title, `请按“${order}”的顺序排列积木。`, "needs"];
    }
    if (analysis.missingType) {
      const missingLabel =
        blockItem(analysis.missingType, mission).label || "需要的积木";
      const title =
        analysis.missingType === "move" ? "还缺一个动作" : "再试一步";
      return [
        title,
        `这个任务还需要“${missingLabel}”，添加后再运行看看。`,
        analysis.missingType === "move" ? "needs" : "almost",
      ];
    }
    return fallback;
  }

  function runtimeStageStyle() {
    const data = state.runData;
    if (!data) return "";
    return `--actor-left:${data.actorLeft}%;--actor-top:${data.actorTop}%;--actor-scale:${data.actorScale};--actor-angle:${data.actorAngle}deg;--room-color:${data.roomColor};--beat-scale:${data.beatScale};--pet-mood:${data.petMood};--car-right:${data.carRight}%;--traffic-color:${data.trafficColor};--enemy-left:${data.enemyLeft}%;--laser-opacity:${data.laser ? 1 : 0};--editor-progress:${data.editorProgress};--studio-progress:${data.studioProgress};--rocket-left:${data.rocketLeft}%;--rocket-top:${data.rocketTop}%;--rocket-scale:${data.rocketScale};--rocket-angle:${data.rocketAngle}deg;--asteroid-left:${data.asteroidLeft}%;--asteroid-top:${data.asteroidTop}%;--asteroid-scale:${data.asteroidScale};--asteroid-angle:${data.asteroidAngle}deg;--asteroid-right:${data.asteroidRight}%;`;
  }

  function createRunData(mission = currentMission()) {
    return {
      scene: mission?.scene || "space",
      actorLeft: mission?.scene === "star" ? 17 : 22,
      actorTop: mission?.scene === "star" ? 55 : 57,
      actorScale: 0.82,
      actorAngle: 0,
      roomColor: "#3a2845",
      beatScale: 1,
      petMood: 48,
      towerEnergy: 80,
      selectedChoice: null,
      carRight: 19,
      trafficColor: "#ff9677",
      enemyLeft: 76,
      laser: false,
      editorProgress: 0,
      studioProgress: 0,

      rocketLeft: 14,
      rocketTop: 62,
      rocketScale: 0.62,
      rocketAngle: 22,
      asteroidLeft: 82,
      asteroidTop: 25,
      asteroidScale: 0.58,
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
    const atBoundary =
      direction === 0
        ? data.actorLeft >= 68
        : direction === 90
          ? data.actorTop >= 72
          : direction === 180
            ? data.actorLeft <= 19
            : data.actorTop <= 24;
    const atWall =
      data.actorLeft === 43 && data.actorTop === 63 && direction === 0;
    return atBoundary || atWall;
  }

  function prepareSceneSound() {
    if (!state.program.some((block) => block.type === "sound")) return;
    const AudioContextClass = timers.AudioContext || timers.webkitAudioContext;
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();
  }

  function playSceneSound(scene) {
    if (!audioContext || audioContext.state !== "running") return;
    const notes =
      scene === "beat"
        ? [180, 180, 260, 180]
        : scene === "star"
          ? [523, 659, 784, 1047]
          : [392, 494, 587];
    const startAt = audioContext.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const at = startAt + index * 0.16;
      oscillator.type = scene === "beat" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.12, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.15);
    });
  }

  function applyExecutionStep(
    block,
    data = state.runData,
    ageMode = state.ageMode,
    playAudio = false,
  ) {
    if (!data) return;
    const scene = data.scene || currentMission().scene || "space";
    if (block.type === "start") {
      data.started = true;
      data.actorLeft =
        scene === "maze"
          ? 19
          : scene === "magic"
            ? 4
            : scene === "star"
              ? 17
              : scene === "book"
                ? 27
                : 22;
      data.actorTop =
        scene === "maze"
          ? 61
          : scene === "magic"
            ? 55
            : scene === "star"
              ? 55
              : scene === "book"
                ? 51
                : 57;
      data.rocketLeft = 14;
      data.rocketTop = 62;
      return;
    }
    if (block.type === "move") {
      if (!data.started) data.collision = true;
      if (scene === "signal") {
        if (!data.conditionMet) {
          data.collision = true;
          return;
        }
        data.moved = true;
        data.carRight = 62;
        return;
      }
      data.moved = true;
      if (scene === "maze") {
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
      if (scene === "cat") data.friendNear = true;
      data.actorLeft = Math.min(
        data.actorLeft + (scene === "cat" ? 24 : scene === "maze" ? 27 : 20),
        76,
      );
      data.actorTop = Math.max(data.actorTop - (scene === "maze" ? 7 : 4), 28);
      if (scene === "magic") {
        data.actorLeft = 50;
        data.actorTop = 50;
      }
      if (scene === "star") {
        data.actorLeft = 57;
        data.actorTop = 35;
      }
      data.actorAngle = scene === "cat" ? 8 : scene === "maze" ? 4 : 0;
      data.carRight = Math.max(data.carRight - 18, 5);
      data.enemyLeft = Math.max(data.enemyLeft - 10, 38);
      data.editorProgress = Math.min(data.editorProgress + 0.3, 1);
      data.studioProgress = Math.min(data.studioProgress + 0.25, 1);
      data.rocketLeft = Math.min(data.rocketLeft + 17, 51);
      data.rocketTop = Math.max(data.rocketTop - 8, 38);
      data.rocketScale = 0.72;
      data.rocketAngle = 32;
      data.asteroidLeft = Math.max(data.asteroidLeft - 7, 66);
      data.asteroidTop += 4;
      data.asteroidScale = 0.7;
      data.asteroidAngle += 58;
      return;
    }
    if (block.type === "condition") {
      if (scene === "maze") data.frontBlocked = mazeFrontIsBlocked(data);
      data.conditionMet =
        data.started &&
        (scene === "maze"
          ? data.frontBlocked
          : scene === "tower"
            ? data.variableTracked && data.repeated && data.towerEnergy > 0
            : scene === "signal"
              ? data.colorChanged
              : scene === "pet"
                ? data.variableTracked && data.petMood >= 60
                : scene === "dialogue"
                  ? data.choiceMade
                  : scene === "studio"
                    ? data.functionCalled && data.repeated
                    : data.moved);
      data.asteroidLeft = Math.max(data.asteroidLeft - 7, 59);
      data.asteroidTop += 4;
      data.asteroidScale = 0.82;
      data.asteroidAngle += 58;
      data.enemyLeft = Math.max(data.enemyLeft - 6, 34);
      if (scene === "maze" && !data.moved) data.collision = true;
      return;
    }
    if (block.type === "turn") {
      if (scene === "maze") {
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
      if (scene === "book") {
        if (!data.moved) {
          data.collision = true;
          return;
        }
        data.turned = true;
        data.actorAngle = 18;
        return;
      }
      if (ageMode === "young") {
        data.turned = true;
        data.actorLeft = Math.min(data.actorLeft + 12, 76);
        data.actorTop = Math.max(data.actorTop - 10, 22);
        data.actorAngle = 48;
        data.rocketLeft = Math.min(data.rocketLeft + 12, 76);
        data.rocketTop = Math.max(data.rocketTop - 10, 22);
        data.rocketScale = 0.78;
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
      data.rocketScale = 0.84;
      data.rocketAngle = 54;
      data.asteroidLeft = Math.max(data.asteroidLeft - 7, 45);
      data.asteroidTop += 8;
      data.asteroidScale = 0.9;
      data.asteroidAngle += 55;
      return;
    }
    if (block.type === "turn-left") {
      if (scene === "maze") {
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
    if (block.type === "repeat") {
      data.repeated = true;
      data.beatScale = Math.min(data.beatScale + 0.14, 1.5);
      data.enemyLeft = Math.max(data.enemyLeft - 8, 30);
      if (scene !== "signal") data.carRight = Math.max(data.carRight - 6, 5);
      data.editorProgress = Math.min(data.editorProgress + 0.22, 1);
      data.studioProgress = Math.min(data.studioProgress + 0.2, 1);
      data.asteroidLeft = Math.max(data.asteroidLeft - 3, 42);
      data.asteroidTop += 3;
      return;
    }
    if (block.type === "sound") {
      if (scene === "dialogue" && !data.selectedChoice) return;
      if (
        (scene === "star" && !data.colorChanged) ||
        (scene === "dialogue" && !data.conditionMet) ||
        (scene === "pet" && !data.conditionMet)
      ) {
        data.collision = true;
        return;
      }
      data.soundPlayed = true;
      data.beatScale = Math.min(data.beatScale + 0.1, 1.5);
      if (playAudio) playSceneSound(scene);
    }
    if (block.type === "variable") {
      data.variableTracked = true;
      data.petMood = Math.min(data.petMood + 12, 100);
    }
    if (block.type === "function") {
      data.functionCalled = true;
      data.editorProgress = Math.min(data.editorProgress + 0.4, 1);
      data.studioProgress = Math.min(data.studioProgress + 0.4, 1);
    }
    if (block.type === "color") {
      data.colorChanged = true;
      data.roomColor = "#365543";
      data.trafficColor = "#6dd69f";
    }
    if (block.type === "choice") {
      data.choiceMade = Boolean(data.selectedChoice);
    }
    if (block.type === "attack") {
      if ((scene === "tower" || scene === "studio") && !data.conditionMet) {
        data.collision = true;
        return;
      }
      data.attacked = true;
      data.laser = true;
      if (scene === "tower") data.towerEnergy -= 1;
    }
  }

  function simulateProgram(
    program = state.program,
    ageMode = state.ageMode,
    missionId = null,
    selectedChoice = null,
  ) {
    const mission = missionForAge(
      ageMode,
      missionId ||
        (ageMode === state.ageMode
          ? state.missionId
          : ageProfiles[ageMode].missionId),
    );
    const data = createRunData(mission);
    data.selectedChoice = selectedChoice;
    program.forEach((block) => applyExecutionStep(block, data, ageMode));
    return data;
  }

  function freeRunFeedback() {
    if (state.lastRun === "running")
      return ["正在运行", "正在按积木顺序播放作品。", "running"];
    if (state.lastRun === "idle")
      return ["准备创作", "添加积木，点击运行查看作品。", "idle"];
    if (!state.runData?.started)
      return ["还没开始", "先添加“当点击开始”积木。", "needs"];
    if (state.runData.collision)
      return ["动作未生效", "有积木的前置条件未满足，试试调整顺序。", "needs"];
    const flags = [
      ["moved", "角色移动了"],
      ["functionCalled", "画面建立了"],
      ["repeated", "节奏开始了"],
      ["conditionMet", "条件成立了"],
      ["attacked", "命中目标了"],
      ["colorChanged", "颜色改变了"],
      ["soundPlayed", "声音播放了"],
      ["turned", "角色转向了"],
    ];
    const effects = flags
      .filter(([flag]) => state.runData[flag])
      .map(([, label]) => label);
    return [
      "运行完成",
      effects.length
        ? effects.join("，") + "。"
        : "程序已启动，继续添加动作让作品发生变化。",
      "success",
    ];
  }

  function selectMission(id) {
    const mission = missions.find((item) => item.id === id);
    if (!mission) return;
    if (!isMissionUnlocked(id) && !state.completedMissions.includes(id)) {
      notify(
        `完成前 ${mission.number - 1} 个任务后，就能解锁“${mission.title}”。`,
      );
      return;
    }
    persist();
    state.freeProjectId = null;
    state.missionId = id;
    const savedProgram = state.programsByMission?.[state.ageMode]?.[id];
    state.program = clone(
      Array.isArray(savedProgram)
        ? savedProgram
        : mission.starterProgram || profile().starterProgram,
    );
    state.lastRun = "idle";
    state.runOutcome = null;
    state.runMode = null;
    state.runStep = null;
    state.runData = null;
    state.catClicked = false;
    state.view = "mission";
    persist();
  }

  function selectNextMission(id) {
    const previousMission = state.missionId;
    selectMission(id);
    if (state.missionId === id && previousMission !== id) {
      state.view = "workbench";
      persist();
    }
  }

  function switchAgeMode(nextAge) {
    if (!ageProfiles[nextAge] || nextAge === state.ageMode) return;
    timers.clearTimeout(runTimer);
    persist();
    state.freeProjectId = null;
    if (state.view === "free-workbench") state.view = "create";
    state.ageMode = nextAge;
    missions = missionsForAge(nextAge);
    state.recommendationOffset = 0;
    state.missionId = ageProfiles[nextAge].missionId;
    const nextMission = missionForAge(nextAge, state.missionId);
    const savedMissionProgram =
      state.programsByMission?.[nextAge]?.[nextMission.id];
    const savedModeProgram = state.programsByMode?.[nextAge];
    state.program = clone(
      Array.isArray(savedMissionProgram)
        ? savedMissionProgram
        : Array.isArray(savedModeProgram)
          ? savedModeProgram
          : nextMission.starterProgram || ageProfiles[nextAge].starterProgram,
    );
    state.completedMissions = clone(completedMissionsForAge(nextAge));
    state.lastRun = "idle";
    state.runOutcome = null;
    state.runMode = null;
    state.runStep = null;
    state.runData = null;
    state.catClicked = false;
    persist();
  }

  function addBlock(type) {
    if (!blockCatalog[type]) return;
    if (
      state.view === "free-workbench" &&
      !freeTemplates[activeFreeProject()?.template]?.palette.includes(type)
    )
      return;
    timers.clearTimeout(runTimer);
    state.program.push({ type });
    state.lastRun = "idle";
    state.runOutcome = null;
    state.runMode = null;
    state.runStep = null;
    state.runData = null;
    persist();
  }

  function analyzeProgramData(
    program,
    data,
    ageMode = state.ageMode,
    missionId = state.missionId,
  ) {
    const safeData = data || createRunData();
    const types = program.map((block) => block.type);
    const mission = missionForAge(ageMode, missionId);
    const defaultRequired =
      ageMode === "young"
        ? ["start", "move"]
        : ageMode === "older"
          ? ["start", "repeat", "move", "condition", "turn"]
          : ["start", "move", "condition", "turn"];
    const requiredBlocks = mission.requiredBlocks || defaultRequired;
    const requiredOrder = mission.requiredOrder || requiredBlocks;
    const runtimeFlags = {
      start: safeData.started,
      move: safeData.moved,
      repeat: safeData.repeated,
      condition: safeData.conditionMet,
      turn: safeData.turned,
      "turn-left": safeData.leftTurned,
      sound: safeData.soundPlayed,
      variable: safeData.variableTracked,
      function: safeData.functionCalled,
      color: safeData.colorChanged,
      choice: safeData.choiceMade,
      attack: safeData.attacked,
    };
    const result = {
      hasMove: types.includes("move"),
      hasCondition: types.includes("condition"),
      hasTurn: types.includes("turn"),
      hasRepeat: types.includes("repeat"),
      collision: Boolean(safeData.collision),
      missingType: null,
    };
    const missingType = requiredBlocks.find((type) => !types.includes(type));
    if (safeData.collision)
      return { ...result, outcome: "needs", reason: "wrong-order" };
    if (missingType) {
      return {
        ...result,
        outcome: ["start", "move"].includes(missingType) ? "needs" : "almost",
        reason: `missing-${missingType}`,
        missingType,
      };
    }
    let orderIndex = -1;
    const wrongOrder = requiredOrder.some((type) => {
      orderIndex = types.indexOf(type, orderIndex + 1);
      return orderIndex === -1;
    });
    if (wrongOrder)
      return { ...result, outcome: "needs", reason: "wrong-order" };
    const unmetType = requiredBlocks.find((type) => !runtimeFlags[type]);
    if (unmetType) {
      return {
        ...result,
        outcome: ["start", "move"].includes(unmetType) ? "needs" : "almost",
        reason: `missing-${unmetType}`,
        missingType: unmetType,
      };
    }
    return { ...result, outcome: "success", reason: "complete" };
  }

  function programAnalysis() {
    return analyzeProgramData(
      state.program,
      simulateProgram(
        state.program,
        state.ageMode,
        state.missionId,
        state.dialogueChoice,
      ),
    );
  }

  function simulateFreeProgram(program, project) {
    const data = createRunData(freeMission(project));
    program.forEach((block) =>
      applyExecutionStep(block, data, freeTemplates[project.template].ageMode),
    );
    return data;
  }

  function openFreeProject(id) {
    const project = state.freeProjects.find((item) => item.id === id);
    if (!project) return;
    timers.clearTimeout(runTimer);
    persist();
    state.freeProjectId = id;
    state.program = clone(project.program);
    state.view = "free-workbench";
    state.lastRun = "idle";
    state.runData = null;
    state.runStep = null;
    state.runMode = null;
    state.codeMode = false;
    persist();
  }

  function createFreeProject(template) {
    if (!freeTemplates[template]) return;
    persist();
    const project = {
      id: `free-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      template,
      title: freeTemplates[template].title,
      program: [{ type: "start" }],
      updatedAt: new Date().toISOString(),
    };
    state.freeProjects.unshift(project);
    openFreeProject(project.id);
  }

  function leaveFreeWorkbench(view) {
    timers.clearTimeout(runTimer);
    persist();
    state.freeProjectId = null;
    state.program = clone(
      state.programsByMission[state.ageMode][state.missionId] ||
        currentMission().starterProgram ||
        profile().starterProgram,
    );
    state.lastRun = "idle";
    state.runData = null;
    state.runStep = null;
    state.runMode = null;
    state.view = view;
    persist();
  }

  function beginRun(runMode, countAttempt = true) {
    timers.clearTimeout(runTimer);
    if (countAttempt) state.attempts += 1;
    state.lastRun = "running";
    state.runOutcome = null;
    state.runMode = runMode;
    state.runStep = state.program.length ? 0 : null;
    state.runData = createRunData(currentMission());
    state.runData.catClicked = state.catClicked;
    state.runData.selectedChoice = state.dialogueChoice;
    persist();
  }

  function runProgram() {
    prepareSceneSound();
    if (state.lastRun === "running") {
      if (state.runMode !== "step") return;
      state.runMode = "auto";
      persist();

      runTimer = timers.setTimeout(advanceExecution, 360);
      return;
    }
    beginRun("auto");
    if (state.program.length) {
      runTimer = timers.setTimeout(advanceExecution, 360);
    } else {
      finishRun();
    }
  }

  function advanceExecution() {
    if (state.lastRun !== "running" || state.runMode !== "auto") return;
    const index = state.runStep;
    const block = index === null ? null : state.program[index];
    if (!block) {
      finishRun();
      return;
    }
    applyExecutionStep(
      block,
      state.runData,
      state.view === "free-workbench"
        ? freeTemplates[activeFreeProject().template].ageMode
        : state.ageMode,
      true,
    );
    persist();

    if (index === state.program.length - 1) {
      runTimer = timers.setTimeout(finishRun, 700);
      return;
    }
    // 当前积木的动画播放期间保留其高亮，到下一次执行时再推进索引。
    runTimer = timers.setTimeout(() => {
      state.runStep = index + 1;
      advanceExecution();
    }, 700);
  }

  function stepProgram() {
    prepareSceneSound();
    if (state.lastRun === "running" && state.runMode === "auto") {
      notify("程序正在自动运行，请等它完成后再使用单步。");
      return;
    }
    if (state.lastRun !== "running") beginRun("step");
    timers.clearTimeout(runTimer);
    const index = state.runStep;
    const block = index === null ? null : state.program[index];
    if (!block) {
      finishRun();
      return;
    }
    applyExecutionStep(
      block,
      state.runData,
      state.view === "free-workbench"
        ? freeTemplates[activeFreeProject().template].ageMode
        : state.ageMode,
      true,
    );
    if (index === state.program.length - 1) {
      state.runStep = null;
    } else {
      state.runStep += 1;
    }
    persist();

    if (index === state.program.length - 1)
      runTimer = timers.setTimeout(finishRun, 700);
  }

  function finishRun() {
    if (state.lastRun !== "running") return;
    timers.clearTimeout(runTimer);
    const data = state.runData || createRunData(currentMission());
    if (state.view === "free-workbench") {
      state.runData = data;
      state.runStep = null;
      state.lastRun = data.started && !data.collision ? "success" : "needs";
      state.runMode = null;
      persist();

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
    if (outcome === "success") {
      state.saved = true;
      state.savedAt = new Date().toISOString();
      if (!state.completedMissions.includes(state.missionId)) {
        state.completedMissions.push(state.missionId);
        const currentIndex = missions.findIndex(
          (mission) => mission.id === state.missionId,
        );
        unlockedMission = missions[currentIndex + 1] || null;
      }
    }
    persist();
    const feedback = ageFeedback(
      [
        "程序结果",
        "回到积木区检查执行顺序。",
        outcome === "success" ? "success" : "needs",
      ],
      analysis,
    );
    const unlockCopy = unlockedMission
      ? ` 下一关“${unlockedMission.title}”已解锁。`
      : "";
    notify(
      feedback[0] === "任务完成"
        ? `${feedback[0]}！${feedback[1]}${unlockCopy}`
        : feedback[1],
    );
  }

  function resetProgram() {
    timers.clearTimeout(runTimer);
    state.program =
      state.view === "free-workbench"
        ? [{ type: "start" }]
        : clone(currentMission().starterProgram || profile().starterProgram);
    state.lastRun = "idle";
    state.runOutcome = null;
    state.runMode = null;
    state.runStep = null;
    state.runData = null;
    state.catClicked = false;
    persist();
    notify("程序已回到最初状态，可以重新尝试。");
  }

  function reorderProgram(sourceIndex, targetIndex) {
    if (
      sourceIndex === targetIndex ||
      sourceIndex < 0 ||
      targetIndex < 0 ||
      sourceIndex >= state.program.length
    )
      return;
    timers.clearTimeout(runTimer);
    const [movedBlock] = state.program.splice(sourceIndex, 1);
    const insertIndex =
      sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    state.program.splice(
      Math.min(insertIndex, state.program.length),
      0,
      movedBlock,
    );
    state.lastRun = "idle";
    state.runOutcome = null;
    state.runMode = null;
    state.runStep = null;
    state.runData = null;
    persist();
  }

  function programCode() {
    const lines = [];
    const openBlocks = [];
    let indentLevel = 0;
    const scene = currentMission().scene || "space";
    const conditionCode =
      {
        cat: "friendIsNearby()",
        magic: "enteredRoom()",
        star: "colorChanged()",
        book: "storyPageIsOpen()",
        maze: "frontIsWall()",
        beat: "beatIsReady()",
        pet: "mood < 50",
        signal: 'light === "green"',
        tower: "energy > 0",
        dialogue: 'choice === "A"',
        editor: "hasNextTile()",
        studio: "levelIsReady()",
      }[scene] || "hasTarget()";
    const moveCode =
      {
        cat: "walkToFriend();",
        magic: "enterRoom();",
        maze: "moveForward();",
        signal: "carMove();",
      }[scene] || "moveForward();";
    const soundCode =
      scene === "beat" ? 'playSound("drum");' : 'playSound("signal");';
    const variableCode =
      scene === "pet"
        ? "mood = mood + 10;"
        : scene === "tower"
          ? "energy = energy - 1;"
          : "state = state + 1;";
    const functionCode =
      scene === "editor"
        ? "buildLevel();"
        : scene === "studio"
          ? "publishGame();"
          : "runScene();";
    const addLine = (line, level = indentLevel) => {
      lines.push(`${"  ".repeat(level)}${line}`);
    };
    const closeBlocks = () => {
      while (openBlocks.length > 0) {
        indentLevel -= 1;
        const blockType = openBlocks.pop();
        addLine(blockType === "condition" ? "}" : "});", indentLevel);
      }
    };

    state.program.forEach((block) => {
      if (block.type === "start") {
        closeBlocks();
        addLine("whenGameStarts(() => {");
        openBlocks.push("start");
        indentLevel = 1;
        return;
      }
      if (block.type === "move") {
        addLine(moveCode);
        return;
      }
      if (block.type === "condition") {
        addLine(`if (${conditionCode}) {`);
        openBlocks.push("condition");
        indentLevel += 1;
        return;
      }
      if (block.type === "turn") {
        addLine("turnRight();");
        return;
      }
      if (block.type === "turn-left") {
        addLine("turnLeft();");
        return;
      }
      if (block.type === "repeat") {
        addLine("repeat(() => {");
        openBlocks.push("repeat");
        indentLevel += 1;
        return;
      }
      if (block.type === "sound") {
        addLine(soundCode);
        return;
      }
      if (block.type === "variable") {
        addLine(variableCode);
        return;
      }
      if (block.type === "function") {
        addLine(functionCode);
        return;
      }
      if (block.type === "color") {
        addLine("changeColor();");
        return;
      }
      if (block.type === "choice") {
        addLine("choice = askPlayer();");
        return;
      }
      if (block.type === "attack") {
        addLine("fireCannon();");
        return;
      }
      addLine("// new block");
    });

    closeBlocks();
    const code = lines.join("\n");
    return code || "// 从积木库添加一个动作";
  }

  function workbenchStatus() {
    const mission = currentMission();
    const nextMission = nextMissionForCurrent();
    const currentCopy = missionCopy();
    const analysis = programAnalysis();
    const hasCondition = analysis.hasCondition;
    let feedback =
      state.lastRun === "success"
        ? ["任务完成", mission.successFeedback || "你的作品完成了。", "success"]
        : state.lastRun === "running"
          ? [
              "程序运行中",
              `《${mission.title}》正在执行你的积木，观察场景如何变化。`,
              "running",
            ]
          : state.lastRun === "almost"
            ? [
                "再试一步",
                "作品已经开始变化了，再补上任务要求的积木。",
                "almost",
              ]
            : state.lastRun === "needs"
              ? analysis.reason === "wrong-order"
                ? ["顺序需要调整", "请按照任务提示从上到下排列积木。", "needs"]
                : analysis.reason === "missing-move"
                  ? [
                      "还缺一个动作",
                      "先添加一个动作积木，让作品开始执行。",
                      "needs",
                    ]
                  : ["需要调整", "回到积木区检查执行顺序和任务目标。", "needs"]
              : [
                  "程序观察",
                  mission.canvasTip ||
                    (hasCondition
                      ? `试着点击运行，观察${mission.title}如何根据条件做出变化。`
                      : "先从积木库添加一个动作，再试着运行程序。"),
                  "idle",
                ];
    if (["success", "almost", "needs"].includes(state.lastRun))
      feedback = ageFeedback(feedback, analysis);
    const stageState = ["running", "success", "almost", "needs"].includes(
      state.lastRun,
    )
      ? state.lastRun
      : "idle";
    const currentBlock =
      state.lastRun === "running" && state.runStep !== null
        ? state.program[state.runStep]
        : null;
    const currentBlockLabel = currentBlock
      ? blockItem(currentBlock.type, mission).label
      : "";
    const autoRunning = state.lastRun === "running" && state.runMode === "auto";
    const stageLabel = {
      idle: "准备开始",
      running: currentBlockLabel ? `执行：${currentBlockLabel}` : "作品执行中",
      success:
        state.ageMode === "young"
          ? "动画完成"
          : state.ageMode === "older"
            ? "项目通过"
            : "任务完成",
      almost: "还差一步",
      needs: state.ageMode === "young" ? "再试一次" : "需要调整",
    }[stageState];
    const runLabel =
      state.lastRun === "running"
        ? state.runMode === "step"
          ? "继续运行"
          : "运行中"
        : "运行";
    const runIcon = autoRunning ? "◌" : "▶";
    return {
      mission,
      nextMission,
      currentCopy,
      feedback,
      stageLabel,
      autoRunning,
      runLabel,
      runIcon,
    };
  }

  function handleAction(action, dataset = {}) {
    if (action === "editor-cell") {
      if (currentMission().scene !== "editor" || state.lastRun === "running")
        return;
      const cell = Number(dataset.cell);
      if (!Number.isInteger(cell) || cell < 0 || cell >= 30) return;
      state.editorTiles = state.editorTiles.includes(cell)
        ? state.editorTiles.filter((selected) => selected !== cell)
        : [...state.editorTiles, cell];
      persist();
    } else if (action === "dialogue-choice") {
      if (currentMission().scene !== "dialogue" || state.lastRun === "running")
        return;
      state.dialogueChoice = dataset.choice;
      state.lastRun = "idle";
      state.runData = null;
      persist();
    } else if (action === "cat-click") {
      if (currentMission().scene !== "cat") return;
      state.catClicked = true;
      if (state.runData?.scene === "cat") state.runData.catClicked = true;
      persist();

      notify("小猫看见你啦！现在运行程序，让它走到朋友身边。");
    } else if (action === "continue" || action === "start-mission") {
      state.view = "workbench";
      persist();
    } else if (action === "back-map") {
      state.view = "map";
      persist();
    } else if (action === "run") {
      runProgram();
    } else if (action === "reset-program") {
      resetProgram();
    } else if (action === "hint") {
      state.hintsUsed += 1;
      notify(currentMission().hint || "观察执行顺序，再试着修改一个积木。");
    } else if (action === "save-work") {
      if (state.view === "free-workbench") {
        persist();
        notify("自由作品已保存到“我的作品”。");
        return;
      }
      state.saved = true;
      state.savedAt = new Date().toISOString();
      persist();
      notify("作品已保存到“我的作品”。");
    } else if (action === "code") {
      state.codeMode = true;
      persist();
    } else if (action === "blocks") {
      state.codeMode = false;
      persist();
    } else if (action === "step") {
      stepProgram();
    } else if (action === "shuffle") {
      state.recommendationOffset =
        (state.recommendationOffset + 1) % Math.max(missions.length, 1);
      persist();
    } else if (action === "show-progress") {
      state.progressOpen = true;
      persist();
    } else if (action === "hide-progress") {
      state.progressOpen = false;
      persist();
    } else if (action === "start-free") {
      createFreeProject(dataset.template);
    } else if (action === "open-work") {
      notify("作品预览将在下一步打开。");
    } else if (action === "duplicate-work") {
      notify("已创建一个新的作品草稿。");
    } else if (action === "export-work") {
      notify("作品展示页已准备好，导出前需要家长确认。");
    }
  }

  function navigate(view) {
    timers.clearTimeout(runTimer);
    if (state.view === "free-workbench") return leaveFreeWorkbench(view);
    if (state.lastRun === "running") {
      state.lastRun = "idle";
      state.runMode = null;
      state.runStep = null;
      state.runData = null;
    }
    state.view = view;
    persist();
  }
  function removeBlock(index) {
    if (!Number.isInteger(index) || index < 0 || index >= state.program.length)
      return;
    timers.clearTimeout(runTimer);
    state.program.splice(index, 1);
    state.lastRun = "idle";
    state.runMode = null;
    state.runStep = null;
    state.runData = null;
    persist();
  }
  function renameProject(title) {
    const project = activeFreeProject();
    if (!project) return;
    project.title =
      title.trim().slice(0, 40) || freeTemplates[project.template].title;
    persist();
  }
  function dispose() {
    timers.clearTimeout(runTimer);
    timers.clearTimeout(toastTimer);
    audioContext?.close();
  }

  return {
    state,
    persist,
    notify,
    missionForAge,
    currentMission,
    activeFreeProject,
    freeMission,
    mode,
    copy,
    blockItem,
    missionCopy,
    profile,
    missionsForAge,
    recommendedMissions,
    currentMissionProgress,
    nextMissionForCurrent,
    completedMissionsForAge,
    isMissionUnlocked,
    missionRouteState,
    missionMeta,
    ageFeedback,
    runtimeStageStyle,
    createRunData,
    mazeFrontIsBlocked,
    prepareSceneSound,
    playSceneSound,
    applyExecutionStep,
    simulateProgram,
    freeRunFeedback,
    selectMission,
    selectNextMission,
    switchAgeMode,
    addBlock,
    analyzeProgramData,
    programAnalysis,
    simulateFreeProgram,
    openFreeProject,
    createFreeProject,
    leaveFreeWorkbench,
    beginRun,
    runProgram,
    advanceExecution,
    stepProgram,
    finishRun,
    resetProgram,
    reorderProgram,
    programCode,
    workbenchStatus,
    handleAction,
    navigate,
    removeBlock,
    renameProject,
    dispose,
  };
}
