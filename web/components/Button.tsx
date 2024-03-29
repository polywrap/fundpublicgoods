"use client";

import clsx from "clsx";
import { Popover } from "@headlessui/react";
import { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface ButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  hierarchy?: "primary" | "secondary";
  size?: "default" | "lg";
  variant?: "icon" | "text";
}

const Button = ({
  children,
  hierarchy = "primary",
  size = "default",
  variant,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const hierarchyClasses = {
    primary: clsx(
      "border-indigo-500 bg-indigo-600 text-white shadow-button transform active:translate-y-1 active:bg-indigo-800/90 hover:bg-indigo-500 transition-all duration-100 ease-in-out active:shadow-button-0 focus-visible:outline-0"
    ),
    secondary: clsx("border-indigo-300 bg-transparent text-indigo-600", {
      "hover:bg-top": !disabled,
    }),
  };

  const sizeClasses = {
    default: "px-6 py-2 text-sm",
    lg: "px-8 py-3",
  };

  const variantClasses = {
    icon: "border-none bg-none !p-1 text-indigo-500 hover:!text-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10",
    text: "border-none bg-none !p-1 text-indigo-500 hover:text-white",
  };
  const variantClass = variant ? variantClasses[variant] : null;
  return (
    <Popover className='relative'>
      <Popover.Button
        disabled={disabled}
        className={clsx(
          "text-shadow-md relative inline-flex items-center justify-center space-x-2 rounded-full border-2 transition-all duration-500",
          hierarchyClasses[hierarchy],
          sizeClasses[size],
          variantClass,
          className,
          disabled
            ? "!cursor-default !opacity-60 !bg-indigo-400 hover:!bg-indigo-400 !border-indigo-300 shadow-none !text-indigo-200"
            : "cursor-pointer"
        )}
        {...props}>
        {children}
      </Popover.Button>
    </Popover>
  );
};

export default Button;
