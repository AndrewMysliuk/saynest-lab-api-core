import { IAuthResponse, IGoogleAuth, ILoginRequest, IRegisterRequest } from "../../types"

export interface IAuthService {
  loginWithGoogle(dto: IGoogleAuth): Promise<IAuthResponse>
  register(dto: IRegisterRequest, ip: string, user_agent: string): Promise<IAuthResponse>
  login(dto: ILoginRequest, ip: string, user_agent: string): Promise<IAuthResponse>
  refreshAccessToken(refresh_token: string): Promise<string>
  logout(refresh_token: string): Promise<void>
}
