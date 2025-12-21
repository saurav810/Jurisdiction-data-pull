import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Fieldset,
  FormGroup,
  GridContainer,
  Label,
  Modal,
  ModalFooter,
  ModalHeading,
  Table,
} from '@trussworks/react-uswds'
import type { ModalRef } from '@trussworks/react-uswds'
import './App.css'
import { fetchDashboardData, type DashboardRecord } from './dataLoader'
import { cityFeatures, countyFeatures, type SimpleFeature } from './sampleGeojson'

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQ_zWTMJ46aF_Nw3R5rw_Tq7PMpFnZ099zkFsXwSP1nge546f0PeisEOpBZ3gJQUdxHFrsOP8votEV/pub?output=csv'

type GovernmentTypeFilter = '' | 'City' | 'County' | 'Unified City–County' | 'Other Public Agency'

type LayerType = 'county' | 'city'

interface FeatureWithLayer extends SimpleFeature {
  properties: SimpleFeature['properties'] & { layer: LayerType }
}

function svgPoints(coordinates: [number, number][]): string {
  return coordinates.map((pair) => pair.join(',')).join(' ')
}

function MapLayer({
  features,
  hasDataIds,
  color,
  onFeatureClick,
}: {
  features: FeatureWithLayer[]
  hasDataIds: Set<string>
  color: string
  onFeatureClick: (feature: FeatureWithLayer) => void
}) {
  return (
    <g>
      {features.map((feature) => {
        const id = feature.properties.GEOID
        const hasData = hasDataIds.has(id)
        return (
          <polygon
            key={id}
            points={svgPoints(feature.geometry.coordinates)}
            className="map-polygon"
            data-layer={feature.properties.layer}
            onClick={() => onFeatureClick(feature)}
            style={{
              fill: hasData ? color : '#e6e6e6',
              stroke: hasData ? '#1b1b1b' : '#7d7d7d',
              strokeWidth: hasData ? 2 : 1,
            }}
          >
            <title>{feature.properties.name}</title>
          </polygon>
        )
      })}
    </g>
  )
}

function App() {
  const [data, setData] = useState<DashboardRecord[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const [governmentTypeFilter, setGovernmentTypeFilter] = useState<GovernmentTypeFilter>('')
  const [populationSizeFilter, setPopulationSizeFilter] = useState<Set<string>>(new Set())

  const [selectedFeature, setSelectedFeature] = useState<FeatureWithLayer | null>(null)
  const [selectedFeatureRows, setSelectedFeatureRows] = useState<DashboardRecord[]>([])

  const modalRef = useRef<ModalRef>(null)

  const loadData = async (showSpinner = true) => {
    try {
      if (showSpinner) setRefreshing(true)
      const records = await fetchDashboardData(CSV_URL)
      setData(records)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Failed to fetch CSV', err)
      setError('Unable to load live dashboard data. Showing the last successful load if available.')
    } finally {
      if (showSpinner) setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadData()
    const interval = setInterval(() => void loadData(false), 60_000)
    return () => clearInterval(interval)
  }, [])

  const governmentOptions = useMemo(() => {
    const base: GovernmentTypeFilter[] = ['City', 'County', 'Unified City–County']
    const hasOther = data.some(
      (row) => !row.isUnified && !row.governmentTypes.includes('City') && !row.governmentTypes.includes('County')
    )
    return hasOther ? [...base, 'Other Public Agency'] : base
  }, [data])

  const populationOptions = useMemo(() => {
    const values = new Set<string>()
    data.forEach((row) => {
      if (row.populationSize) values.add(row.populationSize)
    })
    return Array.from(values).sort()
  }, [data])

  const filteredRows = useMemo(() => {
    return data.filter((row) => {
      if (governmentTypeFilter) {
        if (governmentTypeFilter === 'City' && !row.governmentTypes.includes('City')) return false
        if (governmentTypeFilter === 'County' && !row.governmentTypes.includes('County')) return false
        if (governmentTypeFilter === 'Unified City–County' && !row.isUnified) return false
        if (
          governmentTypeFilter === 'Other Public Agency' &&
          (row.isUnified || row.governmentTypes.includes('City') || row.governmentTypes.includes('County'))
        ) {
          return false
        }
      }

      if (populationSizeFilter.size > 0 && !populationSizeFilter.has(row.populationSize)) return false

      return true
    })
  }, [data, governmentTypeFilter, populationSizeFilter])

  const hasDataIds = useMemo(() => new Set(filteredRows.map((row) => row.jurisdictionId)), [filteredRows])

  const allCounties: FeatureWithLayer[] = useMemo(
    () => countyFeatures.map((feat) => ({ ...feat, properties: { ...feat.properties, layer: 'county' } })),
    []
  )
  const allCities: FeatureWithLayer[] = useMemo(
    () => cityFeatures.map((feat) => ({ ...feat, properties: { ...feat.properties, layer: 'city' } })),
    []
  )

  const handleFeatureClick = (feature: FeatureWithLayer) => {
    const featureId = feature.properties.GEOID
    const matches = filteredRows.filter((row) => row.jurisdictionId === featureId)
    setSelectedFeature(feature)
    setSelectedFeatureRows(matches)
    modalRef.current?.toggleModal(undefined, true)
  }

  const resetFilters = () => {
    setGovernmentTypeFilter('')
    setPopulationSizeFilter(new Set())
  }

  const togglePopulationFilter = (value: string) => {
    setPopulationSizeFilter((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const lastUpdatedLabel = lastUpdated ? lastUpdated.toLocaleTimeString() : '—'

  return (
    <GridContainer>
      <div className="page-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Live dashboard map</p>
            <h1>Jurisdiction dashboard coverage</h1>
            <p className="usa-intro">
              The map shows county and city dashboards sourced from the live Google Sheets CSV feed. Filters update both the map
              and the results list.
            </p>
          </div>
          <div className="header-actions">
            <p className="last-updated">Last updated: {lastUpdatedLabel}</p>
            <Button type="button" onClick={() => void loadData()} secondary disabled={refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh data'}
            </Button>
          </div>
        </header>

        {error && (
          <Alert type="error" heading="Data issue" headingLevel="h2" className="stacked-alert">
            {error}
          </Alert>
        )}

        <section className="filters" aria-label="Filters">
          <div className="filters-header">
            <h2>Filters</h2>
            <Button type="button" unstyled onClick={resetFilters} className="reset-button">
              Reset filters
            </Button>
          </div>
          <div className="filters-grid">
            <FormGroup>
              <Label htmlFor="gov-filter">Government type</Label>
              <select
                id="gov-filter"
                className="usa-select"
                value={governmentTypeFilter}
                onChange={(e) => setGovernmentTypeFilter(e.target.value as GovernmentTypeFilter)}
              >
                <option value="">All</option>
                {governmentOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormGroup>

            <Fieldset legend="Population size" legendStyle="srOnly">
              <Label className="checkbox-label" htmlFor="population-options">
                Population size
              </Label>
              <div className="checkbox-grid" id="population-options">
                {populationOptions.map((opt) => (
                  <Checkbox
                    key={opt}
                    id={`pop-${opt}`}
                    name="population-size"
                    value={opt}
                    label={opt}
                    checked={populationSizeFilter.has(opt)}
                    onChange={() => togglePopulationFilter(opt)}
                  />
                ))}
              </div>
            </Fieldset>
          </div>
        </section>

        <section className="map-section">
          <div className="map-header">
            <h2>Map</h2>
            <p className="map-subhead">Polygons are shaded when any filtered dashboards match their GEOID.</p>
          </div>
          <div className="map-frame">
            <svg viewBox="0 0 700 550" role="img" aria-label="Jurisdiction coverage map">
              <rect x="0" y="0" width="700" height="550" fill="#f5f5f5" />
              <MapLayer features={allCounties} hasDataIds={hasDataIds} color="#b6d7a8" onFeatureClick={handleFeatureClick} />
              <MapLayer features={allCities} hasDataIds={hasDataIds} color="#a4c2f4" onFeatureClick={handleFeatureClick} />
            </svg>
          </div>
          <p className="map-legend">
            <span className="legend-swatch county" /> Counties with dashboards
            <span className="legend-swatch city" /> Cities with dashboards
          </p>
        </section>

        <section className="results-section">
          <div className="results-header">
            <h2>Dashboards ({filteredRows.length})</h2>
          </div>
          {refreshing && data.length === 0 ? (
            <div className="centered">
              <p>Loading data…</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <Alert type="info" heading="No dashboards match the filters" headingLevel="h3">
              Try adjusting government type or population filters.
            </Alert>
          ) : (
            <div className="table-wrapper">
              <Table bordered fullWidth>
                <thead>
                  <tr>
                    <th scope="col">Jurisdiction</th>
                    <th scope="col">Jurisdiction ID</th>
                    <th scope="col">Government type</th>
                    <th scope="col">Population size</th>
                    <th scope="col">Notes</th>
                    <th scope="col">Dashboard</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={`${row.jurisdiction}-${row.jurisdictionId}-${row.url}`}>
                      <td>{row.jurisdiction}</td>
                      <td className="mono">{row.jurisdictionId}</td>
                      <td>{row.displayGovernmentType}</td>
                      <td>{row.populationSize}</td>
                      <td>{row.notes || '—'}</td>
                      <td>
                        <a href={row.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </section>
      </div>

      <Modal id="details-modal" ref={modalRef} aria-labelledby="details-heading" aria-describedby="details-body">
        <ModalHeading id="details-heading">
          {selectedFeature ? selectedFeature.properties.name : 'Jurisdiction details'}
        </ModalHeading>
        <div className="modal-body" id="details-body">
          {selectedFeatureRows.length === 0 ? (
            <p>No matching dashboards for the current filters.</p>
          ) : (
            <ul className="detail-list">
              {selectedFeatureRows.map((row) => (
                <li key={`${row.jurisdiction}-${row.url}`} className="detail-card">
                  <p className="detail-title">{row.jurisdiction}</p>
                  <p className="detail-meta">ID: {row.jurisdictionId}</p>
                  <p className="detail-meta">Government type: {row.displayGovernmentType}</p>
                  <p className="detail-meta">Population size: {row.populationSize}</p>
                  {row.notes && <p className="detail-notes">{row.notes}</p>}
                  <p>
                    <a href={row.url} target="_blank" rel="noreferrer">
                      Open dashboard
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ModalFooter>
          <Button type="button" secondary onClick={() => modalRef.current?.toggleModal(undefined, false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </GridContainer>
  )
}

export default App
