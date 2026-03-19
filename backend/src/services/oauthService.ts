interface OAuthUser {
  id: string;
  login: string;
  email: string;
  avatar_url: string;
}

/**
 * Generates the redirect URL for the OAuth flow.
 */
export const generateOAuthURL = (provider: 'github' | 'gitlab'): string => {
  if (provider === 'github') {
    const clientId = process.env.GITHUB_CLIENT_ID || 'dummy_client_id';
    const redirectUri = encodeURIComponent('http://localhost:3005/api/v1/auth/github/callback');
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user,repo`;
  }
  throw new Error(`Unsupported provider: ${provider}`);
};

/**
 * Exchanges the code for an access token and fetches user data.
 */
export const processGitCallback = async (provider: 'github' | 'gitlab', code: string): Promise<{ token: string, user: OAuthUser }> => {
  // Abstracted API communication (typically POST to github.com/login/oauth/access_token)
  console.log(`[OAuthService] Processing code exchange for provider: ${provider}`);

  return Promise.resolve({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Dummy JWT session token
    user: {
      id: '123456',
      login: 'npm-guardian-user',
      email: 'user@example.com',
      avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4'
    }
  });
};
