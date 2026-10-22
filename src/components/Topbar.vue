<script setup>
import { ageModes } from "../data/catalog.js";
import { useStudio } from "../composables/useStudio.js";
const studio = useStudio();
</script>
<template>
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark" aria-hidden="true">造</div>
      <div class="brand-copy">
        <strong>造物星球</strong><span>{{ studio.mode().description }}</span>
      </div>
    </div>
    <div class="topbar-actions">
      <div class="mode-switch" aria-label="选择学习难度">
        <button
          v-for="(mode, key) in ageModes"
          :key="key"
          :class="{ active: studio.state.ageMode === key }"
          :data-age="key"
          @click="studio.switchAgeMode(key)"
        >
          {{ mode.label }}
        </button>
      </div>
      <div class="profile-chip">
        <span>创意造物屋</span><span class="avatar">造</span>
      </div>
    </div>
  </header>
</template>
