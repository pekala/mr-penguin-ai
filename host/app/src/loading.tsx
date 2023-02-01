import { useState, useEffect } from "preact/hooks";
import { motion, AnimatePresence } from "framer-motion";

const puns = [
  "Thaw-ing the frozen neurons",
  "Marching to the beat of a different neural network drum",
  "Shuffling the neural deck",
  "Lining up the penguin neurons",
  "Slipping on the neural ice",
  "Waddling down the neural pathway",
  "Breaking the neural ice",
  "Hatching a plan in the neural nest",
  "Walking the neural tightrope",
  "Swimming through the neural currents",
  "Pleo-ing through the fintech facts, flipper by flipper",
  "Penguin power at Pleo, AI-ing the way to success",
  "Pecking at Pleo problems with AI precision",
  "Marching to the Pleo beat, with algorithms in tow",
  "Hatching Pleo solutions, with a neural network-y nudge",
  "Chilling at Pleo with AI on the iceberg, dishing out the facts",
  "Slipping and sliding through Pleo's fintech maze with AI grace",
  "Waddling through Pleo's data ocean, with AI navigation",
  "Pleo's peng-tastic performance, ready to quack the answers",
  "Fishing for Pleo facts with a pun-ishing AI net, and witty one-liners",
];

export const LoadingIndicator = () => {
  const [currentPun, setCurrentPun] = useState(
    Math.floor(Math.random() * puns.length)
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPun((currentPun + 1) % puns.length);
    }, 1200);
    return () => clearTimeout(timeoutId);
  }, [currentPun, puns.length]);

  return (
    <div class="relative p5 w-full h-20">
      <AnimatePresence>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={currentPun}
          class="absolute w-full text-center top-1/2 -translate-y-1/2"
        >
          {puns[currentPun]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
