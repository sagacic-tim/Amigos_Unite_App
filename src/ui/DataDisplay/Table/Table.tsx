
// src/ui/data-display/Table/Table.tsx
import React from 'react';

type Props = React.TableHTMLAttributes<HTMLTableElement> & { zebra?: boolean };

export default function Table({ zebra, className, ...rest }: Props) {
  const cls = ['table', zebra ? '-zebra' : '', className].filter(Boolean).join(' ');
  return <table className={cls} {...rest} />;
}
