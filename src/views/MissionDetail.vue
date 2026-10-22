<script setup>
import { computed } from "vue";
import PreviewScene from "../components/PreviewScene.vue";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
const mission = computed(studio.currentMission);
const copy = computed(studio.missionCopy);
const bonus = computed(() =>
  studio.state.ageMode === "young"
    ? "新的角色、声音或背景。"
    : studio.state.ageMode === "older"
      ? "新的关卡、变量或函数。"
      : "新的角色、规则或第二个关卡。",
);
</script>
<template>
  <div class="eyebrow">任务准备 · {{ studio.mode().shortLabel }}</div>
  <div class="page-heading">
    <div>
      <h1>{{ copy.missionTitle }}</h1>
      <p>开始前先知道目标，完成后知道自己成长了什么。</p>
    </div>
    <div class="heading-side">
      <strong>{{ mission.difficulty || studio.mode().difficulty }}</strong
      >第 {{ mission.number }}/4 个任务
    </div>
  </div>
  <section class="mission-shell">
    <div class="subhead">
      <span
        ><button data-action="back-map" @click="studio.navigate('map')">
          ← 返回任务地图
        </button>
        / {{ mission.skill }}</span
      ><strong>自动保存已开启</strong>
    </div>
    <div class="mission-content">
      <section class="mission-visual">
        <PreviewScene :mission="mission" label="任务预览" />
        <div class="mission-text">
          <div class="eyebrow">创作主题 · 任务 {{ mission.number }}</div>
          <h2>{{ copy.missionTitle }}</h2>
          <p>{{ copy.missionCopy }}</p>
        </div>
      </section>
      <section class="mission-side">
        <div class="eyebrow">本关主要能力</div>
        <h3>{{ copy.skill }}</h3>
        <p>{{ mission.canvasTip }}</p>
        <div class="goal-row">
          <span class="goal-check">✓</span>
          <div>
            <strong>完成目标</strong><span>{{ copy.goal }}</span>
          </div>
        </div>
        <div class="goal-row">
          <span class="goal-check">◷</span>
          <div>
            <strong>预计时间</strong
            ><span>{{ mission.duration }}，可随时保存</span>
          </div>
        </div>
        <div class="goal-row">
          <span class="goal-check">✓</span>
          <div>
            <strong>你需要做到</strong><span>{{ mission.hint }}</span>
          </div>
        </div>
        <button
          class="primary-button"
          data-action="start-mission"
          @click="studio.handleAction('start-mission')"
        >
          开始编程 <span class="ui-symbol">→</span>
        </button>
        <div class="bonus">完成后可以自由添加：{{ bonus }}</div>
      </section>
    </div>
    <div class="feedback-grid">
      <div class="feedback-item">
        <strong>✓ 完成任务</strong>
        <p>{{ mission.successFeedback }}</p>
      </div>
      <div class="feedback-item">
        <strong>! 还差一步</strong>
        <p>{{ mission.hint }}</p>
      </div>
      <div class="feedback-item">
        <strong>↻ 重新尝试</strong>
        <p>可以回到任意步骤修改，看看作品会发生什么变化。</p>
      </div>
    </div>
  </section>
</template>
