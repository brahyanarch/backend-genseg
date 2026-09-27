import type {
  AuthenticationPort,
  ProfileSwitchSelection,
} from "../domain/ports/authentication.port";

export class SwitchProfileUseCase {
  constructor(
    private readonly auth: AuthenticationPort,
  ) {}

  async execute(selection: ProfileSwitchSelection): Promise<void> {
    await this.auth.switchProfile(selection);
  }
}
