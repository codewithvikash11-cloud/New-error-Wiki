import { searchErrorsAction } from "@/app/actions";
import HomeClient from "@/app/home-client";

export const revalidate = 60;

export default async function Home() {
  let initialErrors: any[] = [];
  try {
    initialErrors = await searchErrorsAction("");
  } catch (error) {
    console.error("Error fetching initial errors:", error);
  }

  return <HomeClient initialErrors={initialErrors} />;
}
