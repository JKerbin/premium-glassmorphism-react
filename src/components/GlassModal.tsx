import React, { useEffect } from 'react';
import { GlassModalProps } from '../types/glass.types';
import { useGlassEffect } from '../hooks/useGlassEffect';

const GlassModal: React.FC<GlassModalProps> = ({
  children,
  className = '',
  style = {},
  variant = 'light',
  blur = 10,
  opacity = 0.1,
  borderRadius = 12,
  border = true,
  shadow = true,
  background,
  isOpen,
  onClose,
  title,
  showCloseButton = true,
  ...props
}) => {
  const { glassStyle } = useGlassEffect({
    variant,
    blur,
    opacity,
    borderRadius,
    border,
    shadow,
    background,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle = {
    ...glassStyle,
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative' as const,
    ...style,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        className={`glass-modal ${className}`}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div style={{ padding: '20px 20px 0', fontSize: '18px', fontWeight: 'bold' }}>
            {title}
          </div>
        )}
        {showCloseButton && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            ×
          </button>
        )}
        <div style={{ padding: title ? '10px 20px 20px' : '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlassModal;
