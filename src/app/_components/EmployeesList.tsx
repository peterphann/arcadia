// components/EmployeesList.tsx
"use client";

import { useEffect, useState } from "react";

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Employees List</h2>
      {employees.length > 0 ? (
        <ul>
          {employees.map((employee: any) => (
            <li key={employee.id}>
              {employee.id}: {employee.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No employees found.</p>
      )}
    </div>
  );
}
