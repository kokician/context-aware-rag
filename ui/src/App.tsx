import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  RotateCcw,
} from 'lucide-react';

import {
  assembleContext,
  type AssembleResult,
} from './assets/lib/contextBuilder';
import { estimateTokens } from './assets/lib/tokenizer';
import { BUDGETS, type BudgetKey } from './assets/lib/budget';


const App: React.FC = () => {
  const [query, setQuery] = useState(
    'How do transformers work in neural networks?'
  );
  const [memory, setMemory] = useState(
    'Previously discussed: embeddings are vector representations.'
  );
  const [toolOutputs, setToolOutputs] = useState(
    'Tool output: Retrieved 3 papers on attention mechanisms.'
  );

  const [result, setResult] = useState<AssembleResult | null>(null);
  const [expanded, setExpanded] = useState<Record<BudgetKey, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setResult(assembleContext(query, memory, toolOutputs));
  }, [query, memory, toolOutputs]);

  if (!result) return null;

  const sections = result.sections;


  const totalTokens = sections.reduce(
    (sum, s) => sum + estimateTokens(s.content),
    0
  );

  const toggle = (name: BudgetKey) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-8">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-1">
          Context-Window-Aware RAG
        </h1>
        <p className="text-slate-600 mb-6">
          Interactive context assembly with hard token budgets
        </p>

        {/* Inputs */}
        <div className="bg-slate-100 p-4 rounded mb-6 space-y-4">
          <Input label="Query" value={query} onChange={setQuery} />
          <Input label="Memory" value={memory} onChange={setMemory} />
          <Input
            label="Tool Outputs"
            value={toolOutputs}
            onChange={setToolOutputs}
          />
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {sections.map(section => {
            const budget = BUDGETS[section.name];
            const used = estimateTokens(section.content);
            const pct = Math.min((used / budget) * 100, 100);

            return (
              <div key={section.name} className="border rounded p-3">
                <div className="text-xs uppercase font-semibold text-slate-500">
                  {section.name}
                </div>

                <div className="h-2 bg-slate-200 rounded mt-2">
                  <div
                    className={`h-full rounded transition-all ${
                      pct > 80 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="text-xs mt-1 font-mono">
                  {used}/{budget}
                </div>

                {section.truncated && (
                  <div className="text-xs text-red-600 mt-1">
                    ⚠ Truncated
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div
              key={section.name}
              className="border rounded overflow-hidden"
            >
              <button
                onClick={() => toggle(section.name)}
                className="w-full flex justify-between items-center bg-slate-100 px-4 py-3"
              >
                <div>
                  <div className="font-semibold capitalize">
                    {section.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {section.source}
                  </div>
                </div>
                {expanded[section.name] ? (
                  <ChevronUp />
                ) : (
                  <ChevronDown />
                )}
              </button>

              {expanded[section.name] && (
                <div className="p-4 bg-white space-y-2">
                  <pre className="bg-slate-50 p-3 rounded text-sm max-h-48 overflow-auto">
                    {section.content || '(empty)'}
                  </pre>

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      Tokens:{' '}
                      {estimateTokens(section.content)} /{' '}
                      {BUDGETS[section.name]}
                    </span>
                    <button
                      onClick={() => copy(section.content, idx)}
                      className="flex items-center gap-1 text-blue-600"
                    >
                      <Copy size={14} />
                      {copiedIndex === idx ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final Context */}
        <div className="mt-6 border rounded bg-blue-50 p-4">
          <h3 className="font-semibold mb-2">
            Final Assembled Context ({totalTokens} tokens)
          </h3>
          <pre className="bg-white p-3 rounded max-h-64 overflow-auto text-sm">
            {result.finalContext}
          </pre>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setQuery(
              'How do transformers work in neural networks?'
            );
            setMemory(
              'Previously discussed: embeddings are vector representations.'
            );
            setToolOutputs(
              'Tool output: Retrieved 3 papers on attention mechanisms.'
            );
          }}
          className="mt-6 w-full bg-slate-900 text-white py-3 rounded flex justify-center items-center gap-2"
        >
          <RotateCcw size={16} />
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default App;


interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-sm font-semibold mb-1">
      {label}
    </label>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    />
  </div>
);
