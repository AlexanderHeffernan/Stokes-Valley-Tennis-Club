<script setup lang="ts">
import type { ClubDay } from '#shared/types/home-club-days'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const days = computed<ClubDay[]>(() => {
  try {
    const parsed = JSON.parse(props.modelValue || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})

const setDays = (items: ClubDay[]) => emit('update:modelValue', JSON.stringify(items))
const update = (index: number, key: keyof ClubDay, value: string) => {
  const items = days.value.map(item => ({ ...item }))
  const item = items[index]
  if (!item) return
  item[key] = value
  setDays(items)
}
const add = () => setDays([...days.value, { name: '', schedule: '', note: '', linkUrl: '' }])
const remove = (index: number) => {
  const item = days.value[index]
  if (!item) return
  if ((item.name || item.schedule || item.note || item.linkUrl) && !window.confirm(`Remove ${item.name || `club day ${index + 1}`}?`)) return
  setDays(days.value.filter((_, itemIndex) => itemIndex !== index))
}
</script>

<template>
  <div class="club-days-editor">
    <article v-for="(day, index) in days" :key="index">
      <header><strong>Session {{ index + 1 }}</strong><button type="button" @click="remove(index)">Remove</button></header>
      <label>Name<input :value="day.name" maxlength="80" @input="update(index, 'name', ($event.target as HTMLInputElement).value)"></label>
      <label>Day and time<input :value="day.schedule" maxlength="100" @input="update(index, 'schedule', ($event.target as HTMLInputElement).value)"></label>
      <label>Short note<textarea :value="day.note" maxlength="180" rows="3" @input="update(index, 'note', ($event.target as HTMLTextAreaElement).value)" /></label>
      <label>Link (optional)<input :value="day.linkUrl" maxlength="500" @input="update(index, 'linkUrl', ($event.target as HTMLInputElement).value)"></label>
    </article>
    <button class="club-days-editor__add" type="button" @click="add">Add session</button>
  </div>
</template>

<style scoped>
.club-days-editor,
.club-days-editor article { display: grid; gap: 0.75rem; }
.club-days-editor article { padding: 0.75rem; border: 1px solid #dfe5e3; border-radius: 3px; background: #f8faf9; }
.club-days-editor header { display: flex; align-items: center; justify-content: space-between; }
.club-days-editor header button { border: 0; background: transparent; color: var(--color-accent); cursor: pointer; font-size: 0.72rem; font-weight: 700; }
.club-days-editor label { display: grid; font-size: 0.78rem; font-weight: 700; gap: 0.4rem; }
.club-days-editor input,
.club-days-editor textarea { width: 100%; padding: 0.7rem; border: 1px solid #bac4c1; border-radius: 3px; color: var(--color-text); font-size: 0.9rem; resize: vertical; }
.club-days-editor__add { min-height: 40px; border: 1px solid var(--color-primary); border-radius: 3px; background: white; color: var(--color-primary); cursor: pointer; font-weight: 700; }
</style>
