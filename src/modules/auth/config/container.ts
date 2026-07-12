import "server-only";

import { HttpAuthenticationAdapter } from "../infrastructure/http/http-authentication.adapter";
import { HttpCurrentUserAdapter } from "../infrastructure/http/http-current-user.adapter";
import { CookieSessionStoreAdapter } from "../infrastructure/cookie/cookie-session-store.adapter";
import { LoginUseCase } from "../application/login.usecase";
import { SelectProfileUseCase } from "../application/select-profile.usecase";
import { LogoutUseCase } from "../application/logout.usecase";
import { GetSessionUseCase } from "../application/get-session.usecase";
import { GetCurrentUserUseCase } from "../application/get-current-user.usecase";

/**
 * Composition root: cablea adaptadores concretos con los casos de uso.
 * Es el único módulo que conoce implementaciones; el resto depende de puertos.
 */
function buildContainer() {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Falta la variable de entorno API_BASE_URL");
  }

  const authentication = new HttpAuthenticationAdapter(baseUrl);
  const currentUser = new HttpCurrentUserAdapter(baseUrl);
  const sessionStore = new CookieSessionStoreAdapter();

  return {
    login: new LoginUseCase(authentication, sessionStore),
    selectProfile: new SelectProfileUseCase(authentication, sessionStore),
    logout: new LogoutUseCase(sessionStore),
    getSession: new GetSessionUseCase(sessionStore),
    getCurrentUser: new GetCurrentUserUseCase(sessionStore, currentUser),
  };
}

export const authContainer = buildContainer();
