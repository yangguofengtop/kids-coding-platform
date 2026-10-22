<script setup>
import { computed } from "vue";
import { freeTemplates } from "../data/catalog.js";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
const groups = computed(() => {
  const available = new Set(
    studio.state.view === "free-workbench"
      ? freeTemplates[studio.activeFreeProject().template].palette
      : studio.profile().palette,
  );
  return [
    ["事件", ["start"]],
    ["控制", ["repeat", "condition"]],
    ["动作", ["move", "turn", "turn-left"]],
    ["声音", ["sound"]],
    ["数据", ["variable"]],
    ["自定义", ["function"]],
    ["游戏", ["choice", "attack", "color"]],
  ]
    .map(([label, types]) => ({
      label,
      types: types.filter((type) => available.has(type)),
    }))
    .filter((group) => group.types.length);
});
function drag(event, type) {
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", type);
}
</script>
<template>
  <aside class="palette">
    <div class="panel-heading">积木库 <span>点击或拖入</span></div>
    <template v-for="group in groups" :key="group.label"
      ><div class="palette-group">{{ group.label }}</div>
      <button
        v-for="type in group.types"
        :key="type"
        class="palette-block"
        :class="studio.blockItem(type).category"
        draggable="true"
        :data-add-block="type"
        @click="studio.addBlock(type)"
        @dragstart="drag($event, type)"
      >
        <span class="ui-symbol" aria-hidden="true">{{
          studio.blockItem(type).symbol
        }}</span
        ><span>{{ studio.blockItem(type).label }}</span>
      </button>
    </template>
  </aside>
</template>
