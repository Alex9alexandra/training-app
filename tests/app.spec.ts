import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await page.getByText("Ana").waitFor();
  await page.locator('tr', { hasText: 'Ana' }).getByText("View").click();
});

test("add workout flow", async ({ page }) => {
  await page.getByRole('button', { name: /^add$/i }).or(page.getByText("Add", { exact: true })).click();
  await page.locator("#workoutName").fill("Leg Day");
  await page.getByTestId("saveWorkoutButton").click();
  await page.goBack(); 
  await expect(page.locator('li').getByText("Leg Day", { exact: true })).toBeVisible();
});

test("prevent adding workout with empty name", async ({ page }) => {
  await page.getByRole('button', { name: /^add$/i }).or(page.getByText("Add", { exact: true })).click();
  const saveButton = page.getByTestId("saveWorkoutButton");
  await expect(saveButton).toBeDisabled();
});

test("validation alert when exercise fields are missing", async ({ page }) => {
  await page.locator('li').first().click();
  await page.getByRole('button', { name: "Update" }).click();
  await page.getByRole('button', { name: "Add Exercise" }).click();

  await page.locator('#name-input').fill("Partial Exercise");

  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain("All fields are required!");
    await dialog.accept();
  });

  await page.getByRole('button', { name: "Save" }).click();
});

test("delete an exercise from a workout", async ({ page }) => {
  await page.locator('li').filter({ hasText: "Flexibility Training" }).click();
  await page.getByRole('button', { name: "Update" }).click();

  const exerciseRow = page.locator('tr').filter({ hasText: "Stretching" }).first();
  await exerciseRow.waitFor();
  await exerciseRow.click();
  await page.getByRole('button', { name: "Delete Exercise" }).click();

  await expect(page.locator('tr').filter({ hasText: "Stretching" })).not.toBeVisible();
});

test("delete an entire workout", async ({ page }) => {
  const workoutName = "Flexibility Training";
  const workoutItem = page.locator('li').filter({ hasText: workoutName });
  
  await workoutItem.click();
  await page.getByRole('button', { name: /delete/i }).click();

  await expect(page.locator('li').filter({ hasText: workoutName })).not.toBeVisible();
});

test("prevent invalid numeric input for exercises", async ({ page }) => {
  await page.locator('li').first().click();
  await page.getByRole('button', { name: "Update" }).click();
  await page.getByRole('button', { name: "Add Exercise" }).click();

  const setsInput = page.locator('#sets-input');
  await setsInput.type("abc");
  await expect(setsInput).toHaveValue(""); 
  
  await page.getByRole('button', { name: "Save" }).click();
});