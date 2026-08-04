import { motion } from 'framer-motion';

const SeeHowItWorksButton = ({ onClick, className }) => {
  return (
    <motion.button
      className={className}
      style={{
        background: '#EEEdFE',
        color: '#3C3489',
        border: '1.5px solid #AFA9EC',
        borderRadius: '999px',
        padding: '10px 24px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
      }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick || (() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }))}
    >
      <motion.span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#7B6FE8',
          display: 'inline-block',
        }}
        animate={{ scale: [1, 1.4, 1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      See How It Works
    </motion.button>
  );
};

export default SeeHowItWorksButton;
