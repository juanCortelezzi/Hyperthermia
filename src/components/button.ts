import { tv } from "tailwind-variants";

export const buttonStyles = tv({
  base: "transition-all duration-75",
  variants: {
    outline: {
      true: "border-2 border-black hover:bg-black hover:text-white px-2 py-1 rounded-lg w-full",
    },
  },
});
