<template>
  <UCard class="hover:shadow-lg transition-shadow">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold text-gray-900">{{ studentName }}</h3>
      
      <div class="flex gap-2">
        <UButton
          v-if="onEdit"
          icon="i-heroicons-pencil"
          color="green"
          variant="soft"
          size="sm"
          @click="onEdit"
        >
          編輯
        </UButton>
        <UButton
          v-if="onExport"
          icon="i-heroicons-arrow-down-tray"
          color="blue"
          variant="soft"
          size="sm"
          @click="onExport"
        >
          匯出
        </UButton>
        <UButton
          v-if="onDelete"
          icon="i-heroicons-trash"
          color="red"
          variant="soft"
          size="sm"
          @click="onDelete"
        >
          刪除
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  studentName: string
  onEdit?: () => void
  onExport?: () => void
  onDelete?: () => void
}

defineProps<Props>()
</script>
