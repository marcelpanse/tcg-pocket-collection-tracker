#!/usr/bin/env node

// Usage: node sync-locales.js [--locale <locale>]
//
// Examples:
//   node sync-locales.js                # Sync all locales
//   node sync-locales.js --locale es-ES # Sync only Spanish locale

import fs from 'node:fs'
import path from 'node:path'
import { glob } from 'glob'

const BASE_LOCALE = 'en-US'
const LOCALES_DIR = './frontend/public/locales'
const TARGET_LOCALES = ['es-ES', 'fr-FR', 'it-IT', 'pt-BR']

// Parse command line arguments
const args = process.argv.slice(2)
const localeIndex = args.indexOf('--locale')
const specificLocale = localeIndex !== -1 ? args[localeIndex + 1] : null

function mergeTranslations(source, target, addedKeys = []) {
  const result = { ...target }

  for (const [key, value] of Object.entries(source)) {
    if (!(key in result)) {
      result[key] = value
      addedKeys.push(key)
    } else if (typeof value === 'object' && value !== null && typeof result[key] === 'object' && result[key] !== null) {
      result[key] = mergeTranslations(value, result[key], addedKeys)
    }
  }

  return result
}

function processFile(baseFile, targetFile) {
  const baseContent = JSON.parse(fs.readFileSync(baseFile, 'utf8'))

  let targetContent = {}
  if (fs.existsSync(targetFile)) {
    targetContent = JSON.parse(fs.readFileSync(targetFile, 'utf8'))
  } else {
    fs.mkdirSync(path.dirname(targetFile), { recursive: true })
  }

  const addedKeys = []
  const mergedContent = mergeTranslations(baseContent, targetContent, addedKeys)

  fs.writeFileSync(targetFile, `${JSON.stringify(mergedContent, null, 2)}\n`)

  return addedKeys.length
}

async function syncLocales() {
  const baseFiles = await glob(path.join(LOCALES_DIR, BASE_LOCALE, '**/*.json'))

  if (baseFiles.length === 0) {
    console.error(`No translation files found in ${BASE_LOCALE}`)
    process.exit(1)
  }

  // Determine which locales to sync
  let localesToSync = TARGET_LOCALES
  if (specificLocale) {
    if (!TARGET_LOCALES.includes(specificLocale)) {
      console.error(`Invalid locale: ${specificLocale}. Available locales: ${TARGET_LOCALES.join(', ')}`)
      process.exit(1)
    }
    localesToSync = [specificLocale]
  }

  console.log(`Syncing ${baseFiles.length} files to ${localesToSync.length} locale(s): ${localesToSync.join(', ')}`)

  for (const locale of localesToSync) {
    let totalAdded = 0

    for (const baseFile of baseFiles) {
      const relativePath = path.relative(path.join(LOCALES_DIR, BASE_LOCALE), baseFile)
      const targetFile = path.join(LOCALES_DIR, locale, relativePath)

      totalAdded += processFile(baseFile, targetFile)
    }

    console.log(`${locale}: ${totalAdded} keys added`)
  }
}

syncLocales().catch(console.error)
