import { AuthenticationPort } from "../domain/ports/authentication.port";

export class SwitchProfileUseCase {
  constructor(
    private readonly auth: AuthenticationPort,
  ) {}

  async execute(profileId: number): Promise<void> {
    await this.auth.switchProfile(profileId);
  }
}
