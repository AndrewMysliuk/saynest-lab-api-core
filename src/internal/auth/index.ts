import { ILoginRequest, ILoginResponse, IRegisterRequest, IRegisterResponse } from "../../types"

export interface IAuthService {
  register(dto: IRegisterRequest, ip: string, user_agent: string): Promise<IRegisterResponse>
  login(dto: ILoginRequest): Promise<ILoginResponse>
  refreshAccessToken(refresh_token: string): Promise<string>
  logout(refresh_token: string): Promise<void>
}
