<script setup>
import { computed } from "vue";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
const nav = [
  ["map", "◎", "任务地图"],
  ["works", "◇", "我的作品"],
  ["create", "+", "自由创作"],
  ["parent", "▤", "家长周报"],
];
const completed = computed(() => studio.completedMissionsForAge().length);
const total = computed(() => studio.missionsForAge().length);
</script>
<template>
  <aside class="sidebar">
    <div class="sidebar-label">我的星球</div>
    <nav class="nav-list" aria-label="主导航">
      <button
        v-for="[view, symbol, label] in nav"
        :key="view"
        class="nav-item"
        :class="{ active: studio.state.view === view }"
        :data-view="view"
        @click="studio.navigate(view)"
      >
        <span class="ui-symbol" aria-hidden="true">{{ symbol }}</span
        ><span>{{ label }}</span>
      </button>
    </nav>
    <div class="side-progress">
      <div class="side-progress-title">当前进度</div>
      <strong>{{ completed }} 个任务</strong>
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: `${(completed / total) * 100}%` }"
        />
      </div>
      <div class="side-progress-meta">
        <span>{{ studio.mode().shortLabel }}</span
        ><span>{{ completed }}/{{ total }}</span>
      </div>
    </div>
  </aside>
</template>
