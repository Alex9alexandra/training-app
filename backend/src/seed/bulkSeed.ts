import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLASS_NAMES = [
  "Morning Yoga", "Power Lifting", "HIIT Cardio", "Pilates Core",
  "Spin Class", "Zumba", "CrossFit", "Stretching & Mobility",
  "Boxing Basics", "Functional Training", "Aqua Aerobics",
  "Boot Camp", "Body Pump", "Dance Fitness", "Meditation Flow",
];

async function seedClients(count: number): Promise<number[]> {
  console.log(`Seeding ${count} clients...`);
  const ids: number[] = [];

  const BATCH = 50;
  for (let i = 0; i < count; i += BATCH) {
    const batchSize = Math.min(BATCH, count - i);
    const created = await Promise.all(
      Array.from({ length: batchSize }, () =>
        prisma.client.create({
          data: {
            name: faker.person.fullName(),
            age: faker.number.int({ min: 16, max: 65 }),
            workouts: {
              create: Array.from(
                { length: faker.number.int({ min: 1, max: 3 }) },
                () => ({
                  name: faker.word.words(2),
                  exercises: {
                    create: Array.from(
                      { length: faker.number.int({ min: 2, max: 5 }) },
                      () => ({
                        name: faker.word.words(2),
                        sets: faker.number.int({ min: 2, max: 5 }),
                        reps: faker.number.int({ min: 6, max: 15 }),
                        weight: faker.number.float({ min: 5, max: 100, fractionDigits: 1 }),
                      })
                    ),
                  },
                })
              ),
            },
            measurements: {
              create: Array.from(
                { length: faker.number.int({ min: 1, max: 4 }) },
                () => ({
                  height: faker.number.float({ min: 155, max: 200, fractionDigits: 1 }),
                  weight: faker.number.float({ min: 50, max: 120, fractionDigits: 1 }),
                  muscularMassPercent: faker.number.float({ min: 30, max: 55, fractionDigits: 1 }),
                  fatMassPercent: faker.number.float({ min: 10, max: 30, fractionDigits: 1 }),
                  boneMassPercent: faker.number.float({ min: 8, max: 15, fractionDigits: 1 }),
                  leanBodyMassPercent: faker.number.float({ min: 40, max: 75, fractionDigits: 1 }),
                  date: faker.date.past({ years: 2 }),
                })
              ),
            },
          },
          select: { id: true },
        })
      )
    );
    created.forEach((c) => ids.push(c.id));
    console.log(`  Clients: ${Math.min(i + BATCH, count)}/${count}`);
  }

  return ids;
}

async function seedGroupClasses(count: number): Promise<number[]> {
  console.log(`Seeding ${count} group classes...`);
  const ids: number[] = [];

  for (let i = 0; i < count; i++) {
    const maxCap = faker.number.int({ min: 10, max: 30 });
    const created = await prisma.groupClass.create({
      data: {
        name: CLASS_NAMES[i % CLASS_NAMES.length] + (i >= CLASS_NAMES.length ? ` ${Math.floor(i / CLASS_NAMES.length) + 1}` : ""),
        scheduledAt: faker.date.soon({ days: 60 }),
        maxCapacity: maxCap,
        currentCapacity: 0,
      },
      select: { id: true },
    });
    ids.push(created.id);
  }

  console.log(`  Done: ${count} classes`);
  return ids;
}

async function seedEnrollments(clientIds: number[], classIds: number[]) {
  console.log(`Seeding enrollments...`);
  let total = 0;

  for (const clientId of clientIds) {
    const classCount = faker.number.int({ min: 5, max: 8 });
    const shuffled = [...classIds].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, classCount);

    for (const classId of chosen) {
      try {
        await prisma.clientClassEnrollment.create({
          data: {
            clientId,
            classId,
            enrolledAt: faker.date.past({ years: 1 }),
          },
        });
        total++;

        await prisma.groupClass.update({
          where: { id: classId },
          data: { currentCapacity: { increment: 1 } },
        });
      } catch {
      }
    }
  }

  console.log(`  Done: ${total} enrollments`);
}

async function main() {
  console.log("=== BULK SEEDER START ===\n");

  const existingClients = await prisma.client.count();
  const existingClasses = await prisma.groupClass.count();

  if (existingClients > 100) {
    console.log(`Already have ${existingClients} clients — skipping client seed.`);
    console.log("If you want to re-seed, clear the tables first.");

    if (existingClasses < 10) {
      const allClientIds = (await prisma.client.findMany({ select: { id: true } })).map((c) => c.id);
      const classIds = await seedGroupClasses(100);
      await seedEnrollments(allClientIds.slice(0, 500), classIds);
    }
  } else {
    const clientIds = await seedClients(500);
    const classIds = await seedGroupClasses(100);
    await seedEnrollments(clientIds, classIds);
  }

  const [clients, classes, enrollments] = await Promise.all([
    prisma.client.count(),
    prisma.groupClass.count(),
    prisma.clientClassEnrollment.count(),
  ]);

  console.log("\n=== SEEDING COMPLETE ===");
  console.log(`Clients:     ${clients}`);
  console.log(`Classes:     ${classes}`);
  console.log(`Enrollments: ${enrollments}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
