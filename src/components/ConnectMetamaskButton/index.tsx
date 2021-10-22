import React from "react";

type MetaMaskButtonProps = {
  onClick: () => void;
  accounts: string[];
};

const MetaMaskButton: React.FC<MetaMaskButtonProps> = ({
  onClick,
  accounts,
}) => {
  const handleClick = function (): void {
    onClick();
  };

  return (
    <button
      className="bg-purple-700 py-3 px-4 text-white rounded-2xl shadow-lg hover:-translate-y-2"
      onClick={() => handleClick()}
      onKeyDown={() => handleClick()}
      tabIndex={0}
      type="button"
      disabled={!!accounts.length}
    >
      Connect wallet
    </button>
  );
};

export default MetaMaskButton;
