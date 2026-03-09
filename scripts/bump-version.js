#!/usr/bin/env node

/**
 * Bumps the patch version in app.json and package.json.
 * Usage: node scripts/bump-version.js
 *
 * Run this before `eas build` to ensure unique version strings
 * for App Store Connect / Google Play.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

function bumpPatch(version) {
  const parts = version.split('.')
  parts[2] = String(Number(parts[2]) + 1)
  return parts.join('.')
}

// Bump app.json
const appJsonPath = path.join(ROOT, 'app.json')
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
const oldVersion = appJson.expo.version
const newVersion = bumpPatch(oldVersion)
appJson.expo.version = newVersion
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n')

// Bump package.json
const pkgJsonPath = path.join(ROOT, 'package.json')
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
pkgJson.version = newVersion
fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n')

console.log(`Version bumped: ${oldVersion} → ${newVersion}`)
