import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const itemName1 = "ベルベットの鐘";
  const item1 = await prisma.item.upsert({
    where: { name: itemName1 },
    update: {},
    create: {
      name: itemName1,
      price: 10,
      tradeInPrice: 5,
      healAmount: 5,
      healSecond: 5,
      size: 1,
    },
  });

  const itemName2 = "棒";
  const item2 = await prisma.item.upsert({
    where: { name: itemName2 },
    update: {},
    create: {
      name: itemName2,
      price: 20,
      tradeInPrice: 10,
      healAmount: 0,
      healSecond: 0,
      size: 2,
    },
  });

  const itemName3 = "きのこ串";
  const item3 = await prisma.item.upsert({
    where: { name: itemName3 },
    update: {},
    create: {
      name: itemName3,
      price: 100,
      tradeInPrice: 50,
      healAmount: 20,
      healSecond: 5,
      size: 2,
    },
  });

  const itemName4 = "きのこの天ぷら";
  const item4 = await prisma.item.upsert({
    where: { name: itemName4 },
    update: {},
    create: {
      name: itemName4,
      price: 120,
      tradeInPrice: 60,
      healAmount: 20,
      healSecond: 5,
      size: 2,
    },
  });

  await prisma.recipe.create({
    data: {
      resultId: item3.id,
      amount: 1,
      materials: {
        create: [
          {
            itemId: item1.id,
            amount: 3,
          },
          { itemId: item2.id, amount: 1 },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      resultId: item4.id,
      amount: 1,
      materials: {
        create: [
          {
            itemId: item1.id,
            amount: 8,
          },
        ],
      },
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect;
    process.exit(1);
  });
