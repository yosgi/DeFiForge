"use client";
import { motion } from "framer-motion";

const features = [
  {
    title: "Get FORGE",
    description: "Acquire FORGE tokens and unlock the power of decentralized finance.",
    buttonText: "Get FORGE",
    buttonLink: "/get-forge",
    icon: "🔥", // Replace with your icon
  },
  {
    title: "Stake FORGE",
    description: "Stake your FORGE tokens to earn IGNIS rewards with competitive APYs.",
    buttonText: "Start Staking",
    buttonLink: "/stake-forge",
    icon: "⚒️", // Replace with your icon
  },
  {
    title: "Borrow & Lend",
    description: "Access decentralized borrowing and lending with your FORGE tokens.",
    buttonText: "Borrow Now",
    buttonLink: "/borrow",
    icon: "🏦", // Replace with your icon
  },
  {
    title: "Save FORGE",
    description: "Save your FORGE tokens securely and earn stable rewards.",
    buttonText: "Start Saving",
    buttonLink: "/save",
    icon: "💰", // Replace with your icon
  },
];

const HomePage = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          Welcome to DeFi Forge
        </h1>
        <p className="text-gray-500 mt-4 text-sm sm:text-base">
          Discover the power of decentralized finance. Get FORGE, stake tokens, borrow, lend, and save—all in one secure platform.
        </p>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, staggerChildren: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4 text-center">{feature.icon}</div>
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              {feature.title}
            </h2>
            <p className="text-gray-500 mt-3 text-center">{feature.description}</p>
            <div className="mt-6 text-center">
              <a
                href={feature.buttonLink}
                className="inline-block px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-600 transition"
              >
                {feature.buttonText}
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};



export default HomePage;
