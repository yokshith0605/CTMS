import React, { useState, useEffect } from 'react';
import { Match, Team, Player, ScorecardInnings, PlayerMatchStats } from '../../types';
import { db } from '../../services/db';
import { useToast } from '../common/Toast';
import { useRouter } from '../../services/router';
import {
  Trophy,
  Award,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Users,
  Shield,
  Activity,
  ArrowLeftRight
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface LiveScoringConsoleProps {
  matchId: string;
}

export const LiveScoringConsole: React.FC<LiveScoringConsoleProps> = ({ matchId }) => {
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const match = db.getMatchById(matchId);
  const team1 = match ? db.getTeamById(match.team1_id) : undefined;
  const team2 = match ? db.getTeamById(match.team2_id) : undefined;

  // Innings tracking
  const [inningsNumber, setInningsNumber] = useState<1 | 2>(1);
  const [battingTeamId, setBattingTeamId] = useState<string>('');
  const [bowlingTeamId, setBowlingTeamId] = useState<string>('');

  // Innings score state
  const [runs, setRuns] = useState<number>(0);
  const [wickets, setWickets] = useState<number>(0);
  const [balls, setBalls] = useState<number>(0); // Total legal balls bowled
  const [wides, setWides] = useState<number>(0);
  const [noBalls, setNoBalls] = useState<number>(0);
  const [byes, setByes] = useState<number>(0);
  const [legByes, setLegByes] = useState<number>(0);

  // Ball history for recent over visualization
  const [recentBalls, setRecentBalls] = useState<string[]>([]);

  // Players
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [currentBowlerId, setCurrentBowlerId] = useState<string>('');

  // Finish match modal state
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [winnerTeamId, setWinnerTeamId] = useState<string>('');
  const [resultDescription, setResultDescription] = useState<string>('');

  // Target in 2nd innings
  const [target, setTarget] = useState<number | null>(null);

  // Load existing scorecard if present
  useEffect(() => {
    if (!match) return;

    // Default batting team based on toss or team1
    const defaultBatting = match.toss_winner_team_id
      ? match.toss_decision === 'bat'
        ? match.toss_winner_team_id
        : match.toss_winner_team_id === match.team1_id ? match.team2_id : match.team1_id
      : match.team1_id;

    const defaultBowling = defaultBatting === match.team1_id ? match.team2_id : match.team1_id;

    const existingScorecards = db.getScorecardsForMatch(match.id);
    const activeInnNum = match.current_innings || (existingScorecards.length > 1 ? 2 : 1);
    setInningsNumber(activeInnNum);

    const activeSc = existingScorecards.find((s) => s.innings_number === activeInnNum);
    const firstSc = existingScorecards.find((s) => s.innings_number === 1);

    if (firstSc && activeInnNum === 2) {
      setTarget(firstSc.runs + 1);
    }

    if (activeSc) {
      setBattingTeamId(activeSc.batting_team_id);
      setBowlingTeamId(activeSc.bowling_team_id);
      setRuns(activeSc.runs);
      setWickets(activeSc.wickets);
      setBalls(activeSc.balls || Math.floor(activeSc.overs) * 6 + Math.round((activeSc.overs % 1) * 10));
      setWides(activeSc.extras?.wides || 0);
      setNoBalls(activeSc.extras?.no_balls || 0);
      setByes(activeSc.extras?.byes || 0);
      setLegByes(activeSc.extras?.leg_byes || 0);
    } else {
      setBattingTeamId(activeInnNum === 1 ? defaultBatting : defaultBowling);
      setBowlingTeamId(activeInnNum === 1 ? defaultBowling : defaultBatting);
      setRuns(0);
      setWickets(0);
      setBalls(0);
      setWides(0);
      setNoBalls(0);
      setByes(0);
      setLegByes(0);
    }
  }, [matchId]);

  // Load batting and bowling squads
  const battingPlayers = db.getPlayers(battingTeamId);
  const bowlingPlayers = db.getPlayers(bowlingTeamId);

  // Auto assign default striker, non-striker, bowler if not selected
  useEffect(() => {
    if (battingPlayers.length > 0 && !strikerId) {
      setStrikerId(battingPlayers[0].id);
    }
    if (battingPlayers.length > 1 && !nonStrikerId) {
      setNonStrikerId(battingPlayers[1].id);
    }
    if (bowlingPlayers.length > 0 && !currentBowlerId) {
      // Pick first bowler or any player
      const bowler = bowlingPlayers.find((p) => p.role === 'Bowler' || p.role === 'All-Rounder') || bowlingPlayers[0];
      if (bowler) setCurrentBowlerId(bowler.id);
    }
  }, [battingPlayers, bowlingPlayers, strikerId, nonStrikerId, currentBowlerId]);

  if (!match || !team1 || !team2) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <p className="text-slate-700 font-bold">Match not found</p>
        <button
          onClick={() => navigate('/scorer/dashboard')}
          className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Calculate overs decimal (e.g. 14 balls = 2.2 overs)
  const completedOvers = Math.floor(balls / 6);
  const ballsInCurrentOver = balls % 6;
  const oversFormatted = `${completedOvers}.${ballsInCurrentOver}`;
  const oversDecimal = balls / 6;
  const runRate = oversDecimal > 0 ? (runs / oversDecimal).toFixed(2) : '0.00';

  // Required Run Rate for Innings 2
  const maxOvers = match.tournament_id.includes('odi') ? 50 : 20;
  const ballsRemaining = maxOvers * 6 - balls;
  const runsNeeded = target !== null ? Math.max(target - runs, 0) : null;
  const reqRunRate =
    runsNeeded !== null && ballsRemaining > 0
      ? ((runsNeeded / (ballsRemaining / 6))).toFixed(2)
      : null;

  const currentBattingTeam = db.getTeamById(battingTeamId);
  const currentBowlingTeam = db.getTeamById(bowlingTeamId);
  const striker = db.getPlayerById(strikerId);
  const nonStriker = db.getPlayerById(nonStrikerId);
  const bowler = db.getPlayerById(currentBowlerId);

  // Sync to database
  const persistScore = (
    newRuns: number,
    newWickets: number,
    newBalls: number,
    newWides: number,
    newNoBalls: number,
    newByes: number,
    newLegByes: number
  ) => {
    const compOvers = Math.floor(newBalls / 6);
    const inCurrentOver = newBalls % 6;
    const formattedOv = Number(`${compOvers}.${inCurrentOver}`);

    db.saveInningsScore(
      match.id,
      inningsNumber,
      battingTeamId,
      bowlingTeamId,
      newRuns,
      newWickets,
      formattedOv,
      newBalls,
      {
        wides: newWides,
        no_balls: newNoBalls,
        byes: newByes,
        leg_byes: newLegByes,
        total: newWides + newNoBalls + newByes + newLegByes,
      }
    );

    // If status was Scheduled, update to Live
    if (match.status === 'Scheduled') {
      db.updateMatch(match.id, { status: 'Live', current_innings: inningsNumber });
    }
  };

  // Scoring Event Handlers
  const handleScoreRuns = (runAmount: number) => {
    const nextRuns = runs + runAmount;
    const nextBalls = balls + 1;
    setRuns(nextRuns);
    setBalls(nextBalls);
    setRecentBalls((prev) => [...prev.slice(-11), runAmount.toString()]);

    // Odd runs swap strike
    if (runAmount % 2 !== 0) {
      swapStrike();
    }

    persistScore(nextRuns, wickets, nextBalls, wides, noBalls, byes, legByes);
  };

  const handleWicket = () => {
    if (wickets >= 10) {
      showToast('All 10 wickets have already fallen.', 'info');
      return;
    }
    const nextWickets = wickets + 1;
    const nextBalls = balls + 1;
    setWickets(nextWickets);
    setBalls(nextBalls);
    setRecentBalls((prev) => [...prev.slice(-11), 'W']);

    // Next batsman
    const nextPlayer = battingPlayers.find((p) => p.id !== strikerId && p.id !== nonStrikerId);
    if (nextPlayer) {
      setStrikerId(nextPlayer.id);
    }

    persistScore(runs, nextWickets, nextBalls, wides, noBalls, byes, legByes);
    showToast(`Wicket down! (${nextWickets}/10)`, 'info');
  };

  const handleWide = () => {
    const nextRuns = runs + 1;
    const nextWides = wides + 1;
    setRuns(nextRuns);
    setWides(nextWides);
    setRecentBalls((prev) => [...prev.slice(-11), 'Wd']);
    persistScore(nextRuns, wickets, balls, nextWides, noBalls, byes, legByes);
  };

  const handleNoBall = () => {
    const nextRuns = runs + 1;
    const nextNoBalls = noBalls + 1;
    setRuns(nextRuns);
    setNoBalls(nextNoBalls);
    setRecentBalls((prev) => [...prev.slice(-11), 'Nb']);
    persistScore(nextRuns, wickets, balls, wides, nextNoBalls, byes, legByes);
  };

  const handleExtraRuns = (type: 'bye' | 'leg_bye', amount = 1) => {
    const nextRuns = runs + amount;
    const nextBalls = balls + 1;
    const nextByes = type === 'bye' ? byes + amount : byes;
    const nextLegByes = type === 'leg_bye' ? legByes + amount : legByes;

    setRuns(nextRuns);
    setBalls(nextBalls);
    if (type === 'bye') setByes(nextByes);
    if (type === 'leg_bye') setLegByes(nextLegByes);

    setRecentBalls((prev) => [...prev.slice(-11), `${amount}${type === 'bye' ? 'B' : 'LB'}`]);
    if (amount % 2 !== 0) swapStrike();

    persistScore(nextRuns, wickets, nextBalls, wides, noBalls, nextByes, nextLegByes);
  };

  const swapStrike = () => {
    const temp = strikerId;
    setStrikerId(nonStrikerId);
    setNonStrikerId(temp);
  };

  const handleSwitchInnings = () => {
    if (inningsNumber === 1) {
      // Save current innings first
      persistScore(runs, wickets, balls, wides, noBalls, byes, legByes);
      
      // Switch to 2nd innings
      const nextBatting = bowlingTeamId;
      const nextBowling = battingTeamId;

      setInningsNumber(2);
      setBattingTeamId(nextBatting);
      setBowlingTeamId(nextBowling);
      setTarget(runs + 1);
      setRuns(0);
      setWickets(0);
      setBalls(0);
      setWides(0);
      setNoBalls(0);
      setByes(0);
      setLegByes(0);
      setRecentBalls([]);
      setStrikerId('');
      setNonStrikerId('');
      setCurrentBowlerId('');

      db.updateMatch(match.id, { current_innings: 2 });
      showToast('Innings 1 concluded. Switched to 2nd Innings!', 'success');
    }
  };

  const handleOpenFinishModal = () => {
    // Determine suggested winner
    let suggestedWinner = '';
    let suggestedDesc = '';

    if (inningsNumber === 2 && target !== null) {
      if (runs >= target) {
        suggestedWinner = battingTeamId;
        const wktsRemaining = 10 - wickets;
        suggestedDesc = `${currentBattingTeam?.name} won by ${wktsRemaining} wickets`;
      } else {
        suggestedWinner = bowlingTeamId;
        const runsMargin = target - 1 - runs;
        suggestedDesc = `${currentBowlingTeam?.name} won by ${runsMargin} runs`;
      }
    } else {
      suggestedWinner = battingTeamId;
      suggestedDesc = `${currentBattingTeam?.name} won by match declaration`;
    }

    setWinnerTeamId(suggestedWinner);
    setResultDescription(suggestedDesc);
    setIsFinishModalOpen(true);
  };

  const handleConfirmFinish = () => {
    try {
      if (!winnerTeamId) throw new Error('Please select the winning team.');
      if (!resultDescription.trim()) throw new Error('Please enter result summary description.');

      // Persist final score
      persistScore(runs, wickets, balls, wides, noBalls, byes, legByes);

      // Finish match and recalculate points table
      db.finishMatchAndRecordResult(match.id, winnerTeamId, resultDescription.trim());
      showToast('Match completed and Points Table updated automatically!', 'success');
      setIsFinishModalOpen(false);
      navigate(`/scorecards/${match.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to complete match', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Match Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                LIVE SCORING CONSOLE
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Innings {inningsNumber} of 2
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading mt-2">
              {team1.name} vs {team2.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Venue: {match.venue} • {match.match_type} Match
            </p>
          </div>

          <div className="flex items-center gap-2">
            {inningsNumber === 1 && (
              <button
                onClick={handleSwitchInnings}
                className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>End 1st Innings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleOpenFinishModal}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Finish Match</span>
            </button>
          </div>
        </div>

        {/* Big Scoreboard Screen */}
        <div className="mt-5 p-6 rounded-2xl bg-slate-950 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Batting: {currentBattingTeam?.name} ({currentBattingTeam?.short_name})
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-tight">
                  {runs}/{wickets}
                </span>
                <span className="text-xl sm:text-2xl font-mono text-slate-400 font-bold">
                  ({oversFormatted} ov)
                </span>
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs sm:text-sm font-mono text-slate-300">
                <span>Current RR: <strong className="text-emerald-400">{runRate}</strong></span>
                {target !== null && (
                  <>
                    <span>•</span>
                    <span>Target: <strong className="text-amber-400">{target}</strong></span>
                    <span>•</span>
                    <span>Req RR: <strong className="text-amber-400">{reqRunRate || '0.00'}</strong></span>
                    <span>•</span>
                    <span>Need: <strong className="text-white">{runsNeeded}</strong> runs in {ballsRemaining}b</span>
                  </>
                )}
              </div>
            </div>

            {/* Bowling against & Extras */}
            <div className="text-right text-xs text-slate-400 font-mono space-y-1">
              <p className="text-slate-300 font-medium">
                Bowling: {currentBowlingTeam?.name}
              </p>
              <p>Extras: <span className="text-white font-bold">{wides + noBalls + byes + legByes}</span> (wd {wides}, nb {noBalls}, b {byes}, lb {legByes})</p>
              <p>Total Legal Balls: <span className="text-white font-bold">{balls}</span></p>
            </div>
          </div>

          {/* Recent Balls Strip */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Recent Balls:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {recentBalls.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No balls bowled yet in this session</span>
              ) : (
                recentBalls.map((b, i) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      b === 'W'
                        ? 'bg-red-600 text-white'
                        : b === '4' || b === '6'
                        ? 'bg-emerald-600 text-white'
                        : b.includes('Wd') || b.includes('Nb')
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {b}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Players On Crease / Active Bowler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Batsmen Controls */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Batters on Crease
              </span>
              <button
                onClick={swapStrike}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Rotate Strike</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Striker */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-emerald-300 shadow-2xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {striker?.name || 'Striker'} *
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">#{striker?.jersey_number}</span>
                </div>
                <select
                  value={strikerId}
                  onChange={(e) => setStrikerId(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 max-w-[130px]"
                >
                  {battingPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Non-Striker */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {nonStriker?.name || 'Non-Striker'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">#{nonStriker?.jersey_number}</span>
                </div>
                <select
                  value={nonStrikerId}
                  onChange={(e) => setNonStrikerId(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 max-w-[130px]"
                >
                  {battingPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bowler Controls */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                Current Bowler
              </span>
              <span className="text-xs text-slate-400 font-mono">Over: {completedOvers + 1}</span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {bowler?.name || 'Selected Bowler'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {bowler?.bowling_style || 'Right-arm medium'}
                  </span>
                </div>
                <select
                  value={currentBowlerId}
                  onChange={(e) => setCurrentBowlerId(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 max-w-[140px]"
                >
                  {bowlingPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400">
                Switch bowler after every 6 legal balls.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Scoring Keypad */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Ball-by-Ball Score Entry (Click to Record)
          </h4>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
            {/* Standard Runs */}
            <button
              onClick={() => handleScoreRuns(0)}
              className="py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold font-mono text-base transition-all active:scale-95 shadow-2xs"
            >
              0 (Dot)
            </button>
            <button
              onClick={() => handleScoreRuns(1)}
              className="py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold font-mono text-base transition-all active:scale-95 shadow-2xs"
            >
              1 Run
            </button>
            <button
              onClick={() => handleScoreRuns(2)}
              className="py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold font-mono text-base transition-all active:scale-95 shadow-2xs"
            >
              2 Runs
            </button>
            <button
              onClick={() => handleScoreRuns(3)}
              className="py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold font-mono text-base transition-all active:scale-95 shadow-2xs"
            >
              3 Runs
            </button>
            <button
              onClick={() => handleScoreRuns(4)}
              className="py-3 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold font-mono text-base transition-all active:scale-95 shadow-2xs border border-emerald-300"
            >
              4 (FOUR!)
            </button>
            <button
              onClick={() => handleScoreRuns(5)}
              className="py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold font-mono text-base transition-all active:scale-95 shadow-2xs"
            >
              5 Runs
            </button>
            <button
              onClick={() => handleScoreRuns(6)}
              className="py-3 px-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl font-bold font-mono text-base transition-all active:scale-95 shadow-2xs border border-amber-300"
            >
              6 (SIX!)
            </button>
          </div>

          {/* Extras and Wickets Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-2.5">
            <button
              onClick={handleWicket}
              className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-xs"
            >
              Wicket Out!
            </button>
            <button
              onClick={handleWide}
              className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              +1 Wide (Wd)
            </button>
            <button
              onClick={handleNoBall}
              className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              +1 No Ball (Nb)
            </button>
            <button
              onClick={() => handleExtraRuns('bye', 1)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              +1 Bye
            </button>
            <button
              onClick={() => handleExtraRuns('leg_bye', 1)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              +1 Leg Bye
            </button>
          </div>
        </div>
      </div>

      {/* Finish Match Modal */}
      <Modal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        title="Conclude Match & Update Points Table"
        subtitle="Finalize match result, assign winner points, and sync tournament standings."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Match Winner *
            </label>
            <select
              value={winnerTeamId}
              onChange={(e) => setWinnerTeamId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">Select Winning Team</option>
              <option value={team1.id}>{team1.name}</option>
              <option value={team2.id}>{team2.name}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Result Description *
            </label>
            <input
              type="text"
              required
              value={resultDescription}
              onChange={(e) => setResultDescription(e.target.value)}
              placeholder="e.g. Vizag Warriors won by 18 runs"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs space-y-1">
            <p className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Automated Operations on Completion:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              <li>Winning team receives +2 Points</li>
              <li>Net Run Rate (NRR) recalculated for both teams</li>
              <li>Full match scorecard generated & permanently archived</li>
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFinishModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmFinish}
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-xs"
            >
              Submit & Finalize Match
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
