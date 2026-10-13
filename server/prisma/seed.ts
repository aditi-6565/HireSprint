import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function main(){
  const passwordHash = await bcrypt.hash("HireSprint@123", 10);
  await prisma.user.upsert({ where:{email:"demo@hiresprint.local"}, update:{}, create:{name:"Demo Student",email:"demo@hiresprint.local",passwordHash} });
}
main().finally(()=>prisma.$disconnect());
