import React, { TdHTMLAttributes, useState } from "react";

/*
 * COMPONENT
 */

export const Table: React.FC = ({ children }) => (
  <table className="table">{children}</table>
);

/*
 * COMPONENT
 */

export const TableHead: React.FC = ({ children }) => <thead>{children}</thead>;

/*
 * COMPONENT
 */

export const TableHeadRow: React.FC = ({ children }) => <tr>{children}</tr>;

/*
 * COMPONENT
 */

export const TableHeadCell: React.FC<TdHTMLAttributes<
  HTMLTableDataCellElement
>> = ({ children, ...rest }) => <th {...rest}>{children}</th>;

/*
 * COMPONENT
 */

export const TableBody: React.FC = ({ children }) => <tbody>{children}</tbody>;

/*
 * COMPONENT
 */

interface TableBodyRowProps {
  row: React.ReactNode;
  expandableRow?: React.ReactNode;
}

export const TableBodyRow: React.FC<TableBodyRowProps> = ({
  row,
  expandableRow,
}) => {
  const [expanded, setExpanded] = useState(false);

  function onClickRow(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName !== "BUTTON") {
      setExpanded(!expanded);
    }
  }

  return (
    <React.Fragment>
      <tr className="table__row" onClick={(e) => onClickRow(e)}>
        {row}
      </tr>
      {expandableRow && expanded && (
        <tr className="table__expandable-row">{expandableRow}</tr>
      )}
    </React.Fragment>
  );
};

/*
 * COMPONENT
 */

export const TableBodyCell: React.FC<TdHTMLAttributes<
  HTMLTableDataCellElement
>> = ({ children, ...rest }) => <td {...rest}>{children}</td>;
