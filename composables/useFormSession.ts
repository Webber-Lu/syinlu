import { computed } from 'vue'
import { useRoute } from 'vue-router'

export const useFormSession = (formType: string) => {
  const route = useRoute()
  
  const editingId = computed(() => {
    return (route.query.id || route.query.edit || route.query.view) as string | undefined
  })
  
  const saveStep = (step: number) => {
    const id = editingId.value
    if (!id) return
    
    if (typeof window !== 'undefined') {
      const key = `${formType}-form-step-${id}`
      sessionStorage.setItem(key, step.toString())
    }
  }
  
  const restoreStep = (): number => {
    const id = editingId.value
    if (!id) return 0
    
    if (typeof window !== 'undefined') {
      const key = `${formType}-form-step-${id}`
      const saved = sessionStorage.getItem(key)
      return saved ? parseInt(saved, 10) : 0
    }
    return 0
  }
  
  const clearStep = () => {
    const id = editingId.value
    if (!id) return
    
    if (typeof window !== 'undefined') {
      const key = `${formType}-form-step-${id}`
      sessionStorage.removeItem(key)
    }
  }
  
  return { 
    saveStep, 
    restoreStep, 
    clearStep, 
    editingId,
    isEditMode: computed(() => !!editingId.value)
  }
}
