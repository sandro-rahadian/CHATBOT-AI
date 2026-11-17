"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
  gradient,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
  gradient?: string;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  const defaultGradient =
    gradient ||
    "bg-[radial-gradient(circle_farthest-side_at_0_100%,#ef4444,transparent),radial-gradient(circle_farthest-side_at_100%_0,#f43f5e,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#fb7185,transparent),radial-gradient(circle_farthest-side_at_0_0,#991b1b,#111118)]";

  return (
    <div className={cn("relative p-[1.5px] group", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "300% 300%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-2xl z-[1] opacity-70 blur-md transition duration-500 will-change-transform",
          defaultGradient
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "300% 300%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-2xl z-[1] will-change-transform",
          defaultGradient
        )}
      />

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
