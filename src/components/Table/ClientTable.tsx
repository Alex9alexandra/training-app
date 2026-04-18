import React, { useState } from "react";
import Button from "../Button/Button";
import "./ClientTable.css";

type Client = {
  id: number;
  name: string;
  age: number;
};

type Props = {
  clients: {
    data: Client[];
    totalPages: number;
  };
  
  page: number;
  onView: (id: number) => void;
  onPageChange: (page: number) => void;
};

const ClientTable: React.FC<Props> = ({ clients, page, onView, onPageChange }) => {
  const currentPage = page;

  const totalPages =clients.totalPages;
  const currentClients = clients.data;

  return (
    <div className="table-wrapper">
      <table className="client-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {currentClients.map((client) => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.age}</td>
              <td>
                <Button text="View" onClick={() => onView(client.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => {
            const newPage = currentPage - 1;
            onPageChange(newPage);
          }}
        >
          Prev
        </button>

        <span>
          {currentPage}/{totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => {
            const newPage = currentPage + 1;
            onPageChange(newPage);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ClientTable;