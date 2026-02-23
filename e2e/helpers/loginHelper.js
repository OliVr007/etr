const { expect } = require("@playwright/test");

// ================================================
// Bejelentkezési segédfüggvények
// Használat: importáld be a teszt fájlba
// ================================================

/**
 * Admin felhasználóként jelentkezik be
 * @param {import('@playwright/test').Page} page
 * @param {string} username - admin felhasználónév
 * @param {string} password - admin jelszó
 */
async function loginAsAdmin(page, username, password) {
	await page.goto("/login");
	await page.fill("#username", username);
	await page.fill("#password", password);
	await page.click("button[type='submit']");
	await expect(page).toHaveURL(/\/admin/);
}

/**
 * Tanárként jelentkezik be
 * @param {import('@playwright/test').Page} page
 * @param {string} username
 * @param {string} password
 */
async function loginAsTeacher(page, username, password) {
	await page.goto("/login");
	await page.fill("#username", username);
	await page.fill("#password", password);
	await page.click("button[type='submit']");
	await expect(page).toHaveURL(/\/teacher/);
}

/**
 * Diákként jelentkezik be
 * @param {import('@playwright/test').Page} page
 * @param {string} username
 * @param {string} password
 */
async function loginAsStudent(page, username, password) {
	await page.goto("/login");
	await page.fill("#username", username);
	await page.fill("#password", password);
	await page.click("button[type='submit']");
	await expect(page).toHaveURL(/\//);
}

module.exports = { loginAsAdmin, loginAsTeacher, loginAsStudent };
