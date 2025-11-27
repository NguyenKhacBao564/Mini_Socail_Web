import React from 'react';

const Input = ({ 
  icon: Icon, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  name,
  required = false 
}) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={20} />
        </div>
      )}
    
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`
          w-full 
          bg-slate-900 
          border border-slate-700 
          rounded-lg 
          py-3 
          text-white 
          placeholder:text-slate-500 
          text-sm font-medium
          ${Icon ? 'pl-10' : 'pl-4'} 
          pr-4
          outline-none 
          transition-all 
          duration-200
          focus:border-blue-500 
          focus:ring-2 
          focus:ring-blue-500/20
          hover:border-slate-600
        `}
      />
    </div>
  );
};

export default Input;