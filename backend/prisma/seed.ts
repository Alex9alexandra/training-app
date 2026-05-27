import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const workoutTypes = [
  "HIIT", "Strength - Upper Body", "Strength - Lower Body",
  "Push Day", "Pull Day", "Leg Day", "Cardio Endurance", "Mobility & Recovery"
];

const exercisePool = [
  "Squats", "Bench Press", "Deadlift", "Pull-ups", "Burpees",
  "Kettlebell Swings", "Lunges", "Plank", "Rowing", "Jump Rope", "Shoulder Press"
];

function getPastDate(weeksAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - weeksAgo * 14);
  return date;
}

async function main() {

   
  await prisma.$transaction([

    prisma.rolePermission.deleteMany(),
    prisma.clientClassEnrollment.deleteMany(),
    prisma.exercise.deleteMany(),
    prisma.workout.deleteMany(),
    prisma.measurement.deleteMany(),
    prisma.user.deleteMany(),

    prisma.groupClass.deleteMany(),
    prisma.client.deleteMany(),

    prisma.permission.deleteMany(),
    prisma.role.deleteMany(),
  ]);
    const adminRole = await prisma.role.create({ data: { name: "admin" } });
    const userRole = await prisma.role.create({ data: { name: "user" } });

    const adminPermission = await prisma.permission.create({ data: { name: "access_admin_dashboard" } });
    const userPermission = await prisma.permission.create({ data: { name: "access_client_dashboard" } });

    await prisma.rolePermission.create({ data: { roleId: adminRole.id, permissionId: adminPermission.id } });
    await prisma.rolePermission.create({ data: { roleId: userRole.id, permissionId: userPermission.id } });

    await prisma.user.create({
      data: {
        username: "admin",
        password: await bcrypt.hash("admin123", 10),
        email: "ale975pop@gmail.com", 
        securityQuestion: "What was the name of your first pet?",
        securityAnswer: await bcrypt.hash("pet", 10), 
        pin: await bcrypt.hash("1234", 10),
        roleId: adminRole.id,
      }
    });

    

   

    const clientsData = [
        { name: "Andrei Popescu",   age: 26, baseWeight: 72,  trend: 1,    workoutCount: 6 },
        { name: "Maria Ionescu",    age: 27, baseWeight: 60,  trend: -0.5, workoutCount: 4 },
        { name: "Alexandru Stan",   age: 25, baseWeight: 80,  trend: 0.8,  workoutCount: 3 },
        { name: "Elena Dumitrescu", age: 30, baseWeight: 65,  trend: -1,   workoutCount: 5 },
        { name: "Radu Mihai",       age: 28, baseWeight: 90,  trend: 0.3,  workoutCount: 2 },
        { name: "Ioana Georgescu",  age: 29, baseWeight: 58,  trend: -0.8, workoutCount: 7 },
    ];

    for (let ci = 0; ci < clientsData.length; ci++) {
        const cd = clientsData[ci]!;

    const client = await prisma.client.create({
      data: {
        name: cd.name,
        age: cd.age,
        measurements: {
          create: [
            {
              height: 175, weight: cd.baseWeight,
              muscularMassPercent: 32, fatMassPercent: 18,
              boneMassPercent: 12, leanBodyMassPercent: 38,
              date: getPastDate(4)
            },
            {
              height: 175, weight: cd.baseWeight + cd.trend,
              muscularMassPercent: 33, fatMassPercent: 17,
              boneMassPercent: 12, leanBodyMassPercent: 38,
              date: getPastDate(2)
            },
            {
              height: 175, weight: cd.baseWeight + cd.trend * 2,
              muscularMassPercent: 34, fatMassPercent: 16,
              boneMassPercent: 12, leanBodyMassPercent: 38,
              date: getPastDate(0)
            },
          ]
        }
      }
    });
    await prisma.user.create({
      data: {
        username: cd.name.toLowerCase().replace(" ", "."),
        password: await bcrypt.hash("user123", 10),
        email: `${cd.name.toLowerCase().replace(" ", ".")}@test.com`,
        securityQuestion: "What was the name of your first pet?",
        securityAnswer: await bcrypt.hash("pet", 10),
        pin: await bcrypt.hash("1234", 10),
        roleId: userRole.id,
        clientId: client.id,
      }
    });

    for (let i = 1; i <= cd.workoutCount; i++) {
      const exerciseCount = 3 + (i % 3);
      const exercises = [];

      for (let j = 0; j < exerciseCount; j++) {
        exercises.push({
          name: exercisePool[(i + j) % exercisePool.length]!,
          sets: 3 + (j % 2),
          reps: 8 + (j * 2),
          weight: 20 + (j * 5),
        });
      }

      await prisma.workout.create({
        data: {
          name: workoutTypes[(i + ci) % workoutTypes.length]!,
          clientId: client.id,
          exercises: { create: exercises }
        }
      });
    }
  }

  
  const testClient = await prisma.client.create({
    data: {
      name: "Test User Client",
      age: 25,
    }
  });

  await prisma.user.create({
    data: {
      username: "test.user",
      password: await bcrypt.hash("user123", 10),
      email: "test.user@test.com",
      securityQuestion: "What was the name of your first pet?",
      securityAnswer: await bcrypt.hash("pet", 10),
      pin: await bcrypt.hash("1234", 10),
      roleId: userRole.id,
      clientId: testClient.id, 
    }
  });

  console.log("Seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());