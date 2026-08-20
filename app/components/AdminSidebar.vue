<script setup lang="ts">
import type { HomeHeroEditorData } from '#shared/types/home-hero'
import { getPageEditor } from '~/data/page-editors'

interface SessionData {
  csrfToken: string
  user: { displayName: string, username: string }
}

const route = useRoute()
const session = useState<SessionData | null>('admin-session', () => null)
const isOpen = useState('admin-panel-open', () => true)
const previewWidth = useState<'desktop' | 'mobile'>('admin-preview-width', () => 'desktop')
const previews = useState<Record<string, Record<string, string>>>('page-previews', () => ({}))
const savedContent = ref<Record<string, Record<string, string>>>({})
const isLoading = ref(true)
const isPublishing = ref(false)
const isUploading = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const activeEditor = computed(() => getPageEditor(route.path))
const activeContent = computed(() => activeEditor.value ? previews.value[activeEditor.value.resource] : undefined)
const hasChanges = computed(() => Boolean(
  activeEditor.value && activeContent.value
  && JSON.stringify(activeContent.value) !== JSON.stringify(savedContent.value[activeEditor.value.resource])
))
const hasAnyChanges = computed(() => Object.entries(previews.value).some(([resource, content]) => (
  JSON.stringify(content) !== JSON.stringify(savedContent.value[resource])
)))

const authenticatedRequest = async <T>(url: string, options: Parameters<typeof $fetch<T>>[1] = {}) => {
  return $fetch<T>(url, {
    ...options,
    headers: { ...options.headers, 'x-csrf-token': session.value?.csrfToken || '' }
  })
}

const loadEditor = async () => {
  try {
    session.value = await $fetch<SessionData>('/api/admin/session')
    if (!session.value) return
    await loadPageContent()
  } catch {
    session.value = null
    previews.value = {}
  } finally {
    isLoading.value = false
  }
}

const loadPageContent = async () => {
  const editor = activeEditor.value
  if (!session.value || !editor || previews.value[editor.resource]) return
  const data = await $fetch<HomeHeroEditorData>(`/api/admin/${editor.resource}`)
  const content = { ...data.content } as Record<string, string>
  savedContent.value[editor.resource] = { ...content }
  previews.value[editor.resource] = content
}

const publish = async () => {
  const editor = activeEditor.value
  if (!editor || !activeContent.value) return
  isPublishing.value = true
  errorMessage.value = ''
  statusMessage.value = ''
  try {
    const result = await authenticatedRequest<HomeHeroEditorData>(`/api/admin/${editor.resource}/publish`, {
      method: 'POST',
      body: activeContent.value
    })
    savedContent.value[editor.resource] = { ...result.content }
    previews.value[editor.resource] = { ...result.content }
    statusMessage.value = 'Changes published'
  } catch (error: unknown) {
    const response = error as { data?: { statusMessage?: string } }
    errorMessage.value = response.data?.statusMessage || 'Unable to publish changes'
  } finally {
    isPublishing.value = false
  }
}

const uploadImage = async (event: Event, fieldKey: string) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !activeContent.value) return
  isUploading.value = true
  errorMessage.value = ''
  try {
    const formData = new FormData()
    formData.append('image', file)
    const result = await authenticatedRequest<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    activeContent.value[fieldKey] = result.url
    statusMessage.value = 'Image ready to publish'
  } catch (error: unknown) {
    const response = error as { data?: { statusMessage?: string } }
    errorMessage.value = response.data?.statusMessage || 'Unable to upload the image'
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

const signOut = async () => {
  if (hasAnyChanges.value && !window.confirm('You have unpublished changes. Sign out and discard them?')) return
  await authenticatedRequest('/api/admin/logout', { method: 'POST' })
  session.value = null
  previews.value = {}
  await navigateTo('/')
}

onMounted(loadEditor)
watch(() => route.path, loadPageContent)
</script>

<template>
  <template v-if="!isLoading && session">
    <aside class="admin-sidebar" :class="{ 'admin-sidebar--open': isOpen }">
      <header class="admin-sidebar__header">
        <span>Preview</span>
        <div>
          <button type="button" :class="{ active: previewWidth === 'desktop' }" @click="previewWidth = 'desktop'">Desktop</button>
          <button type="button" :class="{ active: previewWidth === 'mobile' }" @click="previewWidth = 'mobile'">Mobile</button>
        </div>
        <button class="admin-sidebar__close" type="button" aria-label="Collapse editing panel" @click="isOpen = false">
          <BaseIcon name="panel-close" :size="24" />
        </button>
      </header>

      <p class="admin-sidebar__instructions">Preview changes live to the left, then publish for everyone else to see. Navigate to another page to edit it.</p>

      <div v-if="activeEditor && activeContent" class="admin-sidebar__body">
        <label v-for="field in activeEditor.fields" :key="field.key" :class="{ 'admin-sidebar__upload': field.type === 'image' }">
          {{ field.label }}
          <textarea
            v-if="field.type === 'textarea'"
            v-model="activeContent[field.key]"
            :maxlength="field.maxLength"
            :rows="field.rows || 4"
          />
          <input
            v-else-if="field.type === 'text'"
            v-model="activeContent[field.key]"
            :maxlength="field.maxLength"
          >
          <input
            v-else
            type="file"
            accept="image/jpeg,image/png,image/webp"
            :disabled="isUploading"
            @change="uploadImage($event, field.key)"
          >
          <span v-if="field.help">{{ isUploading ? 'Uploading…' : field.help }}</span>
        </label>

        <p v-if="errorMessage" class="admin-sidebar__message admin-sidebar__message--error" role="alert">{{ errorMessage }}</p>
        <p v-else-if="statusMessage" class="admin-sidebar__message" role="status">{{ statusMessage }}</p>

        <div class="admin-sidebar__actions">
          <button class="admin-sidebar__publish" type="button" :disabled="isPublishing || !hasChanges" @click="publish">
            {{ isPublishing ? 'Publishing…' : 'Publish changes' }}
          </button>
          <button class="admin-sidebar__sign-out" type="button" @click="signOut">Sign out</button>
        </div>
      </div>

      <div v-else class="admin-sidebar__empty">
        <strong>Nothing to edit here yet</strong>
        <p>Navigate through the website normally. Editing controls will appear for pages that support them.</p>
        <button class="admin-sidebar__sign-out" type="button" @click="signOut">Sign out</button>
      </div>
    </aside>
  </template>
</template>

<style scoped>
.admin-sidebar {
  position: fixed;
  z-index: 210;
  top: 0;
  right: 0;
  display: flex;
  width: min(380px, 100%);
  height: 100svh;
  border-left: 1px solid #cfd7d4;
  background: white;
  box-shadow: -12px 0 35px rgb(0 37 30 / 16%);
  color: var(--color-text);
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 300ms ease;
}

.admin-sidebar--open {
  transform: translateX(0);
}

.admin-sidebar__header {
  display: flex;
  min-height: 64px;
  padding: 0.7rem 0.8rem 0.7rem 1rem;
  align-items: center;
  background: var(--color-primary);
  color: white;
  gap: 0.7rem;
}

.admin-sidebar__header > span {
  margin-right: auto;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.admin-sidebar__header > div {
  display: flex;
}

.admin-sidebar__header > div button {
  padding: 0.35rem 0.5rem;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: rgb(255 255 255 / 68%);
  cursor: pointer;
  font-size: 0.72rem;
}

.admin-sidebar__header > div button.active {
  background: white;
  color: var(--color-primary);
}

.admin-sidebar__header .admin-sidebar__close {
  display: grid;
  width: 42px;
  height: 42px;
  border: 0;
  background: transparent;
  color: white;
  cursor: pointer;
  place-items: center;
}

.admin-sidebar__instructions {
  margin: 0;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #e1e6e4;
  color: #66716e;
  font-size: 0.76rem;
  line-height: 1.5;
}

.admin-sidebar__body {
  display: flex;
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
  flex-direction: column;
  gap: 1rem;
}

.admin-sidebar__body label {
  display: grid;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 0.4rem;
}

.admin-sidebar__body input:not([type='file']),
.admin-sidebar__body textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #bac4c1;
  border-radius: 3px;
  color: var(--color-text);
  font-size: 0.9rem;
  resize: vertical;
}

.admin-sidebar__body input:focus,
.admin-sidebar__body textarea:focus {
  border-color: var(--color-primary);
  outline: 3px solid rgb(218 223 60 / 40%);
}

.admin-sidebar__upload span {
  color: #67726f;
  font-size: 0.72rem;
  font-weight: 400;
}

.admin-sidebar__message {
  margin: 0;
  color: #28612f;
  font-size: 0.78rem;
}

.admin-sidebar__message--error {
  color: #a92300;
}

.admin-sidebar__actions {
  display: grid;
  margin-top: auto;
  grid-template-columns: 1fr auto;
  gap: 0.65rem;
}

.admin-sidebar__publish,
.admin-sidebar__sign-out {
  min-height: 50px;
  border: 0;
  border-radius: 3px;
  background: var(--color-secondary);
  color: var(--color-text);
  cursor: pointer;
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 700;
  text-transform: uppercase;
}

.admin-sidebar__sign-out {
  padding: 0.7rem 1rem;
  background: var(--color-accent);
  color: white;
}

.admin-sidebar__publish:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.admin-sidebar__empty {
  padding: 2rem 1.25rem;
  flex: 1;
}

.admin-sidebar__empty p {
  color: #66716e;
  font-size: 0.85rem;
  line-height: 1.5;
}

@media (max-width: 850px) {
  .admin-sidebar {
    width: min(360px, 100%);
  }
}
</style>
