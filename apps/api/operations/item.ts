import { PrismaClient, Prisma, ItemEffect } from "@prisma/client";
import { Request, Response } from "express";
import { getLog } from "../utils/log";
import { toHiragana, toKatakana } from "../utils/japanese";

type Effect = { name: string } & (
  | { flag: boolean }
  | { amount: number }
  | { amount: number | string; second: number }
);

export const itemOperations = (prisma: PrismaClient) => {
  return {
    getItem: get(prisma),
    createItem: post(prisma),
  };
};

interface GetItemRequest extends Request {
  query: {
    nameLike: string | undefined;
  };
}

const get =
  (prisma: PrismaClient) =>
  async (req: GetItemRequest, res: Response, next: any) => {
    getLog("item", req);

    try {
      const where = {};

      if (req.query.nameLike) {
        Object.assign(where, {
          OR: [
            {
              name: {
                contains: toHiragana(req.query.nameLike),
              },
            },
            {
              name: {
                contains: toKatakana(req.query.nameLike),
              },
            },
          ],
        });
      }

      const items = await prisma.item.findMany({
        include: {
          itemEffect: true,
        },
        where,
        orderBy: {
          name: "asc",
        },
      });

      res.json(
        items.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          name: item.name,
          price: item.price,
          tradeInPrice: item.tradeInPrice,
          size: item.size,
          healAmount: item.healAmount,
          healSecond: item.healSecond,
          itemEffectList: item.itemEffect
            ? convertToItemEffectList(item.itemEffect)
            : [],
        }))
      );
    } catch (e) {
      next(e);
    }
  };

const convertToItemEffectList = (itemEffect: ItemEffect): Array<Effect> => {
  const itemEffectList = [];

  if (itemEffect.poisonedRemovable) {
    itemEffectList.push({
      name: "中毒削除",
      flag: itemEffect.poisonedRemovable,
    });
  }

  if (itemEffect.burningRemovable) {
    itemEffectList.push({
      name: "燃焼削除",
      flag: itemEffect.burningRemovable,
    });
  }

  if (itemEffect.frozenRemovable) {
    itemEffectList.push({
      name: "凍結削除",
      flag: itemEffect.frozenRemovable,
    });
  }

  if (itemEffect.poisonResistance && itemEffect.poisonResistanceSecond) {
    itemEffectList.push({
      name: "毒抵抗力",
      amount: itemEffect.poisonResistance,
      second: itemEffect.poisonResistanceSecond,
    });
  }

  if (itemEffect.fireResistance && itemEffect.fireResistanceSecond) {
    itemEffectList.push({
      name: "炎抵抗力",
      amount: itemEffect.fireResistance,
      second: itemEffect.fireResistanceSecond,
    });
  }

  if (itemEffect.frostResistance && itemEffect.frostResistanceSecond) {
    itemEffectList.push({
      name: "霜抵抗力",
      amount: itemEffect.frostResistance,
      second: itemEffect.frostResistanceSecond,
    });
  }

  if (itemEffect.electricResistance && itemEffect.electricResistanceSecond) {
    itemEffectList.push({
      name: "電気抵抗力",
      amount: itemEffect.electricResistance,
      second: itemEffect.electricResistanceSecond,
    });
  }

  if (itemEffect.slowMotionPercentage && itemEffect.slowMotionSecond) {
    itemEffectList.push({
      name: "スローモーション",
      amount: `${itemEffect.slowMotionPercentage}`,
      second: itemEffect.slowMotionSecond,
    });
  }

  if (itemEffect.movementSpeedPercentage && itemEffect.movementSpeedSecond) {
    itemEffectList.push({
      name: "移動速度",
      amount: `${itemEffect.movementSpeedPercentage}%`,
      second: itemEffect.movementSpeedSecond,
    });
  }

  if (itemEffect.dashBonus) {
    itemEffectList.push({
      name: "ダッシュボーナス",
      amount: itemEffect.dashBonus,
    });
  }

  if (itemEffect.accuracyPercentage && itemEffect.accuracySecond) {
    itemEffectList.push({
      name: "移動時精度",
      amount: `${itemEffect.accuracyPercentage}%`,
      second: itemEffect.accuracySecond,
    });
  }

  return itemEffectList;
};

const post =
  (prisma: PrismaClient) => async (req: Request, res: Response, next: any) => {
    console.log(req.body);
    try {
      const item = await prisma.item.create({ data: req.body });
      res.json(item);
    } catch (e: unknown) {
      console.log((e as Error).message);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          const message = `Unique constraint failed on the ${e.meta?.target}`;
          res.status(500).json({ code: e.code, message });
        } else {
          next(e);
        }
      } else {
        next(e);
      }
    }
  };
