import { Hono } from "hono";
import { serveStatic } from "hono/bun";

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
      class="bg-blue-500 border border-black rounded-lg flex w-64 justify-center items-center"
    >
      {globalState.clicked ? "clicked" : "click me daddy!"}
      <img class="htmx-indicator w-10 h-10" src="/static/spinner.svg" />
    </button>
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

      <body>
        <h1>Hello Hono!</h1>
        <Button />
      </body>
      <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    </html>
  );
};

app.use("/static/index.css", async (c) => {
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
  await Bun.sleep(1000);
  return c.html(<Button />);
});

export default app;
