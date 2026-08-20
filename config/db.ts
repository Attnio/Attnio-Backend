// Shared database connection — used by ALL future features, not just auth.
// Lives in root config/, outside both api/ and modules/.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;