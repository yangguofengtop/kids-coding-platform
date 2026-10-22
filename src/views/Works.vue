<script setup>
import PreviewScene from "../components/PreviewScene.vue";
import { freeTemplates } from "../data/catalog.js";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
const { state } = studio;
const unlocked = (item) =>
  studio.isMissionUnlocked(item.id) ||
  state.completedMissions.includes(item.id);
</script>
<template>
  <div class="eyebrow">作品空间 · {{ studio.mode().shortLabel }}</div>
  <div class="page-heading">
    <div>
      <h1>我的作品</h1>
      <p>保存创作，再回来继续完善自己的作品。</p>
    </div>
    <button
      class="primary-button"
      data-view="create"
      @click="studio.navigate('create')"
    >
      <span class="ui-symbol">+</span><span>自由创作</span>
    </button>
  </div>
  <section class="works-shell">
    <div class="subhead">
      <strong>自由作品</strong
      ><span>{{ state.freeProjects.length }} 个作品 · 保存在这台设备</span>
    </div>
    <div class="works-grid">
      <article
        v-for="project in state.freeProjects"
        :key="project.id"
        class="project-card"
      >
        <PreviewScene
          class="project-cover"
          :mission="studio.freeMission(project)"
          label="自由作品"
        /><strong>{{ project.title }}</strong
        ><span
          >{{ freeTemplates[project.template].title }} ·
          {{ project.program.length }} 块积木</span
        >
        <div class="project-actions">
          <button
            :data-free-project="project.id"
            @click="studio.openFreeProject(project.id)"
          >
            继续创作
          </button>
        </div>
      </article>
      <p v-if="!state.freeProjects.length" class="empty-works">
        还没有自由作品，从一个创作起点开始吧。
      </p>
    </div>
  </section>
  <section class="works-shell">
    <div class="subhead">
      <strong>当前主题作品</strong
      ><span
        >{{ studio.missionsForAge().length }} 个任务原型 · 默认仅家庭可见</span
      >
    </div>
    <div class="works-grid">
      <article
        v-for="item in studio.missionsForAge()"
        :key="item.id"
        class="project-card"
        :class="{ locked: !unlocked(item) }"
      >
        <PreviewScene
          class="project-cover"
          :mission="item"
          label="作品"
        /><strong>{{ item.title }}</strong
        ><span>{{
          unlocked(item)
            ? `${item.skill} · ${item.difficulty}`
            : `完成前 ${item.number - 1} 个任务后解锁`
        }}</span>
        <div class="project-actions">
          <button
            :data-mission="item.id"
            @click="studio.selectMission(item.id)"
          >
            {{ unlocked(item) ? "继续编辑" : "查看解锁条件" }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
