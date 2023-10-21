import { type todos } from "~/db/schema";
import { buttonStyles } from "./button";
import { Todo } from "./todo";

export const Home = ({
  todoList,
}: {
  todoList: (typeof todos.$inferSelect)[];
}) => {
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
            id="description_input"
            name="description"
            class="border-2 px-2 py-1 border-black rounded-lg w-full"
            placeholder="description..."
            autocomplete="off"
            hx-get="/validate/todoform"
            hx-target="#description_input_errors"
            hx-swap="innerHTML"
            hx-trigger="change, keyup delay:500ms changed "
          />
          <span id="description_input_errors" class="text-red-500" />
          <button
            type="submit"
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
    </html>
  );
};
