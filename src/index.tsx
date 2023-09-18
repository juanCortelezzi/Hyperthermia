import { Hono } from "hono";
import { serveStatic } from "hono/bun";
// @ts-ignore
// import { Database } from "bun:sqlite";

// const db = new Database(":memory:");

const app = new Hono();

const globalState = {
  clicked: false,
};

const Button = () => {
  return (
    <button
      hx-post="/click"
      hx-trigger="click"
      hx-swap="outerHTML"
      class="border-2 px-2 py-1 border-black rounded-lg flex w-full justify-center items-center hover:bg-black transition-all duration-75 gap-2 group"
    >
      <span class="group-hover:text-white text-black">
        {globalState.clicked ? "clicked" : "click me daddy!"}
      </span>
      <img class="htmx-indicator w-5 h-5" src="/static/spinner.svg" />
    </button>
  );
};

const TodoForm = () => {
  return (
    <form class="space-y-2" hx-post="/todo">
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
  );
};

const View = () => {
  return (
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
        <TodoForm />
      </body>
      <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    </html>
  );
};

app.use("/static/index.css", async (c) => {
  // @ts-ignore
  const file = Bun.file("./static/index.css");
  const t = await file.text();
  console.log(t);
  c.header("Content-Type", "text/css");
  return c.text(t);
});

app.use("/static/*", serveStatic({ root: "." }));

app.get("/", (c) => c.html(<View />));
app.post("/click", async (c) => {
  globalState.clicked = !globalState.clicked;
  // @ts-ignore
  await Bun.sleep(1000);
  return c.html(<Button />);
});

app.post("/todo", async (c) => {
  const f = await c.req.formData();
  console.log(f);
  return c.status(200);
});

export default app;
