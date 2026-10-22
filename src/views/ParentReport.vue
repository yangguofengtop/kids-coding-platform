<script setup>
import { computed } from "vue";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
const { state } = studio;
const mission = computed(studio.currentMission);
const total = computed(() => studio.missionsForAge().length);
const recent = computed(() =>
  studio
    .missionsForAge()
    .filter(
      (item) =>
        state.completedMissions.includes(item.id) ||
        item.id === state.missionId,
    )
    .slice(-3)
    .reverse(),
);
const structures = computed(
  () => new Set(state.program.map((block) => block.type)).size,
);
const structureProgress = computed(() =>
  Math.min(
    100,
    Math.round(
      (structures.value /
        Math.max(
          (mission.value.requiredBlocks || ["start", "move"]).length,
          1,
        )) *
        100,
    ),
  ),
);
const advice = computed(() =>
  state.lastRun === "needs"
    ? `可以和孩子一起检查《${mission.value.title}》的执行顺序：${mission.value.canvasTip || mission.value.hint}`
    : state.lastRun === "success"
      ? `《${mission.value.title}》已经完成，可以鼓励孩子给作品再加一个自己的规则。`
      : `当前正在练习《${mission.value.title}》，可以让孩子先说出每块积木会带来什么变化。`,
);
</script>
<template>
  <div class="eyebrow">家庭空间 · 创作成长报告</div>
  <div class="page-heading">
    <div>
      <h1>创作成长报告</h1>
      <p>这里展示当前模式中的真实任务、尝试和作品记录。</p>
    </div>
    <div class="heading-side">
      <strong>{{ studio.mode().label }}</strong
      >当前模式
    </div>
  </div>
  <section class="parent-shell">
    <div class="parent-top">
      <div>
        <h2>看见成长，不只看分数</h2>
        <p>报告只展示当前设备中真实记录的任务、尝试和自由作品。</p>
      </div>
      <button
        class="secondary-button"
        data-view="map"
        @click="studio.navigate('map')"
      >
        查看孩子端
      </button>
    </div>
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">完成任务</div>
        <div class="metric-value">{{ state.completedMissions.length }} 个</div>
        <div class="metric-note">当前模式共 {{ total }} 个任务</div>
      </div>
      <div class="metric">
        <div class="metric-label">自由作品</div>
        <div class="metric-value">{{ state.freeProjects.length }} 个</div>
        <div class="metric-note">已保存在本设备</div>
      </div>
      <div class="metric">
        <div class="metric-label">程序尝试</div>
        <div class="metric-value">{{ state.attempts }} 次</div>
        <div class="metric-note">运行程序时累计记录</div>
      </div>
    </div>
    <div class="parent-columns">
      <div>
        <div class="section-heading">
          <h2>能力成长</h2>
          <span class="text-button">当前主题：{{ mission.title }}</span>
        </div>
        <div class="growth-row">
          <div class="growth-label">
            <strong>当前任务进度</strong
            ><span>{{ studio.currentMissionProgress() }}%</span>
          </div>
          <div class="growth-bar">
            <i :style="{ width: `${studio.currentMissionProgress()}%` }" />
          </div>
        </div>
        <div class="growth-row">
          <div class="growth-label">
            <strong>程序结构</strong><span>{{ structures }} 种积木</span>
          </div>
          <div class="growth-bar">
            <i class="blue" :style="{ width: `${structureProgress}%` }" />
          </div>
        </div>
        <div class="growth-row">
          <div class="growth-label">
            <strong>任务完成率</strong
            ><span>{{ state.completedMissions.length }}/{{ total }}</span>
          </div>
          <div class="growth-bar">
            <i
              class="yellow"
              :style="{
                width: `${Math.round((state.completedMissions.length / total) * 100)}%`,
              }"
            />
          </div>
        </div>
        <div class="activity">
          <div class="section-heading">
            <h2>最近学习记录</h2>
            <span class="text-button">{{ state.attempts }} 次尝试</span>
          </div>
          <div v-for="item in recent" :key="item.id" class="activity-row">
            <time>{{ item.id === state.missionId ? "当前" : "已完成" }}</time>
            <div>
              <strong>{{ item.title }}</strong
              ><span>{{ item.description }}</span>
            </div>
            <small>{{
              state.completedMissions.includes(item.id) ? "已完成" : "进行中"
            }}</small>
          </div>
        </div>
      </div>
      <aside>
        <div class="section-heading"><h2>本次建议</h2></div>
        <div class="advice">
          <strong>围绕作品提问，让孩子解释规则</strong>
          <p>{{ advice }}</p>
        </div>
        <div class="settings">
          <div class="section-heading"><h2>家庭设置</h2></div>
          <div class="setting-row">
            <span>每日使用时长</span><span>未记录</span>
          </div>
          <div class="setting-row">
            <span>作品可见范围</span><span>仅家庭可见</span>
          </div>
          <div class="setting-row">
            <span>允许导出作品</span><span>已开启</span>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
