import { todos } from "~/db/schema";
import { buttonStyles } from "./button";

export const Todo = ({ todo }: { todo: typeof todos.$inferSelect }) => {
  return (
    <div
      id={`todo-${todo.id}`}
      class="todo flex space-x-4 justify-between items-center ease-in-out duration-75"
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
