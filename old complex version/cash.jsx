import { useId, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRightLeft,
  CheckCircle2,
  ChevronDown,
  Coins,
  Compass,
  Info,
  RotateCcw,
  Scale,
  SlidersHorizontal,
  Users,
  WandSparkles,
} from 'lucide-react';

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

const defaultGuidedAnswers = {
  spendingPressure: 'mix',
  earlySupport: 'helpful',
  coverageTradeoff: 'balanced',
  directDelivery: 'patchy',
  communityGoal: 'mixed',
  localTrust: 'reservations',
};

const guidedPresets = {
  leanSeasonFarmers: {
    label: 'Lean-season farmers',
    description: 'Seasonal stress, mixed spending pressure, and some delivery friction.',
    answers: {
      spendingPressure: 'mix',
      earlySupport: 'very',
      coverageTradeoff: 'balanced',
      directDelivery: 'patchy',
      communityGoal: 'households',
      localTrust: 'reservations',
    },
  },
  urbanDisplacement: {
    label: 'Urban displacement',
    description: 'Recurring essentials dominate and direct delivery is comparatively feasible.',
    answers: {
      spendingPressure: 'essentials',
      earlySupport: 'helpful',
      coverageTradeoff: 'broad',
      directDelivery: 'high',
      communityGoal: 'households',
      localTrust: 'cautious',
    },
  },
  remoteConflictArea: {
    label: 'Remote conflict area',
    description: 'Needs are mixed, access is hard, and delivery routes are fragile.',
    answers: {
      spendingPressure: 'mix',
      earlySupport: 'helpful',
      coverageTradeoff: 'balanced',
      directDelivery: 'difficult',
      communityGoal: 'mixed',
      localTrust: 'reservations',
    },
  },
  communityRecovery: {
    label: 'Community recovery',
    description: 'Shared recovery goals matter, and local actors may play a stronger role.',
    answers: {
      spendingPressure: 'one_off',
      earlySupport: 'not_important',
      coverageTradeoff: 'balanced',
      directDelivery: 'patchy',
      communityGoal: 'community',
      localTrust: 'trust',
    },
  },
};

const guidedQuestions = [
  {
    key: 'spendingPressure',
    title: 'What are households mainly likely to need cash for right now?',
    why: 'This helps decide whether support should arrive all at once or over time.',
    options: [
      {
        value: 'essentials',
        title: 'Mostly everyday essentials',
        description: 'Food, rent, transport, or other regular costs are the main pressure.',
      },
      {
        value: 'mix',
        title: 'A meaningful mix of both',
        description: 'Recurring essentials matter, but households also face some bigger one-off costs.',
      },
      {
        value: 'one_off',
        title: 'Mostly bigger one-off costs',
        description: 'Repairs, debt, tools, travel, or restocking are the main pressure.',
      },
    ],
  },
  {
    key: 'earlySupport',
    title: 'How important is it to get support there early?',
    why: 'This helps decide how much timing should shape the payment pattern.',
    options: [
      {
        value: 'very',
        title: 'Very important',
        description: 'Getting money there early would materially change what households can do next.',
      },
      {
        value: 'helpful',
        title: 'Helpful but not critical',
        description: 'Earlier support would help, but it is not the whole story.',
      },
      {
        value: 'not_important',
        title: 'Not especially important',
        description: 'Timing matters less than choosing a reliable pattern of support.',
      },
    ],
  },
  {
    key: 'coverageTradeoff',
    title: 'Is it more important to reach people broadly, or to focus support on a smaller high-priority group?',
    why: 'This helps decide how much the tool should lean toward breadth versus sharper prioritisation.',
    options: [
      {
        value: 'broad',
        title: 'Reach people as broadly as possible',
        description: 'Avoiding exclusion tension and getting money wider matters most.',
      },
      {
        value: 'balanced',
        title: 'Try to balance breadth and prioritisation',
        description: 'Some targeting is acceptable, but breadth still matters.',
      },
      {
        value: 'targeted',
        title: 'Focus support on a smaller high-priority group',
        description: 'Resources are tight enough that sharper prioritisation is worth it.',
      },
    ],
  },
  {
    key: 'directDelivery',
    title: 'How realistic is it to get support directly to households in a reliable, accountable way?',
    why: 'This helps decide whether direct delivery should stay the default route.',
    options: [
      {
        value: 'high',
        title: 'Highly realistic',
        description: 'Direct delivery looks workable at scale with solid accountability.',
      },
      {
        value: 'patchy',
        title: 'Possible but patchy',
        description: 'Direct delivery is feasible in places, but not consistently everywhere.',
      },
      {
        value: 'difficult',
        title: 'Difficult to do well',
        description: 'Direct delivery would be hard to run reliably or accountably.',
      },
    ],
  },
  {
    key: 'communityGoal',
    title: 'Is success here mainly about helping households directly, or also about supporting shared community recovery?',
    why: 'This helps decide whether the tool should think only at household level or also about wider recovery goals.',
    options: [
      {
        value: 'households',
        title: 'Mainly household support',
        description: 'The primary job is getting support into households directly.',
      },
      {
        value: 'mixed',
        title: 'Mostly household support, with some shared recovery goals',
        description: 'Households come first, but wider community recovery still matters somewhat.',
      },
      {
        value: 'community',
        title: 'Shared community recovery matters a lot',
        description: 'Success depends heavily on restoring shared functions, assets, or local recovery.',
      },
    ],
  },
  {
    key: 'localTrust',
    title: 'If local groups or leaders helped pass support on, how much would you trust that process to be fair and accountable?',
    why: 'This helps decide how plausible any delegated route really is.',
    options: [
      {
        value: 'trust',
        title: 'I would trust it',
        description: 'Trusted local actors could plausibly manage onward allocation fairly.',
      },
      {
        value: 'reservations',
        title: 'I would have some reservations',
        description: 'It might work, but only with caution and strong safeguards.',
      },
      {
        value: 'cautious',
        title: 'I would be cautious about relying on it',
        description: 'Trust and accountability look too uncertain for this to be a comfortable default.',
      },
    ],
  },
];

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
    description: 'High when households need to buy assets, repay debt, repair shelter, move, or restock all at once.',
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

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function normalizeWeightMap(weightMap) {
  const entries = Object.entries(weightMap);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  return Object.fromEntries(entries.map(([key, value]) => [key, total === 0 ? 0 : value / total]));
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
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

  const scored = alternatives
    .map((alt) => {
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
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  return {
    normalizedWeights,
    ranked: scored,
    winner: scored[0],
  };
}

function buildScenarioFromAnswers(answers) {
  const scenario = {
    primaryObjective: 'mixed',
    crisisType: 'sudden',
    marketFunction: 'mixed',
    accessConstraint: 'medium',
    redistributionSetting: 'mixed',
    lumpyPurchases: 64,
    smoothingNeed: 66,
    earlyTimingValue: 58,
    repeatPaymentCapacity: 52,
    predictabilityOfNeeds: 58,
    householdChoicePriority: 74,
    exclusionTensionRisk: 58,
    directAccessFeasibility: 50,
    confidenceLocalRedistributors: 48,
    communityGoodsPriority: 52,
    spilloverImportance: 60,
    scarcityPressure: 55,
  };

  switch (answers.spendingPressure) {
    case 'essentials':
      scenario.lumpyPurchases = 28;
      scenario.smoothingNeed = 88;
      scenario.predictabilityOfNeeds = 76;
      break;
    case 'one_off':
      scenario.lumpyPurchases = 88;
      scenario.smoothingNeed = 28;
      scenario.predictabilityOfNeeds = 40;
      break;
    default:
      scenario.lumpyPurchases = 66;
      scenario.smoothingNeed = 68;
      scenario.predictabilityOfNeeds = 58;
      break;
  }

  switch (answers.earlySupport) {
    case 'very':
      scenario.earlyTimingValue = 88;
      scenario.crisisType = 'seasonal';
      break;
    case 'not_important':
      scenario.earlyTimingValue = 28;
      scenario.crisisType = 'protracted';
      break;
    default:
      scenario.earlyTimingValue = 58;
      scenario.crisisType = 'sudden';
      break;
  }

  switch (answers.coverageTradeoff) {
    case 'broad':
      scenario.householdChoicePriority = 86;
      scenario.exclusionTensionRisk = 82;
      scenario.scarcityPressure = 24;
      scenario.spilloverImportance = 72;
      break;
    case 'targeted':
      scenario.householdChoicePriority = 62;
      scenario.exclusionTensionRisk = 32;
      scenario.scarcityPressure = 84;
      scenario.spilloverImportance = 46;
      break;
    default:
      scenario.householdChoicePriority = 74;
      scenario.exclusionTensionRisk = 58;
      scenario.scarcityPressure = 55;
      scenario.spilloverImportance = 60;
      break;
  }

  switch (answers.directDelivery) {
    case 'high':
      scenario.directAccessFeasibility = 82;
      scenario.repeatPaymentCapacity = 74;
      scenario.marketFunction = 'strong';
      scenario.accessConstraint = 'low';
      break;
    case 'difficult':
      scenario.directAccessFeasibility = 24;
      scenario.repeatPaymentCapacity = 30;
      scenario.marketFunction = 'weak';
      scenario.accessConstraint = 'high';
      break;
    default:
      scenario.directAccessFeasibility = 50;
      scenario.repeatPaymentCapacity = 52;
      scenario.marketFunction = 'mixed';
      scenario.accessConstraint = 'medium';
      break;
  }

  switch (answers.communityGoal) {
    case 'households':
      scenario.communityGoodsPriority = 20;
      scenario.spilloverImportance = clamp((scenario.spilloverImportance + 46) / 2);
      scenario.redistributionSetting = 'household';
      break;
    case 'community':
      scenario.communityGoodsPriority = 86;
      scenario.spilloverImportance = clamp((scenario.spilloverImportance + 76) / 2);
      scenario.redistributionSetting = 'community';
      break;
    default:
      scenario.communityGoodsPriority = 52;
      scenario.spilloverImportance = clamp((scenario.spilloverImportance + 60) / 2);
      scenario.redistributionSetting = 'mixed';
      break;
  }

  switch (answers.localTrust) {
    case 'trust':
      scenario.confidenceLocalRedistributors = 82;
      break;
    case 'cautious':
      scenario.confidenceLocalRedistributors = 18;
      break;
    default:
      scenario.confidenceLocalRedistributors = 48;
      break;
  }

  if (answers.communityGoal === 'community') {
    scenario.primaryObjective = 'public_goods';
  } else if (answers.communityGoal === 'mixed') {
    scenario.primaryObjective = 'mixed';
  } else if (answers.spendingPressure === 'essentials') {
    scenario.primaryObjective = 'consumption';
  } else if (answers.spendingPressure === 'one_off') {
    scenario.primaryObjective = 'investment';
  } else {
    scenario.primaryObjective = 'mixed';
  }

  return scenario;
}

function getQuestionByKey(key) {
  return guidedQuestions.find((question) => question.key === key);
}

function getOptionByValue(questionKey, value) {
  return getQuestionByKey(questionKey)?.options.find((option) => option.value === value);
}

function scoreTone(score) {
  if (score >= 74) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (score >= 58) return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-stone-100 text-stone-700 border-stone-200';
}

function weightTone(weight) {
  if (weight >= 0.2) return 'bg-orange-900';
  if (weight >= 0.12) return 'bg-orange-700';
  return 'bg-orange-300';
}

function confidenceTone(level) {
  if (level === 'clear') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (level === 'reasonable') return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-rose-50 text-rose-800 border-rose-200';
}

function getConfidence(cadenceResult, coverageResult) {
  const cadenceGap = cadenceResult.ranked[0].finalScore - cadenceResult.ranked[1].finalScore;
  const coverageGap = coverageResult.ranked[0].finalScore - coverageResult.ranked[1].finalScore;
  const decisiveGap = Math.min(cadenceGap, coverageGap);

  if (decisiveGap >= 12) {
    return { label: 'Clear fit', level: 'clear' };
  }
  if (decisiveGap >= 6) {
    return { label: 'Reasonable fit', level: 'reasonable' };
  }
  return { label: 'Depends on a few assumptions', level: 'tentative' };
}

function recommendationSentence(cadenceKey, coverageKey) {
  const cadenceText = {
    lump_sum: 'a larger one-off payment',
    instalments: 'regular smaller payments',
    hybrid: 'a larger early payment followed by smaller follow-ups',
  }[cadenceKey];

  const coverageText = {
    broad_direct: 'delivered directly to households as broadly as possible',
    targeted_direct: 'delivered directly to a smaller high-priority group',
    delegated: 'passed through trusted local actors to reallocate',
  }[coverageKey];

  return `Start with ${cadenceText}, ${coverageText}.`;
}

function criterionReasonText(contribution) {
  const high = contribution.rawValue >= 60;

  switch (contribution.criterionKey) {
    case 'lumpyPurchases':
      return high
        ? 'Households seem to face bigger one-off costs that benefit from upfront cash.'
        : 'Bigger one-off purchases do not seem to dominate the situation.';
    case 'smoothingNeed':
      return high
        ? 'Recurring essentials look like a major pressure for households.'
        : 'Day-to-day spending does not look like the only pressure.';
    case 'earlyTimingValue':
      return high
        ? 'Getting cash there early could materially change outcomes.'
        : 'Timing looks helpful, but not decisive enough to drive everything.';
    case 'repeatPaymentCapacity':
      return high
        ? 'The delivery system looks capable of handling repeated payments.'
        : 'Repeated transfers may be hard to deliver consistently.';
    case 'predictabilityOfNeeds':
      return high
        ? 'Needs look regular enough for planned follow-ups.'
        : 'Needs may be too uneven for a rigid repeated-payment pattern.';
    case 'householdChoicePriority':
      return high
        ? 'Keeping choice with households appears important here.'
        : 'There may be more room for intermediary allocation than usual.';
    case 'exclusionTensionRisk':
      return high
        ? 'Broader coverage could help reduce exclusion tensions.'
        : 'Sharper prioritisation may be more acceptable in this context.';
    case 'directAccessFeasibility':
      return high
        ? 'Direct delivery to households looks feasible enough to trust.'
        : 'Direct delivery looks hard enough that alternative routes matter more.';
    case 'confidenceLocalRedistributors':
      return high
        ? 'Trusted local actors look plausible as partners in onward allocation.'
        : 'Trust in local reallocation looks too limited to lean on it casually.';
    case 'communityGoodsPriority':
      return high
        ? 'Shared community recovery matters to success here.'
        : 'Household-level support seems to matter more than collective recovery.';
    case 'spilloverImportance':
      return high
        ? 'Wider benefits to non-recipients and local markets seem important.'
        : 'Indirect spillovers do not look central to success.';
    case 'scarcityPressure':
      return high
        ? 'Scarce resources push toward sharper prioritisation.'
        : 'There is a stronger case for reaching people more broadly.';
    default:
      return contribution.criterionLabel;
  }
}

function collectReasons(cadenceResult, coverageResult) {
  const merged = [
    ...cadenceResult.winner.contributions.slice(0, 3).map((contribution) => ({ ...contribution, section: 'cadence' })),
    ...coverageResult.winner.contributions.slice(0, 3).map((contribution) => ({ ...contribution, section: 'coverage' })),
  ].sort((a, b) => b.contribution - a.contribution);

  const selected = [];
  const seen = new Set();
  for (const contribution of merged) {
    if (seen.has(contribution.criterionKey)) continue;
    selected.push(contribution);
    seen.add(contribution.criterionKey);
    if (selected.length === 3) break;
  }

  const sectionsSeen = new Set(selected.map((contribution) => contribution.section));

  if (sectionsSeen.size === 1) {
    const missingSection = sectionsSeen.has('cadence') ? 'coverage' : 'cadence';
    const extra = merged.find((contribution) => contribution.section === missingSection && !selected.includes(contribution));
    if (extra) {
      if (selected.length === 3) {
        selected[2] = extra;
      } else {
        selected.push(extra);
      }
    }
  }

  return selected.slice(0, 3).map((contribution) => criterionReasonText(contribution));
}

function cadenceWatchout(key) {
  switch (key) {
    case 'lump_sum':
      return 'Double-check that households really face bigger upfront costs rather than mainly recurring weekly spending.';
    case 'instalments':
      return 'Double-check that repeated payments can actually be delivered on time and without extra friction.';
    default:
      return 'Double-check that the program can manage both an early payment and reliable follow-up transfers.';
  }
}

function coverageWatchout(key) {
  switch (key) {
    case 'broad_direct':
      return 'If resources are too tight to reach people meaningfully, broader coverage may spread support too thin.';
    case 'targeted_direct':
      return 'Targeting errors or resentment can undermine this path if exclusion feels unfair on the ground.';
    default:
      return 'Only lean on local reallocation if trusted actors can pass support on fairly and transparently.';
  }
}

function runnerUpCondition(section, key) {
  if (section === 'cadence') {
    switch (key) {
      case 'lump_sum':
        return 'households actually need more upfront cash or early timing matters more than assumed';
      case 'instalments':
        return 'needs are more ongoing and repeated delivery is more reliable than assumed';
      default:
        return 'people face a real mix of recurring pressure and bigger one-off costs';
    }
  }

  switch (key) {
    case 'broad_direct':
      return 'avoiding exclusion tensions or reaching people more widely matters more than assumed';
    case 'targeted_direct':
      return 'resources are tighter or sharper prioritisation is more acceptable than assumed';
    default:
      return 'shared community recovery matters more and trusted local actors could reallocate fairly';
  }
}

function runnerUpLabel(section, key) {
  if (section === 'cadence') {
    return {
      lump_sum: 'a larger one-off payment',
      instalments: 'regular smaller payments',
      hybrid: 'a larger early payment followed by smaller follow-ups',
    }[key];
  }

  return {
    broad_direct: 'broader direct household delivery',
    targeted_direct: 'more targeted direct household delivery',
    delegated: 'working through trusted local actors',
  }[key];
}

function getRunnerUpNote(cadenceResult, coverageResult) {
  const cadenceGap = cadenceResult.ranked[0].finalScore - cadenceResult.ranked[1].finalScore;
  const coverageGap = coverageResult.ranked[0].finalScore - coverageResult.ranked[1].finalScore;

  if (cadenceGap <= coverageGap) {
    const runnerUp = cadenceResult.ranked[1];
    return `A close alternative would be ${runnerUpLabel('cadence', runnerUp.key)} if ${runnerUpCondition('cadence', runnerUp.key)}.`;
  }

  const runnerUp = coverageResult.ranked[1];
  return `A close alternative would be ${runnerUpLabel('coverage', runnerUp.key)} if ${runnerUpCondition('coverage', runnerUp.key)}.`;
}

function MetricSlider({ label, value, onChange, hint, badge }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium leading-5 text-stone-800">{label}</label>
        <div className="flex items-center gap-2">
          {badge ? (
            <Badge variant="outline" className="rounded-full border-stone-300 bg-white/80 text-stone-700">
              {badge}
            </Badge>
          ) : null}
          <span className="text-sm text-stone-500">{value}</span>
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
      <p className="text-xs leading-5 text-stone-500">{hint}</p>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  const fieldId = useId();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-stone-800" htmlFor={fieldId}>
        {label}
      </label>
      <select
        id={fieldId}
        className="flex h-10 w-full rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PresetButtons({ onApply }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(guidedPresets).map(([key, preset]) => (
        <Button key={key} variant="outline" className="rounded-full border-stone-300 bg-white/80" onClick={() => onApply(key)}>
          {preset.label}
        </Button>
      ))}
    </div>
  );
}

function AlternativeScoreCard({ title, description, result }) {
  return (
    <Card className="rounded-[24px] border-stone-200 bg-[#fffdf8] shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-stone-900">{title}</CardTitle>
            <CardDescription className="text-stone-600">{description}</CardDescription>
          </div>
          <Badge className={`rounded-full border px-3 py-1 ${scoreTone(result.winner.finalScore)}`}>
            Top option: {result.winner.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.ranked.map((alt) => (
          <div key={alt.key} className="space-y-2 rounded-[20px] border border-stone-200 bg-white/90 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-stone-900">{alt.label}</div>
                <div className="text-xs text-stone-500">
                  Base MCDA score {alt.baseScore.toFixed(1)}
                  {alt.adjustment !== 0 ? ` • context adjustment ${alt.adjustment > 0 ? '+' : ''}${alt.adjustment}` : ''}
                </div>
              </div>
              <Badge className={`border ${scoreTone(alt.finalScore)}`}>{alt.finalScore.toFixed(1)}</Badge>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full bg-stone-900" style={{ width: `${alt.finalScore}%` }} />
            </div>
            <div className="space-y-2 pt-1">
              {alt.contributions.slice(0, 3).map((contribution) => (
                <div key={contribution.criterionKey} className="grid grid-cols-[1fr_auto] gap-2 text-sm">
                  <span className="text-stone-600">{contribution.criterionLabel}</span>
                  <span className="text-stone-500">+{contribution.contribution.toFixed(1)}</span>
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
    <Card className="rounded-[24px] border-stone-200 bg-[#fffdf8] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-stone-900">
          <SlidersHorizontal className="h-5 w-5" /> {title}
        </CardTitle>
        <CardDescription className="text-stone-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.key} className="space-y-4 rounded-[20px] border border-stone-200 bg-white/90 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-medium text-stone-900">{criterion.label}</div>
                <p className="max-w-2xl text-sm leading-6 text-stone-600">{criterion.description}</p>
              </div>
              <Badge variant="outline" className="rounded-full border-stone-300 bg-white/80 text-stone-700">
                {criterion.evidence}
              </Badge>
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
                hint="How important this criterion should be in the model for this decision."
                badge={`${Math.round((normalizedWeights[criterion.key] || 0) * 100)}% of section`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Normalised weight in this section</span>
                <span>{(normalizedWeights[criterion.key] || 0).toFixed(2)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full ${weightTone(normalizedWeights[criterion.key] || 0)}`}
                  style={{ width: `${(normalizedWeights[criterion.key] || 0) * 100}%` }}
                />
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
    <Card className="rounded-[24px] border-stone-200 bg-[#fffdf8] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-stone-900">
          <Scale className="h-5 w-5" /> How the scoring works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
        <p>Each option gets a score from a weighted sum of criterion-specific suitability values.</p>
        <div className="overflow-x-auto rounded-[18px] border border-stone-200 bg-stone-50 p-4 font-mono text-xs text-stone-800 md:text-sm">
          Score(option) = Σ [ normalised criterion weight × suitability of option on that criterion ] + small context adjustment
        </div>
        <p>
          Suitability runs from 0 to 100. Weights are visible and user-adjustable, then normalised automatically within each decision section so you do not need totals to add up manually.
        </p>
      </CardContent>
    </Card>
  );
}

function AssumptionsCard() {
  return (
    <Card className="rounded-[24px] border-stone-200 bg-[#fffdf8] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-stone-900">
          <Info className="h-5 w-5" /> Built-in assumptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
        <ul className="space-y-2">
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>The evidence base is stronger for lump sum versus instalments than for delegated redistribution versus direct distribution.</span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Delegated redistribution is treated cautiously unless direct access is difficult, confidence in local redistributors is high, or collective recovery matters strongly.</span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Small context adjustments from goals, crisis profile, market function, and access constraints are kept separate from the core weighted score.</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

function WorkshopCard() {
  return (
    <Card className="rounded-[24px] border-stone-200 bg-[#fffdf8] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-stone-900">
          <ArrowRightLeft className="h-5 w-5" /> Using the tool well
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
        <p>Try moving one thing at a time. First change the scenario values while holding the default weights fixed. Then ask whether the default weights match your decision context.</p>
        <p>In workshops, this structure works well for surfacing disagreement: people can debate whether a criterion should matter more, or whether the scenario has been rated too high or too low.</p>
        <Separator />
        <div className="rounded-[18px] border border-stone-200 bg-white/90 p-4">
          <div className="mb-2 font-medium text-stone-900">Good challenge questions</div>
          <ul className="space-y-2 text-sm text-stone-600">
            <li>Which criterion are we overweighting because it is easiest to operationalise?</li>
            <li>Which criterion matters most to affected households, not just to programme management?</li>
            <li>If we changed one weight radically, would the recommendation still hold?</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function AnswerCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[20px] border px-4 py-4 text-left transition ${
        selected
          ? 'border-orange-400 bg-orange-50 shadow-[0_8px_24px_rgba(194,65,12,0.12)]'
          : 'border-stone-200 bg-white/90 hover:border-stone-300 hover:bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="font-medium text-stone-900">{option.title}</div>
          <p className="text-sm leading-6 text-stone-600">{option.description}</p>
        </div>
        <div
          className={`mt-1 h-5 w-5 shrink-0 rounded-full border ${
            selected ? 'border-orange-500 bg-orange-500 shadow-inner' : 'border-stone-300 bg-white'
          }`}
        />
      </div>
    </button>
  );
}

function QuestionCard({ question, index, activeIndex, value, defaultValue, onOpen, onSelect }) {
  const selectedOption = getOptionByValue(question.key, value);
  const usingStartingAssumption = value === defaultValue;
  const isActive = activeIndex === index;

  return (
    <Card className={`rounded-[24px] border transition ${isActive ? 'border-orange-200 bg-[#fffaf2] shadow-sm' : 'border-stone-200 bg-white/85 shadow-sm'}`}>
      <CardContent className="p-0">
        {isActive ? (
          <div className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <Badge className="rounded-full border border-stone-200 bg-white/90 text-stone-700">Question {index + 1} of {guidedQuestions.length}</Badge>
                <div className="font-display text-2xl leading-tight text-stone-900">{question.title}</div>
              </div>
              <Badge className={`rounded-full border ${usingStartingAssumption ? 'border-stone-300 bg-stone-100 text-stone-700' : 'border-orange-200 bg-orange-50 text-orange-800'}`}>
                {usingStartingAssumption ? 'Using starting assumption' : 'Your answer'}
              </Badge>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-stone-600">{question.why}</p>
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <AnswerCard
                  key={option.value}
                  option={option}
                  selected={option.value === value}
                  onSelect={() => onSelect(question.key, option.value, index, optionIndex)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-stone-200 bg-stone-100 text-stone-700">Question {index + 1}</Badge>
                <Badge className={`rounded-full border ${usingStartingAssumption ? 'border-stone-300 bg-stone-100 text-stone-700' : 'border-orange-200 bg-orange-50 text-orange-800'}`}>
                  {usingStartingAssumption ? 'Using starting assumption' : 'Your answer'}
                </Badge>
              </div>
              <div className="font-medium text-stone-900">{question.title}</div>
              <p className="text-sm leading-6 text-stone-600">{selectedOption?.title}</p>
            </div>
            <Button variant="outline" className="rounded-full border-stone-300 bg-white/80" onClick={() => onOpen(index)}>
              Change
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationCard({
  cadenceResult,
  coverageResult,
  answeredCount,
  hasAdvancedCustomizations,
}) {
  const confidence = getConfidence(cadenceResult, coverageResult);
  const reasons = collectReasons(cadenceResult, coverageResult);
  const watchouts = [cadenceWatchout(cadenceResult.winner.key), coverageWatchout(coverageResult.winner.key)];
  const runnerUpNote = confidence.level === 'clear' ? null : getRunnerUpNote(cadenceResult, coverageResult);

  let statusText = 'Starting point based on default assumptions. Refine the six questions below.';
  if (answeredCount > 0 && hasAdvancedCustomizations) {
    statusText = 'Based on your answers, with additional advanced changes layered on top.';
  } else if (answeredCount > 0) {
    statusText = 'Based on your answers plus any remaining starting assumptions.';
  } else if (hasAdvancedCustomizations) {
    statusText = 'Based on the starting assumptions, with additional advanced changes layered on top.';
  }

  return (
    <Card className="rounded-[30px] border-stone-200 bg-white/90 shadow-[0_18px_60px_rgba(41,37,36,0.08)] backdrop-blur">
      <CardHeader className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full border border-stone-200 bg-stone-100 text-stone-700">Best-fit starting point</Badge>
          <Badge className={`rounded-full border ${confidenceTone(confidence.level)}`}>{confidence.label}</Badge>
          <Badge className="rounded-full border border-stone-200 bg-white/80 text-stone-700">
            {answeredCount} of {guidedQuestions.length} answered by you
          </Badge>
          {hasAdvancedCustomizations ? (
            <Badge className="rounded-full border border-orange-200 bg-orange-50 text-orange-800">Customized with advanced changes</Badge>
          ) : null}
        </div>
        <div className="space-y-3">
          <CardTitle className="font-display text-3xl leading-tight text-stone-900 md:text-[2.4rem]">
            {recommendationSentence(cadenceResult.winner.key, coverageResult.winner.key)}
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7 text-stone-600">{statusText}</CardDescription>
          {runnerUpNote ? <p className="text-sm leading-6 text-stone-600">{runnerUpNote}</p> : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-stone-200 bg-[#fffaf2] p-5">
          <div className="mb-3 flex items-center gap-2 font-medium text-stone-900">
            <WandSparkles className="h-4 w-4" /> Why this fits
          </div>
          <ul className="space-y-3 text-sm leading-6 text-stone-600">
            {reasons.map((reason) => (
              <li key={reason} className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-orange-600" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[22px] border border-stone-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 font-medium text-stone-900">
            <Info className="h-4 w-4" /> What to double-check
          </div>
          <ul className="space-y-3 text-sm leading-6 text-stone-600">
            {watchouts.map((watchout) => (
              <li key={watchout} className="flex gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-stone-400" />
                <span>{watchout}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2 rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
          This is a starting point for discussion, not a substitute for local judgment.
        </div>
      </CardContent>
    </Card>
  );
}

export default function CashAssistanceDecisionSupportTool() {
  const [guidedAnswers, setGuidedAnswers] = useState(defaultGuidedAnswers);
  const [scenarioOverrides, setScenarioOverrides] = useState({});
  const [weights, setWeights] = useState(initialWeights);
  const [activeQuestion, setActiveQuestion] = useState(0);

  const baseScenario = useMemo(() => buildScenarioFromAnswers(guidedAnswers), [guidedAnswers]);
  const scenario = useMemo(() => ({ ...baseScenario, ...scenarioOverrides }), [baseScenario, scenarioOverrides]);

  const adjustments = useMemo(() => objectiveAdjustments(scenario), [scenario]);
  const cadenceResult = useMemo(
    () => computeSectionScores(cadenceCriteria, cadenceAlternatives, scenario, weights.cadence, adjustments.cadence),
    [scenario, weights.cadence, adjustments]
  );
  const coverageResult = useMemo(
    () => computeSectionScores(coverageCriteria, coverageAlternatives, scenario, weights.coverage, adjustments.coverage),
    [scenario, weights.coverage, adjustments]
  );

  const answeredCount = guidedQuestions.reduce(
    (count, question) => count + (guidedAnswers[question.key] === defaultGuidedAnswers[question.key] ? 0 : 1),
    0
  );

  const hasScenarioCustomizations = Object.entries(scenarioOverrides).some(([key, value]) => baseScenario[key] !== value);
  const hasAdvancedCustomizations = hasScenarioCustomizations || !deepEqual(weights, initialWeights);

  const progressWidth = `${(answeredCount / guidedQuestions.length) * 100}%`;

  const applyPreset = (presetKey) => {
    setGuidedAnswers(guidedPresets[presetKey].answers);
    setScenarioOverrides({});
    setWeights(initialWeights);
    setActiveQuestion(0);
  };

  const resetToStartingPoint = () => {
    setGuidedAnswers(defaultGuidedAnswers);
    setScenarioOverrides({});
    setWeights(initialWeights);
    setActiveQuestion(0);
  };

  const clearAdvancedChanges = () => {
    setScenarioOverrides({});
    setWeights(initialWeights);
  };

  const setGuidedAnswer = (key, value, questionIndex) => {
    setGuidedAnswers((current) => ({ ...current, [key]: value }));
    setActiveQuestion(Math.min(questionIndex + 1, guidedQuestions.length - 1));
  };

  const setScenarioField = (key, value) => {
    setScenarioOverrides((current) => {
      if (baseScenario[key] === value) {
        const { [key]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [key]: value };
    });
  };

  const setWeightField = (section, key, value) => {
    setWeights((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[34px] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(255,244,214,0.82),rgba(255,247,237,0.95))] p-6 shadow-[0_20px_80px_rgba(41,37,36,0.08)] md:p-8">
          <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.18em] text-orange-700">
            <Compass className="h-4 w-4" /> Decision support
          </div>
          <h1 className="font-display text-4xl leading-tight text-stone-900 md:text-[3.6rem]">
            Find a best-fit starting point for how to deliver cash support.
          </h1>
          <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <p className="max-w-2xl text-base leading-7 text-stone-700 md:text-lg">
                Answer 6 quick questions. You will get a plain-language starting recommendation first, and you can inspect or adjust the scoring underneath whenever you need to.
              </p>
            </div>
            <div className="rounded-[26px] border border-white/70 bg-white/70 p-5 backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">What to expect</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-orange-600" />
                  <span>No raw scores on the default path.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-orange-600" />
                  <span>A single best-fit recommendation in plain English.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-orange-600" />
                  <span>Full analyst controls still available below.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white/85 p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <div className="font-display text-3xl text-stone-900">Answer these six questions</div>
              <p className="max-w-2xl text-sm leading-6 text-stone-600">
                Work through the questions one at a time. Answers you leave unchanged stay marked as starting assumptions.
              </p>
            </div>
            <Button variant="secondary" className="rounded-full bg-stone-900 text-white hover:bg-stone-800" onClick={resetToStartingPoint}>
              <RotateCcw className="mr-2 h-4 w-4" /> Start over from the default assumptions
            </Button>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm text-stone-600">
              <span>{answeredCount} of {guidedQuestions.length} answered by you</span>
              <span>{guidedQuestions.length - answeredCount} still using starting assumptions</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: progressWidth }} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {guidedQuestions.map((question, index) => (
              <QuestionCard
                key={question.key}
                question={question}
                index={index}
                activeIndex={activeQuestion}
                value={guidedAnswers[question.key]}
                defaultValue={defaultGuidedAnswers[question.key]}
                onOpen={setActiveQuestion}
                onSelect={setGuidedAnswer}
              />
            ))}
          </div>
        </section>

        <RecommendationCard
          cadenceResult={cadenceResult}
          coverageResult={coverageResult}
          answeredCount={answeredCount}
          hasAdvancedCustomizations={hasAdvancedCustomizations}
        />

        <details className="group rounded-[28px] border border-stone-200 bg-white/85 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 md:px-6">
            <div>
              <div className="font-display text-2xl text-stone-900">Inspect scoring and adjust assumptions</div>
              <p className="text-sm leading-6 text-stone-600">
                Open the full analyst view: raw scenario controls, weights, rankings, and methodology.
              </p>
            </div>
            <ChevronDown className="h-5 w-5 shrink-0 text-stone-500 transition group-open:rotate-180" />
          </summary>

          <div className="space-y-6 border-t border-stone-200 px-5 py-5 md:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full border border-stone-200 bg-stone-100 text-stone-700">
                {hasAdvancedCustomizations ? 'Advanced changes are affecting the result' : 'No advanced changes yet'}
              </Badge>
              {hasAdvancedCustomizations ? (
                <Button variant="outline" className="rounded-full border-stone-300 bg-white/80" onClick={clearAdvancedChanges}>
                  Remove advanced changes
                </Button>
              ) : null}
            </div>

            <Card className="rounded-[24px] border-stone-200 bg-[#fffdf8] shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-stone-900">Context settings</CardTitle>
                <CardDescription className="text-stone-600">
                  These create small contextual adjustments on top of the core weighted score.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <SelectField
                  label="Primary objective"
                  value={scenario.primaryObjective}
                  options={optionSets.primaryObjective}
                  onChange={(value) => setScenarioField('primaryObjective', value)}
                />
                <SelectField
                  label="Crisis profile"
                  value={scenario.crisisType}
                  options={optionSets.crisisType}
                  onChange={(value) => setScenarioField('crisisType', value)}
                />
                <SelectField
                  label="Market function"
                  value={scenario.marketFunction}
                  options={optionSets.marketFunction}
                  onChange={(value) => setScenarioField('marketFunction', value)}
                />
                <SelectField
                  label="Access / accountability constraints"
                  value={scenario.accessConstraint}
                  options={optionSets.accessConstraint}
                  onChange={(value) => setScenarioField('accessConstraint', value)}
                />
                <SelectField
                  label="Role of community priorities"
                  value={scenario.redistributionSetting}
                  options={optionSets.redistributionSetting}
                  onChange={(value) => setScenarioField('redistributionSetting', value)}
                />
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
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

              <details className="group rounded-[24px] border border-stone-200 bg-[#fffdf8] shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <div className="font-medium text-stone-900">How this works</div>
                    <p className="text-sm leading-6 text-stone-600">Formula, assumptions, and workshop guidance.</p>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 text-stone-500 transition group-open:rotate-180" />
                </summary>
                <div className="space-y-6 border-t border-stone-200 px-5 py-5">
                  <FormulaCard />
                  <AssumptionsCard />
                  <WorkshopCard />
                </div>
              </details>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
