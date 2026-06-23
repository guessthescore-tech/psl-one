'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { redirect } from 'next/navigation';

export default function AdminRoot() {
  redirect('/admin/overview');
}
