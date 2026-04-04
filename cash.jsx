import { useId, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Scale, SlidersHorizontal, ArrowRightLeft, Coins, Users, Info, RotateCcw } from 'lucide-react';

const optionSets = {
  primaryObjective: [
    { value: 'consumption', label: 'Protect food security / smooth consumption' },
    { value: 'investment', label: 'Enable lumpy purchases / productive investment' },
    { value: 'mixed', label: 'Balance immediate protection and recovery' },
    { value: 'public_goods', label: 'Support community-level recovery / public goods' },
  ],
  crisisType: [
    { value: 'sudden', label: 'Sudden-onset shock' },
    { value: 'seasonal', label: 'Seasonal / lean-season stress' },
    { value: 'protracted', label: 'Protracted crisis / displacement' },
  ],
  marketFunction: [
    { value: 'strong', label: 'Markets functioning well' },
    { value: 'mixed', label: 'Markets partly functioning / patchy access' },
    { value: 'weak', label: 'Markets weak or disrupted' },
  ],
  accessConstraint: [
    { value: 'low', label: 'Low access and accountability constraints' },
    { value: 'medium', label: 'Moderate constraints' },
    { value: 'high', label: 'High constraints / limited direct access' },
  ],
  redistributionSetting: [
    { value: 'household', label: 'Household welfare is the main goal' },
    { value: 'mixed', label: 'Household welfare plus some community priorities' },
    { value: 'community', label: 'Community assets / public goods matter a lot' },
  ],
};

const cadenceAlternatives = [
  { key: 'lump_sum', label: 'Lump sum' },
  { key: 'instalments', label: 'Instalments over time' },
  { key: 'hybrid', label: 'Front-loaded hybrid' },
];

const coverageAlternatives = [
  { key: 'broad_direct', label: 'Broader direct distribution' },
  { key: 'targeted_direct', label: 'Targeted direct distribution' },
  { key: 'delegated', label: 'Delegated redistribution' },
];

const initialScenario = {
  primaryObjective: 'mixed',
  crisisType: 'seasonal',
  marketFunction: 'strong',
  accessConstraint: 'medium',
  redistributionSetting: 'household',
  lumpyPurchases: 72,
  smoothingNeed: 78,
  earlyTimingValue: 82,
  repeatPaymentCapacity: 58,
  predictabilityOfNeeds: 66,
  householdChoicePriority: 82,
  exclusionTensionRisk: 56,
  directAccessFeasibility: 62,
  confidenceLocalRedistributors: 42,
  communityGoodsPriority: 28,
  spilloverImportance: 68,
  scarcityPressure: 60,
};

const initialWeights = {
  cadence: {
    lumpyPurchases: 90,
    smoothingNeed: 90,
    earlyTimingValue: 60,
    repeatPaymentCapacity: 50,
    predictabilityOfNeeds: 40,
  },
  coverage: {
    householdChoicePriority: 85,
    exclusionTensionRisk: 60,
    directAccessFeasibility: 75,
    confidenceLocalRedistributors: 90,
    communityGoodsPriority: 60,
    spilloverImportance: 45,
    scarcityPressure: 65,
  },
};

const cadenceCriteria = [
  {
    key: 'lumpyPurchases',
    label: 'Need for lumpy purchases',
    description: 'High when households need to buy inputs, repay debt, repair shelter, move, or restock all at once.',
    evidence: 'Stronger evidence',
    suitability: {
      lump_sum: (v) => v,
      instalments: (v) => 100 - v,
      hybrid: (v) => 50 + 0.45 * Math.abs(v - 50) * -1 + 22,
    },
  },
  {
    key: 'smoothingNeed',
    label: 'Need for consumption smoothing',
    description: 'High when recurring food and essential spending over time is the main challenge.',
    evidence: 'Stronger evidence',
    suitability: {
      lump_sum: (v) => 100 - v,
      instalments: (v) => v,
      hybrid: (v) => 50 + 0.45 * Math.abs(v - 50) * -1 + 22,
    },
  },
  {
    key: 'earlyTimingValue',
    label: 'Value of getting cash there early',
    description: 'High when earlier delivery can change behaviour before a seasonal crunch or predictable stress point.',
    evidence: 'Moderate evidence',
    suitability: {
      lump_sum: (v) => v,
      instalments: (v) => 55 + 0.2 * (100 - Math.abs(v - 55)),
      hybrid: (v) => 70 + 0.15 * v,
    },
  },
  {
    key: 'repeatPaymentCapacity',
    label: 'Capacity for frequent payments',
    description: 'High when systems can reliably make repeated transfers without heavy delay, leakage, or friction.',
    evidence: 'Operational constraint',
    suitability: {
      lump_sum: (v) => 100 - 0.7 * v,
      instalments: (v) => v,
      hybrid: (v) => 40 + 0.6 * v,
    },
  },
  {
    key: 'predictabilityOfNeeds',
    label: 'Predictability of recurring needs',
    description: 'High when needs are likely to remain regular and foreseeable rather than one-off or highly volatile.',
    evidence: 'Moderate evidence',
    suitability: {
      lump_sum: (v) => 100 - v,
      instalments: (v) => v,
      hybrid: (v) => 52 + 0.25 * v,
    },
  },
];

const coverageCriteria = [
  {
    key: 'householdChoicePriority',
    label: 'Priority placed on household choice and control',
    description: 'High when households should decide directly how money is used, rather than intermediaries allocating it.',
    evidence: 'Stronger evidence',
    suitability: {
      broad_direct: (v) => v,
      targeted_direct: (v) => 70 + 0.25 * v,
      delegated: (v) => 100 - v,
    },
  },
  {
    key: 'exclusionTensionRisk',
    label: 'Risk of exclusion tensions or perceived unfairness',
    description: 'High when selective inclusion may create conflict, resentment, or protection concerns.',
    evidence: 'Moderate evidence',
    suitability: {
      broad_direct: (v) => 55 + 0.45 * v,
      targeted_direct: (v) => 100 - 0.25 * v,
      delegated: (v) => 100 - 0.45 * v,
    },
  },
  {
    key: 'directAccessFeasibility',
    label: 'Feasibility of direct delivery',
    description: 'High when the programme can reach recipients directly with adequate accountability and monitoring.',
    evidence: 'Operational constraint',
    suitability: {
      broad_direct: (v) => v,
      targeted_direct: (v) => 45 + 0.5 * v,
      delegated: (v) => 100 - v,
    },
  },
  {
    key: 'confidenceLocalRedistributors',
    label: 'Confidence in local redistributors',
    description: 'High only if local actors are trusted, accountable, and able to document onward allocation.',
    evidence: 'Critical if delegating',
    suitability: {
      broad_direct: (v) => 75 - 0.25 * v,
      targeted_direct: (v) => 72 - 0.15 * v,
      delegated: (v) => v,
    },
  },
  {
    key: 'communityGoodsPriority',
    label: 'Importance of community-level goods or collective recovery',
    description: 'High when the programme aims partly at shared assets or public goods, not just household welfare.',
    evidence: 'More indirect evidence',
    suitability: {
      broad_direct: (v) => 100 - 0.6 * v,
      targeted_direct: (v) => 100 - 0.35 * v,
      delegated: (v) => v,
    },
  },
  {
    key: 'spilloverImportance',
    label: 'Importance of wider local spillovers',
    description: 'High when indirect benefits to non-recipients and traders matter to programme success.',
    evidence: 'Moderate evidence',
    suitability: {
      broad_direct: (v) => 65 + 0.25 * v,
      targeted_direct: (v) => 68 + 0.28 * v,
      delegated: (v) => 40 + 0.2 * v,
    },
  },
  {
    key: 'scarcityPressure',
    label: 'Pressure to target because resources are scarce',
    description: 'High when you cannot cover many households and need sharper prioritisation.',
    evidence: 'Operational constraint',
    suitability: {
      broad_direct: (v) => 100 - v,
      targeted_direct: (v) => v,
      delegated: (v) => 48 + 0.22 * v,
    },
  },
];

const presets = {
  default: {
    scenario: initialScenario,
    weights: initialWeights,
  },
  leanSeasonFarmers: {
    scenario: {
      ...initialScenario,
      primaryObjective: 'mixed',
      crisisType: 'seasonal',
      lumpyPurchases: 84,
      smoothingNeed: 72,
      earlyTimingValue: 90,
      repeatPaymentCapacity: 52,
      predictabilityOfNeeds: 60,
      householdChoicePriority: 84,
      exclusionTensionRisk: 42,
      directAccessFeasibility: 58,
      confidenceLocalRedistributors: 38,
      communityGoodsPriority: 24,
      spilloverImportance: 62,
      scarcityPressure: 56,
    },
    weights: initialWeights,
  },
  urbanDisplacement: {
    scenario: {
      ...initialScenario,
      primaryObjective: 'consumption',
      crisisType: 'protracted',
      lumpyPurchases: 30,
      smoothingNeed: 93,
      earlyTimingValue: 38,
      repeatPaymentCapacity: 81,
      predictabilityOfNeeds: 84,
      householdChoicePriority: 92,
      exclusionTensionRisk: 78,
      directAccessFeasibility: 76,
      confidenceLocalRedistributors: 32,
      communityGoodsPriority: 18,
      spilloverImportance: 74,
      scarcityPressure: 66,
    },
    weights: initialWeights,
  },
  remoteConflictArea: {
    scenario: {
      ...initialScenario,
      primaryObjective: 'mixed',
      crisisType: 'sudden',
      marketFunction: 'mixed',
      accessConstraint: 'high',
      lumpyPurchases: 67,
      smoothingNeed: 76,
      earlyTimingValue: 54,
      repeatPaymentCapacity: 26,
      predictabilityOfNeeds: 36,
      householdChoicePriority: 74,
      exclusionTensionRisk: 82,
      directAccessFeasibility: 22,
      confidenceLocalRedistributors: 66,
      communityGoodsPriority: 46,
      spilloverImportance: 55,
      scarcityPressure: 73,
    },
    weights: initialWeights,
  },
  communityRecovery: {
    scenario: {
      ...initialScenario,
      primaryObjective: 'public_goods',
      crisisType: 'protracted',
      redistributionSetting: 'community',
      lumpyPurchases: 58,
      smoothingNeed: 40,
      earlyTimingValue: 24,
      repeatPaymentCapacity: 44,
      predictabilityOfNeeds: 56,
      householdChoicePriority: 42,
      exclusionTensionRisk: 48,
      directAccessFeasibility: 52,
      confidenceLocalRedistributors: 78,
      communityGoodsPriority: 88,
      spilloverImportance: 70,
      scarcityPressure: 45,
    },
    weights: initialWeights,
  },
};

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function normalizeWeightMap(weightMap) {
  const entries = Object.entries(weightMap);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  return Object.fromEntries(entries.map(([key, value]) => [key, total === 0 ? 0 : value / total]));
}

function objectiveAdjustments(scenario) {
  const cadence = {
    lump_sum: 0,
    instalments: 0,
    hybrid: 0,
  };
  const coverage = {
    broad_direct: 0,
    targeted_direct: 0,
    delegated: 0,
  };

  if (scenario.primaryObjective === 'investment') cadence.lump_sum += 8;
  if (scenario.primaryObjective === 'consumption') cadence.instalments += 8;
  if (scenario.primaryObjective === 'mixed') cadence.hybrid += 8;
  if (scenario.primaryObjective === 'public_goods') {
    coverage.delegated += 10;
    coverage.broad_direct -= 6;
  }

  if (scenario.crisisType === 'seasonal') {
    cadence.lump_sum += 4;
    cadence.hybrid += 4;
  }
  if (scenario.crisisType === 'protracted') cadence.instalments += 4;

  if (scenario.marketFunction === 'weak') {
    cadence.lump_sum -= 5;
    cadence.instalments -= 5;
    cadence.hybrid -= 5;
    coverage.broad_direct -= 4;
    coverage.targeted_direct -= 4;
  }

  if (scenario.accessConstraint === 'high') {
    coverage.delegated += 8;
    coverage.broad_direct -= 10;
    coverage.targeted_direct -= 4;
  }
  if (scenario.accessConstraint === 'low') {
    coverage.broad_direct += 6;
    coverage.targeted_direct += 4;
  }

  if (scenario.redistributionSetting === 'household') {
    coverage.broad_direct += 5;
    coverage.targeted_direct += 4;
    coverage.delegated -= 8;
  }
  if (scenario.redistributionSetting === 'community') {
    coverage.delegated += 10;
    coverage.broad_direct -= 6;
  }

  return { cadence, coverage };
}

function computeSectionScores(criteria, alternatives, scenario, weights, sectionAdjustment = {}) {
  const normalizedWeights = normalizeWeightMap(weights);

  const scored = alternatives.map((alt) => {
    const contributions = criteria.map((criterion) => {
      const rawValue = scenario[criterion.key];
      const suitabilityFn = criterion.suitability[alt.key];
      const suitability = clamp(suitabilityFn(rawValue));
      const normalizedWeight = normalizedWeights[criterion.key] || 0;
      const contribution = suitability * normalizedWeight;
      return {
        criterionKey: criterion.key,
        criterionLabel: criterion.label,
        rawValue,
        suitability: Math.round(suitability),
        normalizedWeight,
        contribution,
      };
    });

    const baseScore = contributions.reduce((sum, c) => sum + c.contribution, 0);
    const adjustment = sectionAdjustment[alt.key] || 0;
    const finalScore = clamp(baseScore + adjustment);

    return {
      key: alt.key,
      label: alt.label,
      baseScore,
      adjustment,
      finalScore,
      contributions: contributions.sort((a, b) => b.contribution - a.contribution),
    };
  }).sort((a, b) => b.finalScore - a.finalScore);

  return {
    normalizedWeights,
    ranked: scored,
    winner: scored[0],
  };
}

function scoreTone(score) {
  if (score >= 74) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 58) return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function weightTone(weight) {
  if (weight >= 0.2) return 'bg-slate-900';
  if (weight >= 0.12) return 'bg-slate-700';
  return 'bg-slate-400';
}

function MetricSlider({ label, value, onChange, hint, badge }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium leading-5">{label}</label>
        <div className="flex items-center gap-2">
          {badge ? <Badge variant="outline" className="rounded-full">{badge}</Badge> : null}
          <span className="text-sm text-slate-500">{value}</span>
        </div>
      </div>
      <input
        className="range-slider h-4 w-full cursor-pointer"
        type="range"
        value={value}
        min={0}
        max={100}
        step={1}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <p className="text-xs text-slate-500 leading-5">{hint}</p>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  const fieldId = useId();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={fieldId}>{label}</label>
      <select
        id={fieldId}
        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function PresetButtons({ onApply }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => onApply('default')}>Default</Button>
      <Button variant="outline" onClick={() => onApply('leanSeasonFarmers')}>Lean-season farmers</Button>
      <Button variant="outline" onClick={() => onApply('urbanDisplacement')}>Urban displacement</Button>
      <Button variant="outline" onClick={() => onApply('remoteConflictArea')}>Remote conflict area</Button>
      <Button variant="outline" onClick={() => onApply('communityRecovery')}>Community recovery</Button>
    </div>
  );
}

function AlternativeScoreCard({ title, description, result }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge className={`border rounded-full px-3 py-1 ${scoreTone(result.winner.finalScore)}`}>
            Top option: {result.winner.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.ranked.map((alt) => (
          <div key={alt.key} className="space-y-2 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{alt.label}</div>
                <div className="text-xs text-slate-500">Base MCDA score {alt.baseScore.toFixed(1)} {alt.adjustment !== 0 ? `• context adjustment ${alt.adjustment > 0 ? '+' : ''}${alt.adjustment}` : ''}</div>
              </div>
              <Badge className={`border ${scoreTone(alt.finalScore)}`}>{alt.finalScore.toFixed(1)}</Badge>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-slate-900" style={{ width: `${alt.finalScore}%` }} />
            </div>
            <div className="space-y-2 pt-1">
              {alt.contributions.slice(0, 3).map((c) => (
                <div key={c.criterionKey} className="grid grid-cols-[1fr_auto] gap-2 text-sm">
                  <span className="text-slate-600">{c.criterionLabel}</span>
                  <span className="text-slate-500">+{c.contribution.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function WeightPanel({ title, description, criteria, scenario, scenarioUpdater, weights, weightUpdater, normalizedWeights }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl"><SlidersHorizontal className="h-5 w-5" /> {title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.key} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-medium text-slate-900">{criterion.label}</div>
                <p className="text-sm text-slate-600 leading-6 max-w-2xl">{criterion.description}</p>
              </div>
              <Badge variant="outline" className="rounded-full">{criterion.evidence}</Badge>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <MetricSlider
                label="Scenario value"
                value={scenario[criterion.key]}
                onChange={(value) => scenarioUpdater(criterion.key, value)}
                hint="How strongly this feature is present in the current programme context."
              />
              <MetricSlider
                label="Decision weight"
                value={weights[criterion.key]}
                onChange={(value) => weightUpdater(criterion.key, value)}
                hint="How important this criterion should be in the MCDA model for this decision."
                badge={`${Math.round((normalizedWeights[criterion.key] || 0) * 100)}% of section`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Normalised weight in this section</span>
                <span>{(normalizedWeights[criterion.key] || 0).toFixed(2)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${weightTone(normalizedWeights[criterion.key] || 0)}`} style={{ width: `${(normalizedWeights[criterion.key] || 0) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FormulaCard() {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Scale className="h-5 w-5" /> MCDA scoring logic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600 leading-6">
        <p>
          Each option gets a score from a weighted sum of criterion-specific suitability values.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs md:text-sm text-slate-800 overflow-x-auto">
          Score(option) = Σ [ normalised criterion weight × suitability of option on that criterion ] + small context adjustment
        </div>
        <p>
          Suitability runs from 0 to 100. Weights are visible and user-adjustable, then automatically normalised within each decision section so you can change importance without needing the totals to add up manually.
        </p>
      </CardContent>
    </Card>
  );
}

function RecommendationNarrative({ cadenceResult, coverageResult }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Current recommendation</CardTitle>
        <CardDescription>
          Based on the current scenario values and visible criterion weights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600 leading-6">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 font-medium text-slate-900 mb-2"><Coins className="h-4 w-4" /> Payment cadence</div>
          <p>
            The highest-scoring cadence option is <strong>{cadenceResult.winner.label}</strong> with a score of <strong>{cadenceResult.winner.finalScore.toFixed(1)}</strong>. Its strongest drivers are{' '}
            {cadenceResult.winner.contributions.slice(0, 2).map((c) => c.criterionLabel).join(' and ')}.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 font-medium text-slate-900 mb-2"><Users className="h-4 w-4" /> Distribution strategy</div>
          <p>
            The highest-scoring coverage option is <strong>{coverageResult.winner.label}</strong> with a score of <strong>{coverageResult.winner.finalScore.toFixed(1)}</strong>. Its strongest drivers are{' '}
            {coverageResult.winner.contributions.slice(0, 2).map((c) => c.criterionLabel).join(' and ')}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function AssumptionsCard() {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Info className="h-5 w-5" /> Key assumptions built in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600 leading-6">
        <ul className="space-y-2">
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>The evidence base is stronger for lump sum versus instalments than for delegated redistribution versus direct distribution.</span></li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>Delegated redistribution is treated cautiously unless direct access is difficult, confidence in local redistributors is high, or collective/community goods matter strongly.</span></li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>Small context adjustments from objective, crisis type, market function, and access constraints are kept separate from the core MCDA score so users can inspect them.</span></li>
        </ul>
      </CardContent>
    </Card>
  );
}

export default function CashAssistanceDecisionSupportTool() {
  const [scenario, setScenario] = useState(initialScenario);
  const [weights, setWeights] = useState(initialWeights);

  const applyPreset = (presetKey) => {
    setScenario(presets[presetKey].scenario);
    setWeights(presets[presetKey].weights);
  };

  const setScenarioField = (key, value) => setScenario((current) => ({ ...current, [key]: value }));
  const setWeightField = (section, key, value) => {
    setWeights((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const adjustments = useMemo(() => objectiveAdjustments(scenario), [scenario]);
  const cadenceResult = useMemo(
    () => computeSectionScores(cadenceCriteria, cadenceAlternatives, scenario, weights.cadence, adjustments.cadence),
    [scenario, weights.cadence, adjustments]
  );
  const coverageResult = useMemo(
    () => computeSectionScores(coverageCriteria, coverageAlternatives, scenario, weights.coverage, adjustments.coverage),
    [scenario, weights.coverage, adjustments]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">Humanitarian cash assistance</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">MCDA prototype</Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl">Cash assistance design tool with visible weights</CardTitle>
              <CardDescription className="text-sm md:text-base leading-6">
                Explore cash-assistance design choices using a multi-criteria decision analysis structure. Change both the scenario values and the criterion weights, then inspect how each option’s score is built.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600 leading-6">
              <p>
                This tool separates two decisions: <strong>payment cadence</strong> and <strong>distribution strategy</strong>. Within each one, criteria are scored transparently and weighted visibly.
              </p>
              <p>
                The point is not false precision. The point is to make assumptions explicit, adjustable, and discussable in decision meetings.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <FormulaCard />
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Scenario presets</CardTitle>
                <CardDescription>Start with a context and then tune the criteria and weights.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PresetButtons onApply={applyPreset} />
                <Button variant="secondary" onClick={() => applyPreset('default')} className="w-full sm:w-auto">
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset to default
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Context settings</CardTitle>
            <CardDescription>These settings create small contextual adjustments on top of the core MCDA score.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <SelectField label="Primary objective" value={scenario.primaryObjective} options={optionSets.primaryObjective} onChange={(v) => setScenarioField('primaryObjective', v)} />
            <SelectField label="Crisis profile" value={scenario.crisisType} options={optionSets.crisisType} onChange={(v) => setScenarioField('crisisType', v)} />
            <SelectField label="Market function" value={scenario.marketFunction} options={optionSets.marketFunction} onChange={(v) => setScenarioField('marketFunction', v)} />
            <SelectField label="Access / accountability constraints" value={scenario.accessConstraint} options={optionSets.accessConstraint} onChange={(v) => setScenarioField('accessConstraint', v)} />
            <SelectField label="Role of community priorities" value={scenario.redistributionSetting} options={optionSets.redistributionSetting} onChange={(v) => setScenarioField('redistributionSetting', v)} />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <WeightPanel
            title="Payment cadence criteria"
            description="Adjust how the cadence decision is scored. Weights are normalised automatically within this section."
            criteria={cadenceCriteria}
            scenario={scenario}
            scenarioUpdater={setScenarioField}
            weights={weights.cadence}
            weightUpdater={(key, value) => setWeightField('cadence', key, value)}
            normalizedWeights={cadenceResult.normalizedWeights}
          />

          <WeightPanel
            title="Distribution strategy criteria"
            description="Adjust how the coverage decision is scored, including the trade-off between direct control and delegated allocation."
            criteria={coverageCriteria}
            scenario={scenario}
            scenarioUpdater={setScenarioField}
            weights={weights.coverage}
            weightUpdater={(key, value) => setWeightField('coverage', key, value)}
            normalizedWeights={coverageResult.normalizedWeights}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <AlternativeScoreCard
              title="Payment cadence results"
              description="Compare lump sum, instalments, and a front-loaded hybrid." 
              result={cadenceResult}
            />
            <AlternativeScoreCard
              title="Distribution strategy results"
              description="Compare broader direct distribution, targeted direct distribution, and delegated redistribution." 
              result={coverageResult}
            />
          </div>

          <div className="space-y-6">
            <RecommendationNarrative cadenceResult={cadenceResult} coverageResult={coverageResult} />
            <AssumptionsCard />
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><ArrowRightLeft className="h-5 w-5" /> Using the tool well</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600 leading-6">
                <p>
                  Try moving one thing at a time. First change the scenario values while holding the default weights fixed. Then ask whether the default weights match your decision context.
                </p>
                <p>
                  In workshops, this structure works well for surfacing disagreement: people can debate whether a criterion should matter more, or whether the scenario has been rated too high or too low.
                </p>
                <Separator />
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="font-medium text-slate-900 mb-2">Good challenge questions</div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>Which criterion are we overweighting because it is easiest to operationalise?</li>
                    <li>Which criterion matters most to affected households, not just to programme management?</li>
                    <li>If we changed one weight radically, would the recommendation still hold?</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
