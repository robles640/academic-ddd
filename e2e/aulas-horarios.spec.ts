import { test, expect, type Page } from '@playwright/test';
import { randomBytes } from 'node:crypto';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'Admin123!';

function suffix(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

function buildCandidateSlots(): Array<{
  day: string;
  start: string;
  end: string;
  slot: string;
}> {
  const days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  const candidates: Array<{
    day: string;
    start: string;
    end: string;
    slot: string;
  }> = [];

  for (const day of days) {
    for (let hour = 6; hour <= 19; hour += 1) {
      for (const minute of ['00', '10', '20', '30', '40', '50']) {
        const startHour = String(hour).padStart(2, '0');
        const endHour = String(hour + 2).padStart(2, '0');
        const start = `${startHour}:${minute}`;
        const end = `${endHour}:${minute}`;
        candidates.push({
          day,
          start,
          end,
          slot: `${day} ${start}-${end}`,
        });
      }
    }
  }

  return candidates;
}

async function pickUnusedSlots(page: Page) {
  const existingTexts = await page.locator('tbody tr').allTextContents();
  const candidates = buildCandidateSlots();
  const available = candidates.filter(
    (candidate) => !existingTexts.some((text) => text.includes(candidate.slot)),
  );

  if (available.length < 2) {
    throw new Error('No se encontraron suficientes horarios libres para el e2e');
  }

  return {
    created: available[0],
    updated: available[1],
  };
}

test.describe('Aulas y horarios (e2e)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: /iniciar sesi[oó]n/i }),
    ).toBeVisible();
    await page.getByLabel(/usuario/i).fill(ADMIN_USER);
    await page.getByLabel(/contrase[nñ]a/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('crea, edita y elimina aulas y horarios', async ({ page }) => {
    const code1 = `LAB-${suffix()}`;
    const code2 = `LAB-${suffix()}`;

    await page.goto('/aulas');
    await expect(page.getByRole('heading', { name: /aulas/i })).toBeVisible();

    await page.getByLabel(/codigo/i).fill(code1);
    await page.getByLabel(/edificio/i).fill('Bloque E');
    await page.getByLabel(/capacidad/i).fill('45');
    await page.getByRole('button', { name: /crear aula/i }).click();
    await expect(page.locator('tbody tr').filter({ hasText: code1 })).toBeVisible();

    await page.getByLabel(/codigo/i).fill(code2);
    await page.getByLabel(/edificio/i).fill('Bloque F');
    await page.getByLabel(/capacidad/i).fill('60');
    await page.getByRole('button', { name: /crear aula/i }).click();
    await expect(page.locator('tbody tr').filter({ hasText: code2 })).toBeVisible();

    await page.goto('/horarios');
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();
    const schedulePair = await pickUnusedSlots(page);
    await page.getByRole('button', { name: /agregar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);

    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    await page.getByLabel(/curso/i).selectOption({ index: 2 });
    await page.getByLabel(/aula/i).selectOption({ label: `${code1} - Bloque E` });
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption(schedulePair.created.day);
    await page.getByLabel(/hora de inicio/i).fill(schedulePair.created.start);
    await page.getByLabel(/hora de fin/i).fill(schedulePair.created.end);
    await page.getByRole('button', { name: /registrar horario/i }).click();

    await expect(page).toHaveURL(/\/horarios$/);

    const scheduleRow = page
      .locator('tbody tr')
      .filter({ hasText: schedulePair.created.slot })
      .filter({ hasText: code1 });
    await expect(scheduleRow).toBeVisible();

    await scheduleRow.getByRole('button', { name: /editar/i }).click();
    await expect(page).toHaveURL(/\/horarios\/.+\/editar$/);
    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption(schedulePair.updated.day);
    await page.getByLabel(/hora de inicio/i).fill(schedulePair.updated.start);
    await page.getByLabel(/hora de fin/i).fill(schedulePair.updated.end);
    await page.getByLabel(/aula/i).selectOption({ label: `${code2} - Bloque F` });
    await page.getByRole('button', { name: /guardar cambios/i }).click();

    await expect(page).toHaveURL(/\/horarios$/);

    const updatedRow = page
      .locator('tbody tr')
      .filter({ hasText: schedulePair.updated.slot })
      .filter({ hasText: code2 });
    await expect(updatedRow).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await updatedRow.getByRole('button', { name: /eliminar/i }).click();
    await expect(
      page.locator('tbody tr').filter({ hasText: schedulePair.updated.slot }),
    ).toHaveCount(0);

    await page.goto('/aulas');

    page.once('dialog', (dialog) => dialog.accept());
    await page
      .locator('tbody tr')
      .filter({ hasText: code2 })
      .getByRole('button', { name: /eliminar/i })
      .click();
    await expect(page.locator('tbody tr').filter({ hasText: code2 })).toHaveCount(0);

    page.once('dialog', (dialog) => dialog.accept());
    await page
      .locator('tbody tr')
      .filter({ hasText: code1 })
      .getByRole('button', { name: /eliminar/i })
      .click();
    await expect(page.locator('tbody tr').filter({ hasText: code1 })).toHaveCount(0);
  });
});
