import { useState } from 'react';
import type { GateSettings } from '../types';
import { DEFAULT_GATE_SETTINGS, GATE_LIMITS } from '../types';
import { SettingsIcon, ChevronIcon, GateIcon, AlertIcon } from './Icons';

interface GateControlsProps {
  settings: GateSettings;
  onSettingsChange: (settings: GateSettings) => void;
  rejectedCount: number;
}

interface GateImpact {
  label: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

function getGateImpacts(settings: GateSettings, defaults: GateSettings): GateImpact[] {
  const impacts: GateImpact[] = [];

  if (settings.minWordCount < defaults.minWordCount) {
    const reduction = Math.round(((defaults.minWordCount - settings.minWordCount) / defaults.minWordCount) * 100);
    impacts.push({
      label: `Word count reduced to ${settings.minWordCount}`,
      description: `Accepting ${reduction}% shorter articles. May include incomplete excerpts or headlines.`,
      impact: settings.minWordCount < 150 ? 'high' : settings.minWordCount < 200 ? 'medium' : 'low',
    });
  }

  if (settings.minDensityScore < defaults.minDensityScore) {
    const reduction = defaults.minDensityScore - settings.minDensityScore;
    impacts.push({
      label: `Density threshold lowered to ${settings.minDensityScore}`,
      description: `Accepting articles with ${reduction} fewer evidence points. May include speculative or thin content.`,
      impact: settings.minDensityScore < 25 ? 'high' : settings.minDensityScore < 35 ? 'medium' : 'low',
    });
  }

  if (!settings.sameDayOnly && defaults.sameDayOnly) {
    impacts.push({
      label: `Same-day requirement disabled`,
      description: `Including articles from the past ${settings.dateLookbackDays} day(s). Date freshness not guaranteed.`,
      impact: settings.dateLookbackDays > 3 ? 'high' : settings.dateLookbackDays > 1 ? 'medium' : 'low',
    });
  }

  if (settings.maxArticles > defaults.maxArticles) {
    impacts.push({
      label: `Max articles increased to ${settings.maxArticles}`,
      description: `Showing more articles per feed. Lower-ranked items included.`,
      impact: settings.maxArticles > 30 ? 'high' : settings.maxArticles > 20 ? 'medium' : 'low',
    });
  }

  return impacts;
}

export default function GateControls({ settings, onSettingsChange, rejectedCount }: GateControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const impacts = getGateImpacts(settings, DEFAULT_GATE_SETTINGS);
  const isModified = JSON.stringify(settings) !== JSON.stringify(DEFAULT_GATE_SETTINGS);

  const handleReset = () => {
    onSettingsChange(DEFAULT_GATE_SETTINGS);
  };

  const updateSetting = <K extends keyof GateSettings>(key: K, value: GateSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#141418]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-4 w-4 text-zinc-400" />
          <div>
            <p className="text-sm font-semibold text-zinc-100">Gate Strictness</p>
            <p className="text-xs text-zinc-400">
              {isModified ? `${impacts.length} gate(s) loosened` : 'Default (strict)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isModified && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
              Modified
            </span>
          )}
          <span className="text-xs font-medium text-zinc-400">{rejectedCount} rejected</span>
          <ChevronIcon className="h-4 w-4 text-zinc-400" direction={isOpen ? 'up' : 'down'} />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-white/[0.06] p-5 animate-fade-in">
          {impacts.length > 0 && (
            <div className="mb-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Active Reductions</p>
              {impacts.map((impact, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 rounded-md p-3 ${
                    impact.impact === 'high' ? 'bg-red-500/10 border border-red-500/20' :
                    impact.impact === 'medium' ? 'bg-amber-500/10 border border-amber-500/20' :
                    'bg-white/[0.03] border border-white/[0.06]'
                  }`}
                >
                  <AlertIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    impact.impact === 'high' ? 'text-red-400' :
                    impact.impact === 'medium' ? 'text-amber-400' : 'text-zinc-400'
                  }`} />
                  <div>
                    <p className={`text-xs font-semibold ${
                      impact.impact === 'high' ? 'text-red-300' :
                      impact.impact === 'medium' ? 'text-amber-300' : 'text-zinc-200'
                    }`}>{impact.label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{impact.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200">
                  <GateIcon className="mr-1.5 inline h-3 w-3 text-zinc-400" />
                  Minimum Word Count
                </label>
                <span className="text-xs font-mono font-bold text-white">{settings.minWordCount}</span>
              </div>
              <input
                type="range"
                min={GATE_LIMITS.minWordCount.min}
                max={GATE_LIMITS.minWordCount.max}
                step={GATE_LIMITS.minWordCount.step}
                value={settings.minWordCount}
                onChange={(e) => updateSetting('minWordCount', Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>{GATE_LIMITS.minWordCount.min} (loose)</span>
                <span>{GATE_LIMITS.minWordCount.max} (strict)</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200">
                  <GateIcon className="mr-1.5 inline h-3 w-3 text-zinc-400" />
                  Minimum Density Score
                </label>
                <span className="text-xs font-mono font-bold text-white">{settings.minDensityScore}</span>
              </div>
              <input
                type="range"
                min={GATE_LIMITS.minDensityScore.min}
                max={GATE_LIMITS.minDensityScore.max}
                step={GATE_LIMITS.minDensityScore.step}
                value={settings.minDensityScore}
                onChange={(e) => updateSetting('minDensityScore', Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>{GATE_LIMITS.minDensityScore.min} (loose)</span>
                <span>{GATE_LIMITS.minDensityScore.max} (strict)</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200">
                  <GateIcon className="mr-1.5 inline h-3 w-3 text-zinc-400" />
                  Max Articles
                </label>
                <span className="text-xs font-mono font-bold text-white">{settings.maxArticles}</span>
              </div>
              <input
                type="range"
                min={GATE_LIMITS.maxArticles.min}
                max={GATE_LIMITS.maxArticles.max}
                step={GATE_LIMITS.maxArticles.step}
                value={settings.maxArticles}
                onChange={(e) => updateSetting('maxArticles', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.03] p-4">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Same-Day Only</p>
                <p className="text-xs text-zinc-400 mt-0.5">Strict date lock to today</p>
              </div>
              <button
                onClick={() => updateSetting('sameDayOnly', !settings.sameDayOnly)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.sameDayOnly ? 'bg-white' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full transition-transform ${
                    settings.sameDayOnly ? 'left-6 bg-zinc-900' : 'left-1 bg-zinc-300'
                  }`}
                />
              </button>
            </div>

            {!settings.sameDayOnly && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-200">Lookback Days</label>
                  <span className="text-xs font-mono font-bold text-white">{settings.dateLookbackDays}</span>
                </div>
                <input
                  type="range"
                  min={GATE_LIMITS.dateLookbackDays.min}
                  max={GATE_LIMITS.dateLookbackDays.max}
                  step={GATE_LIMITS.dateLookbackDays.step}
                  value={settings.dateLookbackDays}
                  onChange={(e) => updateSetting('dateLookbackDays', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {isModified && (
            <button
              onClick={handleReset}
              className="mt-5 w-full rounded-md border border-white/[0.1] bg-white/[0.04] py-2.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/[0.08]"
            >
              Reset to Default (Strict)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
