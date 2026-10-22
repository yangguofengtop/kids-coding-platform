<script setup>
import { ref } from "vue";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
const over = ref(false);
const dragging = ref(null);
function drag(event, index) {
  dragging.value = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("application/x-program-index", String(index));
}
function dragLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) over.value = false;
}
function drop(event) {
  over.value = false;
  dragging.value = null;
  const source = event.dataTransfer.getData("application/x-program-index");
  if (source !== "") {
    const target = event.target.closest("[data-program-index]");
    studio.reorderProgram(
      Number(source),
      target
        ? Number(target.dataset.programIndex)
        : studio.state.program.length,
    );
  } else studio.addBlock(event.dataTransfer.getData("text/plain"));
}
</script>
<template>
  <pre
    v-if="studio.state.codeMode"
    class="program code-program"
  ><code>{{ studio.programCode() }}</code></pre>
  <div
    v-else
    class="program"
    :class="{ 'drag-over': over }"
    data-drop-zone="program"
    @dragover.prevent="over = true"
    @dragleave="dragLeave"
    @drop.prevent="drop"
  >
    <div
      v-for="(block, index) in studio.state.program"
      :key="index"
      class="program-block"
      :class="[
        studio.blockItem(block.type).category,
        {
          dragging: dragging === index,
          executing:
            studio.state.lastRun === 'running' &&
            studio.state.runStep === index,
          'current-step':
            studio.state.lastRun === 'running' &&
            studio.state.runStep === index,
          'completed-step':
            studio.state.lastRun === 'running' &&
            studio.state.runStep !== null &&
            index < studio.state.runStep,
        },
      ]"
      draggable="true"
      :data-program-index="index"
      @dragstart="drag($event, index)"
      @dragend="
        dragging = null;
        over = false;
      "
    >
      <span class="ui-symbol" aria-hidden="true">{{
        studio.blockItem(block.type).symbol
      }}</span
      ><span>{{ studio.blockItem(block.type).label }}</span
      ><button
        class="remove-block"
        :aria-label="`删除${studio.blockItem(block.type).label}`"
        :data-remove-index="index"
        @click="studio.removeBlock(index)"
      >
        ×
      </button>
    </div>
    <div class="drop-hint">把新的积木拖到这里继续</div>
  </div>
</template>
