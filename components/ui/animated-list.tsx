"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { AnimatePresence, motion, type MotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export function AnimatedListItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const animations: MotionProps = {
    initial: { scale: 0.8, opacity: 0, y: -10 },
    animate: { scale: 1, opacity: 1, y: 0, originY: 0 },
    exit: { scale: 0.8, opacity: 0, y: -10 },
    transition: { type: "spring", stiffness: 350, damping: 30 },
  };

  return (
    <motion.div {...animations} layout className={cn("mx-auto w-full", className)}>
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  delay?: number;
  autoAdd?: boolean;
}

export function AnimatedList({
  children,
  className,
  delay = 1000,
  autoAdd = false,
  ...props
}: AnimatedListProps) {
  const childrenArray = useMemo(
    () => React.Children.toArray(children),
    [children]
  );
  const [index, setIndex] = useState(autoAdd ? 0 : childrenArray.length);

  useEffect(() => {
    if (autoAdd && index < childrenArray.length - 1) {
      const timeout = setTimeout(() => {
        setIndex((prevIndex) => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [autoAdd, index, delay, childrenArray.length]);

  const itemsToShow = useMemo(() => {
    if (!autoAdd) return childrenArray;
    return childrenArray.slice(0, index + 1).reverse();
  }, [autoAdd, index, childrenArray]);

  return (
    <div
      className={cn(`flex flex-col items-center gap-2.5`, className)}
      {...props}
    >
      <AnimatePresence mode="popLayout">
        {itemsToShow.map((item) => (
          <AnimatedListItem key={(item as React.ReactElement).key}>
            {item}
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  );
}

AnimatedList.displayName = "AnimatedList";
export default AnimatedList;
