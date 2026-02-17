import { AnimatePresence, motion } from "framer-motion";

const StepTransition = ({
  children,
  stepKey,
  direction,
}: {
  children: React.ReactNode;
  stepKey: number;
  direction: number;
}) => {
  const variants = {
    initial: (d: number) => ({
      x: d > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
    },

    exit: (d: number) => ({
      x: d > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.4,
          ease: [0.32, 0.72, 0, 1],
        }}
        style={{ width: "100%", gridArea: "1 / 1 / 2 / 2" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default StepTransition;
