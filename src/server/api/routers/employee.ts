import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db"; // Adjust the path as needed
import { employees } from "~/server/db/schema"; // Adjust the path as needed

export const employeeRouter = createTRPCRouter({
  getEmployees: publicProcedure.query(async () => {
    // Query all records from the employees table using Drizzle ORM
    const result = await db.select().from(employees);
    return result;
  }),
});
