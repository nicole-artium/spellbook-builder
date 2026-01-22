import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

test.describe('Spellbook Export/Import', () => {
  test('creates Oath of Glory paladin spellbook, exports, refreshes, and imports', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Spellbook Builder' })).toBeVisible()

    const nameInput = page.getByPlaceholder('Character name...')
    await nameInput.fill('Mr. Mime')

    const classSelect = page.locator('select').nth(0)
    await classSelect.selectOption('paladin')

    await page.waitForFunction(() => {
      const subclassSelect = document.querySelectorAll('select')[1]
      return subclassSelect && !subclassSelect.disabled && subclassSelect.options.length > 1
    })

    const subclassSelect = page.locator('select').nth(1)
    await subclassSelect.selectOption('glory')

    const levelSelect = page.locator('select').nth(2)
    await levelSelect.selectOption('5')

    const autoFillButton = page.getByRole('button', { name: 'Auto-fill Spells' })
    await autoFillButton.click()

    await expect(page.getByText(/Added \d+ spells/)).toBeVisible({ timeout: 10000 })

    await expect(page.getByText(/\d+ spells selected/)).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export Spellbook' }).click()
    const download = await downloadPromise

    const downloadPath = path.join('/tmp', download.suggestedFilename())
    await download.saveAs(downloadPath)

    const exportedContent = fs.readFileSync(downloadPath, 'utf-8')
    const exportedData = JSON.parse(exportedContent)

    expect(exportedData.character.name).toBe('Mr. Mime')
    expect(exportedData.character.className).toBe('paladin')
    expect(exportedData.character.subclass).toBe('glory')
    expect(exportedData.character.level).toBe(5)
    expect(exportedData.spells.length).toBeGreaterThan(0)

    const exportedSpellCount = exportedData.spells.length

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Spellbook Builder' })).toBeVisible()
    await expect(page.getByPlaceholder('Character name...')).toHaveValue('')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(downloadPath)

    await expect(page.getByText('This will replace your current spellbook. Continue?')).toBeVisible()

    await page.getByRole('button', { name: 'Replace' }).click()

    await expect(page.getByText(/Imported Mr. Mime's spellbook/)).toBeVisible()

    await expect(nameInput).toHaveValue('Mr. Mime')
    await expect(classSelect).toHaveValue('paladin')
    await expect(subclassSelect).toHaveValue('glory')
    await expect(levelSelect).toHaveValue('5')

    await expect(page.getByText(`${exportedSpellCount} spells selected`)).toBeVisible()

    fs.unlinkSync(downloadPath)
  })
})
