<script setup lang="ts">
import type { HomeHeroEditorData } from '#shared/types/home-hero'
import type { HomeSponsor } from '#shared/types/home-sponsors'
import { getPageEditors } from '~/data/page-editors'

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
const openGroups = ref<string[]>([])

const activeEditors = computed(() => getPageEditors(route.path))
const hasActiveContent = computed(() => (
  activeEditors.value.length > 0 && activeEditors.value.every(editor => previews.value[editor.resource])
))
const hasChanges = computed(() => activeEditors.value.some(editor => (
  previews.value[editor.resource]
  && JSON.stringify(previews.value[editor.resource]) !== JSON.stringify(savedContent.value[editor.resource])
)))
const hasAnyChanges = computed(() => Object.entries(previews.value).some(([resource, content]) => (
  JSON.stringify(content) !== JSON.stringify(savedContent.value[resource])
)))
const editorContent = (resource: string) => previews.value[resource] || {}
const isGroupOpen = (resource: string) => openGroups.value.includes(resource)
const toggleGroup = (resource: string) => {
  openGroups.value = isGroupOpen(resource)
    ? openGroups.value.filter(item => item !== resource)
    : [...openGroups.value, resource]
}
const nestedGroupKey = (resource: string, group: string) => `${resource}:${group}`

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
  if (!session.value) return
  await Promise.all(activeEditors.value.map(async (editor) => {
    if (previews.value[editor.resource]) return
    const data = await $fetch<HomeHeroEditorData>(`/api/admin/${editor.resource}`)
    const content = { ...data.content } as Record<string, string>
    savedContent.value[editor.resource] = { ...content }
    previews.value[editor.resource] = content
  }))
}

const publish = async () => {
  const changedEditors = activeEditors.value.filter(editor => (
    previews.value[editor.resource]
    && JSON.stringify(previews.value[editor.resource]) !== JSON.stringify(savedContent.value[editor.resource])
  ))
  if (!changedEditors.length) return
  isPublishing.value = true
  errorMessage.value = ''
  statusMessage.value = ''
  try {
    await Promise.all(changedEditors.map(async (editor) => {
      const result = await authenticatedRequest<HomeHeroEditorData>(`/api/admin/${editor.resource}/publish`, {
        method: 'POST',
        body: previews.value[editor.resource]
      })
      savedContent.value[editor.resource] = { ...result.content }
      previews.value[editor.resource] = { ...result.content }
    }))
    statusMessage.value = 'Changes published'
  } catch (error: unknown) {
    const response = error as { data?: { statusMessage?: string } }
    errorMessage.value = response.data?.statusMessage || 'Unable to publish changes'
  } finally {
    isPublishing.value = false
  }
}

const uploadImage = async (event: Event, resource: string, fieldKey: string) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !previews.value[resource]) return
  isUploading.value = true
  errorMessage.value = ''
  try {
    const formData = new FormData()
    formData.append('image', file)
    const result = await authenticatedRequest<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    previews.value[resource][fieldKey] = result.url
    statusMessage.value = 'Image ready to publish'
  } catch (error: unknown) {
    const response = error as { data?: { statusMessage?: string } }
    errorMessage.value = response.data?.statusMessage || 'Unable to upload the image'
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

const sponsorItems = (resource: string, fieldKey: string): HomeSponsor[] => {
  try {
    const items = JSON.parse(editorContent(resource)[fieldKey] || '[]')
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

const setSponsorItems = (resource: string, fieldKey: string, items: HomeSponsor[]) => {
  const content = previews.value[resource]
  if (content) content[fieldKey] = JSON.stringify(items)
}

const updateSponsor = (resource: string, fieldKey: string, index: number, key: keyof HomeSponsor, value: string) => {
  const items = sponsorItems(resource, fieldKey).map(item => ({ ...item }))
  if (!items[index]) return
  items[index][key] = value
  setSponsorItems(resource, fieldKey, items)
}

const addSponsor = (resource: string, fieldKey: string) => {
  const items = sponsorItems(resource, fieldKey)
  setSponsorItems(resource, fieldKey, [
    ...items,
    { name: '', imageUrl: '', websiteUrl: '', message: '' }
  ])
}

const removeSponsor = (resource: string, fieldKey: string, index: number) => {
  const sponsor = sponsorItems(resource, fieldKey)[index]
  if (!sponsor) return
  const hasContent = Boolean(sponsor.name || sponsor.imageUrl || sponsor.websiteUrl || sponsor.message)
  if (hasContent && !window.confirm(`Remove ${sponsor.name || `sponsor ${index + 1}`}? This cannot be undone after publishing.`)) return
  setSponsorItems(
    resource,
    fieldKey,
    sponsorItems(resource, fieldKey).filter((_, itemIndex) => itemIndex !== index)
  )
}

const uploadSponsorLogo = async (event: Event, resource: string, fieldKey: string, index: number) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  isUploading.value = true
  errorMessage.value = ''
  try {
    const formData = new FormData()
    formData.append('image', file)
    const result = await authenticatedRequest<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    updateSponsor(resource, fieldKey, index, 'imageUrl', result.url)
    statusMessage.value = 'Sponsor logo ready to publish'
  } catch (error: unknown) {
    const response = error as { data?: { statusMessage?: string } }
    errorMessage.value = response.data?.statusMessage || 'Unable to upload the logo'
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
watch(activeEditors, (editors) => {
  const activeResources = new Set(editors.map(editor => editor.resource))
  openGroups.value = openGroups.value.filter(resource => activeResources.has(resource))
  if (!openGroups.value.length && editors[0]) openGroups.value = [editors[0].resource]
}, { immediate: true })
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

      <div v-if="hasActiveContent" class="admin-sidebar__body">
        <section v-for="editor in activeEditors" :key="editor.resource" class="editor-group">
          <button
            class="editor-group__toggle"
            type="button"
            :aria-expanded="isGroupOpen(editor.resource)"
            :aria-controls="`editor-group-${editor.resource}`"
            @click="toggleGroup(editor.resource)"
          >
            <span>{{ editor.label }}</span>
            <i v-if="JSON.stringify(previews[editor.resource]) !== JSON.stringify(savedContent[editor.resource])" aria-label="Unpublished changes" />
            <BaseIcon name="chevron-down" :size="18" />
          </button>
          <div
            :id="`editor-group-${editor.resource}`"
            class="editor-group__wrap"
            :class="{ 'editor-group__wrap--open': isGroupOpen(editor.resource) }"
          >
            <div class="editor-group__fields">
              <component
                :is="field.type === 'sponsors' || field.type === 'club-days' ? 'div' : 'label'"
                v-for="field in editor.fields"
                :key="field.key"
                class="admin-field"
                :class="{ 'admin-sidebar__upload': field.type === 'image' }"
              >
                <template v-if="field.type !== 'sponsors' && field.type !== 'club-days'">{{ field.label }}</template>
                <div v-if="field.type === 'sponsors'" class="sponsor-editor">
                  <article v-for="(sponsor, index) in sponsorItems(editor.resource, field.key)" :key="index" class="sponsor-editor__item">
                    <div class="sponsor-editor__heading">
                      <strong>Sponsor {{ index + 1 }}</strong>
                      <button type="button" @click="removeSponsor(editor.resource, field.key, index)">Remove</button>
                    </div>
                    <img v-if="sponsor.imageUrl" :src="sponsor.imageUrl" :alt="sponsor.name || `Sponsor ${index + 1} logo`">
                    <label>
                      Sponsor name
                      <input :value="sponsor.name" maxlength="100" @input="updateSponsor(editor.resource, field.key, index, 'name', ($event.target as HTMLInputElement).value)">
                    </label>
                    <label>
                      Website (optional)
                      <input type="url" :value="sponsor.websiteUrl" maxlength="500" @input="updateSponsor(editor.resource, field.key, index, 'websiteUrl', ($event.target as HTMLInputElement).value)">
                    </label>
                    <label>
                      Short write-up (optional)
                      <textarea :value="sponsor.message" maxlength="240" rows="3" @input="updateSponsor(editor.resource, field.key, index, 'message', ($event.target as HTMLTextAreaElement).value)" />
                    </label>
                    <label>
                      Logo
                      <input class="admin-sidebar__file-input" type="file" accept="image/jpeg,image/png,image/webp" :disabled="isUploading" @change="uploadSponsorLogo($event, editor.resource, field.key, index)">
                      <span class="admin-sidebar__upload-button">{{ sponsor.imageUrl ? 'Replace logo' : 'Upload logo' }}</span>
                      <span v-if="sponsor.imageUrl">Current logo uploaded</span>
                    </label>
                  </article>
                  <button class="sponsor-editor__add" type="button" @click="addSponsor(editor.resource, field.key)">Add sponsor</button>
                </div>
                <AdminClubDaysField
                  v-else-if="field.type === 'club-days'"
                  :model-value="editorContent(editor.resource)[field.key] || '[]'"
                  @update:model-value="editorContent(editor.resource)[field.key] = $event"
                />
                <textarea
                  v-else-if="field.type === 'textarea'"
                  v-model="editorContent(editor.resource)[field.key]"
                  :maxlength="field.maxLength"
                  :rows="field.rows || 4"
                />
                <select v-else-if="field.type === 'select'" v-model="editorContent(editor.resource)[field.key]">
                  <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
                <input
                  v-else-if="field.type === 'text' || field.type === 'color'"
                  v-model="editorContent(editor.resource)[field.key]"
                  :type="field.type"
                  :maxlength="field.maxLength"
                >
                <input
                  v-else
                  class="admin-sidebar__file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  :disabled="isUploading"
                  @change="uploadImage($event, editor.resource, field.key)"
                >
                <img v-if="field.type === 'image' && editorContent(editor.resource)[field.key]" class="admin-sidebar__image-preview" :src="editorContent(editor.resource)[field.key]" alt="Current uploaded image">
                <span v-if="field.type === 'image'" class="admin-sidebar__upload-button">{{ editorContent(editor.resource)[field.key] ? 'Replace image' : 'Upload image' }}</span>
                <span v-if="field.type === 'image' && editorContent(editor.resource)[field.key]">Current image uploaded</span>
                <span v-else-if="field.help">{{ isUploading ? 'Uploading…' : field.help }}</span>
              </component>

              <section v-for="group in editor.groups" :key="group.key" class="editor-group editor-group--nested">
                <button
                  class="editor-group__toggle editor-group__toggle--nested"
                  type="button"
                  :aria-expanded="isGroupOpen(nestedGroupKey(editor.resource, group.key))"
                  :aria-controls="`editor-group-${editor.resource}-${group.key}`"
                  @click="toggleGroup(nestedGroupKey(editor.resource, group.key))"
                >
                  <span>{{ group.label }}</span>
                  <BaseIcon name="chevron-down" :size="16" />
                </button>
                <div
                  :id="`editor-group-${editor.resource}-${group.key}`"
                  class="editor-group__wrap"
                  :class="{ 'editor-group__wrap--open': isGroupOpen(nestedGroupKey(editor.resource, group.key)) }"
                >
                  <div class="editor-group__fields">
                    <label v-for="field in group.fields" :key="field.key" class="admin-field" :class="{ 'admin-sidebar__upload': field.type === 'image' }">
                      {{ field.label }}
                      <textarea
                        v-if="field.type === 'textarea'"
                        v-model="editorContent(editor.resource)[field.key]"
                        :maxlength="field.maxLength"
                        :rows="field.rows || 4"
                      />
                      <select v-else-if="field.type === 'select'" v-model="editorContent(editor.resource)[field.key]">
                        <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                      </select>
                      <input
                        v-else-if="field.type === 'text' || field.type === 'color'"
                        v-model="editorContent(editor.resource)[field.key]"
                        :type="field.type"
                        :maxlength="field.maxLength"
                      >
                      <input
                        v-else
                        class="admin-sidebar__file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        :disabled="isUploading"
                        @change="uploadImage($event, editor.resource, field.key)"
                      >
                      <img v-if="field.type === 'image' && editorContent(editor.resource)[field.key]" class="admin-sidebar__image-preview" :src="editorContent(editor.resource)[field.key]" alt="Current uploaded image">
                      <span v-if="field.type === 'image'" class="admin-sidebar__upload-button">{{ editorContent(editor.resource)[field.key] ? 'Replace image' : 'Upload image' }}</span>
                      <span v-if="field.type === 'image' && editorContent(editor.resource)[field.key]">Current image uploaded</span>
                      <span v-else-if="field.help">{{ isUploading && field.type === 'image' ? 'Uploading…' : field.help }}</span>
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

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
  background: var(--color-accent);
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

.editor-group {
  border: 1px solid #d8dfdd;
  border-radius: 3px;
  background: white;
}

.editor-group__toggle {
  display: flex;
  width: 100%;
  min-height: 50px;
  padding: 0.7rem 0.85rem;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  align-items: center;
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 700;
  text-align: left;
  gap: 0.55rem;
}

.editor-group__toggle span {
  margin-right: auto;
}

.editor-group__toggle i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
}

.editor-group__toggle svg {
  transition: transform var(--transition-fast);
}

.editor-group__toggle[aria-expanded='true'] svg {
  transform: rotate(180deg);
}

.editor-group--nested {
  border-color: #e3e7e6;
  border-radius: 2px;
  background: #f8faf9;
}

.editor-group__toggle--nested {
  min-height: 34px;
  padding: 0.35rem 0.6rem;
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 700;
}

.editor-group--nested > .editor-group__wrap > .editor-group__fields {
  padding-inline: 0.65rem;
  gap: 0.75rem;
}

.editor-group--nested > .editor-group__wrap--open > .editor-group__fields {
  padding-top: 0.7rem;
  padding-bottom: 0.75rem;
}

.editor-group__wrap {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 250ms ease, opacity 180ms ease;
}

.editor-group__wrap--open {
  grid-template-rows: 1fr;
  opacity: 1;
}

.editor-group__fields {
  display: grid;
  min-height: 0;
  padding: 0 0.85rem;
  overflow: hidden;
  gap: 1rem;
}

.editor-group__wrap--open > .editor-group__fields {
  padding-bottom: 1rem;
  border-top: 1px solid #e5e9e8;
  padding-top: 1rem;
}

.admin-sidebar__body label,
.admin-sidebar__body .admin-field {
  display: grid;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 0.4rem;
}

.admin-sidebar__body input:not([type='file']),
.admin-sidebar__body textarea,
.admin-sidebar__body select {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #bac4c1;
  border-radius: 3px;
  color: var(--color-text);
  font-size: 0.9rem;
  resize: vertical;
}

.admin-sidebar__body input[type='color'] {
  min-height: 42px;
  padding: 0.25rem;
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

.admin-sidebar__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.admin-sidebar__image-preview {
  width: 100%;
  height: 92px;
  padding: 0.35rem;
  border: 1px solid #dfe5e3;
  background: #f8faf9;
  object-fit: contain;
}

.admin-sidebar__upload-button {
  display: grid;
  min-height: 40px;
  border: 1px solid var(--color-primary);
  border-radius: 3px;
  color: var(--color-primary) !important;
  cursor: pointer;
  font-weight: 700 !important;
  place-items: center;
}

.sponsor-editor {
  display: grid;
  gap: 0.75rem;
}

.sponsor-editor__item {
  display: grid;
  padding: 0.75rem;
  border: 1px solid #dfe5e3;
  border-radius: 3px;
  background: #f8faf9;
  gap: 0.75rem;
}

.sponsor-editor__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sponsor-editor__heading button {
  border: 0;
  background: transparent;
  color: var(--color-accent);
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
}

.sponsor-editor__item img {
  width: 100%;
  height: 72px;
  padding: 0.5rem;
  border: 1px solid #e0e5e3;
  background: white;
  object-fit: contain;
}

.sponsor-editor__add {
  min-height: 40px;
  border: 1px solid var(--color-primary);
  border-radius: 3px;
  background: white;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 700;
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
