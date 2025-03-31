import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { getLog } from "../utils/log";
import { toHiragana, toKatakana } from "../utils/japanese";

export const recipeOperations = (prisma: PrismaClient) => {
  return {
    getRecipe: get(prisma),
    createRecipe: post(prisma),
  };
};

interface GetRecipeRequest extends Request {
  query: {
    materialItemIds: string | undefined;
    resultId: string | undefined;
    resultNameLike: string | undefined;
  };
}

const get =
  (prisma: PrismaClient) =>
  async (req: GetRecipeRequest, res: Response, next: any) => {
    getLog("recipe", req);

    try {
      const resultId = req.query.resultId
        ? Number.parseInt(req.query.resultId)
        : undefined;

      const where = {};

      if (req.query.materialItemIds) {
        const materialItemIds = req.query.materialItemIds
          .split(",")
          .map((m: string) => Number.parseInt(m));
        Object.assign(where, {
          materials: {
            some: {
              itemId: {
                in: materialItemIds,
              },
            },
          },
        });
      }

      if (req.query.resultId) {
        Object.assign(where, {
          resultId: resultId,
        });
      }

      if (req.query.resultNameLike) {
        Object.assign(where, {
          OR: [
            {
              result: {
                name: {
                  contains: toHiragana(req.query.resultNameLike),
                },
              },
            },
            {
              result: {
                name: {
                  contains: toKatakana(req.query.resultNameLike),
                },
              },
            },
          ],
        });
      }

      const recipes = await prisma.recipe.findMany({
        include: {
          result: true,
          materials: {
            include: {
              item: true,
            },
          },
        },
        where,
        orderBy: {
          result: {
            name: "asc",
          },
        },
      });
      res.json(recipes);
    } catch (e) {
      next(e);
    }
  };

const post =
  (prisma: PrismaClient) => async (req: Request, res: Response, next: any) => {
    console.log(req.body);
    try {
      const data = {
        resultId: req.body.resultId,
        amount: req.body.amount,
        materials: {
          create: req.body.materials,
        },
      };
      const recipe = await prisma.recipe.create({ data });
      res.json(recipe);
    } catch (e: unknown) {
      console.log(`Failed: ${(e as Error).message}`);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        console.log(e.code);
        console.log(e.meta);
        if (e.code === "P2003") {
          const message = `Foreign key constraint failed on the field ${e.meta?.field_name}`;
          res.status(500).json({ code: e.code, message });
        } else {
          next(e);
        }
      } else {
        next(e);
      }
    }
  };
