import { OAuth2Client } from "google-auth-library"

import { serverConfig } from "./server_config"

export const googleClient = new OAuth2Client(serverConfig.GOOGLE_CLIENT_ID)
