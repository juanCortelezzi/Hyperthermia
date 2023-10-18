import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

// @ts-ignore
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { todos } from "./db/schema";
import { eq } from "drizzle-orm";
import { Todo } from "./components/todo";
import { Home } from "./components/home";

const sqlite = new Database("squeal.db", { create: true });
const db = drizzle(sqlite, { schema: { todos } });
migrate(db, { migrationsFolder: "drizzle" });

const app = new Hono();

// const todoToString = (todo: typeof todos.$inferSelect) => {
//   return `id: ${todo.id}, description: ${todo.description}, done: ${todo.done}`;
// };

app.use("/static/index.css", async (c) => {
  // @ts-ignore
  const file = Bun.file("./static/index.css");
  const t = await file.text();
  c.header("Content-Type", "text/css");
  return c.text(t);
});

// app.use("/static/*", serveStatic({ root: "." }));

app.get("/", (c) => {
  const todoList = db.select().from(todos).all();
  return c.html(<Home todoList={todoList} />);
});

app.post(
  "/todo",
  zValidator(
    "form",
    z.object({
      description: z.string().nonempty().max(10),
    }),
  ),
  async (c) => {
    const { description } = c.req.valid("form");
    const created_todos = await db
      .insert(todos)
      .values({ description })
      .onConflictDoNothing()
      .returning();

    if (created_todos.length === 0) {
      throw new HTTPException(400, { message: "uh oh, something broken!" });
    }

    return c.render(<Todo todo={created_todos[0]!} />);
  },
);

app.patch(
  "/todo/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().pipe(z.coerce.number().finite()),
    }),
  ),
  zValidator(
    "form",
    z.object({
      description: z.string().max(10),
      done: z.enum(["true", "false"]).transform((s) => {
        return s === "true";
      }),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const { description, done } = c.req.valid("form");

    const updated_todos = await db
      .update(todos)
      .set({ done, description: description })
      .where(eq(todos.id, id))
      .returning();

    if (updated_todos.length === 0) {
      throw new HTTPException(400, { message: "uh oh, something broken!" });
    }

    return c.render(<Todo todo={updated_todos[0]!} />);
  },
);

app.delete(
  "/todos/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().pipe(z.coerce.number().finite()),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");

    await db.delete(todos).where(eq(todos.id, id));

    return c.body(null, 200);
  },
);

export default app;
