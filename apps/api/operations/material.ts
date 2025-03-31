import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { getLog } from "../utils/log";
import { toHiragana, toKatakana } from "../utils/japanese";

export const materialOperations = (prisma: PrismaClient) => {
  return {
    getMaterial: get(prisma),
  };
};

interface GetMaterialRequest extends Request {
  query: {
    itemNameLike: string | undefined;
  };
}

const get =
  (prisma: PrismaClient) =>
  async (req: GetMaterialRequest, res: Response, next: any) => {
    getLog("material", req);

    try {
      const where = {};

      if (req.query.itemNameLike) {
        Object.assign(where, {
          OR: [
            {
              item: {
                name: {
                  contains: toHiragana(req.query.itemNameLike),
                },
              },
            },
            {
              item: {
                name: {
                  contains: toKatakana(req.query.itemNameLike),
                },
              },
            },
          ],
        });
      }

      const materials = await prisma.material.findMany({
        include: { item: true },
        where,
        orderBy: {
          item: {
            name: "asc",
          },
        },
      });
      res.json(materials);
    } catch (e) {
      next(e);
    }
  };
