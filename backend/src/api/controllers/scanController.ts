import { Request, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/v1/scan/package
 * Submits a deep scan request for a specific npm package.
 * Inserts a real record into the Supabase `scans` table.
 */
export const submitPackageScan = async (req: Request, res: Response) => {
  try {
    const { package_name, version = 'latest', force_rescan = false } = req.body;
    
    if (!package_name) {
      return res.status(400).json({ error: 'package_name is required' });
    }

    const scanId = uuidv4();

    // Insert into Supabase scans table
    const { error } = await supabaseAdmin
      .from('scans')
      .insert({
        id: scanId,
        type: 'package',
        package_name,
        package_version: version,
        status: 'queued',
        overall_risk_score: 0,
        risk_level: 'PENDING'
      });

    if (error) {
      console.error('[ScanController] Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to queue scan job.', details: error.message });
    }

    console.log(`[ScanController] Queued scan ${scanId} for ${package_name}@${version}`);

    return res.status(202).json({
      scan_id: scanId,
      status: 'queued',
      message: 'Package evaluation has started.'
    });
  } catch (error: any) {
    console.error('[ScanController] Error:', error);
    return res.status(500).json({ error: 'Failed to queue scan job.' });
  }
};

/**
 * POST /api/v1/scan/repository
 * Initiates a dependency tree scan of a connected repository.
 */
export const submitRepositoryScan = async (req: Request, res: Response) => {
  try {
    const { repo_url, branch = 'main' } = req.body;

    if (!repo_url) {
      return res.status(400).json({ error: 'repo_url is required' });
    }

    const scanId = uuidv4();

    const { error } = await supabaseAdmin
      .from('scans')
      .insert({
        id: scanId,
        type: 'repository',
        package_name: repo_url,
        package_version: branch,
        status: 'queued',
        overall_risk_score: 0,
        risk_level: 'PENDING'
      });

    if (error) {
      console.error('[ScanController] Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to queue repository scan.', details: error.message });
    }

    return res.status(202).json({
      scan_id: scanId,
      status: 'queued',
      message: 'Repository cloned. Dependency resolution started.'
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to queue repository scan.' });
  }
};

/**
 * GET /api/v1/scan/results/:scanId
 * Fetches the complete scan result from Supabase.
 */
export const getScanResults = async (req: Request, res: Response) => {
  const { scanId } = req.params;

  try {
    // Fetch the scan record
    const { data: scan, error: scanError } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      return res.status(404).json({ error: 'Scan not found', scan_id: scanId });
    }

    // Fetch associated findings
    const { data: findings, error: findingsError } = await supabaseAdmin
      .from('scan_findings')
      .select('*')
      .eq('scan_id', scanId);

    return res.status(200).json({
      scan_id: scan.id,
      status: scan.status,
      target: `${scan.package_name}@${scan.package_version}`,
      overall_risk_score: scan.overall_risk_score,
      risk_level: scan.risk_level,
      started_at: scan.started_at,
      completed_at: scan.completed_at,
      findings: findings || []
    });
  } catch (error: any) {
    console.error('[ScanController] Error fetching results:', error);
    return res.status(500).json({ error: 'Failed to retrieve scan results.' });
  }
};

/**
 * GET /api/v1/packages/risk/:packageName
 * Rapid lookup for CI/CD environments. Reads from Supabase packages table.
 */
export const getThreatIntelligence = async (req: Request, res: Response) => {
  const { packageName } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('name', packageName)
      .single();

    if (error || !data) {
      // Package not yet in our database — return unknown
      return res.status(200).json({
        package: packageName,
        version: 'unknown',
        risk_score: 0,
        risk_level: 'UNKNOWN',
        last_scanned: null,
        message: 'Package not yet analyzed. Submit a scan to evaluate.'
      });
    }

    return res.status(200).json({
      package: data.name,
      version: 'latest',
      risk_score: data.latest_scan_score,
      risk_level: data.latest_scan_score > 60 ? 'HIGH' : data.latest_scan_score > 30 ? 'MEDIUM' : 'LOW',
      last_scanned: data.updated_at
    });
  } catch (error: any) {
    console.error('[ScanController] Threat intel error:', error);
    return res.status(500).json({ error: 'Failed to retrieve threat intelligence.' });
  }
};
