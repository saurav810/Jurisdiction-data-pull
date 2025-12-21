import Papa from 'papaparse'

export interface CsvRowRaw {
  Jurisdiction?: string
  'Jurisdiction ID'?: string
  URL?: string
  'Population Size'?: string
  'Government Type'?: string
  Notes?: string
}

export interface DashboardRecord {
  jurisdiction: string
  jurisdictionId: string
  url: string
  populationSize: string
  governmentTypeRaw: string
  governmentTypes: string[]
  isUnified: boolean
  displayGovernmentType: string
  notes: string
}

function normalizeRow(raw: CsvRowRaw): DashboardRecord | null {
  const jurisdiction = raw.Jurisdiction?.trim() || ''
  const jurisdictionId = (raw['Jurisdiction ID'] ?? '').toString().trim()
  const url = raw.URL?.trim() || ''
  const populationSize = raw['Population Size']?.trim() || ''
  const governmentTypeRaw = raw['Government Type']?.trim() || ''
  const notes = raw.Notes?.trim() || ''

  if (!jurisdictionId || !url) {
    console.warn('Skipping row with missing jurisdiction id or url', jurisdiction)
    return null
  }

  const governmentTypes = governmentTypeRaw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  const hasCity = governmentTypes.includes('City')
  const hasCounty = governmentTypes.includes('County')
  const unifiedByNotes = notes.includes('Unified City-County Government')
  const isUnified = unifiedByNotes || (hasCity && hasCounty)

  let displayGovernmentType = governmentTypes[0] || 'Other Public Agency'
  if (unifiedByNotes) {
    displayGovernmentType = 'Unified City–County'
  } else if (isUnified) {
    displayGovernmentType = 'City + County'
  }

  return {
    jurisdiction,
    jurisdictionId,
    url,
    populationSize,
    governmentTypeRaw,
    governmentTypes,
    isUnified,
    displayGovernmentType,
    notes,
  }
}

export async function fetchDashboardData(csvUrl: string): Promise<DashboardRecord[]> {
  const response = await fetch(`${csvUrl}&t=${Date.now()}`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status}`)
  }

  const csvText = await response.text()
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
  const records: DashboardRecord[] = []

  parsed.data.forEach((row) => {
    const normalized = normalizeRow(row as CsvRowRaw)
    if (normalized) {
      records.push(normalized)
    }
  })

  return records
}
