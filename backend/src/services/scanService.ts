import { supabaseAdmin } from '../lib/supabaseClient';

export interface ScanJobPayload {
  scanId: string;
  type: 'package' | 'repository';
  target: string;
  force_rescan?: boolean;
  extras?: {
    branch?: string;
  };
}

/**
 * Updates the scan status in Supabase when the worker picks up the job.
 * In a full implementation, this would also push to a Redis/BullMQ queue.
 */
export const queueScanJob = async (payload: ScanJobPayload): Promise<void> => {
  console.log(`[ScanService] Processing job: ${payload.scanId} for target ${payload.target}`);

  // Update the scan record to 'running' status
  const { error } = await supabaseAdmin
    .from('scans')
    .update({ status: 'running' })
    .eq('id', payload.scanId);

  if (error) {
    console.error('[ScanService] Failed to update scan status:', error);
  }
};

/**
 * Marks a scan as completed and writes the risk score.
 */
export const completeScanJob = async (
  scanId: string, 
  riskScore: number, 
  riskLevel: string
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('scans')
    .update({
      status: 'completed',
      overall_risk_score: riskScore,
      risk_level: riskLevel,
      completed_at: new Date().toISOString()
    })
    .eq('id', scanId);

  if (error) {
    console.error('[ScanService] Failed to complete scan:', error);
  }
};

/**
 * Inserts individual scan findings into Supabase.
 */
export const insertScanFindings = async (
  scanId: string,
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    file_path?: string;
    line_number?: number;
    payload_preview?: string;
  }>
): Promise<void> => {
  const rows = findings.map(f => ({
    scan_id: scanId,
    ...f
  }));

  const { error } = await supabaseAdmin
    .from('scan_findings')
    .insert(rows);

  if (error) {
    console.error('[ScanService] Failed to insert findings:', error);
  }
};
