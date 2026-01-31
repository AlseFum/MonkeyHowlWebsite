<template>
  <div class="roar-translator">
    <h2 class="title">译者</h2>
    <div class="main-flex">
      <div class="input-group card">
        <div class="label-row">
          <label>明文</label>
          <button type="button" class="btn-icon" title="复制" @click="copyPlain" aria-label="复制明文">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <textarea v-model="plainText" rows="10" placeholder="请输入明文..." @input="encode"></textarea>
      </div>
      <div class="settings-group card">
        <label>字典设置</label>
        <textarea v-model="passcodeInput" rows="1" placeholder="口令不能变换顺序~">{{passcodeInput}}</textarea>
        <div class="center-buttons">
          <button class="btn-primary" @click="decode">←解码</button>
          <button class="btn-primary" @click="encode">编码→</button>
        </div>
        <p v-if="decodeError" class="decode-error">{{ decodeError }}</p>
      </div>
      <div class="input-group card">
        <div class="label-row">
          <label>密文</label>
          <button type="button" class="btn-icon" title="复制" @click="copyRoar" aria-label="复制密文">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <textarea v-model="roarText" rows="10" placeholder="请输入密文..." @input="decode"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,inject } from 'vue'
import {encrypt, decrypt} from "../cip.js"
const pwdsRef = inject("pwds")
const list = pwdsRef?.value ?? []
const passcodeInput = ref(
  list.length ? list[Math.floor(Math.random() * list.length)] : ""
)
const plainText = ref('')
const roarText = ref('')
const decodeError = ref('')

function encode() {
  decodeError.value = ''
  roarText.value = encrypt(plainText.value, passcodeInput.value)
}

function decode() {
  decodeError.value = ''
  try {
    plainText.value = decrypt(roarText.value, passcodeInput.value)
  } catch (e) {
    decodeError.value = e instanceof Error ? e.message : '密文无法解密'
  }
}

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
  min-height: 100vh;
  box-sizing: border-box;
  padding: 1.5rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
}

.title {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.main-flex {
  display: flex;
  flex: 1;
  gap: 1.5rem;
  justify-content: center;
  align-items: stretch;
  min-height: 0;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  padding: 1.25rem;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.card:hover {
  box-shadow: 0 8px 28px rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.25);
}

.input-group {
  flex: 1 1 0;
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

.input-group .label-row + textarea {
  margin-top: 0;
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

.settings-group {
  flex: 0 0 auto;
  width: 200px;
  min-width: 180px;
  padding: 1rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-self: center;
}

.settings-group label {
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
  min-height: 140px;
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

.settings-group textarea {
  min-height: 40px;
  font-size: 1rem;
  resize: none;
  margin-bottom: 0.75rem;
  text-align: center;
}

.center-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: stretch;
  width: 100%;
}

.center-buttons .btn-primary {
  width: 100%;
}

.decode-error {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: #b91c1c;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
  text-align: center;
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

@media (max-width: 800px) {
  .main-flex {
    flex-direction: column;
    gap: 1rem;
  }
  .settings-group {
    width: 100%;
    min-width: 0;
    order: -1;
  }
  .input-group.card {
    margin-bottom: 0;
  }
  .roar-translator {
    padding: 1.25rem 0;
  }
}
</style> 