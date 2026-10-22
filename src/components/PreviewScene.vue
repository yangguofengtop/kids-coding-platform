<script setup>
import SceneArtwork from "./SceneArtwork.js";
import { useStudio } from "../composables/useStudio.js";
const props = defineProps({
  mission: { type: Object, required: true },
  label: { type: String, default: "作品预览" },
  interactive: Boolean,
});
const studio = useStudio();
function handleClick(event) {
  if (!props.interactive) return;
  const target = event.target.closest("[data-action]");
  if (target && event.currentTarget.contains(target)) studio.handleAction(target.dataset.action, target.dataset);
}
function handleKey(event) {
  if (
    ["Enter", " "].includes(event.key) &&
    event.target.closest('[data-action="cat-click"]')
  ) {
    event.preventDefault();
    handleClick(event);
  }
}
</script>
<template>
  <div
    :class="[
      `scene-${mission.scene || 'space'}`,
      interactive ? ['preview-stage', studio.state.lastRun] : 'space-art',
    ]"
    :style="interactive ? studio.runtimeStageStyle() : ''"
    :aria-label="`${mission.title || '创作'}预览`"
    :aria-live="interactive ? 'polite' : undefined"
    @click="handleClick"
    @keydown="handleKey"
  >
    <span v-if="interactive" class="stage-status"><i />{{ label }}</span>
    <SceneArtwork
      :key="mission.id || mission.scene"
      :mission="mission"
      :label="label"
    />
  </div>
</template>

<style>
.preview-stage .cat-hero,
.preview-stage .wizard-kid,
.preview-stage .book-fox,
.preview-stage .maze-explorer,
.preview-stage .scene-car,
.preview-stage .scene-enemy.one,
.preview-stage .scene-editor-cursor {
  transition:
    left 0.56s ease-in-out,
    top 0.56s ease-in-out,
    right 0.56s ease-in-out,
    transform 0.56s ease-in-out,
    opacity 0.28s ease;
}
@media (prefers-reduced-motion: reduce) {
  .preview-stage * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
