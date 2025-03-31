import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { getLog } from "../utils/log";
import { toHiragana, toKatakana } from "../utils/japanese";

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
        where,
        orderBy: {
          name: "asc",
        },
      });
      res.json(items);
    } catch (e) {
      next(e);
    }
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
