import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar: React.FC = () => {
  console.log('ProgressBar rendering');
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 z-[300]"
      initial={{ width: '0%' }}
      animate={{ width: '100%' }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    />
  );
};

export default ProgressBar;
