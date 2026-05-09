import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/classNames';
import {
  PromptBar, CTMark,
  Panel, Stack, Grid, Section, SplitPane, Rail, Divider,
  StatusPill, Label, Heading, BodyText, Callout, InlineQuote, CodeBlock, Metadata,
  Button, IconButton, TextField, TextArea, Select, Toggle, SegmentedControl, CheckboxRow, RadioRow, Slider,
  QuoteCard, IdentityCard, EvidenceSource, AlertList, ProgressBar, ConclusionCard, SourceTrail, EvidenceStack,
  Timeline, SequenceDiagram, Stepper, ComparisonTable, FlowDiagram,
  StepList, ScopeMatrix, ApprovalGate, ExecutionLog, CopyField, VerificationResult,
  RiskSummary, UncertaintyNote, SourceQualityBadge, SensitiveContextGuard, PrivateModeBadge, AuditTrail,
  Skeleton, ProgressList, EmptyState, ErrorState, SuccessState, LoadingSpinner,
  SecurityBoundary, TrustIndicator, PermissionBadge, DataStream, ScanLine, FloatingIndicator,
  AgentStateIndicator, ToolProgressCard, BudgetBar, MemoryChip, ClarificationPrompt, IntentConfirmation, FollowUpBar, InterruptControl,
  Accordion, Tabs, Breadcrumb, Tooltip, Badge, Tag,
  ImageFrame, MediaFrame, DiagramFrame, ScreenshotFrame, CarouselFrame, CodeFrame, MapFrame, ChartFrame,
} from '@/primitives';

const categories = [
  { id: 'shell', label: 'A. Shell', icon: 'layers' },
  { id: 'layout', label: 'B. Layout', icon: 'grid_view' },
  { id: 'text', label: 'C. Text & Status', icon: 'text_fields' },
  { id: 'input', label: 'D. Inputs', icon: 'toggle_on' },
  { id: 'evidence', label: 'E. Evidence', icon: 'fact_check' },
  { id: 'visual', label: 'F. Visual', icon: 'account_tree' },
  { id: 'action', label: 'G. Actions', icon: 'bolt' },
  { id: 'safety', label: 'H. Safety', icon: 'security' },
  { id: 'state', label: 'I. State', icon: 'hourglass_empty' },
  { id: 'trust', label: 'J. Trust', icon: 'verified_user' },
  { id: 'agent', label: 'K. Agent System', icon: 'smart_toy' },
  { id: 'navigation', label: 'L. Navigation', icon: 'navigation' },
  { id: 'frames', label: 'M. Frames', icon: 'frame_reload' },
];

const GalleryCard = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <div className="bg-surface border border-outline rounded p-4 hard-shadow flex flex-col">
    <div className="font-label-mono text-label-mono text-on-surface-variant border-b border-outline pb-2 mb-4 uppercase tracking-wider">
      {title}
    </div>
    <div className="flex-1 min-h-[80px]">{children}</div>
    <p className="font-body-sm text-body-sm text-on-surface-variant mt-4">{description}</p>
  </div>
);

const SectionHeader = ({ id, title, subtitle }: { id: string; title: string; subtitle: string }) => (
  <div id={id} className="border-l-4 border-primary pl-4 scroll-mt-20">
    <h2 className="font-headline-sm text-headline-sm font-bold text-primary">{title}</h2>
    <p className="font-label-mono text-label-mono text-on-surface-variant mt-1">{subtitle}</p>
  </div>
);

export const PrimitiveGallery = () => {
  const [activeSection, setActiveSection] = useState('shell');
  const [toggleOn, setToggleOn] = useState(false);
  const [checkboxItems, setCheckboxItems] = useState([
    { id: 'read', label: 'Read users', checked: true },
    { id: 'delete', label: 'Delete users', checked: false },
  ]);
  const [radioValue, setRadioValue] = useState('30');
  const [sliderValue, setSliderValue] = useState(65);
  const [segmentedValue, setSegmentedValue] = useState('without');
  const [textFieldValue, setTextFieldValue] = useState('full-permissions-production');
  const [textAreaValue, setTextAreaValue] = useState('');
  const [selectValue, setSelectValue] = useState('production');

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = document.querySelectorAll('section[data-category]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute('data-category') || '');
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col p-3 fixed left-0 top-12 h-[calc(100vh-3rem)] w-56 bg-surface-container-low border-r border-outline z-40 overflow-y-auto">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-on-primary font-bold text-[11px]">CT</div>
          <div>
            <h2 className="font-headline-sm text-headline-sm font-black text-primary">Primitives</h2>
            <span className="font-label-mono text-label-mono text-on-surface-variant">v3.0.0</span>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollTo(cat.id)}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-mono text-label-mono text-left",
                activeSection === cat.id && "bg-secondary-container text-on-secondary-container font-bold"
              )}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-outline-variant pt-3 flex flex-col gap-1">
          <a
            className="flex items-center gap-3 px-2 py-2 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-mono text-label-mono"
            href="UI_PRIMITIVES.md"
          >
            <span className="material-symbols-outlined text-[16px]">description</span> Schema
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 ml-0 md:ml-56 p-3 md:p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-16 pb-24">
          {/* Header */}
          <div className="border-b border-outline pb-3">
            <h1 className="font-headline-sm text-[22px] leading-tight font-black text-primary tracking-tight">Primitive Library</h1>
            <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl">
              Atomic, composable UI primitives for runtime-generated browser overlays. The agent emits these nodes; the renderer maps them to real components.{' '}
              <span className="font-label-mono text-label-mono text-primary">92 primitives</span> across{' '}
              <span className="font-label-mono text-label-mono text-primary">13 categories</span>.
            </p>
          </div>

          {/* A. Overlay Shell */}
          <section data-category="shell" className="space-y-6">
            <SectionHeader id="shell" title="A. Overlay Shell" subtitle="Root containers, prompts, anchors, dimmers" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="OverlayRoot" description="Fixed-position wrapper. Creates stacking context without blocking host scroll or pointer events.">
                <div className="relative h-32 bg-surface-container-low rounded border border-outline-variant overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-20 bg-surface border border-outline rounded subtle-lift flex items-center justify-center">
                      <span className="font-label-mono text-label-mono text-on-surface-variant">Floating panel</span>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 font-label-mono text-label-mono text-on-surface-variant">Host page (pass-through)</div>
                </div>
              </GalleryCard>
              <GalleryCard title="PromptBar" description="Floating command input. Anchored to selection or cursor. Minimal chrome, maximum intent speed.">
                <PromptBar placeholder="Enter generative command..." status="idle" />
              </GalleryCard>
              <GalleryCard title="CTMark" description="Identifies Clickthrough-controlled UI. Never omitted on sensitive actions or approval gates.">
                <div className="flex items-center gap-3">
                  <CTMark variant="badge" />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Trust anchor on every generated surface</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <CTMark variant="icon" />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Compact variant</span>
                </div>
              </GalleryCard>
              <GalleryCard title="AnchorHighlight" description="2px border around the target element. No fill, no blur. Precise and non-intrusive.">
                <div className="p-4 bg-surface-container-low rounded border border-outline-variant">
                  <div className="border-2 border-primary rounded p-2">
                    <span className="font-body-sm text-body-sm text-on-background">Target element on host page</span>
                  </div>
                </div>
              </GalleryCard>
              <GalleryCard title="PageDimmer" description="Subtle overlay behind modal gates. Just enough to shift focus, not enough to hide context.">
                <div className="relative h-32 bg-surface-container-low rounded border border-outline-variant overflow-hidden">
                  <div className="absolute inset-0 bg-black/[0.04] flex items-center justify-center">
                    <span className="font-label-mono text-label-mono text-on-surface-variant">4% opacity scrim</span>
                  </div>
                </div>
              </GalleryCard>
              <GalleryCard title="OverlayPositioner" description="Six overlay modes matched to intent, risk level, and available viewport space.">
                <div className="grid grid-cols-3 gap-1 text-center font-label-mono text-label-mono text-on-surface-variant">
                  <div className="border border-outline rounded p-1 bg-surface-container-low">inline</div>
                  <div className="border border-outline rounded p-1 bg-surface-container-low">popover</div>
                  <div className="border border-outline rounded p-1 bg-surface-container-low">side</div>
                  <div className="border border-primary rounded p-1 bg-primary-container text-on-primary">spotlight</div>
                  <div className="border border-outline rounded p-1 bg-surface-container-low">fullscreen</div>
                  <div className="border border-outline rounded p-1 bg-surface-container-low">native</div>
                </div>
              </GalleryCard>
            </div>
          </section>

          {/* B. Layout */}
          <section data-category="layout" className="space-y-6">
            <SectionHeader id="layout" title="B. Layout" subtitle="Containers, spacing, and structural primitives" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="Panel" description="Primary container. 1px border, optional hard shadow, sectioned by horizontal rules.">
                <Panel title="Header" subtitle="Subtitle" size="sm">
                  <div className="font-body-sm text-body-sm text-on-surface-variant">Body content with 1px top border separating sections.</div>
                </Panel>
              </GalleryCard>
              <GalleryCard title="Stack" description="Vertical flex with consistent gap. The default layout primitive.">
                <Stack gap="sm">
                  <div className="p-2 bg-surface-container-low rounded border border-outline-variant font-label-mono text-label-mono text-on-surface-variant">Item A</div>
                  <div className="p-2 bg-surface-container-low rounded border border-outline-variant font-label-mono text-label-mono text-on-surface-variant">Item B</div>
                  <div className="p-2 bg-surface-container-low rounded border border-outline-variant font-label-mono text-label-mono text-on-surface-variant">Item C</div>
                </Stack>
              </GalleryCard>
              <GalleryCard title="Grid" description="CSS grid with configurable columns. Used for evidence grids and comparison matrices.">
                <Grid columns={2} gap="sm">
                  <div className="p-2 bg-surface-container-low rounded border border-outline-variant text-center font-label-mono text-label-mono text-on-surface-variant">A</div>
                  <div className="p-2 bg-surface-container-low rounded border border-outline-variant text-center font-label-mono text-label-mono text-on-surface-variant">B</div>
                  <div className="p-2 bg-surface-container-low rounded border border-outline-variant text-center font-label-mono text-label-mono text-on-surface-variant">C</div>
                  <div className="p-2 bg-surface-container-low rounded border border-outline-variant text-center font-label-mono text-label-mono text-on-surface-variant">D</div>
                </Grid>
              </GalleryCard>
              <GalleryCard title="Section" description="Panel subdivision. Used to group evidence, controls, and actions.">
                <Section title="Section Title" description="Content grouped by purpose. Always separated by 1px borders, never nested cards." />
              </GalleryCard>
              <GalleryCard title="SplitPane" description="Two-column layout for comparison or detail views.">
                <SplitPane ratio="1:1">
                  <div className="p-2 font-body-sm text-body-sm text-on-surface-variant">Left pane</div>
                  <div className="p-2 border-l border-outline font-body-sm text-body-sm text-on-surface-variant">Right pane</div>
                </SplitPane>
              </GalleryCard>
              <GalleryCard title="Rail" description="Vertical icon navigation. Used in side panels and workbench modes.">
                <Rail items={[{ id: '1', label: 'Home', icon: 'home' }, { id: '2', label: 'Search', icon: 'search' }, { id: '3', label: 'Settings', icon: 'settings' }]} activeId="1" />
              </GalleryCard>
              <GalleryCard title="Spacer" description="Explicit spacing primitive. Agent controls density through spacers, not magic numbers.">
                <div className="flex flex-col">
                  <div className="h-0.5 bg-primary-container rounded" />
                  <div className="font-label-mono text-label-mono text-on-surface-variant text-center mt-1">xs (2px)</div>
                  <div className="h-1 bg-primary-container rounded mt-2" />
                  <div className="font-label-mono text-label-mono text-on-surface-variant text-center mt-1">sm (4px)</div>
                </div>
              </GalleryCard>
              <GalleryCard title="Divider" description="1px horizontal rule. Uses outline color. No margin assumptions.">
                <div className="space-y-1">
                  <div className="font-body-sm text-body-sm text-on-background">Above</div>
                  <Divider />
                  <div className="font-body-sm text-body-sm text-on-background">Below</div>
                </div>
              </GalleryCard>
            </div>
          </section>

          {/* C. Text & Status */}
          <section data-category="text" className="space-y-6">
            <SectionHeader id="text" title="C. Text & Status" subtitle="Typography, labels, pills, and callouts" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="StatusPill" description="Compact status indicator. Dot + label. Monochrome variants using surface/container hierarchy.">
                <div className="flex flex-col gap-1">
                  <StatusPill label="Analyzing" />
                  <StatusPill label="Streaming" />
                  <StatusPill label="Unverified" />
                  <StatusPill label="Completed" />
                </div>
              </GalleryCard>
              <GalleryCard title="Label" description="11px JetBrains Mono. Uppercase with tracking. Used for section headers, metadata, and status.">
                <div className="space-y-2">
                  <Label tone="strong">Section Label</Label>
                  <Label>Metadata &middot; 11px mono</Label>
                  <Label tone="muted">Muted metadata</Label>
                </div>
              </GalleryCard>
              <GalleryCard title="Heading" description="Geist, tight leading, negative tracking. Three levels max inside overlays.">
                <div className="space-y-1">
                  <Heading level={1}>Headline</Heading>
                  <Heading level={2}>Section Title</Heading>
                  <Heading level={3}>Subsection</Heading>
                </div>
              </GalleryCard>
              <GalleryCard title="BodyText" description="Max 64ch inside panels. No oversized typography in overlays.">
                <div className="space-y-1">
                  <BodyText>Body text at 13px/18px. Optimized for scanning, not reading.</BodyText>
                  <BodyText tone="muted">Secondary text at 12px/16px. Used for descriptions and metadata.</BodyText>
                </div>
              </GalleryCard>
              <GalleryCard title="Callout" description="Left-border emphasis. No side-stripe cards. Used for warnings, notes, and quotes.">
                <div className="space-y-2">
                  <Callout body="Default callout with accent border. No background tint." />
                  <Callout body="This action cannot be undone." tone="danger" title="Danger" />
                  <Callout body="The agent is not certain about this claim." tone="warning" />
                </div>
              </GalleryCard>
              <GalleryCard title="InlineQuote" description="Attributed quotation from source material. Used in verification dashboards.">
                <InlineQuote quote="Because the verifier was never sent over the wire, an attacker who intercepts the authorization code cannot exchange it for a token." source="Source paragraph, page 12" />
              </GalleryCard>
              <GalleryCard title="CodeBlock" description="Dark container for credentials, tokens, and code snippets.">
                <CodeBlock code="sk_live_51H7x...9J2m" language="bash" />
              </GalleryCard>
              <GalleryCard title="Metadata" description="Source attribution. 11px mono, dot-separated, muted color.">
                <Metadata items={[{ label: 'Source', value: 'x.com/raulgcc1' }, { label: 'Date', value: 'May 9, 2026' }, { label: 'Time', value: '10:42 AM' }]} />
              </GalleryCard>
            </div>
          </section>

          {/* D. Inputs */}
          <section data-category="input" className="space-y-6">
            <SectionHeader id="input" title="D. Inputs" subtitle="Buttons, fields, toggles, and controls" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="Button" description="Four variants: primary (filled), secondary (outlined), destructive (error), ghost (text).">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button label="Primary" variant="primary" />
                    <Button label="Secondary" variant="secondary" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button label="Destructive" variant="danger" />
                    <Button label="Ghost" variant="ghost" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button label="Disabled" variant="primary" disabled />
                    <Button label="Loading" variant="primary" loading />
                  </div>
                </div>
              </GalleryCard>
              <GalleryCard title="IconButton" description="Square button with icon. Always includes title attribute for accessibility.">
                <div className="flex gap-2">
                  <IconButton icon="content_copy" label="Copy" />
                  <IconButton icon="close" label="Close" />
                  <IconButton icon="settings" label="Settings" />
                </div>
              </GalleryCard>
              <GalleryCard title="TextField" description="Single-line input. 1px border, minimal padding, primary focus ring.">
                <div className="space-y-2">
                  <TextField placeholder="Key name..." />
                  <TextField value={textFieldValue} onChange={setTextFieldValue} />
                </div>
              </GalleryCard>
              <GalleryCard title="TextArea" description="Multi-line input. Same styling as TextField. Vertical resize only.">
                <TextArea placeholder="Type a reply..." rows={3} value={textAreaValue} onChange={setTextAreaValue} />
              </GalleryCard>
              <GalleryCard title="Select" description="Dropdown selection. Native select element, styled consistently.">
                <Select
                  value={selectValue}
                  onChange={setSelectValue}
                  options={[{ label: 'Production', value: 'production' }, { label: 'Staging', value: 'staging' }, { label: 'Development', value: 'development' }]}
                />
              </GalleryCard>
              <GalleryCard title="Toggle" description="Binary switch. Minimal chrome, clear on/off state.">
                <Toggle label="Click to toggle" checked={toggleOn} onChange={setToggleOn} />
              </GalleryCard>
              <GalleryCard title="SegmentedControl" description="Mutually exclusive options. Used for mode switching and filter selection.">
                <SegmentedControl
                  value={segmentedValue}
                  onChange={setSegmentedValue}
                  options={[{ label: 'Without', value: 'without' }, { label: 'With', value: 'with' }]}
                />
              </GalleryCard>
              <GalleryCard title="CheckboxRow" description="Checkbox with label. Used in scope matrices and permission lists.">
                <CheckboxRow
                  items={checkboxItems}
                  onChange={(id, checked) => setCheckboxItems((prev) => prev.map((item) => item.id === id ? { ...item, checked } : item))}
                />
              </GalleryCard>
              <GalleryCard title="RadioRow" description="Single-select option. Used when only one choice is valid.">
                <RadioRow
                  name="expiry"
                  value={radioValue}
                  onChange={setRadioValue}
                  items={[{ id: '30', label: '30 days', value: '30' }, { id: '90', label: '90 days', value: '90' }]}
                />
              </GalleryCard>
              <GalleryCard title="Slider" description="Range slider for continuous values. Used for tone strength and explanation depth.">
                <div className="space-y-2">
                  <Slider label="Tone" value={sliderValue} onChange={setSliderValue} />
                  <Slider label="Depth" value={30} onChange={() => {}} />
                </div>
              </GalleryCard>
            </div>
          </section>

          {/* E. Evidence */}
          <section data-category="evidence" className="space-y-6">
            <SectionHeader id="evidence" title="E. Evidence" subtitle="Claims, sources, identity, and verdict" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="QuoteCard" description="Extracted text with source attribution. Generic: works for claims, quotes, and statements.">
                <QuoteCard claim="I'm joining Amazon as a summer intern." speaker="Raul Garcia" sourceLabel="x.com/raulgcc1 · May 9, 2026" />
              </GalleryCard>
              <GalleryCard title="IdentityCard" description="Identity match with verification status. Avatar + name + handle + status pill.">
                <IdentityCard name="Raul Garcia" aliases={['@raulgcc1']} profiles={[{ label: 'X (Twitter)', url: '#' }]} matchConfidence={0.72} />
              </GalleryCard>
              <GalleryCard title="EvidenceSource" description="Generic source row with favicon, title, URL, and quality badge. Stacked in EvidenceStack.">
                <div className="space-y-1">
                  <EvidenceSource title="LinkedIn — Raul Garcia" url="linkedin.com/in/raulgcc" quality="high" stance="supports" />
                  <EvidenceSource title="Amazon Jobs Blog" url="amazon.jobs" quality="medium" stance="neutral" />
                </div>
              </GalleryCard>
              <GalleryCard title="AlertList" description="List of alerts or warnings with tone-based styling.">
                <AlertList items={[{ message: 'Source is unverified', tone: 'warning' }, { message: 'Claim matches 3 sources', tone: 'success' }]} />
              </GalleryCard>
              <GalleryCard title="ProgressBar" description="Thin progress bar with percentage. Used for claim confidence and task progress.">
                <div className="space-y-2">
                  <ProgressBar value={72} label="Confidence" />
                  <ProgressBar value={34} label="Progress" tone="warning" />
                </div>
              </GalleryCard>
              <GalleryCard title="ConclusionCard" description="Generic final judgment with reasoning. Thick border for emphasis. Works for any verdict type.">
                <ConclusionCard verdict="true" headline="Likely true" summary="Multiple sources confirm the claim. No direct contradiction found, though exact start date is unverified." confidence={0.85} />
              </GalleryCard>
              <GalleryCard title="SourceTrail" description="Horizontal source chain. Dots for visited nodes, hollow for future.">
                <SourceTrail steps={[{ label: 'LinkedIn', state: 'done' }, { label: 'Amazon', state: 'done' }, { label: 'GitHub', state: 'done' }, { label: 'More', state: 'pending' }]} currentStep={2} />
              </GalleryCard>
              <GalleryCard title="EvidenceStack" description="Stacked list of evidence sources. Border-separated, no card nesting.">
                <EvidenceStack sources={[{ title: 'LinkedIn — High confidence', url: '#', quality: 'high' }, { title: 'Amazon Blog — High confidence', url: '#', quality: 'high' }, { title: 'GitHub — Medium confidence', url: '#', quality: 'medium' }]} />
              </GalleryCard>
            </div>
          </section>

          {/* F. Visual */}
          <section data-category="visual" className="space-y-6">
            <SectionHeader id="visual" title="F. Visual Explanations" subtitle="Diagrams, timelines, and structured visuals" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="Timeline" description="Vertical timeline with active state. Used for sequences and process steps.">
                <Timeline items={[{ id: '1', label: 'Request', date: 'Client sends code challenge' }, { id: '2', label: 'Authorize', date: 'User authenticates', active: true }, { id: '3', label: 'Exchange', date: 'Code + verifier → token' }]} />
              </GalleryCard>
              <GalleryCard title="SequenceDiagram" description="Actor-message-actor flow. Used for protocol explanations and API flows.">
                <SequenceDiagram actors={['Client', 'Server']} messages={[{ from: 'Client', to: 'Server', label: 'Authorization Request + Code Challenge' }, { from: 'Server', to: 'Client', label: 'Authorization Code' }, { from: 'Client', to: 'Server', label: 'Token Request + Code + Verifier' }, { from: 'Server', to: 'Client', label: 'Access Token' }]} activeStep={2} />
              </GalleryCard>
              <GalleryCard title="Stepper" description="Horizontal step indicator. Completed, current, and future states.">
                <Stepper steps={[{ title: 'Auth', state: 'done' }, { title: 'Code', state: 'active' }, { title: 'Token', state: 'pending' }]} activeStep={1} />
              </GalleryCard>
              <GalleryCard title="ComparisonTable" description="Side-by-side comparison. Highlighted cells for advantages. No card nesting.">
                <ComparisonTable columns={[{ key: 'feature', label: 'Feature' }, { key: 'basic', label: 'Basic' }, { key: 'pkce', label: 'PKCE' }]} rows={[{ feature: 'Mobile safe', basic: 'No', pkce: 'Yes' }, { feature: 'Secretless', basic: 'No', pkce: 'Yes' }, { feature: 'Complexity', basic: 'Simple', pkce: 'Moderate' }]} highlightColumn="pkce" />
              </GalleryCard>
              <GalleryCard title="AnnotatedDiagram" description="Image or diagram with numbered callout badges. Used for annotated screenshots.">
                <div className="relative p-4 bg-surface-container-low rounded border border-outline-variant h-24">
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-mono text-[10px] font-bold">1</div>
                  <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-mono text-[10px] font-bold">2</div>
                </div>
              </GalleryCard>
              <GalleryCard title="FlowDiagram" description="Simple flowchart with boxes and arrows. Used for decision trees and workflows.">
                <FlowDiagram nodes={[{ id: 'start', label: 'Start' }, { id: 'process', label: 'Process' }, { id: 'end', label: 'End' }]} edges={[{ from: 'start', to: 'process' }, { from: 'process', to: 'end' }]} />
              </GalleryCard>
            </div>
          </section>

          {/* G. Actions */}
          <section data-category="action" className="space-y-6">
            <SectionHeader id="action" title="G. Actions" subtitle="Forms, approval, execution, and results" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="StepList" description="Generic numbered sequence with timing estimates. Shown before execution. Decoupled from any specific action type.">
                <StepList goal="Generate API Key" steps={[{ label: 'Validate permissions (~1s)' }, { label: 'Generate key pair (~2s)' }, { label: 'Log audit event (~0.5s)' }]} riskLevel="high" requiresApproval />
              </GalleryCard>
              <GalleryCard title="ScopeMatrix" description="Permission matrix with checkmarks. Danger rows highlighted for sensitive scopes.">
                <ScopeMatrix scopes={[{ id: 'users', label: 'Users', risk: 'low' }, { id: 'billing', label: 'Billing', risk: 'high', description: 'Can charge cards' }]} selectedScopes={['users', 'billing']} />
              </GalleryCard>
              <GalleryCard title="ApprovalGate" description="Modal approval gate. Requires explicit user confirmation before destructive actions.">
                <ApprovalGate title="Confirm Action" summary="This will create a full-permissions API key. This action cannot be undone." approveLabel="Confirm" cancelLabel="Cancel" risks={[{ label: 'Full permissions', level: 'high' }]} />
              </GalleryCard>
              <GalleryCard title="ExecutionLog" description="Generic dark terminal-style log. Timestamp + status icon + message. Used for any execution stream.">
                <ExecutionLog entries={[{ label: 'Validating permissions matrix', status: 'done' }, { label: 'Checking environment access', status: 'done' }, { label: 'Full permissions flagged — logging audit', status: 'failed' }, { label: 'Generating key pair', status: 'done' }, { label: 'Key created successfully', status: 'done' }]} currentEntry={4} mode="compact" />
              </GalleryCard>
              <GalleryCard title="CopyField" description="Read-only field with copy button. Used for credentials, tokens, and generated values.">
                <CopyField value="sk_live_51H7x...9J2m" />
              </GalleryCard>
              <GalleryCard title="VerificationResult" description="Success state with result and copy action. Primary border for emphasis.">
                <VerificationResult status="success" summary="Your API key has been generated. Copy it now — you won't see it again." evidence={['Permissions validated', 'Key pair generated']} nextActions={[{ label: 'Copy key' }, { label: 'Create another' }]} />
              </GalleryCard>
            </div>
          </section>

          {/* H. Safety */}
          <section data-category="safety" className="space-y-6">
            <SectionHeader id="safety" title="H. Safety" subtitle="Risk, uncertainty, and sensitive context" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="RiskSummary" description="Risk level indicator with description. Error-colored for high risk.">
                <RiskSummary riskLevel="high" items={[{ label: 'Full permissions', level: 'high' }]} recommendation="This key can read, modify, and delete all resources." />
              </GalleryCard>
              <GalleryCard title="UncertaintyNote" description="Honest uncertainty disclosure. Italic, dashed top border, muted color.">
                <UncertaintyNote reason="Clickthrough is uncertain because identity on X could not be cryptographically verified. The claim itself is consistent with other sources." />
              </GalleryCard>
              <GalleryCard title="SourceQualityBadge" description="Source reliability indicator. Three levels: solid, outlined, dashed.">
                <div className="flex gap-2 flex-wrap">
                  <SourceQualityBadge quality="high" />
                  <SourceQualityBadge quality="medium" />
                  <SourceQualityBadge quality="low" />
                </div>
              </GalleryCard>
              <GalleryCard title="SensitiveContextGuard" description="Full-screen guard for sensitive contexts. User must explicitly opt-in.">
                <SensitiveContextGuard category="health" message="This topic may be personal. Clickthrough can offer general information, not professional advice." />
              </GalleryCard>
              <GalleryCard title="PrivateModeBadge" description="Privacy indicator. Dashed border signals ephemeral, non-persistent context.">
                <PrivateModeBadge label="Private — nothing stored" />
              </GalleryCard>
              <GalleryCard title="AuditTrail" description="Action audit log. Icon + event + timestamp. Used for compliance and verification.">
                <AuditTrail entries={[{ timestamp: '10:42:03', action: 'User approved action', actor: 'raulgcc1' }, { timestamp: '10:42:04', action: 'API key created', actor: 'system' }, { timestamp: '10:42:05', action: 'Notification sent', actor: 'system' }]} />
              </GalleryCard>
            </div>
          </section>

          {/* I. State */}
          <section data-category="state" className="space-y-6">
            <SectionHeader id="state" title="I. State" subtitle="Loading, empty, error, and success" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="Skeleton" description="Animated placeholder bars. Shown while agent generates content. Never use spinners alone.">
                <div className="space-y-2">
                  <Skeleton shape="line" count={1} />
                  <Skeleton shape="line" count={1} />
                  <Skeleton shape="block" count={1} />
                </div>
              </GalleryCard>
              <GalleryCard title="ProgressList" description="Task progress with status icons. Done, active (pulsing), and pending states.">
                <ProgressList items={[{ label: 'Done', state: 'done' }, { label: 'Running', state: 'running' }, { label: 'Waiting', state: 'pending' }]} />
              </GalleryCard>
              <GalleryCard title="EmptyState" description="Neutral empty state. No blame, no decoration. Clear next step.">
                <EmptyState title="No results yet" body="Start by asking a question." />
              </GalleryCard>
              <GalleryCard title="ErrorState" description="Error with explanation and recovery action. No generic something went wrong.">
                <ErrorState title="Unable to reach source" body="The server returned a 503 error." retryActionId="retry" />
              </GalleryCard>
              <GalleryCard title="SuccessState" description="Success confirmation with optional dismiss. Minimal, non-intrusive.">
                <SuccessState title="Action completed" body="Your changes have been saved." />
              </GalleryCard>
              <GalleryCard title="LoadingSpinner" description="Minimal spinner. Only used inside buttons or tiny spaces. Prefer Skeleton for content.">
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="md" />
                </div>
              </GalleryCard>
            </div>
          </section>

          {/* J. Trust & Security */}
          <section data-category="trust" className="space-y-6">
            <SectionHeader id="trust" title="J. Trust & Security" subtitle="Verification, boundaries, and permission indicators" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="SecurityBoundary" description="Dashed border indicating CT-controlled zone. Used for approval gates and sensitive forms.">
                <SecurityBoundary level="high">
                  <div className="font-body-sm text-body-sm text-on-surface-variant">This zone is controlled by Clickthrough.</div>
                </SecurityBoundary>
              </GalleryCard>
              <GalleryCard title="TrustIndicator" description="Verification level with icon. Clear distinction between confirmed and uncertain.">
                <div className="space-y-2">
                  <TrustIndicator level="trusted" label="Cryptographically verified" />
                  <TrustIndicator level="unverified" label="Identity unconfirmed" />
                </div>
              </GalleryCard>
              <GalleryCard title="PermissionBadge" description="Scope tag. Error styling for elevated permissions.">
                <div className="flex gap-2 flex-wrap">
                  <PermissionBadge permission="read:users" />
                  <PermissionBadge permission="write:keys" />
                  <PermissionBadge permission="admin:*" />
                </div>
              </GalleryCard>
              <GalleryCard title="DataStream" description="Live-updating text stream. Used for real-time agent status and log output.">
                <DataStream label="Analyzing page context..." active />
              </GalleryCard>
              <GalleryCard title="ScanLine" description="Horizontal scanning indicator. Used during DOM inspection and page analysis.">
                <ScanLine active progress={50} label="Scanning DOM..." />
              </GalleryCard>
              <GalleryCard title="FloatingIndicator" description="Small floating status dot or pill. Anchored to corners of panels.">
                <div className="relative h-16 bg-surface-container-low rounded border border-outline-variant">
                  <FloatingIndicator label="Streaming" tone="info" pulse />
                </div>
              </GalleryCard>
            </div>
          </section>

          {/* K. Agent System */}
          <section data-category="agent" className="space-y-6">
            <SectionHeader id="agent" title="K. Agent System" subtitle="Agent state, tools, budget, memory, and control" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="AgentStateIndicator" description="Current agent state. Dot color + label. Pulsing for active states.">
                <div className="space-y-2">
                  <AgentStateIndicator state="observing" message="Observing page" />
                  <AgentStateIndicator state="searching" message="Searching sources" />
                  <AgentStateIndicator state="generating" message="Generating response" />
                </div>
              </GalleryCard>
              <GalleryCard title="ToolProgressCard" description="Individual tool execution progress. Icon, name, count, and progress bar.">
                <ToolProgressCard toolName="Web Search" status="running" progress={40} detail="2/5 sources" />
              </GalleryCard>
              <GalleryCard title="BudgetBar" description="Budget consumption tracker. Segmented bar with label and limit.">
                <BudgetBar turnsUsed={42} turnsMax={100} toolsUsed={3} toolsMax={10} elapsedMs={42000} />
              </GalleryCard>
              <GalleryCard title="MemoryChip" description="Memory/context chips. Shows what the agent remembers about the current session.">
                <div className="flex gap-2 flex-wrap">
                  <MemoryChip hint="claim:amazon-intern" source="session" />
                  <MemoryChip hint="source:linkedin" source="site" />
                  <MemoryChip hint="intent:verify" source="user" />
                </div>
              </GalleryCard>
              <GalleryCard title="ClarificationPrompt" description="Asks user to clarify ambiguous intent. Button options, no free text.">
                <ClarificationPrompt question="Which Raul Garcia?" options={[{ label: 'Raul Garcia — SWE at Amazon', value: 'amazon' }, { label: 'Raul Garcia — Designer at Spotify', value: 'spotify' }]} />
              </GalleryCard>
              <GalleryCard title="IntentConfirmation" description="Confirms interpreted intent before execution. Prevents misunderstood commands.">
                <IntentConfirmation intent="Create a full-permissions API key" confidence={0.94} onConfirm="confirm" onReject="reject" />
              </GalleryCard>
              <GalleryCard title="FollowUpBar" description="Suggested follow-up actions. Horizontal scrollable chips.">
                <FollowUpBar suggestions={['Show sources', 'Explain PKCE', 'Create another key']} />
              </GalleryCard>
              <GalleryCard title="InterruptControl" description="Pause or stop agent execution. Used for long-running or streaming tasks.">
                <InterruptControl onCancel="cancel" onPause="pause" onResume="resume" />
              </GalleryCard>
            </div>
          </section>

          {/* L. Navigation */}
          <section data-category="navigation" className="space-y-6">
            <SectionHeader id="navigation" title="L. Navigation" subtitle="Accordion, tabs, breadcrumbs, tooltips, badges, and tags" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GalleryCard title="Accordion" description="Collapsible sections. One open at a time. Used for dense information grouping.">
                <Accordion items={[{ id: '1', title: 'Sources', content: 'LinkedIn, Amazon Blog, GitHub' }, { id: '2', title: 'Details', content: 'Confidence: 72% · Last checked: 10:42 AM' }]} />
              </GalleryCard>
              <GalleryCard title="Tabs" description="Tabbed navigation for switching between related views inside a panel.">
                <Tabs tabs={[{ id: 'evidence', label: 'Evidence' }, { id: 'sources', label: 'Sources' }, { id: 'timeline', label: 'Timeline' }]} activeTab="evidence" />
                <div className="pt-2 font-body-sm text-body-sm text-on-surface-variant">3 sources confirm the claim with high confidence.</div>
              </GalleryCard>
              <GalleryCard title="Breadcrumb" description="Hierarchical navigation path. Slash-separated, last item is active.">
                <Breadcrumb items={[{ label: 'Home' }, { label: 'Investigations' }, { label: 'Amazon Intern Claim' }]} />
              </GalleryCard>
              <GalleryCard title="Tooltip" description="Hover-activated info popup. Uses native title for simplicity.">
                <div className="flex items-center justify-center py-4">
                  <Tooltip content="PKCE adds security for public clients" targetId="tooltip-target" />
                  <span id="tooltip-target" className="font-body-sm text-body-sm text-on-background cursor-help border-b border-dashed border-outline">Hover me</span>
                </div>
              </GalleryCard>
              <GalleryCard title="Badge" description="Count or status badge. Circular for numbers, pill for labels.">
                <div className="flex gap-2">
                  <Badge label="3" tone="info" />
                  <Badge label="!" tone="danger" />
                  <Badge label="NEW" tone="neutral" />
                </div>
              </GalleryCard>
              <GalleryCard title="Tag" description="Categorization tag. Hash prefix, selectable variants. Used for filtering and grouping.">
                <div className="flex gap-2 flex-wrap">
                  <Tag label="#verification" />
                  <Tag label="#oauth" />
                  <Tag label="#critical" />
                </div>
              </GalleryCard>
            </div>
          </section>

          {/* M. Frames */}
          <section data-category="frames" className="space-y-6">
            <SectionHeader id="frames" title="M. Frames" subtitle="Media, diagrams, screenshots, and visual content containers" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GalleryCard title="ImageFrame" description="Image container with optional caption. Used for screenshots, diagrams, and evidence images.">
                <ImageFrame src="" alt="Captured 10:42 AM" caption="Screenshot annotation" />
              </GalleryCard>
              <GalleryCard title="MediaFrame" description="Video/audio container with progress and controls. Used for generated explainers and tutorials.">
                <MediaFrame src="" type="video" caption="Video explanation" controls />
              </GalleryCard>
              <GalleryCard title="DiagramFrame" description="Structured diagram container with consistent styling. Used for architecture diagrams and flowcharts.">
                <DiagramFrame caption="System architecture" />
              </GalleryCard>
              <GalleryCard title="ScreenshotFrame" description="Browser screenshot with window chrome. Used for page context and visual evidence.">
                <ScreenshotFrame src="" caption="example.com" />
              </GalleryCard>
              <GalleryCard title="CarouselFrame" description="Image carousel with navigation dots. Used for multiple screenshots or evidence images.">
                <CarouselFrame items={[{ src: '', caption: 'Image 1' }, { src: '', caption: 'Image 2' }]} />
              </GalleryCard>
              <GalleryCard title="CodeFrame" description="Code snippet with syntax label and copy action. Dark container for contrast.">
                <CodeFrame code="const verifier = generateCodeVerifier();\nconst challenge = deriveChallenge(verifier);" language="JavaScript" filename="auth.js" copyable />
              </GalleryCard>
              <GalleryCard title="MapFrame" description="Map placeholder with location marker. Used for geographic context and location-based claims.">
                <MapFrame center={{ lat: 37.7749, lng: -122.4194 }} markers={[{ lat: 37.7749, lng: -122.4194, label: 'SF' }]} />
              </GalleryCard>
              <GalleryCard title="ChartFrame" description="Bar chart container. Used for data visualization and trend evidence.">
                <ChartFrame type="bar" data={[{ day: 'Mon', value: 40 }, { day: 'Tue', value: 65 }, { day: 'Wed', value: 85 }, { day: 'Thu', value: 55 }, { day: 'Fri', value: 70 }]} />
              </GalleryCard>
            </div>
          </section>

          <footer className="mt-16 pt-3 border-t border-outline text-on-surface-variant font-body-sm text-body-sm">
            Clickthrough Primitive Library v3.0 · 92 Primitives · 13 Categories · Monochrome Material System · <a href="UI_PRIMITIVES.md" className="text-primary hover:underline">Schema Spec</a>
          </footer>
        </div>
      </main>
    </div>
  );
};
