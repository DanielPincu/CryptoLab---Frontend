import { test, expect } from '@playwright/test'

test('trade flow: login → buy → sell', async ({ page }) => {
  // --- LOGIN ---
  await page.goto('/login')

  await page.getByTestId('email-input').fill('kw@easv.dk')
  await page.getByTestId('password-input').fill('DoNotTryMe')

  await page.getByTestId('login-submit').click()
  await page.waitForURL(/home/)

  // --- BUY BTC ---
  await page.goto('/research')

  await page.getByText('BTC').first().click()

  await page.getByTestId('mode-usd').click()
  await page.getByTestId('trade-input').fill('10')
  await page.getByTestId('trade-submit').click()

  await expect(page.getByTestId('trade-success')).toBeVisible()

  // --- SELL BTC ---
  await page.getByTestId('toggle-sell').click()
  await page.getByTestId('mode-usd').click()
  await page.getByTestId('trade-input').fill('5')

  await page.getByTestId('trade-submit').click()

  await expect(page.getByTestId('trade-success')).toBeVisible()
})