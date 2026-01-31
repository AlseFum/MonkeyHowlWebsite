<script setup>
import { ref, computed, onMounted, onUnmounted ,provide} from 'vue'
import Desktop from "./components/Desktop.vue"
import Mobile from "./components/Mobile.vue"

const screenWidth = ref(window.innerWidth)

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
}
onMounted(() => {
  window.addEventListener('resize', updateScreenWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
const pwd = new URLSearchParams(window.location.search).get('pwd');
provide("pwds",ref(pwd ? pwd.split(',').map(s => s.trim()).filter(s => s) : [
    "你说你不想在这里",
    "愿原力与你同在",
    "；-）"
]));
const layoutType = computed(() => {
  return screenWidth.value <= 768 ? 'mobile' : 'desktop'
})
</script>

<template>
  <div class="app-root">
    <Desktop v-if="layoutType === 'desktop'"/>
    <Mobile v-else />
  </div>
</template>

<style scoped>
.app-root {
  width: 100%;
  min-height: 100vh;
  display: block;
}
</style>