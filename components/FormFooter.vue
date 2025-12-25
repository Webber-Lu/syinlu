<template>
  <div class="flex justify-between">
    <UButton
      v-if="showPrev"
      color="gray"
      variant="soft"
      :size="size"
      @click="$emit('prev')"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2" />
      上一步
    </UButton>
    <div v-else />
    
    <div class="flex gap-3">
      <UButton
        v-if="!hideCancel"
        color="gray"
        variant="outline"
        :size="size"
        @click="$emit('cancel')"
      >
        取消
      </UButton>
      <UButton
        v-if="showNext"
        :color="color"
        :size="size"
        @click="$emit('next')"
        :disabled="nextDisabled"
      >
        下一步
        <UIcon name="i-heroicons-arrow-right" class="ml-2" />
      </UButton>
      <template v-else>
        <!-- 最後一步：顯示儲存和匯出按鈕 -->
        <UButton
          v-if="showExport"
          color="gray"
          :size="size"
          @click="$emit('save')"
          :loading="loading"
        >
          <UIcon name="i-heroicons-document" class="mr-2" />
          儲存
        </UButton>
        <UButton
          :color="showExport ? 'green' : 'green'"
          :size="size"
          @click="showExport ? $emit('export') : $emit('save')"
          :loading="showExport ? exportLoading : loading"
        >
          <UIcon :name="showExport ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-check'" class="mr-2" />
          {{ showExport ? (exportLoading ? '匯出中...' : '匯出') : (loading ? '儲存中...' : '儲存') }}
        </UButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ButtonColor } from '#ui/types'

defineProps<{
  showPrev?: boolean
  showNext?: boolean
  showExport?: boolean
  hideCancel?: boolean
  color?: ButtonColor
  loading?: boolean
  exportLoading?: boolean
  nextDisabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>()

defineEmits<{
  prev: []
  next: []
  cancel: []
  save: []
  export: []
}>()
</script>
