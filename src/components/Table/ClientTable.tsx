import React, { useState } from "react";
import Button from "../Button/Button";
import "./ClientTable.css";

type Client = {
  id: number;
  name: string;
  age: number;
};

type Props = {
  clients: Client[];
  onView: (id: number) => void;
};

const ClientTable: React.FC<Props> = ({ clients, onView }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // number of rows per page

  // calculate current page items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = clients.slice(startIndex, startIndex + itemsPerPage);

  const totalPages = Math.ceil(clients.length / itemsPerPage);

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
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>

        <span>
          {currentPage}/{totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ClientTable;