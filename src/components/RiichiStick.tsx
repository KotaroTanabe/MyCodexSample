import React from 'react';

export const RiichiStick: React.FC<{ className?: string }> = ({ className }) => (
  <span className={`riichi-stick ${className ?? ''}`} aria-label="riichi stick" />
);
