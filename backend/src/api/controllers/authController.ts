import { Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabaseClient';
import { generateOAuthURL, processGitCallback } from '../../services/oauthService';

/**
 * GET /api/v1/auth/github/login
 * Redirects the user to the GitHub OAuth authorization page.
 */
export const githubLogin = async (req: Request, res: Response) => {
  try {
    const url = generateOAuthURL('github');
    res.redirect(url);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate OAuth URL.' });
  }
};

/**
 * GET /api/v1/auth/github/callback
 * Handles the OAuth callback from GitHub.
 * Upserts the user into the Supabase `users` table.
 */
export const githubCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is missing.' });
    }

    const { token, user } = await processGitCallback('github', code);

    // Upsert user into Supabase users table
    const { data: dbUser, error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          oauth_provider: 'github',
          oauth_id: user.id,
          email: user.email,
          login: user.login,
          avatar_url: user.avatar_url,
          last_login: new Date().toISOString()
        },
        { onConflict: 'oauth_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[AuthController] Supabase upsert error:', error);
    } else {
      console.log(`[AuthController] User upserted: ${dbUser?.login || user.login}`);
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: dbUser || user
    });
  } catch (error) {
    res.status(500).json({ error: 'OAuth callback failed.' });
  }
};
