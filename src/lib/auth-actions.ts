'use server';

import { redirect } from "next/navigation";

import { passwordLogin } from "./openauth";
import { clearSession, createSession } from "./session";

export type LoginState = {
  error?: string;
};

const initialState: LoginState = {};

export async function loginAction(
  _prevState: LoginState = initialState,
  formData: FormData
): Promise<LoginState> {
  void _prevState;
  const identifier = (formData.get("identifier") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();

  if (!identifier || !password) {
    return { error: "Email/username and password are required." };
  }

  try {
    const response = await passwordLogin({ identifier, password });
    createSession({
      userId: response.userId ?? identifier,
      email: response.email ?? identifier,
      token: response.token ?? response.accessToken,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to sign in with the provided credentials.",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  clearSession();
  redirect("/login");
}
