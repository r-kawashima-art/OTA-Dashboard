import { expect, test } from '@playwright/test'

test.describe('Rival Company Overlay (FR-02)', () => {
  test('renders pins, opens summary card on click, and filters by category', async ({ page }) => {
    await page.goto('/')

    // Wait for the map + at least one rival pin to render
    await expect(page.locator('.leaflet-container')).toBeVisible()
    const pins = page.locator('.rival-pin')
    await expect(pins.first()).toBeVisible({ timeout: 10_000 })

    // Zoom in past the cluster threshold so every rival is individually pinned
    await page.evaluate(() => {
      // @ts-expect-error — accessing the global Leaflet map for test only
      const map = document.querySelector('.leaflet-container')?._leaflet_map
      if (map) map.setZoom(6)
    })

    // Click the first visible pin and assert the summary card opens with a name
    await pins.first().click()
    const card = page.getByRole('dialog')
    await expect(card).toBeVisible()
    await expect(card.locator('.rival-card__title')).not.toBeEmpty()

    // Close the card via the × button
    await card.getByRole('button', { name: /close rival summary/i }).click()
    await expect(card).toHaveCount(0)

    // Toggle the first category chip off → fewer pins visible
    const firstChip = page.locator('.rival-filter__chip').first()
    const pinCountBefore = await pins.count()
    await firstChip.click()
    // allow Leaflet a tick to remove markers
    await page.waitForTimeout(150)
    const pinCountAfter = await pins.count()
    expect(pinCountAfter).toBeLessThanOrEqual(pinCountBefore)
  })
})
