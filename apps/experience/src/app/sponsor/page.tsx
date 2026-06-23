'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { redirect } from 'next/navigation';

export default function SponsorRoot() {
  redirect('/sponsor/overview');
}
