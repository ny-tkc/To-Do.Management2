interface IconProps {
  name?: string;
  className?: string;
  size?: number;
}

export const Icon = ({ name, className, size = 24 }: IconProps) => {
  const safeClassName = className || '';

  if (!name) {
    return (
      <i
        className={`fas fa-circle ${safeClassName} opacity-0`}
        style={{ fontSize: size }}
      />
    );
  }

  if (name.startsWith('fa-')) {
    return (
      <i className={`fas ${name} ${safeClassName}`} style={{ fontSize: size }} />
    );
  }

  return (
    <i
      className={`fas fa-circle ${safeClassName}`}
      style={{ fontSize: size }}
    />
  );
};
