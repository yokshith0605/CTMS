import React from 'react';
import { ScorecardView } from '../../components/cricket/ScorecardView';
import { useRouter } from '../../services/router';
import { ArrowLeft } from 'lucide-react';

interface ScorecardPublicPageProps {
  matchId: string;
}

export const ScorecardPublicPage: React.FC<ScorecardPublicPageProps> = ({ matchId }) => {
  const { navigate } = useRouter();

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/fixtures')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Matches</span>
      </button>

      <ScorecardView matchId={matchId} />
    </div>
  );
};
