/*
 * Adapted from ynaka-adobe/dupont tools/workfront/approval.js (Apache-2.0),
 * revision ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0.
 * Chevron changes: reuse secure session and task UI, without source branding.
 */
import { initialize } from './app.js';

initialize({ mode: 'approval' });
