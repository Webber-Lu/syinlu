import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  getAuth,
  updateProfile,
  type Auth,
  type User
} from 'firebase/auth'
import { doc, setDoc, getDoc, getFirestore, type Firestore } from 'firebase/firestore'
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { ref } from 'vue'
import type { Ref } from 'vue'

let firebaseAuth: Auth | null = null
let firebaseDb: Firestore | null = null
let firebaseApp: FirebaseApp | null = null

const initFirebase = () => {
  if (firebaseAuth && firebaseDb) {
    return { auth: firebaseAuth, db: firebaseDb }
  }

  // 在函數內使用 useRuntimeConfig
  const config = useRuntimeConfig()
  
  const firebaseConfig = {
    apiKey: config.public.apiKey,
    authDomain: config.public.authDomain,
    projectId: config.public.projectId,
    storageBucket: config.public.storageBucket,
    messagingSenderId: config.public.messagingSenderId,
    appId: config.public.appId
  }

  // 驗證配置是否完整
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase 配置不完整，請檢查 .env 檔案')
  }

  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!
    firebaseAuth = getAuth(firebaseApp!)
    firebaseDb = getFirestore(firebaseApp!)
    
    return { auth: firebaseAuth, db: firebaseDb }
  } catch (err: any) {
    console.error('Firebase 初始化失敗:', err)
    throw err
  }
}

// 使用模組級別的響應式狀態
const user = ref<User | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

export const useAuth = () => {
  const initAuth = () => {
    if (typeof window === 'undefined') {
      loading.value = false
      return () => {}
    }

    try {
      const { auth } = initFirebase()
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
        loading.value = false
      })
      return unsubscribe
    } catch (err: any) {
      error.value = err.message
      loading.value = false
      return () => {}
    }
  }

  const registerWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      error.value = null
      loading.value = true
      const { auth, db } = initFirebase()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUser = userCredential.user
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: newUser.email,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      return newUser
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    try {
      error.value = null
      loading.value = true
      const { auth } = initFirebase()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    try {
      error.value = null
      loading.value = true
      const { auth, db } = initFirebase()
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const firebaseUser = result.user
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      return firebaseUser
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      error.value = null
      const { auth } = initFirebase()
      await signOut(auth)
      user.value = null
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const getUserData = async (uid: string) => {
    try {
      const { db } = initFirebase()
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return userDoc.data()
      }
      return null
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  const updateDisplayName = async (displayName: string) => {
    try {
      if (!user.value) throw new Error('使用者未登入')
      
      const { db, auth } = initFirebase()
      
      // 更新 Firestore 資料庫
      await setDoc(doc(db, 'users', user.value.uid), {
        displayName,
        updatedAt: new Date().toISOString()
      }, { merge: true })
      
      // 更新 Firebase Auth 的 displayName
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName })
        // 強制重新取得使用者資料以觸發響應式更新
        user.value = { ...auth.currentUser }
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    initAuth,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    updateDisplayName,
    getUserData
  }
}