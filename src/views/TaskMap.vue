<script setup>
import { computed } from "vue";
import PreviewScene from "../components/PreviewScene.vue";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
const { state } = studio;
const mission = computed(studio.currentMission);
const copy = computed(studio.missionCopy);
const missions = computed(() => studio.missionsForAge());
const tasks = computed(() => studio.recommendedMissions());
const progress = computed(studio.currentMissionProgress);
const unlocked = (item) =>
  studio.isMissionUnlocked(item.id) ||
  state.completedMissions.includes(item.id);
const taskProgress = (item) =>
  state.completedMissions.includes(item.id)
    ? 100
    : item.id === state.missionId
      ? progress.value
      : 0;
</script>
<template>
  <div class="eyebrow">{{ copy.eyebrow }}</div>
  <div class="page-heading">
    <div>
      <h1>{{ copy.mapTitle }}</h1>
      <p>{{ copy.mapLead }}</p>
    </div>
    <div class="heading-side">
      <strong>{{ studio.mode().difficulty }}</strong
      >{{ state.completedMissions.length }}/{{ missions.length }} 已完成任务
    </div>
  </div>
  <section class="continue-panel">
    <div class="continue-copy">
      <div class="eyebrow">继续挑战 · {{ mission.skill }}</div>
      <h2>{{ copy.continueTitle }}</h2>
      <p>{{ copy.continueCopy }}</p>
      <div class="continue-meta">
        <span
          >预计 <b>{{ mission.duration }}</b></span
        ><span
          >本关能力 <b>{{ copy.skill }}</b></span
        >
      </div>
      <div class="progress-row">
        <span>任务进度</span><strong>{{ progress }}%</strong>
      </div>
      <div class="progress-track large">
        <div class="progress-fill" :style="{ width: `${progress}%` }" />
      </div>
      <button
        class="primary-button"
        data-action="continue"
        @click="studio.handleAction('continue')"
      >
        <span class="ui-symbol">▶</span><span>继续编程</span>
      </button>
    </div>
    <PreviewScene :mission="mission" label="今日任务" />
  </section>
  <section class="section">
    <div class="section-heading">
      <h2>本周成长路线</h2>
      <button
        class="text-button"
        :data-action="state.progressOpen ? 'hide-progress' : 'show-progress'"
        @click="
          studio.handleAction(
            state.progressOpen ? 'hide-progress' : 'show-progress',
          )
        "
      >
        {{ state.progressOpen ? "收起主题进度" : "查看主题进度" }}
      </button>
    </div>
    <div class="route">
      <button
        v-for="item in missions"
        :key="item.id"
        class="route-node"
        :class="studio.missionRouteState(item).className"
        :data-mission="item.id"
        :disabled="!unlocked(item)"
        @click="studio.selectMission(item.id)"
      >
        <span class="route-number">{{
          unlocked(item) ? item.number : "锁"
        }}</span
        ><span class="route-status">{{
          studio.missionRouteState(item).label
        }}</span>
        <h3>{{ item.title }}</h3>
        <p>
          {{
            unlocked(item)
              ? `${item.skill} · ${item.difficulty}`
              : `完成前 ${item.number - 1} 个任务后解锁`
          }}
        </p>
      </button>
    </div>
  </section>
  <section v-if="state.progressOpen" class="topic-progress">
    <div class="section-heading">
      <h2>主题进度</h2>
      <span
        >{{ state.completedMissions.length }}/{{
          missions.length
        }}
        个任务已完成</span
      >
    </div>
    <div class="topic-progress-list">
      <div v-for="item in missions" :key="item.id" class="topic-progress-row">
        <div>
          <strong>{{ item.title }}</strong
          ><span>{{
            state.completedMissions.includes(item.id)
              ? "已完成"
              : item.id === state.missionId
                ? "正在学习"
                : unlocked(item)
                  ? "已解锁"
                  : "待解锁"
          }}</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: `${taskProgress(item)}%` }"
          />
        </div>
        <b>{{ taskProgress(item) }}%</b>
      </div>
    </div>
  </section>
  <section class="section two-column">
    <div>
      <div class="section-heading">
        <h2>推荐任务</h2>
        <button
          class="text-button"
          data-action="shuffle"
          @click="studio.handleAction('shuffle')"
        >
          换一批
        </button>
      </div>
      <div class="task-list" data-age-task-list>
        <div
          v-for="(item, index) in tasks"
          :key="item.id"
          class="task-row"
          :class="{ locked: !unlocked(item) }"
        >
          <div class="task-main">
            <span
              class="task-icon"
              :class="index === 1 ? 'blue' : index === 2 ? 'coral' : ''"
              >{{ item.number }}</span
            >
            <div>
              <strong>{{ item.title }}</strong
              ><span>{{ studio.missionMeta(item) }}</span>
            </div>
          </div>
          <button
            class="task-action"
            :data-mission="item.id"
            :disabled="!unlocked(item)"
            @click="studio.selectMission(item.id)"
          >
            {{
              state.completedMissions.includes(item.id)
                ? "再玩一次"
                : unlocked(item)
                  ? "开始"
                  : "待解锁"
            }}
          </button>
        </div>
      </div>
    </div>
    <div>
      <div class="section-heading">
        <h2>最近作品</h2>
        <button
          class="text-button"
          data-view="works"
          @click="studio.navigate('works')"
        >
          全部作品
        </button>
      </div>
      <div class="work-list">
        <div
          v-for="item in missions.slice(0, 2)"
          :key="item.id"
          class="work-row"
        >
          <PreviewScene class="work-thumb" :mission="item" label="作品" />
          <div class="work-info">
            <strong>{{ item.title }}</strong
            ><span>{{ item.skill }} · {{ item.difficulty }}</span>
          </div>
          <span class="work-state">{{
            state.completedMissions.includes(item.id) ? "已完成" : "草稿"
          }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
