import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata = { title: "Sign in — LearningOS" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="login" />;
}
