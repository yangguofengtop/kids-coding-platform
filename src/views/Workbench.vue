<script setup>
import { computed, ref, watch } from "vue";
import BlockPalette from "../components/BlockPalette.vue";
import ProgramEditor from "../components/ProgramEditor.vue";
import PreviewScene from "../components/PreviewScene.vue";
import { freeTemplates } from "../data/catalog.js";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
const { state } = studio;
const free = computed(() => state.view === "free-workbench");
const mission = computed(studio.currentMission);
const project = computed(studio.activeFreeProject);
const status = computed(() => {
  if (!free.value) return studio.workbenchStatus();
  const feedback = studio.freeRunFeedback();
  return {
    feedback,
    autoRunning: state.lastRun === "running" && state.runMode === "auto",
    runLabel: state.lastRun === "running" ? "运行中" : "运行",
    runIcon: "▶",
    stageLabel:
      state.lastRun === "running" && state.runStep !== null
        ? `执行：${studio.blockItem(state.program[state.runStep]?.type).label}`
        : feedback[0],
  };
});
const titleDraft = ref("");
watch(
  () => project.value?.id,
  () => {
    titleDraft.value = project.value?.title || "";
  },
  { immediate: true },
);
const copy = computed(studio.missionCopy);
function rename() {
  studio.renameProject(titleDraft.value);
}
function normalizeTitle() {
  rename();
  titleDraft.value = project.value.title;
}
</script>
<template>
  <div class="eyebrow">
    {{
      free
        ? `自由创作 · ${freeTemplates[project.template].title}`
        : "核心页面 · 编程工作台"
    }}
  </div>
  <div class="page-heading">
    <div>
      <h1>{{ mission.title }}</h1>
      <p>
        {{
          free
            ? freeTemplates[project.template].copy
            : `${copy.missionCopy}把想法变成可以玩的结果。`
        }}
      </p>
    </div>
    <button
      v-if="free"
      class="secondary-button"
      data-view="works"
      @click="studio.navigate('works')"
    >
      返回我的作品
    </button>
    <div v-else class="heading-side">
      <strong>{{ mission.difficulty || studio.mode().difficulty }}</strong
      >任务难度
    </div>
  </div>
  <section class="workbench-shell" :class="{ 'free-workbench': free }">
    <div class="workbench-header">
      <div class="workbench-title">
        <template v-if="free"
          ><label for="free-title">作品名称</label
          ><input
            id="free-title"
            v-model="titleDraft"
            class="free-title-input"
            maxlength="40"
            aria-label="作品名称"
            @input="rename"
            @change="normalizeTitle"
          /><span>没有固定答案，积木会按从上到下的顺序执行。</span></template
        >
        <template v-else
          ><strong>{{ mission.title }} / {{ copy.skill }}</strong
          ><span>本关目标：{{ copy.goal }}</span></template
        >
      </div>
      <div class="workbench-actions">
        <button
          data-action="save-work"
          @click="studio.handleAction('save-work')"
        >
          <span class="ui-symbol">↓</span><span>保存</span></button
        ><button
          class="run"
          data-action="run"
          :disabled="status.autoRunning"
          @click="studio.runProgram()"
        >
          <span class="ui-symbol">{{ status.runIcon }}</span
          ><span>{{ status.runLabel }}</span></button
        ><button
          v-if="!free"
          data-action="hint"
          @click="studio.handleAction('hint')"
        >
          <span class="ui-symbol">?</span><span>提示</span>
        </button>
      </div>
    </div>
    <div v-if="!free" class="stepper">
      <div class="step active"><b>1</b>看目标</div>
      <div class="step active"><b>2</b>搭积木</div>
      <div class="step" :class="{ active: state.lastRun !== 'idle' }">
        <b>3</b>运行
      </div>
      <div
        class="step"
        :class="{
          active: ['success', 'almost', 'needs'].includes(state.lastRun),
        }"
      >
        <b>4</b>检查结果
      </div>
      <div
        class="step"
        :class="{ active: state.lastRun === 'success' && state.saved }"
      >
        <b>5</b>保存
      </div>
    </div>
    <div class="workbench-grid">
      <BlockPalette />
      <section class="canvas">
        <div class="canvas-bar">
          <span>我的程序</span>
          <div class="view-toggle">
            <button
              :class="{ active: !state.codeMode }"
              data-action="blocks"
              @click="studio.handleAction('blocks')"
            >
              积木</button
            ><button
              :class="{ active: state.codeMode }"
              data-action="code"
              @click="studio.handleAction('code')"
            >
              代码
            </button>
          </div>
        </div>
        <ProgramEditor />
        <div class="canvas-tip">
          <span class="tip-symbol">!</span
          ><span>{{
            free
              ? "点击左侧积木添加；拖动积木可以调整顺序。"
              : mission.canvasTip
          }}</span>
        </div>
      </section>
      <aside class="preview-panel">
        <div class="panel-heading">
          {{ free ? "作品预览" : "运行结果" }} <span>实时预览</span>
        </div>
        <div class="preview-panel-inner">
          <div>
            <PreviewScene
              :mission="mission"
              :label="status.stageLabel"
              interactive
            />
            <div class="stage-toolbar">
              <button
                data-action="run"
                :disabled="status.autoRunning"
                @click="studio.runProgram()"
              >
                <span class="ui-symbol">{{ status.runIcon }}</span
                ><span>{{ status.runLabel }}</span></button
              ><button
                data-action="reset-program"
                @click="studio.resetProgram()"
              >
                <span class="ui-symbol">↻</span><span>重置</span></button
              ><button
                data-action="step"
                :disabled="status.autoRunning"
                @click="studio.stepProgram()"
              >
                <span class="ui-symbol">→</span><span>单步</span>
              </button>
            </div>
            <div
              class="execution-order"
              :class="{ running: state.lastRun === 'running' }"
              aria-label="程序执行顺序"
            >
              <div class="execution-heading">
                执行顺序 <span>从上到下</span>
              </div>
              <ol class="execution-list">
                <li
                  v-for="(block, index) in state.program"
                  :key="index"
                  class="execution-item"
                  :class="[
                    studio.blockItem(block.type).category,
                    {
                      'current-step':
                        state.lastRun === 'running' && state.runStep === index,
                      'completed-step':
                        state.lastRun === 'running' &&
                        state.runStep !== null &&
                        index < state.runStep,
                    },
                  ]"
                >
                  <b>{{ index + 1 }}</b
                  ><span>{{ studio.blockItem(block.type).label }}</span>
                </li>
              </ol>
            </div>
          </div>
          <div class="feedback-box">
            <h4>
              <span class="status-dot" :class="status.feedback[2]" />{{
                status.feedback[0]
              }}
            </h4>
            <p>{{ status.feedback[1] }}</p>
            <button
              v-if="!free && state.lastRun === 'success' && status.nextMission"
              class="next-mission-button"
              :data-next-mission="status.nextMission.id"
              @click="studio.selectNextMission(status.nextMission.id)"
            >
              <span class="ui-symbol">→</span
              ><span>进入下一关：{{ status.nextMission.title }}</span>
            </button>
            <div class="status-line">
              <span class="status-dot" />已自动保存 · 可随时退出
            </div>
          </div>
        </div>
      </aside>
    </div>
    <div v-if="!free" class="workbench-footer">
      <span
        >本关能力：<strong>{{ mission.skill }}</strong></span
      ><span>尝试 {{ state.attempts }} 次 · 提示 {{ state.hintsUsed }} 次</span>
    </div>
  </section>
</template>
