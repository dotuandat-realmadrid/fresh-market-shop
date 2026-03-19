import React from 'react';
import { Button } from 'antd';

const MyButton = ({ children, icon, onClick, type = "default", style, className, ...props }) => {
  return (
    <Button 
      type={type} 
      icon={icon} 
      onClick={onClick} 
      style={{ borderRadius: '6px', ...style }}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
};

export default MyButton;
