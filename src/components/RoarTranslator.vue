<template>
  <div class="roar-translator">
    <h2>猴音译者</h2>
    <div class="main-flex">
      <div class="input-group">
        <label>📝 明文输入框</label>
        <textarea v-model="plainText" rows="10" placeholder="请输入明文..."></textarea>
        <button @click="encode">编码(加密)</button>
      </div>
      <div class="input-group">
        <label>🔒 密文输入框</label>
        <textarea v-model="roarText" rows="10" placeholder="请输入密文..."></textarea>
        <button @click="decode">解码(解密)</button>
      </div>
    </div>
    <div class="settings-group">
      <label>口令设置</label>
      <textarea v-model="passcodeInput" rows="1" placeholder="口令不能变换顺序~"></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import monkeyHowl from '../monkey_howl.js'
const random_passcode=[
    "你说你不想在这里",
    "愿原力与你同在",
    "；-）"
]
const plainText = ref('')
const roarText = ref('')
const passcodeInput = ref(
    random_passcode[Math.floor(random_passcode*Math.random())]
)

function encode() {
  roarText.value = monkeyHowl.encrypt(plainText.value, passcodeInput.value)
}

function decode() {
  plainText.value = monkeyHowl.decrypt(roarText.value, passcodeInput.value)
}
</script>

<style scoped>
.roar-translator {
  width: 100%;
  margin: 40px 0;
  padding: 24px 0;
  background: #f8f8ff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border-radius: 0;
}
.main-flex {
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: flex-start;
}
.input-group {
  flex: 1 1 0;
  min-width: 0;
  margin-bottom: 0;
}
.settings-group {
  margin: 32px auto 0 auto;
  padding: 16px 0;
  border-top: 1px dashed #ccc;
  border-bottom: 1px dashed #ccc;
  text-align: center;
  max-width: 600px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}
textarea {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 18px;
  resize: vertical;
  margin-bottom: 8px;
  min-height: 120px;
  box-sizing: border-box;
}
.settings-group textarea {
  min-height: 36px;
  font-size: 20px;
  resize: none;
  margin-bottom: 0;
}
button {
  padding: 8px 22px;
  border: none;
  border-radius: 6px;
  background: #6c63ff;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #554ee2;
}
small {
  color: #888;
}
@media (max-width: 800px) {
  .main-flex {
    flex-direction: column;
    gap: 0;
  }
  .input-group {
    margin-bottom: 32px;
  }
}
</style> 