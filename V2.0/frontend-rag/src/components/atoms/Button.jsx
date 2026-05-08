export const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
  const styles = {
    primary: "bg-[#0b57d0] text-white hover:bg-[#0842a0] shadow-sm",
    secondary: "bg-[#f0f4f9] text-[#041e49] hover:bg-[#e1e5ea]",
    outline: "border border-[#c4c7c5] text-[#444746] hover:bg-[#f8f9fa]",
    icon: "p-2 hover:bg-gray-100 rounded-full transition-colors"
  };
  return (
    <button 
      disabled={disabled}
      onClick={onClick} 
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};