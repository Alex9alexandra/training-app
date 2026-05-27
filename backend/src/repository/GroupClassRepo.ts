

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class GroupClassRepo {


  async getClassStatsNaive() {
    const classes = await prisma.groupClass.findMany({
      include: {
        enrollments: {
          include: {
            client: {
              include: {
                workouts: true,   
              },
            },
          },
        },
      },
    });

    return classes.map((gc) => {
      const enrolled = gc.enrollments.length;
      const avgAge =
        enrolled === 0
          ? 0
          : gc.enrollments.reduce((sum, e) => sum + e.client.age, 0) / enrolled;
      const totalWorkouts = gc.enrollments.reduce(
        (sum, e) => sum + e.client.workouts.length,
        0
      );

      return {
        classId: gc.id,
        className: gc.name,
        scheduledAt: gc.scheduledAt,
        maxCapacity: gc.maxCapacity,
        currentCapacity: gc.currentCapacity,
        enrolledCount: enrolled,
        averageClientAge: Math.round(avgAge * 10) / 10,
        totalWorkoutsAmongClients: totalWorkouts,
      };
    });
  }

  private cache: { data: any; expiresAt: number } | null = null;
  private readonly CACHE_TTL_MS = 60_000; 

  async getClassStatsOptimized() {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return { fromCache: true, data: this.cache.data };
    }

    const rows: any[] = await prisma.$queryRaw`
      SELECT
        gc.id            AS classId,
        gc.name          AS className,
        gc.scheduledAt   AS scheduledAt,
        gc.maxCapacity   AS maxCapacity,
        gc.currentCapacity AS currentCapacity,
        COUNT(DISTINCT cce.clientId)   AS enrolledCount,
        ISNULL(AVG(CAST(c.age AS FLOAT)), 0) AS averageClientAge,
        COUNT(w.id)                    AS totalWorkoutsAmongClients
      FROM GroupClass gc
      LEFT JOIN ClientClassEnrollment cce ON cce.classId = gc.id
      LEFT JOIN Client c                  ON c.id = cce.clientId
      LEFT JOIN Workout w                 ON w.clientId = c.id
      GROUP BY
        gc.id,
        gc.name,
        gc.scheduledAt,
        gc.maxCapacity,
        gc.currentCapacity
      ORDER BY enrolledCount DESC
    `;

    const data = rows.map((r) => ({
      classId: Number(r.classId),
      className: r.className,
      scheduledAt: r.scheduledAt,
      maxCapacity: Number(r.maxCapacity),
      currentCapacity: Number(r.currentCapacity),
      enrolledCount: Number(r.enrolledCount),
      averageClientAge: Math.round(Number(r.averageClientAge) * 10) / 10,
      totalWorkoutsAmongClients: Number(r.totalWorkoutsAmongClients),
    }));

    this.cache = { data, expiresAt: Date.now() + this.CACHE_TTL_MS };

    return { fromCache: false, data };
  }

  invalidateCache() {
    this.cache = null;
  }
}
