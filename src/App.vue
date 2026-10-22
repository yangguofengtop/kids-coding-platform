<script setup>
import { computed, onUnmounted, provide } from "vue";
import { createStudio } from "./composables/createStudio.js";
import { studioKey } from "./composables/useStudio.js";
import Topbar from "./components/Topbar.vue";
import Sidebar from "./components/Sidebar.vue";
import TaskMap from "./views/TaskMap.vue";
import MissionDetail from "./views/MissionDetail.vue";
import Workbench from "./views/Workbench.vue";
import Works from "./views/Works.vue";
import Create from "./views/Create.vue";
import ParentReport from "./views/ParentReport.vue";

const studio = createStudio();
provide(studioKey, studio);
const { state } = studio;
const views = {
  map: TaskMap,
  mission: MissionDetail,
  workbench: Workbench,
  "free-workbench": Workbench,
  works: Works,
  create: Create,
  parent: ParentReport,
};
const activeView = computed(() => views[state.view] || TaskMap);
onUnmounted(studio.dispose);
</script>

<template>
  <div class="app-shell">
    <Topbar />
    <div class="app-layout">
      <Sidebar />
      <main class="content">
        <div class="content-inner"><component :is="activeView" /></div>
      </main>
    </div>
    <div v-if="state.toast" class="toast" role="status" aria-live="polite">
      {{ state.toast }}
    </div>
  </div>
</template>
