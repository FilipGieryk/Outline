import { useNavigate } from "react-router-dom";

interface ButtonProps {
  content: string;
  to?: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ content, to, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    if (to) navigate(to);
  };
  return (
    <button
      className="bg-blue-500 w-45 h-17 rounded-2xl text-xl p-2"
      onClick={handleClick}
    >
      {content}
    </button>
  );
};
