import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { serveStatic } from "hono/bun";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

// @ts-ignore
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { todos } from "./db/schema";
import { eq } from "drizzle-orm";

const sqlite = new Database("squeal.db", { create: true });
const db = drizzle(sqlite, { logger: true, schema: { todos } });
migrate(db, { migrationsFolder: "drizzle" });

const app = new Hono();

const Todo = ({ todo }: { todo: typeof todos.$inferSelect }) => {
  return (
    <div class="flex space-x-2">
      <button
        class="border-2 rounded-lg border-black h-10 w-10"
        hx-trigger="click"
        hx-patch={`/todo/${todo.id}`}
        hx-vals={'{"myVal": "My Value"}'}
      >
        {todo.done ? "X" : "_"}
      </button>
      <p id={`todo-${todo.id}`}>{todo.description}</p>
    </div>
  );
};

app.use("/static/index.css", async (c) => {
  // @ts-ignore
  const file = Bun.file("./static/index.css");
  const t = await file.text();
  c.header("Content-Type", "text/css");
  return c.text(t);
});

app.use("/static/*", serveStatic({ root: "." }));

app.get("/", (c) => {
  const todoList = db.select().from(todos).all();

  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>My Website</title>
        <link rel="stylesheet" href="/static/index.css" />
        {/* <link rel="icon" href="./favicon.ico" type="image/x-icon" /> */}
      </head>

      <body class="max-w-3xl mx-auto">
        <h1 class="text-4xl font-bold">Hyperthermia</h1>
        <h2 class="text-2xl font-bold text-gray-600">
          Cause we are cooking Hypermedia in Bun's oven
        </h2>
        <div class="my-4" />
        <form
          hx-post="/todo"
          hx-target="#todos"
          hx-swap="afterbegin"
          class="space-y-2"
        >
          <input
            name="description"
            class="border-2 px-2 py-1 border-black rounded-lg w-full"
            placeholder="description..."
          />
          <button class="border-2 px-2 py-1 border-black rounded-lg flex w-full justify-center items-center hover:bg-black transition-all duration-75 gap-2 hover:text-white">
            Create
            <img class="htmx-indicator w-5 h-5" src="/static/spinner.svg" />
          </button>
        </form>
        <div class="my-8" />
        <div id="todos" class="space-y-2">
          {todoList.map((todo) => (
            <Todo todo={todo} />
          ))}
        </div>
      </body>
      <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    </html>,
  );
});

app.patch(
  "/todo/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().pipe(z.coerce.number().finite()),
    }),
  ),
  zValidator(
    "json",
    z.object({
      description: z.string().max(10),
      done: z.boolean(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const { description, done } = c.req.valid("json");

    // const todo = await db.query.todos.findFirst({
    //   where: (todos, { eq }) => eq(todos.id, id),
    // });
    // if (!todo) {
    //   throw new HTTPException(400, { message: "could not find todo" });
    // }

    const x = await db
      .update(todos)
      .set({ done, description })
      .where(eq(todos.id, id))
      .returning();

    if (x.length === 0) {
      throw new HTTPException(400, { message: "uh oh, something broken!" });
    }

    return c.render(<Todo todo={x[0]} />);
  },
);

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
    const x = await db
      .insert(todos)
      .values({ description })
      .onConflictDoNothing()
      .returning();

    if (x.length === 0) {
      throw new HTTPException(400, { message: "uh oh, something broken!" });
    }

    return c.render(<Todo todo={x[0]} />);
  },
);

export default app;
