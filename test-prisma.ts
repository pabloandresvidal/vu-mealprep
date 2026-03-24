import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    console.log("Testing Prisma Proxy...");
    const users = await prisma.user.findMany();
    console.log("Success! Users found:", users.length);
  } catch (error) {
    console.error("Prisma Proxy Crash:", error);
  }
}

main();
