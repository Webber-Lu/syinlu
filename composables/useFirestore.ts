import { getFirestore } from 'firebase/firestore'
import { getApp } from 'firebase/app'

export const useFirestore = () => {
  const getDb = () => {
    return getFirestore(getApp())
  }
  
  return { getDb }
}
