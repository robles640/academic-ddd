import { test, expect, type Page } from '@playwright/test';
import { randomBytes } from 'node:crypto';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'Admin123!';

function suffix(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

function randomScheduleData() {
  const candidates: Array<{
    day: string;
    startTime: string;
    endTime: string;
    slot: string;
  }> = [];
  const days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  for (const day of days) {
    for (let hour = 6; hour <= 19; hour += 1) {
      for (const minute of ['00', '10', '20', '30', '40', '50']) {
        const startHour = String(hour).padStart(2, '0');
        const endHour = String(hour + 2).padStart(2, '0');
        const startTime = `${startHour}:${minute}`;
        const endTime = `${endHour}:${minute}`;
        candidates.push({
          day,
          startTime,
          endTime,
          slot: `${day} ${startTime}-${endTime}`,
        });
      }
    }
  }

  return candidates;
}

const SLOT_REGEX =
  /(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo)\s+(\d{2}:\d{2})-(\d{2}:\d{2})/;

async function createClassroom(page: Page) {
  const code = `AUTO-${suffix()}`;

  await page.goto('/aulas');
  await expect(page.getByRole('heading', { name: /aulas/i })).toBeVisible();
  await page.getByLabel(/codigo/i).fill(code);
  await page.getByLabel(/edificio/i).fill('Bloque Test');
  await page.getByLabel(/capacidad/i).fill('30');
  await page.getByRole('button', { name: /crear aula/i }).click();
  await expect(page.getByLabel(/codigo/i)).toHaveValue('');

  return `${code} - Bloque Test`;
}

function toMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function overlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(endA) > toMinutes(startB);
}

async function pickUnusedSchedule(
  existingTexts: string[],
  courseLabel: string,
) {
  const courseRows = existingTexts.filter((text) => text.includes(courseLabel));
  const candidate = randomScheduleData().find((item) => {
    return !courseRows.some((text) => {
      const match = text.match(SLOT_REGEX);
      if (!match) return false;
      const [, day, startTime, endTime] = match;
      if (day !== item.day) return false;
      return overlaps(item.startTime, item.endTime, startTime, endTime);
    });
  });

  if (!candidate) {
    throw new Error('No se encontró un horario libre para el e2e');
  }

  return candidate;
}

test.describe('Creación de horario (e2e)', () => {
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

  test('flujo completo: ir a registro, rellenar formulario, enviar y ver horario en la lista', async ({
    page,
  }) => {
    const classroomLabel = await createClassroom(page);

    await page.goto('/horarios');
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();
    const existingTexts = await page.locator('tbody tr').allTextContents();
    await page.getByRole('button', { name: /agregar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);
    await expect(
      page.getByRole('heading', { name: /agregar horario/i }),
    ).toBeVisible();

    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    const courseLabel =
      (await page.locator('#course option').nth(1).textContent())?.trim() ?? '';
    const { day, startTime, endTime, slot } = await pickUnusedSchedule(
      existingTexts,
      courseLabel,
    );
    await page.getByLabel(/curso/i).selectOption({ index: 1 });
    await page.getByLabel(/aula/i).selectOption({ label: classroomLabel });
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption(day);
    await page.getByLabel(/hora de inicio/i).fill(startTime);
    await page.getByLabel(/hora de fin/i).fill(endTime);

    await page.getByRole('button', { name: /registrar horario/i }).click();

    await expect(page).toHaveURL(/\/horarios$/);
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();

    const scheduleRow = page.locator('tbody tr').filter({ hasText: slot });
    await expect(scheduleRow).toBeVisible();
  });

  test('validación: no permite enviar sin campos obligatorios', async ({
    page,
  }) => {
    await page.goto('/horarios/registro');
    await expect(
      page.getByRole('heading', { name: /agregar horario/i }),
    ).toBeVisible();

    await page.getByRole('button', { name: /registrar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);
    await expect(page.getByLabel(/curso/i)).toHaveAttribute('required', '');
    await expect(page.getByLabel(/aula/i)).toHaveAttribute('required', '');
    await expect(
      page.getByLabel(/dia de la semana|d[ií]a de la semana/i),
    ).toHaveAttribute('required', '');
    await expect(page.getByLabel(/hora de inicio/i)).toHaveAttribute(
      'required',
      '',
    );
    await expect(page.getByLabel(/hora de fin/i)).toHaveAttribute(
      'required',
      '',
    );
  });

  test('validación: hora de fin debe ser mayor que hora de inicio', async ({
    page,
  }) => {
    const classroomLabel = await createClassroom(page);

    await page.goto('/horarios/registro');
    await expect(
      page.getByRole('heading', { name: /agregar horario/i }),
    ).toBeVisible();

    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    await page.getByLabel(/curso/i).selectOption({ index: 1 });
    await page.getByLabel(/aula/i).selectOption({ label: classroomLabel });
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption('Lunes');
    await page.getByLabel(/hora de inicio/i).fill('15:00');
    await page.getByLabel(/hora de fin/i).fill('14:00');

    await page.getByRole('button', { name: /registrar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);
    await expect(
      page.getByText('La hora de fin debe ser mayor que la hora de inicio'),
    ).toBeVisible();
  });

  test('cancelar vuelve a la lista sin crear horario', async ({ page }) => {
    const classroomLabel = await createClassroom(page);

    await page.goto('/horarios/registro');
    await expect(
      page.getByRole('heading', { name: /agregar horario/i }),
    ).toBeVisible();

    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    await page.getByLabel(/curso/i).selectOption({ index: 1 });
    await page.getByLabel(/aula/i).selectOption({ label: classroomLabel });
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption('Lunes');
    await page.getByLabel(/hora de inicio/i).fill('10:00');
    await page.getByLabel(/hora de fin/i).fill('12:00');

    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page).toHaveURL(/\/horarios$/);
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();
  });
});
