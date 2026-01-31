<template>
  <div class="roar-translator">
    <h2 class="title">译者</h2>
    <div ref="splitContainerRef" class="split-container" :class="{ dragging }">
      <div ref="topPanelRef" class="panel panel-top" :style="{ flex: `0 0 ${topPercent}%` }">
        <div
          class="input-group card"
          :class="{ collapsed: topCollapsed, squeezed: topSqueezed }"
          :style="topSqueezed ? { paddingTop: topSqueezePx + 'px', paddingBottom: topSqueezePx + 'px', paddingLeft: '0.5rem', paddingRight: '0.5rem' } : undefined"
        >
          <div class="label-row">
            <label>明文</label>
            <button type="button" class="btn-icon" title="复制" @click="copyPlain" aria-label="复制明文">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
          <div class="panel-body" :class="{ collapsed: topCollapsed }">
            <div class="panel-body-inner">
              <textarea v-model="plainText" placeholder="请输入明文..." @input="encode"></textarea>
            </div>
          </div>
        </div>
      </div>
      <div class="split-bar">
        <div
          class="split-drag"
          role="separator"
          aria-label="拖动调节上下区域"
          @mousedown="onSplitStart($event, 'mouse')"
          @touchstart.prevent="onSplitStart($event, 'touch')"
        >
          <span class="grip-dots" aria-hidden="true">⋯</span>
        </div>
        <div class="split-settings card">
          <label class="split-settings-label">口令</label>
          <textarea v-model="passcodeInput" rows="1" placeholder="口令不能变换顺序~">{{passcodeInput}}</textarea>
        </div>
      </div>
      <div ref="bottomPanelRef" class="panel panel-bottom">
        <div
          class="input-group card"
          :class="{ collapsed: bottomCollapsed, squeezed: bottomSqueezed }"
          :style="bottomSqueezed ? { paddingTop: bottomSqueezePx + 'px', paddingBottom: bottomSqueezePx + 'px', paddingLeft: '0.5rem', paddingRight: '0.5rem' } : undefined"
        >
          <div class="label-row">
            <label>密文</label>
            <button type="button" class="btn-icon" title="复制" @click="copyRoar" aria-label="复制密文">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
          <div class="panel-body" :class="{ collapsed: bottomCollapsed }">
            <div class="panel-body-inner">
              <textarea v-model="roarText" placeholder="请输入密文..." @input="decode"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted, nextTick } from 'vue'
import { encrypt, decrypt } from '../cip.js'

const pwdsRef = inject('pwds')
const list = pwdsRef?.value ?? []
const passcodeInput = ref(
  list.length ? list[Math.floor(Math.random() * list.length)] : ''
)
const plainText = ref('')
const roarText = ref('')

const splitContainerRef = ref(null)
const topPanelRef = ref(null)
const bottomPanelRef = ref(null)
const topPercent = ref(50)
const dragging = ref(false)
let pointerKind = null

const COLLAPSE_HEIGHT_PX = 108
const LABEL_ROW_HEIGHT_PX = 40
const SQUEEZE_THRESHOLD_PX = LABEL_ROW_HEIGHT_PX + 32
const topCollapsed = ref(false)
const bottomCollapsed = ref(false)
const topSqueezed = ref(false)
const bottomSqueezed = ref(false)
const topSqueezePx = ref(16)
const bottomSqueezePx = ref(16)

function updateCollapseFromHeights() {
  if (topPanelRef.value) {
    const h = topPanelRef.value.getBoundingClientRect().height
    topCollapsed.value = h < COLLAPSE_HEIGHT_PX
    if (h < SQUEEZE_THRESHOLD_PX) {
      topSqueezed.value = true
      topSqueezePx.value = Math.max(4, (h - LABEL_ROW_HEIGHT_PX) / 2)
    } else {
      topSqueezed.value = false
    }
  }
  if (bottomPanelRef.value) {
    const h = bottomPanelRef.value.getBoundingClientRect().height
    bottomCollapsed.value = h < COLLAPSE_HEIGHT_PX
    if (h < SQUEEZE_THRESHOLD_PX) {
      bottomSqueezed.value = true
      bottomSqueezePx.value = Math.max(4, (h - LABEL_ROW_HEIGHT_PX) / 2)
    } else {
      bottomSqueezed.value = false
    }
  }
}

function encode() {
  roarText.value = encrypt(plainText.value, passcodeInput.value)
}

function decode() {
  plainText.value = decrypt(roarText.value, passcodeInput.value)
}

function onSplitStart(e, kind) {
  e.preventDefault()
  dragging.value = true
  pointerKind = kind
}

function onSplitMove(e) {
  if (!dragging.value || !splitContainerRef.value) return
  if (pointerKind === 'touch') e.preventDefault()
  const rect = splitContainerRef.value.getBoundingClientRect()
  const clientY = pointerKind === 'touch' ? e.touches[0].clientY : e.clientY
  const y = clientY - rect.top
  let p = (y / rect.height) * 100
  const maxTopPct = 100 - (COLLAPSE_HEIGHT_PX / rect.height) * 100
  p = Math.max(5, Math.min(maxTopPct, p))
  topPercent.value = p
}

function onSplitEnd() {
  dragging.value = false
  pointerKind = null
}

let resizeObserver = null

onMounted(() => {
  window.addEventListener('mousemove', onSplitMove)
  window.addEventListener('mouseup', onSplitEnd)
  window.addEventListener('touchmove', onSplitMove, { passive: false })
  window.addEventListener('touchend', onSplitEnd)

  resizeObserver = new ResizeObserver(() => {
    updateCollapseFromHeights()
  })
  nextTick(() => {
    if (topPanelRef.value) resizeObserver.observe(topPanelRef.value)
    if (bottomPanelRef.value) resizeObserver.observe(bottomPanelRef.value)
    updateCollapseFromHeights()
  })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onSplitMove)
  window.removeEventListener('mouseup', onSplitEnd)
  window.removeEventListener('touchmove', onSplitMove)
  window.removeEventListener('touchend', onSplitEnd)
  if (resizeObserver) {
    if (topPanelRef.value) resizeObserver.unobserve(topPanelRef.value)
    if (bottomPanelRef.value) resizeObserver.unobserve(bottomPanelRef.value)
  }
})

function copyToClipboard(text) {
  const fallback = () => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    el.style.top = '0'
    document.body.appendChild(el)
    el.select()
    try {
      document.execCommand('copy')
    } finally {
      document.body.removeChild(el)
    }
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(fallback)
  } else {
    fallback()
  }
}

function copyPlain() {
  try {
    copyToClipboard(plainText.value)
  } catch (_) {}
}

function copyRoar() {
  try {
    copyToClipboard(roarText.value)
  } catch (_) {}
}
</script>

<style scoped>
.roar-translator {
  --card-bg: #ffffff;
  --card-border: rgba(99, 102, 241, 0.15);
  --card-shadow: 0 4px 20px rgba(99, 102, 241, 0.08);
  --label-color: #374151;
  --input-border: #e5e7eb;
  --input-focus: #6366f1;
  --btn-bg: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  --btn-hover: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  max-height: 100dvh;
  box-sizing: border-box;
  padding: 1rem 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title {
  flex-shrink: 0;
  margin: 0 0 0.75rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.split-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.panel {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: flex-basis 0.25s ease-out;
}

.split-container.dragging .panel {
  transition: none;
}

.panel-bottom {
  flex: 1;
}

.panel .card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel .input-group {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.panel-body {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
  transition: flex 0.3s ease-out, grid-template-rows 0.3s ease-out;
}

.panel-body.collapsed {
  flex: 0 0 0;
  grid-template-rows: 0fr;
  pointer-events: none;
}

.panel-body-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: 1;
  transition: opacity 0.28s ease-out;
}

.panel-body.collapsed .panel-body-inner {
  opacity: 0;
}

.panel .panel-body-inner textarea {
  flex: 1;
  min-height: 0;
  resize: none;
  margin-bottom: 0;
  width: 100%;
  display: block;
}

.split-bar {
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  min-height: 0;
  margin: 0.25rem 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.split-drag {
  flex-shrink: 0;
  width: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  user-select: none;
  cursor: row-resize;
  background: #f8fafc;
  border-right: 1px solid var(--card-border);
}

.split-settings {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}

.split-settings:hover {
  box-shadow: none;
}

.split-settings-label {
  flex-shrink: 0;
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.split-settings textarea {
  flex: 1;
  min-width: 0;
  min-height: 24px;
  height: 24px;
  padding: 0.15rem 0.35rem;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.35;
  text-align: center;
  resize: none;
  border: none;
  background: transparent;
}

.split-settings textarea:focus {
  box-shadow: none;
}

.grip-dots {
  font-size: 1rem;
  color: #94a3b8;
  letter-spacing: 0.15em;
  line-height: 1;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  padding: 1rem 1.25rem;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, padding 0.25s ease;
}

.panel .card.squeezed .label-row {
  margin-bottom: 0.2rem;
}

.card:hover {
  box-shadow: 0 8px 28px rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.25);
}

.input-group {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.label-row label {
  margin-bottom: 0;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.btn-icon:hover {
  color: var(--input-focus);
  background: rgba(99, 102, 241, 0.1);
}

.btn-icon:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35);
}

.input-group label {
  margin-bottom: 0.5rem;
}

label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--label-color);
}

textarea {
  width: 100%;
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--input-border);
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: 0.75rem;
  min-height: 100px;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
}

textarea::placeholder {
  color: #9ca3af;
}

textarea:focus {
  outline: none;
  border-color: var(--input-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.btn-primary {
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: var(--btn-bg);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  align-self: flex-start;
}

.btn-primary:hover {
  background: var(--btn-hover);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.35);
}

small {
  color: #6b7280;
  font-size: 0.875rem;
}

</style> 