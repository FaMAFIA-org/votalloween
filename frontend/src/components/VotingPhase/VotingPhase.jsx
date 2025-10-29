import { useState, useEffect, useCallback } from 'react';
import { getAllCostumes, checkIfVoted, submitVote } from '../../services/api';
import VotingScreen from './VotingScreen';
import ThankYouScreen from './ThankYouScreen';
import './VotingPhase.css';

export default function VotingPhase({ deviceId, votingEndTime }) {
  const [costumes, setCostumes] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [votedCostume, setVotedCostume] = useState(null);

  const checkVoteStatus = useCallback(async () => {
    try {
      const result = await checkIfVoted(deviceId);
      setHasVoted(result.hasVoted);
      if (result.hasVoted && result.vote) {
        setVotedCostume(result.vote.costume);
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
    }
  }, [deviceId]);

  const loadCostumes = useCallback(async () => {
    try {
      setLoading(true);
      const allCostumes = await getAllCostumes();
      setCostumes(allCostumes);
    } catch (error) {
      console.error('Error loading costumes:', error);
      alert('Error al cargar los disfraces');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user has already voted
  useEffect(() => {
    checkVoteStatus();
    loadCostumes();
  }, [checkVoteStatus, loadCostumes]);

  async function handleVote(costumeId) {
    try {
      setLoading(true);
      const result = await submitVote(deviceId, costumeId);

      setHasVoted(true);
      setVotedCostume(result.costume);

      alert('¡Voto registrado correctamente!');
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Error al registrar el voto. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (loading && costumes.length === 0) {
    return (
      <div className="voting-phase">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando disfraces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-phase">
      {!hasVoted ? (
        <VotingScreen
          costumes={costumes}
          onVote={handleVote}
          loading={loading}
        />
      ) : (
        <ThankYouScreen
          votingEndTime={votingEndTime}
          votedCostume={votedCostume}
        />
      )}
    </div>
  );
}
