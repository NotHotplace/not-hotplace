export type ChatGPTUser={userId:string;displayName:string;email:string;fullName:string|null};
export async function getChatGPTUser():Promise<ChatGPTUser|null>{return null;}
export function chatGPTSignInPath(_returnTo:string){return '/login';}
export function chatGPTSignOutPath(_returnTo='/'){return '/login';}
