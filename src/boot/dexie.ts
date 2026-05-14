// src/boot/dexie.ts

import { boot } from 'quasar/wrappers'
import { db } from '../services/db/Database'
import { useSyncStore } from '../stores/sync.store'

/**
 * Dexie/IndexedDB Boot File
 * Initializes the local database for offline storage
 */
export default boot(async ({ app }) => {
  try {
    // Initialize the database
    await db.initialize()
    console.log('✓ Local database initialized')
    console.log(`  Database: ${db.getName()}`)
    console.log(`  Version: ${db.getVersion()}`)
    console.log(`  Tables: ${db.getTableNames().join(', ')}`)

    // Make database available globally via Vue prototype
    app.config.globalProperties.$db = db

    // Also provide via Vue's provide/inject
    app.provide('db', db)

    // Initialize sync store if online
    const syncStore = useSyncStore()
    if (syncStore.status !== 'offline') {
      await syncStore.initialize()
    }
  } catch (error) {
    console.error('Failed to initialize local database:', error)

    // Don't throw - allow app to continue with limited functionality
    console.warn('App will continue with limited offline functionality')
  }
})
