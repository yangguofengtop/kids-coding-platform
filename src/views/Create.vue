<script setup>
import PreviewScene from "../components/PreviewScene.vue";
import { freeTemplates } from "../data/catalog.js";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
const items = [
  ["game", "小游戏"],
  ["story", "互动故事"],
  ["music", "节奏实验"],
];
</script>
<template>
  <div class="eyebrow">自由创作 · 没有标准答案</div>
  <div class="page-heading">
    <div>
      <h1>从一个想法开始</h1>
      <p>选择一个起点，做一个属于自己的互动作品。</p>
    </div>
    <button
      class="secondary-button"
      data-view="map"
      @click="studio.navigate('map')"
    >
      返回任务地图
    </button>
  </div>
  <section class="works-shell">
    <div class="subhead">
      <strong>选择创作起点</strong><span>可以随时保存为作品</span>
    </div>
    <div class="works-grid">
      <button
        v-for="[key, title] in items"
        :key="key"
        class="project-card"
        data-action="start-free"
        :data-template="key"
        style="text-align: left"
        @click="studio.createFreeProject(key)"
      >
        <PreviewScene
          class="project-cover"
          :mission="{ scene: freeTemplates[key].scene }"
          label="创作"
        /><strong>{{ title }}</strong
        ><span>{{ freeTemplates[key].copy }}</span>
      </button>
    </div>
  </section>
</template>
