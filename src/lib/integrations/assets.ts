// ============================================================================
// EXTERNAL ASSET SYSTEM INTEGRATION BOUNDARY
// ============================================================================
// The external Asset Management System is the sole source of truth for assets.
// ELC consumes asset assignments and recovery details for offboarding clearance.
// ============================================================================

export interface ExternalAssetItem {
  asset_id: string;
  asset_name: string;
  asset_tag: string;
  asset_type: 'laptop' | 'monitor' | 'phone' | 'id_card' | 'access_key' | 'other';
  assigned_date: string;
  serial_number: string;
  assignment_status: 'assigned' | 'in_custody' | 'decommissioned';
  external_return_status: 'pending_return' | 'returned' | 'damaged' | 'missing';
  estimated_recovery_amount: number;
  specifications?: string;
}

export interface ExternalAssetQueryResponse {
  source_system: 'Enterprise_Asset_Management_API';
  fetched_at: string;
  employee_id: string;
  total_assigned_count: number;
  total_recovery_required: number;
  assets: ExternalAssetItem[];
}

export interface IAssetIntegrationService {
  getEmployeeAssignedAssets(employeeId: string): Promise<ExternalAssetQueryResponse>;
}

// ----------------------------------------------------------------------------
// MOCK IMPLEMENTATION (Easily swappable with Real REST/GraphQL Asset API)
// ----------------------------------------------------------------------------

const MOCK_EMPLOYEE_ASSETS: Record<string, ExternalAssetItem[]> = {
  // Vikram Patel (Academia)
  'emp-vikram-patel': [
    {
      asset_id: 'ast-ext-091',
      asset_name: 'Apple MacBook Air 13" M2 (16GB, 512GB)',
      asset_tag: 'NG-LAP-2023-089',
      asset_type: 'laptop',
      assigned_date: '2023-04-10',
      serial_number: 'C02G90XXMD6M',
      assignment_status: 'assigned',
      external_return_status: 'pending_return',
      estimated_recovery_amount: 85000,
      specifications: 'Midnight Blue, Apple Silicon M2, Battery health 94%',
    },
    {
      asset_id: 'ast-ext-092',
      asset_name: 'LG UltraFine 27" 4K Display',
      asset_tag: 'NG-MON-2023-014',
      asset_type: 'monitor',
      assigned_date: '2023-04-12',
      serial_number: '304NTPK8B912',
      assignment_status: 'assigned',
      external_return_status: 'pending_return',
      estimated_recovery_amount: 32000,
      specifications: 'USB-C 90W Power Delivery Hub with stand',
    },
    {
      asset_id: 'ast-ext-093',
      asset_name: 'Campus Access Smartcard & NFC Fob',
      asset_tag: 'NG-SEC-2023-441',
      asset_type: 'access_key',
      assigned_date: '2023-04-10',
      serial_number: 'RFID-9921',
      assignment_status: 'assigned',
      external_return_status: 'pending_return',
      estimated_recovery_amount: 500,
      specifications: 'Sarjapur Campus Master Turnstile Access',
    },
  ],

  // Rajesh Verma (Damaged laptop scenario)
  'emp-rajesh-verma': [
    {
      asset_id: 'ast-ext-104',
      asset_name: 'Dell Latitude 5430 (Intel Core i7 12th Gen)',
      asset_tag: 'NG-LAP-2022-045',
      asset_type: 'laptop',
      assigned_date: '2022-06-15',
      serial_number: '8F7K2L3',
      assignment_status: 'assigned',
      external_return_status: 'damaged',
      estimated_recovery_amount: 14500,
      specifications: 'Cracked hinge & display bezel pressure mark reported',
    },
    {
      asset_id: 'ast-ext-105',
      asset_name: 'Dell 65W USB-C Power Adapter',
      asset_tag: 'NG-ACC-2022-118',
      asset_type: 'other',
      assigned_date: '2022-06-15',
      serial_number: 'CN-0M1W25',
      assignment_status: 'assigned',
      external_return_status: 'returned',
      estimated_recovery_amount: 0,
      specifications: 'Original factory adapter returned',
    },
  ],

  // Aisha Khan (Cleared all items)
  'emp-aisha-khan': [
    {
      asset_id: 'ast-ext-155',
      asset_name: 'ThinkPad T14 Gen 3 (AMD Ryzen 7 PRO)',
      asset_tag: 'NG-LAP-2023-112',
      asset_type: 'laptop',
      assigned_date: '2023-01-20',
      serial_number: 'PF-328K99',
      assignment_status: 'in_custody',
      external_return_status: 'returned',
      estimated_recovery_amount: 0,
      specifications: 'Returned in pristine condition to Pune IT hub',
    },
    {
      asset_id: 'ast-ext-156',
      asset_name: 'Company YubiKey 5C NFC Security Key',
      asset_tag: 'NG-SEC-2023-098',
      asset_type: 'access_key',
      assigned_date: '2023-01-20',
      serial_number: 'YK-882710',
      assignment_status: 'in_custody',
      external_return_status: 'returned',
      estimated_recovery_amount: 0,
      specifications: 'Hardware key de-provisioned and wiped',
    },
  ],
};

export class MockAssetIntegrationService implements IAssetIntegrationService {
  async getEmployeeAssignedAssets(employeeId: string): Promise<ExternalAssetQueryResponse> {
    // Simulate lightweight network latency for realism
    const assets = MOCK_EMPLOYEE_ASSETS[employeeId] || [
      {
        asset_id: `ast-def-${employeeId}`,
        asset_name: 'Lenovo ThinkPad E14 Laptop',
        asset_tag: `NG-LAP-${employeeId.substring(0, 8).toUpperCase()}`,
        asset_type: 'laptop',
        assigned_date: '2023-08-01',
        serial_number: 'PF-DEFAULT-101',
        assignment_status: 'assigned',
        external_return_status: 'pending_return',
        estimated_recovery_amount: 45000,
        specifications: 'Standard Developer Configuration (16GB RAM / 512GB SSD)',
      },
    ];

    const totalRecovery = assets.reduce(
      (sum, item) => (item.external_return_status !== 'returned' ? sum + item.estimated_recovery_amount : sum),
      0
    );

    return {
      source_system: 'Enterprise_Asset_Management_API',
      fetched_at: new Date().toISOString(),
      employee_id: employeeId,
      total_assigned_count: assets.length,
      total_recovery_required: totalRecovery,
      assets,
    };
  }
}

// Singleton integration instance
export const assetIntegrationService = new MockAssetIntegrationService();
