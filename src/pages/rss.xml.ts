import type { APIRoute } from 'astro';
import { rssResponse } from '../i18n/rss';

export const GET: APIRoute = ({ site }) => rssResponse('en', site);
