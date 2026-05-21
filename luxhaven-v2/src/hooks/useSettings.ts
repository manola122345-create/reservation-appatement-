import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { CONFIG } from '../config'

export interface SiteSettings {
  telegram: string
  telegramUsername: string
  email: string
  phone: string
  address: string
  companyNumber: string
  companyName: string
}

const defaultSettings: SiteSettings = {
  telegram: CONFIG.telegram,
  telegramUsername: CONFIG.telegramUsername,
  email: CONFIG.email,
  phone: CONFIG.phone,
  address: CONFIG.address,
  companyNumber: CONFIG.companyNumber,
  companyName: CONFIG.companyName,
}

let cachedSettings: SiteSettings | null = null

export function useSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || defaultSettings)

  useEffect(() => {
    if (cachedSettings) return
    getDoc(doc(db, 'settings', 'site'))
      .then(snap => {
        if (snap.exists()) {
          const data = { ...defaultSettings, ...snap.data() } as SiteSettings
          cachedSettings = data
          setSettings(data)
        }
      })
      .catch(() => {})
  }, [])

  return settings
}
