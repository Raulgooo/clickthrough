## ADDED Requirements

### Requirement: Generic web search tool
The system SHALL expose web search through a provider-neutral `web.search` tool.

#### Scenario: Search uses Exa MVP provider
- **WHEN** the harness requests web evidence for a claim
- **THEN** `web.search` MUST call the Exa provider when an Exa API key is configured

#### Scenario: Search provider hidden from product logic
- **WHEN** the planner consumes search results
- **THEN** it MUST receive normalized ranked sources rather than Exa-specific response objects

#### Scenario: Search returns media-grounded sources
- **WHEN** the harness requests image-grounded web evidence
- **THEN** `web.search` MUST normalize representative image URLs, favicon URLs, and page image links where the provider returns them
- **AND** missing images MUST be represented as absent optional fields rather than tool failure

### Requirement: Web content extraction tool
The system SHALL expose page content retrieval through a provider-neutral `web.fetch` tool.

#### Scenario: Fetch uses Exa contents or search contents
- **WHEN** a source URL or search result needs text evidence
- **THEN** `web.fetch` MUST return clean text, highlights, title, URL, date, and source metadata where available

#### Scenario: Fetch returns image links for GenUI embedding
- **WHEN** a generated evidence UI needs visual grounding from a source page
- **THEN** `web.fetch` SHOULD request provider image metadata, including representative image, favicon, and extracted image links when available
- **AND** returned media MUST include enough attribution metadata for the renderer to show the image next to its source URL

#### Scenario: Fetch failure handled
- **WHEN** Exa cannot retrieve content for a URL
- **THEN** the tool MUST return a structured failure that the harness can show as missing evidence or attempt with fallback fetch

### Requirement: Profile and LinkedIn lookup support
The system SHALL support people/company lookup for verification without assuming all LinkedIn content is fetchable.

#### Scenario: People search
- **WHEN** the verification flow needs public profile signals for a person
- **THEN** the search tool MAY use Exa `people` category and LinkedIn-domain inclusion when appropriate

#### Scenario: Category restrictions respected
- **WHEN** using Exa `people` or `company` categories
- **THEN** the provider MUST avoid unsupported filters such as date filters and `excludeDomains`, and MUST only use LinkedIn domains with `people.includeDomains`

### Requirement: Cost and reliability controls
The system SHALL protect the hackathon demo from unnecessary paid search calls.

#### Scenario: Development cache hit
- **WHEN** a demo query has cached results
- **THEN** the web tool SHOULD use the cached result unless the user explicitly requests fresh evidence

#### Scenario: Result count capped
- **WHEN** a search request does not specify a result count
- **THEN** the provider MUST use a small default result count suitable for evidence UI and free-tier conservation
