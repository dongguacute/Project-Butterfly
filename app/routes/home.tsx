import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Project Butterfly" },
    { name: "description", content: "Welcome to Project Butterfly!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
