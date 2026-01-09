import { fetchPortfolioDataServerSide } from "@/lib/portfolio/serverFetch";
import PortfolioShell from "./PortfolioShell";

export default async function Home() {
  const server = await fetchPortfolioDataServerSide();

  return <PortfolioShell initialData={server.data} initialRawJsonText={server.rawJsonText} />;
}
