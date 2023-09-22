import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { tv } from "tailwind-variants";

// @ts-ignore
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { todos } from "./db/schema";
import { eq } from "drizzle-orm";

const sqlite = new Database("squeal.db", { create: true });
const db = drizzle(sqlite, { schema: { todos } });
migrate(db, { migrationsFolder: "drizzle" });

const app = new Hono();

// const todoToString = (todo: typeof todos.$inferSelect) => {
//   return `id: ${todo.id}, description: ${todo.description}, done: ${todo.done}`;
// };

const buttonStyles = tv({
  base: "transition-all duration-75",
  variants: {
    outline: {
      true: "border-2 border-black hover:bg-black hover:text-white px-2 py-1 rounded-lg w-full",
    },
  },
});

const Todo = ({ todo }: { todo: typeof todos.$inferSelect }) => {
  return (
    <div
      id={`todo-${todo.id}`}
      class="flex space-x-4 justify-between items-center ease-in"
    >
      <button
        hx-trigger="click"
        hx-target={`#todo-${todo.id}`}
        hx-swap="outerHTML"
        hx-patch={`/todo/${todo.id}`}
        hx-vals={`{
          "done": ${!todo.done},
          "description": "${todo.description}"
        }`}
      >
        {todo.done ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={buttonStyles({ className: "hover:text-sky-500" })}
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={buttonStyles({ className: "hover:text-sky-500" })}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
          </svg>
        )}
      </button>
      <p class="text-2xl flex-grow text-start">{todo.description}</p>
      <button
        hx-trigger="click"
        hx-target={`#todo-${todo.id}`}
        hx-swap="outerHTML"
        hx-delete={`/todos/${todo.id}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class={buttonStyles({ className: "hover:text-red-500" })}
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      </button>
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

// app.use("/static/*", serveStatic({ root: "." }));

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

      <body class="max-w-3xl mx-auto py-4">
        <h1 class="text-5xl font-bold">Hyperthermia</h1>
        <h2 class="text-3xl font-bold text-gray-600">
          Cause we are cooking Hypermedia in Bun's oven
        </h2>
        <div class="my-6" />
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
          <button
            class={buttonStyles({
              outline: true,
              className: "flex justify-center items-center gap-4",
            })}
          >
            <span class="htmx-inverse-indicator font-bold">Create</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="htmx-indicator animate-spin"
            >
              <path d="M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44" />
            </svg>
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

app.post(
  "/todo",
  zValidator(
    "form",
    z.object({
      description: z.string().nonempty().max(10),
    }),
  ),
  async (c) => {
    // await Bun.sleep(2000);
    // const created_todos = [{ id: 1, description: "test", done: false }];

    const { description } = c.req.valid("form");
    const created_todos = await db
      .insert(todos)
      .values({ description })
      .onConflictDoNothing()
      .returning();

    if (created_todos.length === 0) {
      throw new HTTPException(400, { message: "uh oh, something broken!" });
    }

    return c.render(<Todo todo={created_todos[0]} />);
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

    // const todo = await db.query.todos.findFirst({
    //   where: (todos, { eq }) => eq(todos.id, id),
    // });
    // if (!todo) {
    //   throw new HTTPException(400, { message: "could not find todo" });
    // }

    const updated_todos = await db
      .update(todos)
      .set({ done, description: description })
      .where(eq(todos.id, id))
      .returning();

    if (updated_todos.length === 0) {
      throw new HTTPException(400, { message: "uh oh, something broken!" });
    }

    return c.render(<Todo todo={updated_todos[0]} />);
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
