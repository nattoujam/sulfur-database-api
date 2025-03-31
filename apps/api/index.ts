import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { initialize } from "express-openapi";
import path from "path";

import { itemOperations } from "./operations/item";
import { materialOperations } from "./operations/material";
import { recipeOperations } from "./operations/recipe";

const app = express();
const port = 3000;
const prisma = new PrismaClient({ log: ["query"] });

// TODO: 特定のオリジンのみ許可するようにする
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Error handling
const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error("ErrorHandler:", err);
  if (err.status === 400) {
    res.status(400).json({
      code: "E1",
      message: err.errors.map((e: any) => `${e.path} ${e.message}`).join(","),
    });
  } else {
    res.status(500).send("Internal Server Error");
  }
};

app.listen(port, () => {
  console.log(`listen... http://localhost:${port}`);
});

initialize({
  app,
  apiDoc: path.resolve(__dirname, "public", "openapi.yaml"),
  validateApiDoc: true,
  operations: {
    ...itemOperations(prisma),
    ...materialOperations(prisma),
    ...recipeOperations(prisma),
  },
  errorMiddleware: errorHandler,
});
