"use client";
import { motion, useInView } from "motion/react";
import { ComponentPropsWithoutRef, FC, ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string;
}

const TextReveal: FC<TextRevealProps> = ({ children, className }) => {
  const targetRef = useRef<HTMLDivElement >(null);
  const isInView = useInView(targetRef, { once: false, amount: 0.3 });

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string");
  }

  const words = children.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0", className)}>
      <div
        className={
          "mx-auto flex max-w-4xl items-center bg-transparent px-[1rem] py-[5rem]"
        }
      >
        <span
          className={
            "flex flex-wrap p-5 text-2xl text-black/20 dark:text-white/20 md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl"
          }
        >
          {words.map((word, i) => {
            return (
              <Word
                key={i}
                index={i}
                totalWords={words.length}
                isInView={isInView}
              >
                {word}
              </Word>
            );
          })}
        </span>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  index: number;
  totalWords: number;
  isInView: boolean;
}

const Word: FC<WordProps> = ({ children, index, totalWords, isInView }) => {
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-1.5">
      <span className="absolute opacity-30">{children}</span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{
        opacity: isInView ? 1 : 0.2,
      }}
        transition={{
        duration: 0.4,
        delay: isInView ? index * 0.08 : 0,
      }}
      
        className={"text-black dark:text-white"}
      >
        {children}
      </motion.span>
    </span>
  );
};

export default TextReveal;
