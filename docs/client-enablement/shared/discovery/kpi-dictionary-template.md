# KPI Dictionary Template

Status: Template
Purpose: Define KPIs and business metrics before modeling, visualization, or reporting so the analytical layer is stable and reviewable.

## Usage

Use one section per KPI. Duplicate the KPI entry as needed.

This template is intended to prevent:

- vague KPI labels
- stakeholder definition conflicts
- hidden calculation changes
- dashboards that look polished but are semantically unstable

## KPI Summary Table

| KPI Name | Business Purpose | Owner | Grain | Refresh Cadence | Status |
|---|---|---|---|---|---|
|  |  |  |  |  | Draft |

---

## KPI Entry

### 1. Basic Identification

- KPI name:
- Short label:
- Domain:
- Business owner:
- Technical owner:
- Status:
  - draft
  - under review
  - approved
  - deprecated

### 2. Business Meaning

- Why this KPI exists:
- What decision it supports:
- Intended audience:
- Common misinterpretations to avoid:

### 3. Formal Definition

- Plain-language definition:
- Calculation logic:
- Numerator:
- Denominator:
- Unit of measure:
- Direction of good performance:
  - higher is better
  - lower is better
  - depends

### 4. Grain and Time Context

- Entity grain:
- Time grain:
- Snapshot or event metric:
- Default reporting window:
- Valid comparison windows:

### 5. Source and Field Mapping

| Source | Table/Object | Field(s) used | Transformation notes |
|---|---|---|---|
|  |  |  |  |

### 6. Inclusion / Exclusion Rules

- Included records:
- Excluded records:
- Status filters:
- Channel/platform filters:
- Geography filters:
- Quality thresholds:

### 7. Business Caveats

- Known limitations:
- Known edge cases:
- Situations where this KPI should not be used alone:
- Related KPIs that should be reviewed with it:

### 8. Privacy / Sensitivity Notes

- Does this KPI use personal data?
- Does it require aggregation or masking?
- Are there platform-policy or jurisdictional constraints?
- What is safe to expose publicly versus privately?

### 9. Validation Rules

- Reconciliation check:
- Freshness check:
- Range/threshold sanity check:
- Duplicate or missing-data check:
- Owner-approved validation method:

### 10. Presentation Notes

- Recommended visualization type:
- Recommended comparison pattern:
- Context that should accompany the KPI:
- Warning text or footnotes if needed:

### 11. Change Log

| Date | Change | Approved by | Notes |
|---|---|---|---|
|  |  |  |  |

---

## KPI Review Checklist

Before a KPI is treated as production-ready or client-ready, confirm:

- The business owner agrees with the definition
- The technical owner agrees with the calculation
- Grain and time context are explicit
- Inclusion/exclusion rules are explicit
- Validation rules exist
- Privacy and exposure rules are understood
- Related caveats are documented
