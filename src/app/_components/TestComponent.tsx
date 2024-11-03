import { api, HydrateClient } from "~/trpc/server";

export default function TestComponent() {
  const { data, isLoading, isError } = api.employee.getEmployees.useQuery();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching data</p>;

  console.log("Data:", data);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
