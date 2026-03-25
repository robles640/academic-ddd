import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'Admin123!';

function uniqueSuffix(): string {
  return `${randomBytes(4).toString('hex')}`;
}

function randomScheduleData() {
  const suffix = uniqueSuffix();
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const randomDay = days[Math.floor(Math.random() * days.length)];
  const startHour = String(9 + Math.floor(Math.random() * 8)).padStart(2, '0');
  const endHour = String(parseInt(startHour) + 2).padStart(2, '0');

  return {
    day: randomDay,
    startTime: `${startHour}:00`,
    endTime: `${endHour}:00`,
    slot: `${randomDay} ${startHour}:00-${endHour}:00`,
  };
}

test.describe('Creación de horario (e2e)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await page.getByLabel(/usuario/i).fill(ADMIN_USER);
    await page.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('flujo completo: ir a registro, rellenar formulario, enviar y ver horario en la lista', async ({
    page,
  }) => {
    const { day, startTime, endTime, slot } = randomScheduleData();

    await page.goto('/horarios');
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();
    await page.getByRole('button', { name: /agregar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);
    await expect(page.getByRole('heading', { name: /agregar horario/i })).toBeVisible();

    // Seleccionar primer curso disponible
    await page.getByLabel(/curso/i).selectOption({ index: 1 });

    await page.getByLabel(/día de la semana/i).selectOption(day);
    await page.getByLabel(/hora de inicio/i).fill(startTime);
    await page.getByLabel(/hora de fin/i).fill(endTime);

    await page.getByRole('button', { name: /registrar horario/i }).click();

    await expect(page).toHaveURL(/\/horarios$/);
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();

    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByRole('cell', { name: slot, exact: true })).toBeVisible();
  });

  test('validación: no permite enviar sin campos obligatorios', async ({ page }) => {
    await page.goto('/horarios/registro');
    await expect(page.getByRole('heading', { name: /agregar horario/i })).toBeVisible();

    await page.getByRole('button', { name: /registrar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);
    await expect(page.getByLabel(/curso/i)).toHaveAttribute('required', '');
    await expect(page.getByLabel(/día de la semana/i)).toHaveAttribute('required', '');
    await expect(page.getByLabel(/hora de inicio/i)).toHaveAttribute('required', '');
    await expect(page.getByLabel(/hora de fin/i)).toHaveAttribute('required', '');
  });

  test('validación: hora de fin debe ser mayor que hora de inicio', async ({ page }) => {
    await page.goto('/horarios/registro');
    await expect(page.getByRole('heading', { name: /agregar horario/i })).toBeVisible();

    // Seleccionar primer curso disponible
    await page.getByLabel(/curso/i).selectOption({ index: 1 });
    await page.getByLabel(/día de la semana/i).selectOption('Lunes');
    await page.getByLabel(/hora de inicio/i).fill('15:00');
    await page.getByLabel(/hora de fin/i).fill('14:00'); // Hora anterior

    await page.getByRole('button', { name: /registrar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);
    await expect(page.getByText('La hora de fin debe ser mayor que la hora de inicio')).toBeVisible();
  });

  test('cancelar vuelve a la lista sin crear horario', async ({ page }) => {
    await page.goto('/horarios/registro');

    // Seleccionar primer curso disponible
    await page.getByLabel(/curso/i).selectOption({ index: 1 });
    await page.getByLabel(/día de la semana/i).selectOption('Lunes');
    await page.getByLabel(/hora de inicio/i).fill('10:00');
    await page.getByLabel(/hora de fin/i).fill('12:00');

    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page).toHaveURL(/\/horarios$/);
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();
  });
});