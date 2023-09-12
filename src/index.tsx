import { Hono } from "hono";

const app = new Hono();

const globalState = {
  clicked: false,
};

const Button = () => {
  return (
    <button hx-post="/click" hx-trigger="click" hx-swap="outerHTML">
      {globalState.clicked ? "clicked" : "click me daddy!"}
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
        {/* <link rel="stylesheet" href="./style.css" /> */}
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

app.get("/", (c) => c.html(<View />));
app.post("/click", (c) => {
  globalState.clicked = !globalState.clicked;
  return c.html(<Button />);
});

export default app;
